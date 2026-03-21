import { useState, useCallback } from "react";
import { streamCookingAssistant } from "@/services/aiService";
import { trackError, trackEvent } from "@/lib/telemetry";

type Message = { role: "user" | "assistant"; content: string };

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setLastPrompt(input);
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    let assistantSoFar = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const allMessages = [...messages, userMsg];
      await streamCookingAssistant(allMessages, upsertAssistant);
      trackEvent("ai_chat_success", { messageCount: allMessages.length });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      trackError("ai_chat_failure", e, { inputLength: input.length });
      // Remove the user message if nothing was received
      if (!assistantSoFar) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastPrompt(null);
  }, []);

  const retryLast = useCallback(() => {
    if (!lastPrompt || isLoading) return;
    setError(null);
    void sendMessage(lastPrompt);
  }, [lastPrompt, isLoading, sendMessage]);

  return { messages, isLoading, error, sendMessage, clearChat, retryLast, canRetry: Boolean(lastPrompt) };
}
