"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AIAssistantDrawer,
  type AIAssistantContext,
} from "./ai-assistant-drawer";

interface AIAssistantFABProps {
  context?: AIAssistantContext;
}

export function AIAssistantFAB({ context }: AIAssistantFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Desktop-only FAB — hidden on mobile (nav handles it there) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 h-10 items-center gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        aria-label="Open Pulse AI"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Pulse AI</span>
      </button>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetTitle className="sr-only">AI Assistant</SheetTitle>
        <AIAssistantDrawer context={context} />
      </SheetContent>
    </Sheet>
  );
}
