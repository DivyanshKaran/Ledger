import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAIChat } from "@/hooks/useAIChat";

vi.mock("@/services/aiService", () => ({
  streamCookingAssistant: vi.fn(),
}));

vi.mock("@/lib/telemetry", () => ({
  trackEvent: vi.fn(),
  trackError: vi.fn(),
}));

describe("useAIChat", () => {
  it("streams assistant chunks into messages", async () => {
    const { streamCookingAssistant } = await import("@/services/aiService");
    vi.mocked(streamCookingAssistant).mockImplementation(async (_messages, onChunk) => {
      onChunk("Hello");
      onChunk(" world");
    });

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toEqual({ role: "assistant", content: "Hello world" });
    expect(result.current.error).toBeNull();
  });

  it("captures service errors and exposes retry", async () => {
    const { streamCookingAssistant } = await import("@/services/aiService");
    vi.mocked(streamCookingAssistant).mockRejectedValueOnce(new Error("Temporary failure"));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("Need help");
    });

    expect(result.current.error).toBe("Temporary failure");
    expect(result.current.canRetry).toBe(true);
  });
});
