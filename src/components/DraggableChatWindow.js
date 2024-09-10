import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';
import AiTool from './ai/server/AiTool';
import xfVoice from './audio/XfVoiceDictation';

const LoadingDots = () => (
  <div className="flex h-5 space-x-1 justify-center items-center">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-loading-dot"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-loading-dot" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-loading-dot" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const DraggableChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const animationRef = useRef(null);
  const aiToolRef = useRef(null);
  const timesRef = useRef(null);


  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const updatePosition = () => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(updatePosition);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [handleMouseMove, handleMouseUp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      setIsSending(true);
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      
      aiToolRef.current?.submitHoodle(inputMessage);
    }
  };

  const handleAiResponse = (result) => {
    setMessages(prevMessages => [...prevMessages, { text: result, sender: 'ai' }]);
    setIsSending(false);
  };

  const handleLoadingState = (isLoading) => {
    setIsSending(isLoading);
  };

  const handleError = (hasError) => {
    if (hasError) {
      setMessages(prevMessages => [...prevMessages, { text: "抱歉，出现了一个错误。请稍后再试。", sender: 'ai' }]);
      setIsSending(false);
    }
  };

  const startListening = () => {
    if (xfVoice) {
      if (isListening) {
        xfVoice.stop();
        setIsListening(false);
      } else {
        setIsListening(true);
        xfVoice.start();
        xfVoice.onTextChange = (text) => {
          setInputMessage(text);
          clearTimeout(timesRef.current);
          timesRef.current = setTimeout(() => {
            xfVoice.stop();
            setIsListening(false);
          }, 3000);
        };
      }
    }
  };


  return (
    <div
      ref={chatWindowRef}
      className="absolute bg-white bg-opacity-80 rounded-lg shadow-lg p-4 w-96 transition-shadow duration-300 ease-in-out text-sm"
      style={{
        zIndex: 4,
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: `translate(0, 0)`, // 使用 GPU 加速
        willChange: 'transform' // 提示浏览器元素将被频繁改变
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="font-bold mb-2 cursor-move">聊天窗口</div>
      <div className="h-96 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-2 rounded ${msg.sender === 'user' ? 'bg-blue-200' : 'bg-green-200'} 
                        transition-all duration-300 ease-in-out 
                        ${index === messages.length - 1 ? 'animate-fade-in-up' : ''}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-grow border rounded p-2 transition-all duration-300"
          placeholder="输入消息..."
          disabled={isSending}
        />
        <button
          onClick={startListening}
          className={`p-2 rounded ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} text-white transition-all duration-300`}

        >
          <Mic size={24} className={isListening ? 'animate-mic-glow' : ''}/>
        </button>
        
      </div>
      <div className='mt-2 flex justify-center items-center space-x-2 text-gray-500'>
        <button
          onClick={sendMessage}
          className={`p-2 rounded ${isSending ? 'bg-gray-300' : 'bg-orange-500'} w-full text-white transition-all duration-300`}
          disabled={isSending}
        >
          {isSending ? <LoadingDots /> : '发送'}
        </button>
      </div>
      
      <AiTool
        ref={aiToolRef}
        respondHoodle={handleAiResponse}
        loadHoodle={handleLoadingState}
        errorHoodle={handleError}
      />
    </div>
  );
};

export default DraggableChatWindow;