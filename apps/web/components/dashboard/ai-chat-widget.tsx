"use client";

import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export function AIChatWidget() {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement AI chat functionality
      console.log("Sending message:", message);
      setMessage("");
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
            <div className="rounded-full bg-primary/5 p-2.5">
              <Sparkles className="h-5 w-5 text-primary" />
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
            <MessageSquare className="h-5 w-5 text-muted-foreground/30" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/5 p-2">
              <Sparkles className="h-4 w-4 text-primary" />
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

      <div className="p-4 h-64 overflow-y-auto">
        <div className="space-y-4">
          {/* Welcome message */}
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/5 p-1.5 h-fit">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 rounded-lg bg-muted/50 p-3">
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
                "Change my Workout plan to include bench press",
                "Tips for better form",
                "How to improve recovery",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="text-left text-xs rounded-md border border-border bg-background px-3 py-2 hover:bg-primary/5 hover:border-primary/20 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
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
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
