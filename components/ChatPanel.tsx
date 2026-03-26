"use client";

import { useState } from "react";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi! I can help you analyze the Order to Cash process. Ask me questions like: 'Which products are associated with the highest number of billing documents?' or 'Trace the full flow of billing document 90000001'." }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        // Optionally show returned SQL or data in UI if requested
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the query service." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden relative">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800">Chat with Graph Agent</h2>
        <p className="text-xs text-slate-500">Order to Cash Context</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-500/20' 
                : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/50 shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-sm flex space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-1.5 flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <input 
            suppressHydrationWarning
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Analyze anything..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 text-sm placeholder:text-slate-400"
          />
          <button 
            suppressHydrationWarning
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-400 mt-2 font-medium tracking-wide pb-1">
          DODGE AI GRAPH AGENT
        </div>
      </div>
    </div>
  );
}
