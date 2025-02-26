import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
    console.error('⚠️ No se encontró la API KEY de Cohere en las variables de entorno');
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/completion', async (req, res) => {
    try {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-nightly',
                prompt: req.body.prompt,
                max_tokens: 500,
                temperature: 0.8,
                k: 0,
                stop_sequences: [],
                return_likelihoods: 'NONE'
            })
        });

        const data = await response.json();
        console.log('Respuesta de Cohere:', data);
        
        if (data.error) {
            throw new Error(data.message || 'Error en la API de Cohere');
        }

        res.json({
            content: [{
                text: data.generations?.[0]?.text || 'No se pudo generar una respuesta'
            }]
        });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
