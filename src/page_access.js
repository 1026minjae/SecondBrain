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
    console.log(data);
    var pagelist = JSON.parse(data);
    console.log(pagelist);

    var nav = document.getElementById("btn-box");
    nav.textContent = "";
    for (var page in pagelist) {
        var btn = document.createElement("button");
        btn.onclick = () => {changeText(page["Filename"])};
        btn.value = page["Name"];
        nav.appendChild(btn);
    }
};

loadPageList();