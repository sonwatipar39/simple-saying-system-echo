import React, { useState, useEffect, useRef } from 'react';
import { wsClient } from '@/integrations/ws-client';
import { Send, Paperclip, MessageCircle, X, Minimize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  message: string;
  timestamp: string;
  file_url?: string;
  file_name?: string;
  user_ip: string;
}

const AdminChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

 useEffect(() => {
  const handleChatMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleStartChat = () => {
    setIsChatActive(true);
    setIsVisible(true);
  };

  wsClient.on('chat_message', handleChatMessage);
  wsClient.on('start_chat', handleStartChat);

  return () => {
    wsClient.off('chat_message', handleChatMessage);
    wsClient.off('start_chat', handleStartChat);
  };
}, []);

  const startChat = () => {
    setIsChatActive(true);
    setIsVisible(true);
    wsClient.send('start_chat', { role: 'admin' });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const messageData = {
      id: Date.now().toString(),
      sender: 'admin' as const,
      message: newMessage,
      timestamp: new Date().toISOString(),
      user_ip: 'admin'
    };
    wsClient.send('chat_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const messageData = {
        id: Date.now().toString(),
        sender: 'admin' as const,
        message: `Sent file: ${file.name}`,
        timestamp: new Date().toISOString(),
        file_url: e.target?.result as string,
        file_name: file.name,
        user_ip: 'admin'
      };
      wsClient.send('chat_message', messageData);
      setMessages(prev => [...prev, messageData]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-20 right-4 z-50">
        {!isChatActive && (
          <button
            onClick={startChat}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Chat Popup */}
      {isVisible && (
        <div className={`fixed bottom-20 right-4 bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-12' : 'w-80 h-96'
        }`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-semibold text-sm">Admin Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-3 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded max-w-xs text-sm ${
                      msg.sender === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border text-gray-800'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">
                        {msg.sender === 'admin' ? 'You (Admin)' : `User ${msg.user_ip}`}
                      </div>
                      <div>{msg.message}</div>
                      {msg.file_url && (
                        <div className="mt-2">
                          <a href={msg.file_url} download={msg.file_name} className="text-blue-600 underline text-xs">
                            📎 {msg.file_name}
                          </a>
                        </div>
                      )}
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message here"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AdminChat;
