let wordInput = document.getElementById("wordInput");
let currentSite = document.getElementById("currentSite");
let listCont = document.getElementById("listContainer");
let wordsTab = document.getElementById("wordsTab");
let urlsTab = document.getElementById("urlsTab");
let onTab = document.getElementById("onTab");
let offTab = document.getElementById("offTab");
let currentLocation = "";
let viewingWords = true;
let filterOff = false;
let blockedWords = [];
let blockedUrls = [];

const urlReg = /:\/\/(.[^/]+)/;

chrome.storage.sync.get(["bWords"], (words) => {
    listCont = document.getElementById("listContainer");
    blockedWords = words.bWords;
    changeTab(true);
});

chrome.storage.sync.get(["globalOff"], (filtOff) => {
    filterOff = filtOff.globalOff;
    changeTab(false);
})

wordInput.addEventListener("keypress", (event) => {
    if (event.keyCode === 13 || event.which === 13) {
        const enteredWord = wordInput.value;
        wordInput.value = "";
        if (!enteredWord || enteredWord.length === 1) {
            showError("Please enter a word");
        } else if (blockedWords.includes(enteredWord)) {
            showError(enteredWord + " is already blocked!");
        } else {
            blockedWords.push(enteredWord);
            chrome.storage.sync.set({ bWords: blockedWords, bUrls: blockedUrls, globalOff: filterOff }, () => {
                console.log("Added to storage: " + blockedWords);
                if (viewingWords) {
                    updateUL(blockedWords);
                }
            });
        }
    }
});

currentSite.addEventListener("click", (event) => {
    if (blockedUrls.includes(currentLocation)) {
        currentSite.style.color = "green";
        const delIndex = blockedUrls.indexOf(currentLocation);
        if (delIndex > -1) {
            blockedUrls.splice(delIndex, 1);
        }
    } else {
        currentSite.style.color = "red";
        blockedUrls.push(currentLocation);
    }

    chrome.storage.sync.set({ bWords: blockedWords, bUrls: blockedUrls, globalOff: filterOff }, () => {
        if (!viewingWords) {
            updateUL(blockedUrls);
        }
    });
    chrome.tabs.reload();
    /*chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });*/
});

wordsTab.addEventListener("click", (event) => {
    viewingWords = true;
    changeTab(true);
});

urlsTab.addEventListener("click", (event) => {
    viewingWords = false;
    changeTab(true);
});

onTab.addEventListener("click", (event) => {
    changeGlobalOff(false);
});

offTab.addEventListener("click", (event) => {
    changeGlobalOff(true);
    /*chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });*/
    chrome.tabs.reload();
});

function changeGlobalOff(filter) {
    filterOff = filter;
    chrome.storage.sync.set({ bWords: blockedWords, bUrls: blockedUrls, globalOff: filterOff }, () => {
        changeTab(false);
    });
}

chrome.tabs.query(
    {
        active: true,
        lastFocusedWindow: true,
    },
    (tabs) => {
        currentLocation = tabs[0].url.match(urlReg)[1];
        currentSite.innerHTML = "Current Site: " + currentLocation;
        chrome.storage.sync.get(["bUrls"], (urls) => {
            blockedUrls = urls.bUrls;
            if (blockedUrls.includes(currentLocation)) {
                currentSite.style.color = "red";
            } else {
                currentSite.style.color = "green";
            }
        });
    }
);

function updateUL(list) {
    deleteChildren(listCont);
    let item = {};
    console.log(list);
    list.forEach((word) => {
        item = document.createElement("li");
        item.className = "itemStyle";
        item.appendChild(document.createTextNode(word));
        item.addEventListener("mouseover", (event) => {
            const clickedElement = event.target || event.srcElement;
            clickedElement.style.color = "red";
        });
        item.addEventListener("mouseout", (event) => {
            const clickedElement = event.target || event.srcElement;
            clickedElement.style.color = "white";
        });
        item.addEventListener("click", (event) => {
            const clickedElement = event.target || event.srcElement;
            const clickedText = clickedElement.textContent;
            let clickedIndex = -1;
            if (viewingWords) {
                clickedIndex = blockedWords.indexOf(clickedText);
                if (clickedIndex > -1) {
                    blockedWords.splice(clickedIndex, 1);
                }
                updateUL(blockedWords);
            } else {
                clickedIndex = blockedUrls.indexOf(clickedText);
                if (clickedIndex > -1) {
                    blockedUrls.splice(clickedIndex, 1);
                }
                updateUL(blockedUrls);
            }

            chrome.storage.sync.set({ bWords: blockedWords, bUrls: blockedUrls, globalOff: filterOff }, () => {
                console.log("Updated deletion");
            });
        });
        listCont.appendChild(item);
    });
}

function deleteChildren(node) {
    console.log(node);
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}

function showError(errorText) {
    const error = document.createElement("h5");
    error.appendChild(document.createTextNode(errorText));
    error.className = "textElems";
    error.style.textAlign = "center";
    document.getElementById("wrapper").insertBefore(error, document.getElementById("listDivider"));
    setTimeout(() => {
        document.getElementById("wrapper").removeChild(error);
    }, 3000);
}

function changeTab(listTab) {
    const tab1 = listTab ? wordsTab : offTab;
    const tab2 = listTab ? urlsTab : onTab;
    const condition = listTab ? viewingWords : filterOff;
    if (condition) {
        tab1.style.backgroundColor = "white";
        tab1.style.color = "black";
        tab2.style.backgroundColor = "black";
        tab2.style.color = "white";
        if (listTab) {
            updateUL(blockedWords);
        }
    } else {
        tab1.style.backgroundColor = "black";
        tab1.style.color = "white";
        tab2.style.backgroundColor = "white";
        tab2.style.color = "black";
        if (listTab) {
            updateUL(blockedUrls);
        }
    }
}
