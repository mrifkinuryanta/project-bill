"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import { AIChatInput } from "./ai-chat-input";
import { AIMessageBubble } from "./ai-message-bubble";
import { AIInsightCard } from "./ai-insight-card";
import type { BaseMessage, ChatMessage, ProactiveInsight } from "@/lib/ai/types";

interface ConversationListItem {
  id: string;
  title: string;
  _count: { messages: number };
}

export function AIChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didLoadRef = useRef(false);

  // Load conversations on mount
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    fetch("/api/agent/history")
      .then((res) => res.ok ? res.json() : { conversations: [] })
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamContent]);

  const openConversation = (id: string) => {
    setConversationId(id);
    setStreamContent("");
    fetch(`/api/agent/history?conversationId=${id}`)
      .then((res) => res.ok ? res.json() : { messages: [] })
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  };

  const newConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setStreamContent("");
  };

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamContent("");

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, conversationId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") {
            setIsStreaming(false);
            setStreamContent("");
            // Refresh conversation list
            fetch("/api/agent/history").then((r) => r.ok ? r.json() : { conversations: [] })
              .then((d) => setConversations(d.conversations ?? [])).catch(() => {});
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "chunk") {
              setStreamContent((prev) => prev + parsed.content);
            } else if (parsed.type === "done") {
              setConversationId(parsed.conversationId);
              if (!conversationId) {
                fetch(`/api/agent/history?conversationId=${parsed.conversationId}`)
                  .then((r) => r.ok ? r.json() : { messages: [] })
                  .then((d) => setMessages(d.messages ?? []))
                  .catch(() => {});
              }
              setIsStreaming(false);
              setStreamContent("");
            } else if (parsed.type === "error") {
              setStreamContent(`⚠️ Error: ${parsed.message}`);
              setIsStreaming(false);
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      setStreamContent("⚠️ An error occurred. Please try again.");
      setIsStreaming(false);
    }
  };

  const displayMessages = streamContent
    ? [...messages, { id: "streaming", role: "assistant" as const, content: streamContent, createdAt: new Date() } as ChatMessage]
    : messages;

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Financial Co-Pilot</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={newConversation} className="h-7 gap-1 px-2 text-xs">
          <Plus className="h-3 w-3" /> New
        </Button>
      </CardHeader>

      <div className="flex shrink-0 overflow-x-auto border-b bg-muted/30 py-1 px-2 gap-1">
        {conversations.slice(0, 6).map((c) => (
          <Button
            key={c.id}
            variant={conversationId === c.id ? "default" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs whitespace-nowrap shrink-0"
            onClick={() => openConversation(c.id)}
          >
            {c.title}
          </Button>
        ))}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-3 min-h-0">
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Bot className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">Hello! 👋</p>
            <p className="text-xs mt-1">I'm your AI assistant. Ask me anything about your business.</p>
            <div className="flex flex-wrap gap-1 mt-3 justify-center">
              {["What's my total revenue this month?", "Which invoices are unpaid?", "Who is my best client?"].map((q) => (
                <Button key={q} variant="outline" size="sm" className="text-xs h-7" onClick={() => sendMessage(q)}>
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {displayMessages.map((msg) => (
            <AIMessageBubble
              key={msg.id}
              content={msg.content}
              role={msg.role}
              isStreaming={msg.id === "streaming" && isStreaming}
            />
          ))}
        </div>
      </ScrollArea>

      <AIChatInput onSend={sendMessage} disabled={isStreaming} />
    </Card>
  );
}
