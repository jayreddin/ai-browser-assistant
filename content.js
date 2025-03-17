// Advanced AI-Driven Browser Automation

class AIBrowserAutomation {
    constructor() {
        this.automationRules = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch(request.action) {
                case 'PREDICT_AUTOMATION':
                    return this.predictAutomation(request.context);
                case 'EXECUTE_AUTOMATION':
                    return this.executeAutomationWorkflow(request.workflow);
                case 'LEARN_INTERACTION':
                    return this.learnInteraction(request.interaction);
            }
        });
    }

    // Advanced element interaction with AI-powered selection
    async intelligentElementSelect(selectors, context) {
        const elements = [];
        for (const selector of selectors) {
            const matchedElements = document.querySelectorAll(selector);
            if (matchedElements.length > 0) {
                // AI-powered element ranking
                const rankedElements = Array.from(matchedElements).map(el => ({
                    element: el,
                    score: this.calculateElementRelevance(el, context)
                })).sort((a, b) => b.score - a.score);
                
                elements.push(rankedElements[0].element);
            }
        }
        return elements;
    }

    calculateElementRelevance(element, context) {
        let score = 0;
        
        // Text content relevance
        if (element.textContent.toLowerCase().includes(context.toLowerCase())) {
            score += 10;
        }

        // Positional relevance
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Prefer elements in the visible viewport
        if (rect.top >= 0 && rect.bottom <= viewportHeight && 
            rect.left >= 0 && rect.right <= viewportWidth) {
            score += 5;
        }

        // Size and visibility
        if (rect.width > 0 && rect.height > 0 && 
            window.getComputedStyle(element).visibility !== 'hidden') {
            score += 3;
        }

        return score;
    }

    async predictAutomation(context) {
        // Machine learning-based automation prediction
        const workflows = [
            {
                name: 'form_fill',
                conditions: ['input', 'form', 'registration'],
                steps: [
                    { action: 'fill', 
                      selectors: ['input[name="email"]', 'input[type="email"]'],
                      value: context.userEmail 
                    },
                    { action: 'fill', 
                      selectors: ['input[name="password"]', 'input[type="password"]'],
                      value: context.userPassword 
                    },
                    { action: 'click', 
                      selectors: ['button[type="submit"]', 'input[type="submit"]'] 
                    }
                ]
            },
            {
                name: 'search_action',
                conditions: ['search', 'query', 'find'],
                steps: [
                    { action: 'fill', 
                      selectors: ['input[name="q"]', 'input[type="search"]'],
                      value: context.searchQuery 
                    },
                    { action: 'click', 
                      selectors: ['button[type="submit"]', 'input[type="submit"]'] 
                    }
                ]
            }
        ];

        // Find most relevant workflow
        const matchedWorkflow = workflows.find(workflow => 
            workflow.conditions.some(condition => 
                context.toLowerCase().includes(condition)
            )
        );

        return matchedWorkflow || null;
    }

    async executeAutomationWorkflow(workflow) {
        if (!workflow) return false;

        for (const step of workflow.steps) {
            const elements = await this.intelligentElementSelect(step.selectors, step.value);
            
            if (elements.length > 0) {
                const element = elements[0];
                
                switch(step.action) {
                    case 'fill':
                        element.value = step.value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    case 'click':
                        element.click();
                        break;
                }
            }
        }

        return true;
    }

    learnInteraction(interaction) {
        // Store and learn from user interactions
        this.automationRules.push(interaction);
        
        // Persist learned rules
        chrome.storage.local.set({ 
            automationRules: this.automationRules 
        });

        return true;
    }

    // Computer Vision-like element detection
    detectClickableElements() {
        const clickableElements = Array.from(document.querySelectorAll('a, button, [onclick], [role="button"]'))
            .filter(el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && 
                       style.display !== 'none' && 
                       style.visibility !== 'hidden';
            })
            .map(el => ({
                text: el.textContent.trim(),
                selector: this.generateUniqueSelector(el)
            }));

        return clickableElements;
    }

    generateUniqueSelector(element) {
        if (element.id) return `#${element.id}`;
        
        let path = [];
        while (element.parentElement && element.tagName !== 'BODY') {
            let siblings = Array.from(element.parentElement.children);
            let index = siblings.indexOf(element) + 1;
            path.unshift(`${element.tagName.toLowerCase()}:nth-child(${index})`);
            element = element.parentElement;
        }
        
        return path.join(' > ');
    }
}

// Initialize the automation
new AIBrowserAutomation();