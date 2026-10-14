"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Paperclip,
  Mic,
  X,
  Sparkles,
  ChevronRight,
  Headphones,
} from "lucide-react";

interface ChatMessage {
  id: number;
  sender: string;
  senderName?: string;
  message: string;
  createdAt?: string;
}

interface LiveChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry?: (countryName: string) => void;
}

export const LiveChatSheet: React.FC<LiveChatSheetProps> = ({
  isOpen,
  onClose,
  onSelectCountry,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "consultant">("ai");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Which visa is right for me?",
    "How can I apply for Australia?",
    "What documents do I need?",
    "Show me recruitment opportunities.",
  ];

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    setInputText("");
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      senderName: "You",
      message: text,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: chatMode }),
      });
      const data = await res.json();
      if (data.success && data.replyMessage) {
        setMessages((prev) => [...prev, data.replyMessage]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center">
      <div className="w-full max-w-lg h-[92vh] sm:h-[82vh] bg-white dark:bg-slate-900 rounded-t-[36px] sm:rounded-[36px] flex flex-col overflow-hidden shadow-2xl border border-white/60 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight leading-tight">
                World Vision Support
              </h3>
              <p className="text-[11px] text-blue-200">
                {chatMode === "ai"
                  ? "Ava • AI guide, answers instantly"
                  : "Visa desk • a consultant replies here"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="p-0.5 rounded-xl bg-white/20 flex text-[10px] font-bold">
              <button
                onClick={() => setChatMode("ai")}
                className={`px-2 py-1 rounded-lg transition-all ${
                  chatMode === "ai" ? "bg-white text-blue-900 shadow-xs" : "text-white/80"
                }`}
              >
                AI
              </button>
              <button
                onClick={() => setChatMode("consultant")}
                className={`px-2 py-1 rounded-lg transition-all ${
                  chatMode === "consultant" ? "bg-white text-blue-900 shadow-xs" : "text-white/80"
                }`}
              >
                Visa desk
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs mt-1">
                    {m.sender === "consultant" ? "👨‍💼" : "🤖"}
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-[22px] px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line"
                  }`}
                >
                  {!isUser && (
                    <span className="block text-[10px] font-bold text-blue-600 dark:text-cyan-400 mb-0.5">
                      {m.senderName || "World Vision Advisor"}
                    </span>
                  )}
                  {m.message}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <span className="animate-pulse">Thinking…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => alert("Document attachment: Select file from your device.")}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              chatMode === "ai"
                ? "Ask about Australia, Serbia, Singapore..."
                : "Message senior visa counselor..."
            }
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
