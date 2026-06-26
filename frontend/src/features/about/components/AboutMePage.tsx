import sendServerRequest from '@/shared/lib/api';
import { useState, useRef, useEffect } from 'react';

export default function AboutMePage() {
   return (
      <>
         <div className='standardPage'>
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
         </div>

         <AgentChat />
      </>
   )
}

function AgentChat() {
   const [message, setMessage] = useState('');
   const [history, setHistory] = useState<{role: string, content: string}[]>([{role: 'assistant', content: 'Hello! I am an AI clone of Mackenzie Neill. How can I help you today?'}]);
   const [loading, setLoading] = useState(false);

   const chatEndRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'instant' });
   }, [history, loading]);

   function handleSendMessage() {
      if (!message.trim()) return;

      setLoading(true);
      setMessage('');

      let updatedHistory = [...history, { role: 'user', content: message }];


      sendServerRequest({
         method: 'post',
         url: '/ai/sendMessage',
         body: { message, history },
      })
      .then((response: any) => {
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
      <div className='chatContainer'>
         <h2>Chat with Mackenzie Neill</h2>
         <div className='ChatLog'>
            {history.map((msg, i) => (
               <p key={i}><strong>{msg.role}:</strong> {msg.content}</p>
            ))}
            {loading && <p><em>Thinking...</em></p>}
         </div>
         <div className='textInput'>
            <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key == "Enter") { handleSendMessage(); } }} placeholder="Type your question..."/>
            <button onClick={handleSendMessage}>Send</button>
         </div>
      </div>
   )
}