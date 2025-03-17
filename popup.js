// Advanced AI Browser Assistant

class AIProviderManager {
    constructor() {
        this.providers = {
            openrouter: new OpenRouterProvider(),
            gemini: new GeminiProvider(),
            mistral: new MistralProvider(),
            deepseek: new DeepSeekProvider(),
            copilot: new CopilotProvider(),
            custom: new CustomProvider()
        };
        this.currentProvider = null;
    }

    async initializeProvider(providerName, apiKey) {
        if (this.providers[providerName]) {
            this.currentProvider = this.providers[providerName];
            await this.currentProvider.initialize(apiKey);
        }
    }

    async sendCommand(command, context = {}) {
        if (!this.currentProvider) {
            throw new Error('No AI provider selected');
        }
        return await this.currentProvider.processCommand(command, context);
    }
}

class BaseAIProvider {
    constructor() {
        this.apiKey = null;
        this.selectedModel = null;
    }

    async initialize(apiKey) {
        this.apiKey = apiKey;
    }

    async processCommand(command, context) {
        throw new Error('Not implemented');
    }
}

class OpenRouterProvider extends BaseAIProvider {
    async processCommand(command, context) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.selectedModel || 'anthropic/claude-2',
                messages: [{ role: 'user', content: command }]
            })
        });
        return await response.json();
    }
}

class GeminiProvider extends BaseAIProvider {
    async processCommand(command, context) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: command }] }]
            })
        });
        return await response.json();
    }
}

// Placeholder classes for other providers
class MistralProvider extends BaseAIProvider {}
class DeepSeekProvider extends BaseAIProvider {}
class CopilotProvider extends BaseAIProvider {}
class CustomProvider extends BaseAIProvider {}

class BrowserAutomationManager {
    async captureScreenshot() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
                resolve(dataUrl);
            });
        });
    }

    async executeScript(script) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: new Function(script)
        });
    }

    async findAndInteractWithElement(selector, interaction = 'click') {
        return this.executeScript(`
            const element = document.querySelector('${selector}');
            if (element) {
                element.${interaction}();
                return true;
            }
            return false;
        `);
    }
}

class SpeechRecognitionManager {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.isRecognizing = false;

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            document.getElementById('command-input').value = transcript;
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    startRecognition() {
        if (!this.isRecognizing) {
            this.recognition.start();
            this.isRecognizing = true;
            document.getElementById('mic-btn').classList.add('active');
        }
    }

    stopRecognition() {
        if (this.isRecognizing) {
            this.recognition.stop();
            this.isRecognizing = false;
            document.getElementById('mic-btn').classList.remove('active');
        }
    }
}

class AIBrowserAssistant {
    constructor() {
        this.aiProviderManager = new AIProviderManager();
        this.browserAutomationManager = new BrowserAutomationManager();
        this.speechRecognitionManager = new SpeechRecognitionManager();

        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // Provider selection
        document.getElementById('ai-provider').addEventListener('change', (e) => {
            const provider = e.target.value;
            this.switchAIProviderSettings(provider);
        });

        // API Key save
        document.getElementById('api-key-save').addEventListener('click', () => {
            this.saveAPIKey();
        });

        // Mic button
        document.getElementById('mic-btn').addEventListener('click', () => {
            if (this.speechRecognitionManager.isRecognizing) {
                this.speechRecognitionManager.stopRecognition();
            } else {
                this.speechRecognitionManager.startRecognition();
            }
        });

        // Submit button
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.processCommand();
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelCurrentAction();
        });
    }

    async processCommand() {
        const commandInput = document.getElementById('command-input');
        const command = commandInput.value.trim();

        if (!command) return;

        try {
            // Capture context (screenshot)
            const screenshot = await this.browserAutomationManager.captureScreenshot();
            
            // Process command with AI
            const aiResponse = await this.aiProviderManager.sendCommand(command, { screenshot });

            // Display response
            this.displayMessage('User', command);
            this.displayMessage('AI', aiResponse.choices[0].message.content);

            // Optional: Perform browser automation based on AI response
            if (aiResponse.browserAction) {
                await this.browserAutomationManager.findAndInteractWithElement(
                    aiResponse.browserAction.selector, 
                    aiResponse.browserAction.interaction
                );
            }

            commandInput.value = '';
        } catch (error) {
            this.displayMessage('Error', error.message);
        }
    }

    displayMessage(sender, message) {
        const messagesDisplay = document.getElementById('messages-display');
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messagesDisplay.prepend(messageElement);
    }

    async saveAPIKey() {
        const provider = document.getElementById('ai-provider').value;
        const apiKeyInput = document.getElementById(`${provider}-api-key`);
        
        if (apiKeyInput && apiKeyInput.value) {
            await this.aiProviderManager.initializeProvider(provider, apiKeyInput.value);
            
            // Save to chrome storage
            chrome.storage.sync.set({
                [`${provider}ApiKey`]: apiKeyInput.value
            });
        }
    }

    loadSettings() {
        // Load saved API keys
        chrome.storage.sync.get(['openrouterApiKey', 'geminiApiKey'], (result) => {
            if (result.openrouterApiKey) {
                document.getElementById('openrouter-api-key').value = result.openrouterApiKey;
            }
            if (result.geminiApiKey) {
                document.getElementById('gemini-api-key').value = result.geminiApiKey;
            }
        });
    }

    switchAIProviderSettings(provider) {
        // Hide all provider settings
        ['openrouter', 'gemini', 'mistral', 'deepseek', 'copilot', 'custom'].forEach(p => {
            const settingsDiv = document.getElementById(`${p}-settings`);
            if (settingsDiv) settingsDiv.style.display = 'none';
        });

        // Show selected provider settings
        const selectedSettings = document.getElementById(`${provider}-settings`);
        if (selectedSettings) selectedSettings.style.display = 'block';
    }

    cancelCurrentAction() {
        // Stop any ongoing AI processing or browser automation
        this.speechRecognitionManager.stopRecognition();
    }
}

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
    new AIBrowserAssistant();
});