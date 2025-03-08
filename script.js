let fileMap = {};

async function loadGraph() {
    let files = await fetchFilesFromNotes();
    let graphData = { nodes: [], edges: [] };

    for (let file of files) {
        let filename = file.filename;

        graphData.nodes.push({  id: filename, 
                                label: filename.substring(filename.lastIndexOf("/") + 1).replace(".md", ""), 
                                shape: "dot", 
                                color: {background: "#555555"}, 
                                size: 5, 
                                font: {bold: true}
                            });
        fileMap[filename] = null;

        for (let link of file.links) {
            if (!(link in fileMap)) {
                graphData.nodes.push({  id: link, 
                                        label: link.substring(link.lastIndexOf("/") + 1).replace(".md", ""), 
                                        shape: "dot", 
                                        color: {background: "#aaaaaa"}, 
                                        chosen: false,
                                        size: 5, 
                                        font: {color: "#aaaaaa"}
                                    });
            }
            graphData.edges.push({  from: filename, 
                                    to: link, 
                                    color: {color: "#999999", opacity: 0.7},
                                    chosen: false
                                });
        }
    }

    renderGraph(graphData);
}

async function fetchFilesFromNotes() {
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
            if (file in fileMap) {
                let content = fileMap[file];
                if (content === null) {
                    content = await fetchMarkdownContent(file);
                    content = removeLinks(content);
                    fileMap[file] = content;
                }
                document.getElementById("viewer").innerHTML = marked.parse(content);
            }
        }
    });
}

function removeLinks (content) {
    let wiki_link_pattern = /\[\[[^|^\]]+[|]?([^\]])*\]\]/g;
    let md_link_pattern = /(\[.*?\])\(.*?\)/g;

    content.replaceAll (wiki_link_pattern, "$1");
    content.replaceAll (md_link_pattern, "$1");

    return content;
}

window.onload = loadGraph;
