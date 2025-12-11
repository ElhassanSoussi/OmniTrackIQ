"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface MetricValue {
  name: string;
  value: string;
  change?: string;
  change_direction?: "up" | "down" | "neutral";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  metrics?: MetricValue[];
  suggestions?: string[];
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  conversation_id: string;
  response_type: "metrics" | "faq" | "help" | "general";
  metrics?: MetricValue[];
  suggestions?: string[];
}

interface ChatSuggestion {
  text: string;
  category: "metrics" | "help" | "feature";
}

const INITIAL_SUGGESTIONS: ChatSuggestion[] = [
  { text: "What's my revenue this week?", category: "metrics" },
  { text: "Show me my ROAS", category: "metrics" },
  { text: "How do I connect Shopify?", category: "help" },
  { text: "What is cohort analysis?", category: "feature" },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(INITIAL_SUGGESTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiFetch<ChatResponse>("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          message: text.trim(),
          conversation_id: conversationId,
        }),
      });

      if (response) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.message,
          metrics: response.metrics,
          suggestions: response.suggestions,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(response.conversation_id);

        // Update suggestions if provided
        if (response.suggestions) {
          setSuggestions(
            response.suggestions.map((s) => ({
              text: s,
              category: "metrics" as const,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setSuggestions(INITIAL_SUGGESTIONS);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-full shadow-lg transition-all duration-200 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Open chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Ask Your Data</span>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[400px] max-h-[600px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xl flex flex-col transition-all duration-200 ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#dafbe1] dark:bg-[#238636]/20 rounded-md">
              <Sparkles className="h-4 w-4 text-[#238636] dark:text-[#3fb950]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                Ask Your Data
              </h3>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                AI-powered analytics assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="p-1.5 text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] rounded-md transition-colors text-xs"
                title="New conversation"
              >
                New chat
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] rounded-md transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center py-6">
              <div className="inline-flex p-3 bg-[#f6f8fa] dark:bg-[#21262d] rounded-full mb-4">
                <MessageCircle className="h-6 w-6 text-[#57606a] dark:text-[#8b949e]" />
              </div>
              <p className="text-[#57606a] dark:text-[#8b949e] text-sm mb-4">
                Ask me about your metrics, integrations, or features
              </p>
              
              {/* Initial Suggestions */}
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-3 py-2 text-sm bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#eaeef2] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#1f2328] dark:text-[#e6edf3] transition-colors flex items-center justify-between group"
                  >
                    <span>{suggestion.text}</span>
                    <ArrowRight className="h-3 w-3 text-[#57606a] dark:text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === "user"
                        ? "bg-[#238636] text-white rounded-2xl rounded-tr-sm px-4 py-2"
                        : "bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#e6edf3] rounded-2xl rounded-tl-sm px-4 py-3"
                    }`}
                  >
                    {/* Message Content with Markdown-like formatting */}
                    <div 
                      className={`text-sm whitespace-pre-wrap ${
                        message.role === "assistant" ? "prose prose-sm dark:prose-invert max-w-none" : ""
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br>")
                      }}
                    />
                    
                    {/* Metrics Cards */}
                    {message.metrics && message.metrics.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.metrics.map((metric, mIndex) => (
                          <div
                            key={mIndex}
                            className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-2"
                          >
                            <div className="text-xs text-[#57606a] dark:text-[#8b949e]">
                              {metric.name}
                            </div>
                            <div className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                              {metric.value}
                            </div>
                            {metric.change && (
                              <div
                                className={`text-xs ${
                                  metric.change_direction === "up"
                                    ? "text-[#238636] dark:text-[#3fb950]"
                                    : metric.change_direction === "down"
                                    ? "text-[#cf222e] dark:text-[#f85149]"
                                    : "text-[#57606a] dark:text-[#8b949e]"
                                }`}
                              >
                                {metric.change}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#f6f8fa] dark:bg-[#21262d] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-[#57606a] dark:text-[#8b949e] animate-spin" />
                      <span className="text-sm text-[#57606a] dark:text-[#8b949e]">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Follow-up Suggestions */}
              {messages.length > 0 &&
                !isLoading &&
                messages[messages.length - 1].role === "assistant" &&
                messages[messages.length - 1].suggestions && (
                  <div className="pt-2 space-y-1">
                    <p className="text-xs text-[#57606a] dark:text-[#8b949e] mb-2">
                      Suggested questions:
                    </p>
                    {messages[messages.length - 1].suggestions?.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-2 py-1.5 text-xs bg-transparent hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] border border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d] rounded text-[#0969da] dark:text-[#58a6ff] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#d0d7de] dark:border-[#30363d]"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your metrics..."
              className="flex-1 px-3 py-2 bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#57606a] dark:placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#94d3a2] dark:disabled:bg-[#238636]/50 text-white rounded-md transition-colors disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
