import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const hasGreeted = useRef(false);

  const toggleChat = () => {
    setOpen((prev) => {
      const nowOpen = !prev;
      if (nowOpen && !hasGreeted.current) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "👋 Hi there! How can I help you today?",
          },
        ]);
        hasGreeted.current = true;
      }
      return nowOpen;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: input,
      });
      const botMessage = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 z-50"
      >
        💬
      </button>

      {/* Animated Chat Popup */}
      <div
        className={`fixed bottom-20 right-5 w-80 h-[500px] bg-white border border-gray-300 rounded-xl shadow-xl flex flex-col z-50 transform transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
          <span className="font-semibold">🤖 Assistant</span>
          <button
            onClick={toggleChat}
            className="text-white hover:text-gray-300 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[90%] px-4 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-white text-gray-800 border"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto text-gray-500 text-sm bg-white border px-3 py-2 rounded-lg">
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
