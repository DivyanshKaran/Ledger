import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Loader2, Bot, User, AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAIChat } from "@/hooks/useAIChat";
import { sanitizeExternalUrl, sanitizeMarkdownUrl } from "@/lib/security";
import { Button } from "./ui/button";

export default function AICookingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, clearChat, retryLast, canRetry } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const suggestions = [
    "What can I make with chicken and rice?",
    "Substitute for heavy cream?",
    "Quick dinner under $10?",
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI cooking assistant"
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center group"
            whileHover={{ scale: 1.08, boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-5 right-5 z-50 w-[400px] max-w-[calc(100%-2.5rem)] h-[560px] max-h-[calc(100vh-5rem)] bg-card border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">AI Chef</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">Your cooking companion</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={clearChat}
                    aria-label="Clear conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI cooking assistant"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Hey there!</p>
                  <p className="text-xs text-muted-foreground mb-5">
                    Ask me anything about cooking, recipes, or ingredients.
                  </p>
                  <div className="space-y-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="block w-full text-left text-xs px-3 py-2.5 rounded-xl border border-border/60 bg-background hover:bg-muted hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-xs [&>pre]:bg-background/50 [&>pre]:rounded-lg [&>pre]:p-2 [&>pre]:text-xs [&>code]:text-xs [&>code]:bg-background/50 [&>code]:px-1 [&>code]:rounded break-words">
                          <ReactMarkdown
                            skipHtml
                            disallowedElements={["img", "video", "audio", "iframe", "object", "embed", "script", "style"]}
                            urlTransform={sanitizeMarkdownUrl}
                            components={{
                              a: ({ href, children }) => {
                                const safeHref = sanitizeExternalUrl(href);
                                if (!safeHref) return <span>{children}</span>;
                                return (
                                  <a href={safeHref} target="_blank" rel="noopener noreferrer nofollow">
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              {error && (
                <div role="alert" className="flex items-center justify-between gap-2 text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {canRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={retryLast}
                      disabled={isLoading}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/40 bg-muted/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2 items-end"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about cooking..."
                  rows={1}
                  className="flex-1 min-h-[36px] max-h-[120px] resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-xl shrink-0"
                  aria-label="Send message"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
