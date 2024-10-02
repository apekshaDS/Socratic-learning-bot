const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const MarkDownIt = require("markdown-it");
const md = new MarkDownIt();
dotenv.config();

const app = express();
const port = 3020;

let conversationHistory = [];
let chatSession = null;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get('/bot', (req, res) => {
    res.render('index', { conversationHistory });
});

app.post('/ask', async (req, res) => {
    const prompt = req.body.prompt || req.query.prompt;
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    try {
        if (!chatSession) {
            const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            chatSession = await model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "Hello" }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Great to meet you. What would you like to know?" }],
                    }
                ]
            });
        }

        let result = await chatSession.sendMessage(prompt);
        let botResponse = result.response.text();
        const markedResponse = md.render(botResponse);

        const escapeHtml = (unsafe) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const formattedResponse = markedResponse.replace(/`([^`]+)`/g, (match, code) => {
            return `<pre><code>${escapeHtml(code)}</code></pre>`;
        });
        conversationHistory.push({ prompt, response: botResponse });

        res.send(`<li class="message">
                    <div class="user-message">${prompt}</div>
                    <div class="bot-message">${formattedResponse}</div>
                  </li>`);
    } catch (error) {
        console.error(error);
        conversationHistory.push({ prompt, response: 'Error generating content' });
        
        res.send(`<li class="message">
                    <div class="user-message">${prompt}</div>
                    <div class="bot-message">Error generating content</div>
                  </li>`);
    }
});


app.post('/feedback', async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    
    const conversationText = conversationHistory.map(item => 
        `User: ${item.prompt}\nBot: ${item.response}`
    ).join('\n');
    
    const feedbackPrompt = `Provide feedback about how the user performed based on this conversation:\n${conversationText}`;

    try {
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const feedbackSession = await model.startChat({
            history: [{ role: "user", parts: [{ text: feedbackPrompt }] }]
        });

        let result = await feedbackSession.sendMessage(feedbackPrompt);
        
        res.render('feedback', { feedback: result.response.text() });
    } catch (error) {
        console.error(error);
        res.render('feedback', { feedback: 'Error generating feedback' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});