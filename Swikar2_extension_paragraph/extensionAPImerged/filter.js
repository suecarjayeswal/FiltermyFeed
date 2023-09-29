let blockedWords = [];
let blockedUrls = [];
let filterOff = false;

let running = false;
let timer;

const applyFilter = () => {
    if (filterOff) {
        return;
    }

    try {
        if (!isBlockedUrl()) {
            censor(document.body);
        }

        console.log("finished really!");
    } catch (err) {
        console.log(err);
    }
};

const startTimer = () => {
    if (running) {
        clearInterval(timer);
        running = false;
    }

    timer = setInterval(applyFilter, 7500);
    running = true;
};

chrome.storage.onChanged.addListener(() => {
    chrome.storage.sync.get(["globalOff", "bWords", "bUrls"], (info) => {
        filterOff = info.globalOff;
        blockedWords = info.bWords;
        blockedUrls = info.bUrls;
        if (!filterOff) {
            startScript();
        }
    });
});

/*function replaceOccurrences(text, oldStr) {
    const reg = new RegExp(oldStr, "gi");
    return text.replace(reg, "BLOCKED");
}*/

function replaceOccurrences(text, oldValue) {
    const pattern = oldValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    return text.replace(new RegExp(pattern, "gi"), "█".repeat(oldValue.length));
}

async function censor(node) {
    if (node.hasChildNodes()) {
        node.childNodes.forEach(async (childNode) => {
            await censor(childNode); // Recursively process child nodes
        });
    }

    if (node.nodeType === Node.TEXT_NODE) {
        if (blockedWords) {
            const textContent = node.textContent.trim(); // Trim whitespace
            const sanitizedText = textContent.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (sanitizedText.length > 0) { // Check if textContent is not empty
                try {
                    // Try to parse the content as JSON
                    const jsonContent = JSON.parse(textContent);

                    // If parsing succeeds, it's JSON data; skip processing
                } catch (error) {
                    // If parsing fails, it's not JSON data; proceed with processing
                         // Replace spaces and special characters with hyphens
                         // Remove hyphens from the beginning and end

                    const url = `http://127.0.0.1:8000/string/${sanitizedText}`;

                    // Make an HTTP request to get the count
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const data = await response.json();
                            const count = data.count;

                            // Check if count is less than 3 to decide whether to censor
                            if (count > 3) {
                                node.textContent = replaceOccurrences(textContent, textContent);
                            }
                        } else {
                            console.error(`Failed to fetch count for ${url}`);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }
}


async function censorBasedOnID(ID) {
console.log("inside censor");
const element = document.getElementById(ID);

if (element) {
    const textContent = element.textContent;
    const sanitizedText = textContent
        .replace(/[^a-zA-Z0-9]+/g, '-') // Replace spaces and special characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove hyphens from the beginning and end

    const url = `http://127.0.0.1:8000/string/${sanitizedText}`;

    makeRequest(url);
    }
}



function startScript() {
    if (!isBlockedUrl()) {
        applyFilter();
        startTimer();
        //window.addEventListener("load", applyFilter, false);
        //window.addEventListener("load", startTimer, false);
    }
}

chrome.storage.sync.get(["globalOff", "bUrls", "bWords"], (info) => {
    blockedUrls = info.bUrls;
    blockedWords = info.bWords;
    filterOff = info.globalOff;
    if (!filterOff) {
        startScript();
    }
});

function isBlockedUrl() {
    const currUrl = window.location.origin;
    let blocked = false;
    for (let i = 0; i < blockedUrls.length; i++) {
        if (currUrl.toString().toLowerCase().includes(blockedUrls[i])) {
            blocked = true;
            break;
        }
    }

    return blocked;
}

function makeRequest(url) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert("Giving up :( Cannot create an XMLHTTP instance");
        return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open("GET", url);
    httpRequest.send();
}

function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
            console.log("Sucess!!")
        } else {
            alert("There was a problem with the request.");
        }
    }
}