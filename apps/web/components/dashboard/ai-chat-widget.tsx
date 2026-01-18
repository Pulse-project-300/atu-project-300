"use client";

import { MessageSquare, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatWidgetProps {
  workoutPlan?: any;
}

export function AIChatWidget({ workoutPlan }: AIChatWidgetProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      setMessage("");

      // Add user message to chat
      const newMessages = [...messages, { role: "user" as const, content: userMessage }];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        // Call the chat API with workout plan context
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            workoutPlan: workoutPlan,
            chatHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get response: ${response.statusText}`);
        }

        const data = await response.json();

        // Add assistant response to chat
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      } catch (err: any) {
        console.error("Error getting chat response:", err);
        // Add error message to chat
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isExpanded) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 text-left hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                AI Workout Assistant
                <span className="text-xs font-normal text-muted-foreground">
                  (Click to chat)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get personalised workout advice and tips
              </p>
            </div>
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm flex flex-col h-[600px]">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Workout Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Ask me anything about your fitness
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Minimize
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <>
              <div className="flex gap-3">
                <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 h-fit">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3">
                  <p className="text-sm">
                    Hi! I'm your AI workout assistant. I can help you with workout
                    plans, exercise tips, and answer any fitness questions you have.
                    What would you like to know?
                  </p>
                </div>
              </div>

              {/* Suggested prompts */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                <div className="grid gap-2">
                  {[
                    "What exercises are in my plan?",
                    "Tips for better squat form",
                    "How can I improve recovery?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setMessage(prompt)}
                      className="text-left text-xs rounded-md border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5 px-3 py-2 hover:from-purple-500/10 hover:to-pink-500/10 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Chat messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className="flex gap-3">
              {msg.role === "assistant" && (
                <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 h-fit">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`flex-1 rounded-lg p-3 ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                    : "bg-blue-500/10 ml-auto max-w-[85%]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 h-fit">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
