let loadFile = (filePath) => {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", "pages/" + filePath, false); // synchronous
    xmlhttp.send();

    if (xmlhttp.status == 200) { // success
        return xmlhttp.responseText;
    }
    else {
        return "Error"
    }
};

let changeText = (filename) => {
    var data = loadFile(filename);
    var contentbox = document.getElementById("contents");
    contentbox.innerText = data;
};

let loadPageList = () => {
    var data = loadFile("pagelist.json");
    var pagelist = JSON.parse(data);

    var nav = document.getElementById("btn-box");
    if (nav.hasChildNodes()) nav.textContent = "";

    for (var page of pagelist) {
        var btn = document.createElement("button");
        btn.innerText = page["Name"];
        btn.setAttribute("onclick", "changeText(\"" + page["Filename"] + "\")");
        nav.appendChild(btn);
    }
};

loadPageList();