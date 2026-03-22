"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AiAssistantProps = {
  locale: string;
};

function detectArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
}

export default function AiAssistant({ locale }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "أثر AI" : "Athr AI",
    subtitle: isAr ? "مساعدك الذكي — مدعوم بكلود" : "Smart Assistant — Powered by Claude",
    placeholder: isAr ? "اسأل أي سؤال..." : "Ask anything...",
    send: isAr ? "إرسال" : "Send",
    close: isAr ? "إغلاق" : "Close",
    error: isAr ? "حصل خطأ، حاول مرة تانية" : "Something went wrong, try again",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: isAr
            ? "حبابك! أنا أثر AI، مساعدك الذكي. اسألني أي حاجة عن:\n\n• التأشيرات والإقامة في السعودية\n• تسجيل الأعمال والرخص\n• المنطقة الشرقية\n• المجتمع السوداني\n• منصة أثر وكيف تستفيد منها\n\nقول لي شنو محتاج!"
            : "Welcome! I'm Athr AI, your smart assistant. Ask me anything about:\n\n• Visas & iqama in Saudi Arabia\n• Business registration & licensing\n• Eastern Region resources\n• Sudanese community\n• How to use the Athr platform\n\nWhat can I help you with?",
        },
      ]);
    }
  }, [isOpen, messages.length, isAr]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Send only user/assistant messages (exclude welcome if it's the only one)
      const chatMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || t.error,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t.error,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-gold glow-gold flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label={isOpen ? t.close : t.title}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
          style={{ animationDuration: "0.3s" }}
        >
          {/* Header */}
          <div className="gradient-gold px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-background text-base">{t.title}</h3>
              <p className="text-background/70 text-xs">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-background/70 hover:text-background transition-colors"
              aria-label={t.close}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-gold text-background"
                      : "glass rounded-2xl text-foreground"
                  }`}
                  dir={detectArabic(msg.content) ? "rtl" : "ltr"}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl px-4 py-3 text-sm text-muted">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-surface rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted border border-border focus:border-gold focus:outline-none transition-colors"
                dir={detectArabic(input) ? "rtl" : "ltr"}
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="gradient-gold rounded-xl px-4 py-3 text-background font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
