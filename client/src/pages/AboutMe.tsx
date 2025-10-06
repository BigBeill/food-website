import { useState, useRef, useEffect } from 'react';

import axios from '../api/axios';

export default function AboutMe() {
   return (
      <>
         <section className='standardPage'>
            <h1>About Me</h1>
            <p>
               My name is Mackenzie Neill, I'm currently graduating from Trent University with a degree in Computer Science. 
               I am a software developer with a passion for Web-development, cyber security, and agentic AI. 
               My expertise lies in full-stack development, and I enjoy working on projects that challenge my skills and allow me to learn new technologies (like this one).
               Feel free to check out my linkedIn and GitHub profiles below to learn more about my work and connect with me.
               Or if you want something easier, you can chat with my AI clone below!
            </p>
            <ul>
               <li><a href="https://www.linkedin.com/in/mackenzie-neill/" target="_blank" rel="noopener noreferrer">My LinkedIn Profile</a></li>
               <li><a href="https://github.com/BigBeill" target="_blank" rel="noopener noreferrer">My GitHub Profile</a></li>
            </ul>
         </section>

         <AgentChat />
      </>
   )
}

function AgentChat() {
   const [message, setMessage] = useState('');
   const [history, setHistory] = useState<{role: string, content: string}[]>([{role: 'assistant', content: 'Hello! I am an AI clone of Mackenzie Neill. How can I help you today?'}]);
   const [loading, setLoading] = useState(false);

   const chatEndRef = useRef<HTMLDivElement | null>(null);
   const liveRegionRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (history.length > 1) { chatEndRef.current?.scrollIntoView({ behavior: 'instant' }); }
   }, [history, loading]);

   // announces new messages to screen readers
   useEffect(() => {
      if (history.length > 1 && liveRegionRef.current) {
         const lastMessage = history[history.length - 1];
         const senderRole = lastMessage.role === 'assistant' ? 'Mackenzie Neill says' : lastMessage.role === 'user' ? 'You said' : 'system update';
         liveRegionRef.current.textContent = `${senderRole}: ${lastMessage.content}`;
      }
   }, [history]);

   function handleSendMessage() {
      if (!message.trim()) { return; }

      const currentMessage = message;
      setMessage('');

      setLoading(true);

      let updatedHistory = [...history, { role: 'user', content: currentMessage }];

      axios({
         method: 'post',
         url: '/ai/sendMessage',
         data: { currentMessage, history },
      })
      .then((response) => {
         const assistantResponse = { role: 'assistant', content: response };
         updatedHistory.push(assistantResponse);
      })
      .catch((error) => {
         console.error('Error sending message:', error);
         setHistory([...updatedHistory, {role: 'system', content: 'An error occurred while communicating with the AI.'}]);
      })
      .finally(() => {
         setLoading(false);
      });

      setHistory(updatedHistory);
   }

   return (
      <section className='chatContainer'>
         <h2>Chat with Mackenzie Neill</h2>

         {/* live region for announcements for screen readers */}
         <div ref={liveRegionRef} role="status" aria-live="polite" aria-atomic="true" className="screenReaderOnly"/>

         <div className='ChatLog' role="log" aria-label="chat conversation" aria-live="off">
            {history.map((message, i) => (
               <p key={i} ><strong>{message.role}:</strong> {message.content}</p>
            ))}
            {loading && (
               <div role="status" aria-live="polite">
                  <p><em>Thinking...</em></p>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>
         <div className='textInput' aria-label="Send a message to the AI chat bot">
            <input 
               id="chatInput" 
               value={message} 
               onChange={(event) => setMessage(event.target.value)} 
               onKeyDown={(event) => { if (event.key == "Enter") { handleSendMessage(); } }}
               placeholder="Type your question..."
               aria-label="Type your message here"
               disabled={loading}
            />
            <button onClick={handleSendMessage} disabled={loading || !message.trim()}>Send</button>
         </div>
      </section>
   )
}