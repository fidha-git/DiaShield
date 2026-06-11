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
        const formatted = [];
        (data.chats || []).forEach((item, idx) => {
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
    <div className="h-[calc(100vh-5rem)] md:h-screen flex flex-col relative transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-sky-100 dark:border-slate-800/80 shadow-sm flex justify-between items-center px-6 py-4 w-full sticky top-0 z-40">
        <div className="flex-1">
          <span className="font-headline-md text-headline-md text-slate-900 dark:text-slate-100 font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            AI Medical Assistant
          </span>
          <span className="block font-label-md text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Endocrinology Support System</span>
        </div>
        <button 
          onClick={() => alert('DiaShield Care System: Complete clinical AI chat protocols are active.')}
          className="text-slate-400 hover:text-sky-500 transition-colors duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-sky-100 dark:border-slate-800/80 ${msg.sender === "ai" ? "bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400" : "bg-sky-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {msg.sender === "ai" ? "smart_toy" : "person"}
              </span>
            </div>
            {/* Bubble */}
            <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : ""}`}>
              <div
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg shadow-slate-100/50 dark:shadow-none border border-sky-100 dark:border-slate-800/80 ${msg.sender === "ai" ? "rounded-tl-none ring-1 ring-sky-200 dark:ring-slate-850" : "rounded-tr-none bg-sky-50 dark:bg-slate-800 border-sky-250 dark:border-slate-700"}`}
              >
                <div className="font-body-md text-body-md text-slate-900 dark:text-slate-100 leading-relaxed">
                  <p>{msg.text}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 opacity-60 font-label-md">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-4 max-w-3xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-slate-850">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <div className="bg-white dark:bg-slate-900 rounded-2xl rounded-tl-none p-4 shadow-md border border-sky-100 dark:border-slate-850">
                <span className="text-slate-400 dark:text-slate-500">DiaShield AI is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Sticky Panel */}
      <div className="absolute bottom-0 left-0 w-full p-6 pt-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#090D16] dark:via-[#090D16]/95 dark:to-transparent pb-[calc(1.5rem+80px)] md:pb-6 z-30">
        <div className="max-w-3xl mx-auto">
          {/* Suggestion Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scroll w-full pb-1">
            {suggestedChips.map((chip, i) => (
              <button 
                key={i}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-sky-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 hover:border-sky-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-650 dark:hover:text-sky-300 font-label-md text-label-md cursor-pointer transition-all backdrop-blur-md"
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2.5 border border-sky-100 dark:border-slate-800 focus-within:border-sky-400 dark:focus-within:border-sky-500 transition-colors shadow-2xl">
              <button
                type="button"
                onClick={() => alert('Attachments: PDF Clinical logs or laboratory data can be uploaded here.')}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <input
                className="bg-transparent flex-1 border-none outline-none text-slate-900 dark:text-slate-100 font-body-md text-body-md p-2 placeholder:text-slate-400 dark:placeholder:text-slate-550 focus:ring-0"
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
                className="bg-sky-500 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/30 transition-all shrink-0 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </form>
          {/* Error Message */}
          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-550 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-label-md text-[14px] animate-fade-in">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
