import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function ChatBox({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  // Load messages when conversation changes
  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const { data } = await api.get(`/messages?conversation_id=${conversationId}`);
      setMessages(data || []);
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 0);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post('/messages', { conversation_id: conversationId, text });
      setMessages((m) => [...m, data]);
      setText('');
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 0);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-lg">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded ${m.is_self ? 'bg-brand-500 self-end ml-auto' : 'bg-white/10'}`}>
            <p className="text-sm">{m.text}</p>
            <p className="text-[10px] text-white/60 mt-1">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 outline-none"
        />
        <button className="px-4 py-2 rounded bg-brand-500 hover:bg-brand-600">Send</button>
      </form>
    </div>
  );
}

