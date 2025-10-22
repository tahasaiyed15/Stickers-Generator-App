import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { chatWithBot } from '../services/geminiService';
import Button from './common/Button';
import Card from './common/Card';
import { useLiveChat } from '../hooks/useLiveChat';

const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: 'Hello! I am PapayaBot 🍍. How can I help you with your sticker designs today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleTurnComplete = useCallback((userText: string, modelText: string) => {
    if(userText.trim()) {
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userText };
        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: modelText };
        setMessages(prev => [...prev, userMsg, botMsg]);
    }
  }, []);

  const { isActive, isConnecting, isModelSpeaking, currentTranscription, startSession, stopSession } = useLiveChat(handleTurnComplete);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    const botResponseText = await chatWithBot(messages, currentInput);
    
    const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponseText };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-papaya-pink">Support Chat</h2>
      <Card className="max-w-2xl mx-auto">
        <div className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 rounded-t-lg">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm px-4 py-2 rounded-2xl shadow-sm ${
                  msg.sender === 'user' ? 'bg-papaya-pink text-white rounded-br-none' : 
                  msg.sender === 'bot' ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 
                  'bg-yellow-100 text-yellow-800 text-sm italic border border-yellow-200 w-full text-center'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {(isActive || isConnecting) && (
              <div className="text-sm text-gray-500 italic">
                {currentTranscription.user && <p>You: {currentTranscription.user}</p>}
                {currentTranscription.model && <p>Bot: {currentTranscription.model}</p>}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-papaya-pink focus:outline-none transition"
              disabled={isLoading || isActive}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim() || isActive}>Send</Button>
            {!isActive ? (
              <Button onClick={startSession} variant="secondary" disabled={isConnecting}>
                {isConnecting ? 'Starting...' : '🎙️'}
              </Button>
            ) : (
              <Button onClick={stopSession} variant="danger">
                {isModelSpeaking ? '🔴' : '⏹️'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupportChat;