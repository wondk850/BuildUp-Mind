
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AICoachProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const AICoach: React.FC<AICoachProps> = ({ chatHistory, onSendMessage, isLoading, onBack }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
      <header className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600">AI 코치</h1>
        <button
          onClick={onBack}
          className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
        >
          뒤로가기
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AI</div>
              )}
              <div
                className={`max-w-lg p-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AI</div>
              <div className="max-w-lg p-3 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="sticky bottom-0 bg-slate-50 py-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI 코치에게 메시지를 보내보세요..."
            className="flex-1 w-full bg-white border border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </form>
      <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};
