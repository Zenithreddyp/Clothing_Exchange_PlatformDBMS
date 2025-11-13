import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ChatBox from '../components/ChatBox.jsx';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/messages?list=1');
      setConversations(data || []);
      
      // Check if there's a conversation ID in URL params
      const conversationParam = searchParams.get('conversation');
      if (conversationParam) {
        const convId = parseInt(conversationParam);
        setSelected(convId);
      } else if (!selected && data?.[0]) {
        // Set selected to first conversation if none selected
        setSelected(data[0].id);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  useEffect(() => {
    loadConversations();
    
    // Poll for new conversations every 5 seconds
    const interval = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-white/60 text-center">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <button 
              key={c.id} 
              onClick={() => setSelected(c.id)} 
              className={`w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5 transition ${selected===c.id ? 'bg-white/10' : ''}`}
            >
              <p className="font-semibold">{c.name || 'Unknown User'}</p>
              <p className="text-white/60 text-sm truncate">{c.last_message || 'No messages yet'}</p>
              {c.last_message_time && (
                <p className="text-white/40 text-xs mt-1">
                  {new Date(c.last_message_time).toLocaleString()}
                </p>
              )}
            </button>
          ))
        )}
      </div>
      <div className="md:col-span-2">
        {selected ? (
          <ChatBox conversationId={selected} />
        ) : (
          <div className="h-full bg-white/5 border border-white/10 rounded-lg grid place-items-center text-white/60">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

