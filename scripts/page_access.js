function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "pages/" + filePath + ".txt", false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    
    return result;
}

function changeText(filename) {
    data=loadFile(filename)
    area = document.getElementById("text");
    area.innerText=data;
}