
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getAIService } from '../services/serviceFactory';

interface ChatInterfaceProps {
  onAgentMessage: (msg: string) => void;
  externalMessage?: string | null;
  externalStyleRequest?: { garmentName: string; description: string; category: string } | null;
  voiceTranscription?: { text: string; role: string } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onAgentMessage,
  externalMessage,
  externalStyleRequest,
  voiceTranscription
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'Hello! I am your AI Style Agent. How can I help you elevate your look today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    // Delay slightly to ensure animation has started/completed
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [messages, isTyping]);

  useEffect(() => {
    if (externalMessage) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        const agentMsg: Message = {
          id: `proactive-${Date.now()}`,
          role: 'agent',
          content: externalMessage,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, agentMsg]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [externalMessage]);

  useEffect(() => {
    if (externalStyleRequest) {
      const prompt = `Styling tips for "${externalStyleRequest.garmentName}" (${externalStyleRequest.category}): ${externalStyleRequest.description}`;
      sendAutomatedRequest(prompt);
    }
  }, [externalStyleRequest]);

  // Handle voice transcriptions from global App header
  useEffect(() => {
    if (voiceTranscription && voiceTranscription.text.trim()) {
      const voiceMsg: Message = {
        id: `voice-${Date.now()}`,
        role: voiceTranscription.role === 'user' ? 'user' : 'agent',
        content: `[Voice] ${voiceTranscription.text}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, voiceMsg]);
    }
  }, [voiceTranscription]);

  const sendAutomatedRequest = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const history = messages.slice(-6).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const result = await getAIService().chat(text, history as any, {
      thinking: useThinking,
      search: useSearch
    });

    setIsTyping(false);
    const agentMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: result.text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, agentMsg]);
    onAgentMessage(result.text);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    await sendAutomatedRequest(currentInput);
  };

  return (
    <div className="flex flex-col h-full glass rounded-3xl overflow-hidden shadow-xl border border-white/40">
      <div className="p-4 border-b border-white/30 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-magic"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 tracking-tight">Style Agent</h3>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setUseThinking(!useThinking)}
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full transition-all ${useThinking ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}
              >
                Thinking {useThinking ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setUseSearch(!useSearch)}
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full transition-all ${useSearch ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}
              >
                Search {useSearch ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/10">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${m.role === 'user'
              ? 'bg-white text-gray-800 rounded-tr-none border-gray-100'
              : 'chat-bubble-ai rounded-tl-none border-indigo-400/30'
              }`}>
              <p className="text-sm leading-relaxed font-medium">{m.content}</p>
              <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60 ${m.role === 'user' ? 'text-right text-gray-400' : 'text-left text-indigo-100'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-message-in">
            <div className="chat-bubble-ai p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/60 border-t border-white/40 backdrop-blur-md">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for fashion advice..."
            className="flex-1 pl-5 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm shadow-inner font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${!input.trim() || isTyping
              ? 'bg-gray-200 text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
              }`}
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
