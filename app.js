let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 20000;

const chatHistory = document.getElementById('chatHistory');
const themeToggle = document.getElementById('themeToggle');
const typingIndicator = document.querySelector('.typing-indicator');
const suggestions = document.querySelectorAll('.suggestion-chip');
const charCount = document.querySelector('.char-count');

const suggestedQuestions = [
    "¿Qué es JavaScript?",
    "Explica la inteligencia artificial",
    "Dame un ejemplo de código HTML",
    "¿Cómo funciona React?",
    "Explica qué es Node.js",
    "¿Qué es una API REST?",
    "Diferencia entre CSS y SASS",
    "Explica el concepto de POO",
    "¿Qué es una base de datos NoSQL?",
    "Mejores prácticas en desarrollo web"
];

function generateRandomSuggestions() {
    const suggestionsContainer = document.querySelector('.suggestions');
    suggestionsContainer.innerHTML = '';
    
    const randomQuestions = suggestedQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    randomQuestions.forEach(question => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = question;
        
        chip.addEventListener('click', () => {
            promptInput.value = question;
            generateBtn.click();
            chip.remove();
            
            const remainingQuestions = suggestedQuestions
                .filter(q => !document.querySelector(`.suggestion-chip[data-question="${q}"]`));
                
            if (remainingQuestions.length > 0) {
                const newQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
                const newChip = document.createElement('div');
                newChip.className = 'suggestion-chip';
                newChip.textContent = newQuestion;
                newChip.dataset.question = newQuestion;
                suggestionsContainer.appendChild(newChip);
                
                newChip.addEventListener('click', () => {
                    promptInput.value = newQuestion;
                    generateBtn.click();
                    newChip.remove();
                });
            }
        });
        
        chip.dataset.question = question;
        suggestionsContainer.appendChild(chip);
    });
}

generateRandomSuggestions();

setInterval(generateRandomSuggestions, 30000);

async function getCompletion(userPrompt) {
    try {
        addMessage('user', userPrompt);
        typingIndicator.style.display = 'inline-flex';
        
        console.log('Iniciando solicitud...');
        console.log('Prompt:', userPrompt);
        
        const res = await fetch('/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                prompt: userPrompt
            }) 
        });

        const data = await res.json();
        console.log('Respuesta completa:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        if (!data.content || !data.content[0]) {
            throw new Error('Respuesta invalida del servidor');
        }

        typingIndicator.style.display = 'none';
        addMessage('ai', data.content[0].text);
        return data.content[0].text;
    } catch (error) {
        typingIndicator.style.display = 'none';
        console.error('Error detallado:', error);
        throw new Error(`Error: ${error.message}`);
    }
}

const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const outputElement = document.getElementById('output');

console.log('Elementos UI encontrados:', {
    promptInput: !!promptInput,
    generateBtn: !!generateBtn,
    outputElement: !!outputElement
});

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    setTheme(isDark);
});

promptInput.addEventListener('input', () => {
    const length = promptInput.value.length;
    charCount.textContent = `${length}/500`;
});

suggestions.forEach(chip => {
    chip.addEventListener('click', () => {
        promptInput.value = chip.textContent;
        generateBtn.click();
    });
});

generateBtn.addEventListener('click', async () => {
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        return;
    }

    generateBtn.disabled = true;
    promptInput.value = '';
    charCount.textContent = '0/500';

    try {
        await getCompletion(userPrompt);
    } catch (error) {
        addMessage('ai', `❌ Error: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
    }
});

promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
    }
});

function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const textDiv = document.createElement('div');
    textDiv.textContent = content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}