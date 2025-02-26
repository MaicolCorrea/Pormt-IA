let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 20000;

async function getCompletion(userPrompt) {
    try {
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

        return data.content[0].text;
    } catch (error) {
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

generateBtn.addEventListener('click', async () => {
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        outputElement.textContent = '⚠️ Por favor, escribe algo en el prompt';
        return;
    }

    outputElement.textContent = '🤔 Generando respuesta...';
    generateBtn.disabled = true;

    try {
        const result = await getCompletion(userPrompt);
        outputElement.textContent = result;
    } catch (error) {
        outputElement.textContent = `❌ Error: ${error.message}`;
        console.error('Error en la generación:', error);
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