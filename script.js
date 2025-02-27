async function loadGraph() {
    let files = await fetchFilesFromNotes();
    let graphData = { nodes: [], edges: [] };
    let fileMap = {};

    for (let file of files) {
        let content = await fetchMarkdownContent(file);
        let links = extractLinks(file, content);

        graphData.nodes.push({ id: file, label: file.substring(file.lastIndexOf("/") + 1).replace(".md", ""), shape: "dot", color: 0x555555, size: 5, font: {bold: true}});
        fileMap[file] = true;

        for (let link of links) {
            if (fileMap[link] || files.includes(link)) {
                graphData.edges.push({ from: file, to: link });
            }
        }
    }

    renderGraph(graphData);
}

async function fetchFilesFromNotes() {
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

function extractLinks(file, content) {
    let links = [];

    /* This part specifies the regular expressions for each type of links 
       The following types can be detected:
       1. Wiki Link: [[Target File Name]]
       2. Markdown Link: [Shown Text](Target File Name) 
       
       And currently, target file should be in same directory which the link-owning file locates. */
    let wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let mdLinkRegex = /\[.*?\]\((.*?)\)/g;

    let parentDir = file.substring(0, file.lastIndexOf("/") + 1); // including '/'

    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
        links.push(parentDir + match[1] + ".md");
    }
    while ((match = mdLinkRegex.exec(content)) !== null) {
        links.push(parentDir + match[1] + ".md");
    }
    return links;
}

function renderGraph(graphData) {
    let container = document.getElementById("graph");
    let options = { physics: { enabled: true } };
    let network = new vis.Network(container, graphData, options);

    network.on("click", async function (params) {
        if (params.nodes.length > 0) {
            let file = params.nodes[0];
            let content = await fetchMarkdownContent(file);
            content = removeLinks(content);
            document.getElementById("viewer").innerHTML = marked.parse(content);
        }
    });
}

function removeLinks (content) {
    //todo
    return content;
}

window.onload = loadGraph;
