async function fetchFilesFromRepo() {
    try {
        const response = await fetch("./notes/index.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching file list:", error);
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

function extractLinks(content) {
    let links = [];
    let wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let mdLinkRegex = /\[.*?\]\((.*?)\)/g;

    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
        links.push("notes/" + match[1] + ".md");
    }
    while ((match = mdLinkRegex.exec(content)) !== null) {
        links.push(match[1]);
    }
    return links;
}

async function loadGraph() {
    let files = await fetchFilesFromRepo();
    let graphData = { nodes: [], edges: [] };
    let fileMap = {};

    for (let file of files) {
        let content = await fetchMarkdownContent(file);
        let links = extractLinks(content);

        graphData.nodes.push({ id: file, label: file.replace("notes/", "").replace(".md", "") });
        fileMap[file] = true;

        for (let link of links) {
            if (fileMap[link] || files.includes(link)) {
                graphData.edges.push({ from: file, to: link });
            }
        }
    }

    renderGraph(graphData);
}

function renderGraph(graphData) {
    let container = document.getElementById("graph");
    let options = { physics: { enabled: true } };
    let network = new vis.Network(container, graphData, options);

    network.on("click", async function (params) {
        if (params.nodes.length > 0) {
            let file = params.nodes[0];
            let content = await fetchMarkdownContent(file);
            document.getElementById("viewer").innerHTML = marked.parse(content);
        }
    });
}

window.onload = loadGraph;
