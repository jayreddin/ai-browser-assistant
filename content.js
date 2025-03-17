// Content script for AI Browser Assistant

class BrowserInteractionHelper {
    static highlightElement(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.border = '3px solid red';
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        });
    }

    static extractPageContext() {
        return {
            title: document.title,
            url: window.location.href,
            headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent),
            links: Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.textContent,
                href: a.href
            })),
            formFields: Array.from(document.querySelectorAll('input, textarea')).map(input => ({
                type: input.type,
                name: input.name,
                placeholder: input.placeholder
            }))
        };
    }

    static autoFillForm(formData) {
        Object.entries(formData).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.value = value;
                // Trigger change event to simulate user input
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    static simulateClick(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
        }
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.action) {
        case 'highlight':
            BrowserInteractionHelper.highlightElement(request.selector);
            break;
        case 'extract_context':
            sendResponse(BrowserInteractionHelper.extractPageContext());
            break;
        case 'auto_fill':
            BrowserInteractionHelper.autoFillForm(request.formData);
            break;
        case 'simulate_click':
            BrowserInteractionHelper.simulateClick(request.selector);
            break;
    }
    return true;
});