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

let loadPageList = () => {
    var data = loadfile("pagelist.json");
    console.log(data);
    var pagelist = JSON.parse(data);
    console.log(pagelist);
};

let changeText = (filename) => {
    var data = loadFile(filename);
    var contentbox = document.getElementById("contents");
    contentbox.innerText = data;
};