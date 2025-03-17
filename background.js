// Background service worker for AI Browser Assistant

chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Browser Assistant installed');
    
    // Initialize default settings
    chrome.storage.sync.set({
        aiProvider: 'openrouter',
        theme: 'light',
        textSize: 16,
        screenshotAmount: 3
    });
});

// Handle communication between popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case 'BROWSER_ACTION':
            // Forward browser interaction requests to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, request.payload);
            });
            break;
        
        case 'CAPTURE_SCREENSHOT':
            chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
                sendResponse({ screenshot: dataUrl });
            });
            return true; // Enable asynchronous response
        
        case 'SAVE_SETTINGS':
            chrome.storage.sync.set(request.settings, () => {
                sendResponse({ success: true });
            });
            return true;
    }
});

// Optional: Monitor tab changes for context
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        // Potentially send page context to AI for analysis
        chrome.tabs.sendMessage(tabId, { action: 'extract_context' });
    }
});