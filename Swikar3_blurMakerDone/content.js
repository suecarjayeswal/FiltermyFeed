// content.js

const minDelayInSeconds = 2; // Minimum delay time in seconds
let pageLoaded = false; // Flag to track page load

let filterOff = false;
let allBlurr = false;

chrome.storage.sync.get(["globalOff", "bUrls", "bWords"], (info) => {

    blockedUrls = info.bUrls;
    blockedWords = info.bWords;
    filterOff = info.globalOff;
    console.log("first get",blockedUrls,blockedWords,filterOff);
    // if (!filterOff) {
    //     startScript();
    // }
});

document.addEventListener("DOMContentLoaded", () => {
    pageLoaded = true;
    hideBodyContent(); // Hide content immediately upon page load
    if (!filterOff) {
        startScript();
        observeDOM(); // Start observing DOM mutations
        const censorCompleteEvent = new Event("censorComplete");
        console.log("censorComplete");
        document.dispatchEvent(censorCompleteEvent);
    }else{
        delayContent();
    }
});

document.addEventListener("censorComplete", () => {
    delayContent();
});


chrome.storage.onChanged.addListener(() => {
    chrome.storage.sync.get(["globalOff", "bWords", "bUrls"], (info) => {
        filterOff = info.globalOff;
        blockedWords = info.bWords;
        blockedUrls = info.bUrls;
        console.log("------changed get\n",blockedUrls,blockedWords,filterOff);

        if (!filterOff) {
            console.log("----- change caused startScript");
            startScript();
        }
    });
});


function hideBodyContent() {
    console.log("hiding");
    const body = document.body;
    body.style.display = "none";
}

function showBodyContent() {
    console.log("showing");
    const body = document.body;
    body.style.display = "block";
}

// Delay the display of content if not loaded yet
function delayContent() {
    if (pageLoaded) {
        showBodyContent();
    } else {
        setTimeout(showBodyContent, minDelayInSeconds * 1000);
    }
}

// Observe mutations to the DOM, looking for new content
function observeDOM() {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        // console.log("addedNode:------------------");
                        censorElement(addedNode);
                    }
                }
            }
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

function startScript() {
    if (!isBlockedUrl()) {
        applyFilter();
    }
}

const applyFilter = () => {
    if (filterOff) {
        return;
    }
    try {
        if (!isBlockedUrl()) {
            censorElement(document.body);
        }
        console.log("finished really!");
    } catch (err) {
        console.log(err);
    }
};


