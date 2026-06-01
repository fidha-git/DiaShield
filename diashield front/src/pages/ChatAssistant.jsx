import React, { useState, useEffect, useRef } from "react";
import { getChatHistory, sendMessage } from "../services/chatService";

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setError("");
      try {
        const data = await getChatHistory();
        console.log("Chat History:", data);
        // Expecting array of { message, response }
        const formatted = [];
        data.forEach((item, idx) => {
          if (item.message) {
            formatted.push({
              id: idx * 2 + 1,
              sender: "user",
              text: item.message,
              time: ""
            });
          }
          if (item.response) {
            formatted.push({
              id: idx * 2 + 2,
              sender: "ai",
              text: item.response,
              time: ""
            });
          }
        });
        setMessages(formatted);
      } catch (e) {
        setError("Unable to contact AI assistant. Please try again.");
      }
    };
    fetchHistory();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestedChips = [
    "What foods should I avoid?",
    "What are diabetes symptoms?",
    "Exercise suggestions",
  ];

  // Send message to backend
  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;
    setError("");
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: textToSend,
        time: now,
      },
    ]);
    setInputValue("");
    setLoading(true);
    try {
      const res = await sendMessage(textToSend);
      console.log("Chat Response:", res);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: res.response,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setError("Unable to contact AI assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen flex flex-col relative bg-surface">
      {/* Header */}
      <header className="bg-surface-dim/80 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-gutter py-unit-4 w-full sticky top-0 z-40">
        <div className="flex-1">
          <span className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
            AI Medical Assistant
          </span>
          <span className="block font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Endocrinology Support System</span>
        </div>
        <button 
          onClick={() => alert('DiaShield Care System: Complete clinical AI chat protocols are active.')}
          className="text-on-surface-variant hover:text-tertiary transition-colors duration-200"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-gutter py-unit-6 space-y-6 pb-40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${msg.sender === "ai" ? "bg-primary-container text-tertiary" : "bg-secondary-container text-secondary"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {msg.sender === "ai" ? "smart_toy" : "person"}
              </span>
            </div>
            {/* Bubble */}
            <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : ""}`}>
              <div
                className={`glass-card rounded-2xl p-unit-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-white/5 ${msg.sender === "ai" ? "rounded-tl-none ring-1 ring-secondary-container/20" : "rounded-tr-none bg-[#7c3aed]/10 border-[#7c3aed]/25"}`}
              >
                <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                  <p>{msg.text}</p>
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1.5 opacity-60 font-label-md">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-primary-container text-tertiary flex items-center justify-center shrink-0 border border-white/5">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <div className="glass-card rounded-2xl rounded-tl-none p-4 shadow-md border border-white/5">
                <span className="text-on-surface-variant">DiaShield AI is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Sticky Panel */}
      <div className="absolute bottom-0 left-0 w-full p-gutter pt-0 bg-gradient-to-t from-background via-background/95 to-transparent pb-[calc(1.5rem+80px)] md:pb-gutter z-30">
        <div className="max-w-3xl mx-auto">
          {/* Suggestion Chips */}
          <div className="flex gap-unit-2 mb-unit-4 overflow-x-auto hide-scroll w-full pb-1">
            {suggestedChips.map((chip, i) => (
              <button 
                key={i}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-unit-4 py-unit-2 rounded-full border border-white/10 bg-surface-container-high/50 hover:bg-white/10 hover:border-tertiary/30 text-on-surface-variant hover:text-tertiary font-label-md text-label-md cursor-pointer transition-all backdrop-blur-md"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-container/30 to-tertiary/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center gap-2 bg-surface-container-high/90 backdrop-blur-xl rounded-xl p-2 border border-white/10 focus-within:border-tertiary/50 transition-colors shadow-lg">
              <button
                type="button"
                onClick={() => alert('Attachments: PDF Clinical logs or laboratory data can be uploaded here.')}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <input
                className="bg-transparent flex-1 border-none outline-none text-on-surface font-body-md text-body-md p-2 placeholder:text-on-surface-variant/50 focus:ring-0"
                placeholder="Ask DiaShield AI anything about your health..."
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
              />
              <button
                type="submit"
                className="bg-tertiary text-on-tertiary w-10 h-10 rounded-lg flex items-center justify-center hover:bg-tertiary-fixed-dim hover:shadow-[0_0_15px_rgba(76,215,246,0.4)] transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </form>
              {/* Error Message */}
              {error && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-3 rounded-xl shadow-lg z-50 font-label-md text-[14px] animate-fade-in">
                  {error}
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
