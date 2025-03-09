mdFileContentMap = {}

isDarkmode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
colorTable = {
                "existing_node": { 
                                    backgroundColor: (isDarkmode ? "#aaaaaa" : "#555555"),
                                    borderColor: "#999999",
                                    fontColor: (isDarkmode ? "#aaaaaa" : "#555555")
                                },
                "nonexisting_node": {
                                    backgroundColor: (isDarkmode ? "#555555" : "#aaaaaa"),
                                    borderColor: "#999999",
                                    fontColor: (isDarkmode ? "#555555" : "#aaaaaa")
                                },
                "edge": {
                        color: "#999999"
                    }
            };

async function loadGraph() {
    let mdFileList = await fetchMdFileListFromDisk();
    let graphData = { nodes: [], edges: [] };

    for (let file of mdFileList) {
        let filename = file.name;

        graphData.nodes.push({  id: filename, 
                                label: filename.substring(filename.lastIndexOf("/") + 1).replace(".md", ""), 
                                shape: "dot", 
                                color: {
                                        background: colorTable["existing_node"].backgroundColor, 
                                        border: colorTable["existing_node"].borderColor 
                                    }, 
                                size: 5, 
                                font: {
                                        color: colorTable["existing_node"].fontColor, 
                                        bold: true 
                                    }
                            });
        
        mdFileContentMap[filename] = null;

        for (let link of file.links_to_exist) {
            graphData.edges.push({  
                                    from: filename, 
                                    to: link, 
                                    color: {
                                            color: colorTable["edge"].color, 
                                            opacity: 0.7
                                        },
                                    chosen: false
                                });
        }
        for (let link of file.links_to_nonexist) {
            graphData.nodes.push({  
                                    id: link, 
                                    label: link, 
                                    shape: "dot", 
                                    color: {
                                            background: colorTable["nonexisting_node"].backgroundColor, 
                                            border: colorTable["nonexisting_node"].borderColor
                                        }, 
                                    chosen: false,
                                    size: 5, 
                                    font: {
                                            color: colorTable["nonexisting_node"].fontColor,
                                            bold: false
                                        }
                                });
            graphData.edges.push({  
                                    from: filename, 
                                    to: link, 
                                    color: {
                                            color: colorTable["edge"].color, 
                                            opacity: 0.7
                                        },
                                    chosen: false
                                });
        }
    }

    renderGraph(graphData);
}

async function fetchMdFileListFromDisk() {
    try {
        const response = await fetch("./notes/index.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching JSON:", error);
        return [];
    }
}

async function fetchMarkdownContent(file) {
    try {
        const response = await fetch(file);
        return await response.text();
    } catch (error) {
        console.error("Error fetching markdown file:", file);
        return "";
    }
}

function renderGraph(graphData) {
    let container = document.getElementById("graph");
    let options = { interaction: { hideEdgesOnDrag: true, hideEdgesOnZoom: true, hover: true },
                    layout: { improvedLayout: false },
                    nodes: { font: { face: "D2 Coding" } },
                    physics: { enabled: true } };
    let network = new vis.Network(container, graphData, options);

    network.on("click", async function (params) {
        if (params.nodes.length > 0) {
            let file = params.nodes[0];

            if (file in mdFileContentMap) {
                let content = mdFileContentMap[file];
            
                if (content === null) {
                    content = await fetchMarkdownContent(file);
                    content = removeLinks(content);
                    mdFileContentMap[file] = content;
                }
            
                document.getElementById("viewer").innerHTML = marked.parse(content);
            }
        }
    });
}

function removeLinks (content) {
    let wiki_link_pattern1 = /\[\[[^|^\]]+[|]([^|^\]]+)\]\]/g;  // [[LinkFile|ShownText]]
    let wiki_link_pattern2 = /\[\[([^\]]+)\]\]/g;               // [[LinkFileAlsoShownText]]
    let md_link_pattern = /\[(.*?)\]\(.*?\)/g;                  // [ShownText](Link)

    content = content.replaceAll (wiki_link_pattern1, "$1");
    content = content.replaceAll (wiki_link_pattern2, "$1");
    content = content.replaceAll (md_link_pattern, "$1");

    return content;
}

window.onload = loadGraph;
