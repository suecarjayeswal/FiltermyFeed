// textDealer.js

let blockedWords = [];
let blockedUrls = [];

const blurredNodes = new Set(); // Set to store already blurred nodes
const textContentCache = {}; // Cache for textContent and counts

// Function to recursively censor all text nodes in an element
function censorElement(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (textNode.tagName && textNode.tagName.toLowerCase() === 'script') {
            continue;
        }
        if (textNode.textContent.trim().length > 0 && !blurredNodes.has(textNode)) {
            censorTextNode(textNode);
        }
    }
}

// Function to censor a text node
async function censorTextNode(node) {
    
    const textContent = node.textContent.trim();
    const sanitizedText = textContent.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    if (blockedWords && node && !allBlurr) {
        // console.log("---checking blacklist");
        // console.log(textContent);
        // console.log(containsBlockedWord(textContent));
        if(containsBlockedWord(textContent)){
            
            blurParentElement(node);
            blurredNodes.add(node);
        }
    }

    // console.log(node.tagName, textContent);
    if (node && allBlurr) {
        if (!blurredNodes.has(node)) {
            if (sanitizedText.length > 0) { // Check if textContent is not empty
                const cachedCount = textContentCache[sanitizedText];
                if (cachedCount !== undefined) {
                    // Use the cached count if available
                    if (cachedCount > 3) {
                        blurParentElement(node);
                        blurredNodes.add(node);
                    }
                } else {
                    const url = `http://127.0.0.1:8000/string/${sanitizedText}`;
                    try {
    
                    
                        const response = await fetch(url);
                        if (response.ok) {
                            const data = await response.json();
                            const count = data.count;
                            textContentCache[sanitizedText]=count;
                            if (count > 3) {
                                blurParentElement(node);
                                blurredNodes.add(node); // Add the node to the set of blurred nodes}
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

function blurParentElement(node) {
    if (node) {
        const parentElement = node.parentElement;
        if (parentElement) {
            
            parentElement.style.filter = 'blur(5px)'; // Apply a blur effect to the parent element
            parentElement.setAttribute('aria-hidden', 'true'); // Screen reader skips this
        }
    }
}

// Function to check if textContent contains any blocked word
function containsBlockedWord(textContent) {

    for (const blockedWord of blockedWords) {
        if (textContent.toLowerCase().includes(blockedWord.toLowerCase())) {
            return true;
        }
    }
    return false;
}