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


chrome.storage.onChanged.addListener((changes) => {
    chrome.storage.sync.get(["globalOff", "bWords", "bUrls"], (info) => {
      const currentBlockedWords = info.bWords || [];
      const currentBlockedUrls = info.bUrls || [];
  
      // Check if blockedWords or blockedUrls decreased
      const wordsDecreased = currentBlockedWords.length < blockedWords.length;
      const urlsDecreased = currentBlockedUrls.length < blockedUrls.length;
  
      // Update the previous values
      blockedWords = currentBlockedWords;
      blockedUrls = currentBlockedUrls;
  
      startScript();
      if (!info.globalOff && (wordsDecreased || urlsDecreased)) {
        console.log("Change caused startScript");
        chrome.runtime.sendMessage({ action: "needReload" });
      }
    });
  });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "updateTab") {
      // Scroll to a specific position on the page without reloading
      const currentScrollPosition = window.scrollY;
      window.scrollTo(0, currentScrollPosition);
    }
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


