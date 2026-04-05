"use client";

import { cn } from "@/lib/utils";

interface AIMessageBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  isStreaming?: boolean;
}

export function AIMessageBubble({ content, role, isStreaming }: AIMessageBubbleProps) {
  const isUser = role === "user";

  // Simple formatter: convert markdown-ish text to paragraphs
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold: **text**
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code class='bg-muted px-1 rounded text-xs'>$1</code>");

      // Headers
      if (line.startsWith("### ")) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith("## ")) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>;

      // Bullet points
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }

      // Empty line
      if (line.trim() === "") return <br key={i} />;

      // Regular text
      return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "rounded-lg px-3 py-2 max-w-[90%]",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
      )}>
        <div className={cn("text-sm", isUser ? "text-primary-foreground" : "text-foreground")}>
          {renderContent(content)}
        </div>
        {isStreaming && (
          <div className="flex gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}
