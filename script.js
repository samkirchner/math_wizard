// TODO: use server
const openaiApiKey = "API KEY HERE";

// Chat tracker
let currentChatIndex = 0;
const chatHistory = [[]];

// LaTex Delimiters
const mathDelimiters = [ 
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false }
];

// set tone of conversation
const systemPrompt = `
You are a Math Tutor who doesn't waffle and keeps things terse.
ALL solutions MUST be THOROUGH
ALWAYS format all mathematical content using proper LaTeX delimiters
NEVER EVER Use \\begin{align*} ... \\end{align*} INSTEAD USE $$...$$ for multiline equations.
NEVER omit math delimiters. 
DO NOT use Markdown code formatting.
add the end of each step add a new line
For longer expressions go to the next line
`;

// Add message to chatbox and generate response
// TODO: sendMessagte(chatID) to enable swapping while waiting for response
async function sendMessage() {
    // get user question
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    // display user question
    const messagesDiv = document.getElementById('messages');

    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<strong>You:</strong> ${message}`;
    messagesDiv.appendChild(userMessage);

    // render LaTeX
    renderMathInElement(userMessage, {
        delimiters: mathDelimiters
    });

    // display API response
    const botResponse = document.createElement('div');
    botResponse.className = 'message bot';
    botResponse.innerHTML = `<strong>MathBOT:</strong> Thinking...`;
    messagesDiv.appendChild(botResponse);

    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // openai API POST request
    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // cheap, but not the best model for math
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await res.json();
        if (data.choices && data.choices[0].message) {
            const content = data.choices[0].message.content;
            botResponse.innerHTML = `<strong>MathBOT:</strong> ${content}`;

            // Render LaTeX
            renderMathInElement(botResponse, {
                delimiters: mathDelimiters
            });
        } else {
            // invalid API key or limit reached
            botResponse.innerHTML = `<strong>MathBOT:</strong> ❌ Unexpected response`;
        }
    } catch (err) {
        console.error(err);
        botResponse.innerHTML = `<strong>MathBOT:</strong> ❌ ${err.message}`;
    }

    // rating the responnse
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'rating';
    ratingDiv.innerHTML = `
        <span>Rate this response: </span>
        <button onclick="rateResponse(this, '👍')">👍</button>
        <button onclick="rateResponse(this, '👎')">👎</button>
    `;
    messagesDiv.appendChild(ratingDiv);

    // save chat history
    chatHistory[currentChatIndex].push(userMessage, botResponse, ratingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// display rating
function rateResponse(button, rating) {
    button.parentElement.innerHTML = `You rated this response: ${rating}`;
}

// open/close sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// change chats
function switchChat(index) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    currentChatIndex = index;

    if (!chatHistory[index]) {
        chatHistory[index] = [];
    }

    // load all saved messsages from a chat instance
    chatHistory[index].forEach(msg => messagesDiv.appendChild(msg.cloneNode(true)));
}

