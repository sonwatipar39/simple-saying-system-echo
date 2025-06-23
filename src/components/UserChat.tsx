import React, { useState, useEffect, useRef } from 'react';
import { wsClient } from '@/integrations/ws-client';
import { Send, Paperclip, X, Minimize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  message: string;
  timestamp: string;
  file_url?: string;
  file_name?: string;
  user_ip: string;
}

const UserChat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleStartChat = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsVisible(true);
      }, 2000);
    };

    const handleChatMessage = (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.sender === 'admin') {
        setIsVisible(true); // Auto-open chat on admin message
      }
    };

    wsClient.on('start_chat', handleStartChat);
    wsClient.on('chat_message', handleChatMessage);

    return () => {
      wsClient.off('start_chat', handleStartChat);
      wsClient.off('chat_message', handleChatMessage);
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const userIP = await getUserIP();
    const messageData = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: newMessage,
      timestamp: new Date().toISOString(),
      user_ip: userIP
    };
    wsClient.send('chat_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const userIP = await getUserIP();
    const reader = new FileReader();
    reader.onload = (e) => {
      const messageData = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: `Sent file: ${file.name}`,
        timestamp: new Date().toISOString(),
        file_url: e.target?.result as string,
        file_name: file.name,
        user_ip: userIP
      };
      wsClient.send('chat_message', messageData);
      setMessages(prev => [...prev, messageData]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Connecting to support...</span>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      }`}
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div 
        className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between"
        style={{ cursor: 'default' }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="font-semibold text-sm">Shruti is connected</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-700 p-1 rounded"
            style={{ cursor: 'pointer' }}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="hover:bg-blue-700 p-1 rounded"
            style={{ cursor: 'pointer' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            className="h-64 overflow-y-auto p-3 bg-gray-50" 
            style={{ cursor: 'default' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded max-w-xs text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border text-gray-800'
                }`}>
                  <div>{msg.message}</div>
                  {msg.file_url && (
                    <div className="mt-2">
                      <a href={msg.file_url} download={msg.file_name} className="text-blue-600 underline text-xs">
                        📎 {msg.file_name}
                      </a>
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-3 border-t bg-white rounded-b-lg" 
            style={{ cursor: 'default' }}
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message here"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                style={{ cursor: 'text' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                style={{ cursor: 'pointer' }}
                type="button"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                style={{ cursor: 'pointer' }}
                type="button"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserChat;
