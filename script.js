mdFileContentMap = {}

async function loadGraph() {
    let mdFileList = await fetchMdFileListFromDisk();
    let graphData = { nodes: [], edges: [] };

    for (let file of mdFileList) {
        let filename = file.name;

        graphData.nodes.push({  id: filename, 
                                label: filename.substring(filename.lastIndexOf("/") + 1).replace(".md", ""), 
                                shape: "dot", 
                                color: {background: "#555555", border: "#999999"}, 
                                size: 5, 
                                font: {bold: true}
                            });
        
        mdFileContentMap[filename] = null;

        for (let link of file.links_to_exist) {
            graphData.edges.push({  from: filename, 
                                    to: link, 
                                    color: {color: "#999999", opacity: 0.7},
                                    chosen: false
                                });
        }
        for (let link of file.links_to_nonexist) {
            graphData.nodes.push({  id: link, 
                                    label: link, 
                                    shape: "dot", 
                                    color: {background: "#aaaaaa", border: "#999999"}, 
                                    chosen: false,
                                    size: 5, 
                                    font: {color: "#aaaaaa"}
                                });
            graphData.edges.push({  from: filename, 
                                    to: link, 
                                    color: {color: "#999999", opacity: 0.7},
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
    let options = { physics: { enabled: true } };
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
