// startup.js 
chrome.runtime.onInstalled.addListener(() => {
    //set up storage object on first launch
    //bWords are words blocked by the user. These words will be changed if detected in the DOM
    //bUrls are urls blocked by the user, the content script will not run on these urls
    chrome.storage.sync.set({ bWords: [], bUrls: [], globalOff: false }, () => {
        console.log("Set up storage");
    });
});

let conMenu = {
    id: "wId",
    title: "Block this word",
    visible: true,
    contexts: ["selection"],
};

chrome.contextMenus.create(conMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ("selectionText" in info && !info["selectionText"].includes(" ")) {
        chrome.storage.sync.get(["bWords"], (words) => {
            if (!words.bWords.includes(info["selectionText"])) {
                words.bWords.push(info["selectionText"]);
                chrome.storage.sync.set({ bWords: words.bWords }, () => console.log("Updated links"));
            }
        });
    }
});


// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "needReload") {
        // Call your function here
        chrome.tabs.reload();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {action: "updateTab" });
        });
    }
});