document.getElementById('chat-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const promptInput = document.getElementById('prompt');
    const promptText = promptInput.value;

    promptInput.value = '';

    const conversationList = document.getElementById('conversation-list');
    const userMessage = document.createElement('li');
    userMessage.classList.add('message');
    userMessage.innerHTML = `
        <div class="user-message">${promptText}</div>
        <div class="bot-msg">
            <img src="/images/botlogo.png" alt="hekk" class="bot-logo">
            <div class="bot-message">Thinking...</div>
        </div>
    `;
    conversationList.appendChild(userMessage);

    const scrollToBottom = () => {
        const conversationHistory = document.getElementById('conversation-history');
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
    };
    scrollToBottom();
    
    const response = await fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ prompt: promptText })
    });

    const result = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result;

    const botResponse = tempDiv.querySelector('.message .bot-message').textContent;

    const botMessageDiv = userMessage.querySelector('.bot-message');
    botMessageDiv.textContent = '';

    let words = botResponse.split(' ');
    let i = 0;

    function typeWord() {
        if (i < words.length) {
            botMessageDiv.textContent += words[i] + ' ';
            i++;
            scrollToBottom();  
            setTimeout(typeWord, 50);
        }
    }

    typeWord();
});
