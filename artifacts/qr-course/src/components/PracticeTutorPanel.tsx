import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAskTutor } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { MathKeyboard } from "@/components/MathKeyboard";
import { Keyboard } from "lucide-react";

type ChatMsg = { role: "user" | "tutor"; text: string };

/**
 * Always-on live tutor for practice runs. Grounded in the current problem so the
 * student can ask for hints and explanations while they work. Hidden only during
 * graded assignments.
 */
export function PracticeTutorPanel({
  problemPrompt,
  problemContext,
}: {
  problemPrompt?: string;
  problemContext?: string;
}) {
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const ask = useAskTutor();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [history.length, ask.isPending]);

  const insertAtCursor = useCallback((text: string) => {
    if (!text) return;
    const ta = textareaRef.current;
    setInput((current) => {
      if (ta && document.activeElement === ta) {
        const start = ta.selectionStart ?? current.length;
        const end = ta.selectionEnd ?? current.length;
        const next = current.slice(0, start) + text + current.slice(end);
        const caret = start + text.length;
        requestAnimationFrame(() => {
          ta.focus();
          try {
            ta.setSelectionRange(caret, caret);
          } catch {}
        });
        return next;
      }
      return current + text;
    });
  }, []);

  const backspaceAtCursor = useCallback(() => {
    const ta = textareaRef.current;
    setInput((current) => {
      if (ta && document.activeElement === ta) {
        const start = ta.selectionStart ?? current.length;
        const end = ta.selectionEnd ?? current.length;
        let next: string;
        let caret: number;
        if (start === end) {
          if (start === 0) return current;
          next = current.slice(0, start - 1) + current.slice(end);
          caret = start - 1;
        } else {
          next = current.slice(0, start) + current.slice(end);
          caret = start;
        }
        requestAnimationFrame(() => {
          ta.focus();
          try {
            ta.setSelectionRange(caret, caret);
          } catch {}
        });
        return next;
      }
      return current.slice(0, -1);
    });
  }, []);

  const clearAll = useCallback(() => {
    setInput("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  function sendMessage(msg: string) {
    const text = msg.trim();
    if (!text) return;
    setHistory((h) => [...h, { role: "user", text }]);
    const context =
      problemContext ??
      (problemPrompt
        ? `The student is working on this practice problem right now:\n${problemPrompt}\nHelp them reason it out and write the answer in symbols — give hints and nudges, do not just hand over the full answer unless they ask directly.`
        : undefined);
    ask.mutate(
      {
        data: {
          message: text,
          selectedLectureText: context,
        },
      },
      {
        onSuccess: (res) => {
          setHistory((h) => [...h, { role: "tutor", text: res.text }]);
        },
        onError: (e) => {
          setHistory((h) => [
            ...h,
            { role: "tutor", text: `Tutor error: ${(e as Error).message}` },
          ]);
        },
      },
    );
  }

  function send() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    sendMessage(msg);
  }

  const starters = [
    "Give me a hint to get started",
    "How do I translate this into symbols?",
    "Which connective or quantifier do I need here?",
  ];

  return (
    <div className="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/40">
        <h3 className="font-serif font-semibold text-primary flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
          Live Tutor
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Here to help while you practice — ask anything.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {history.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Stuck? Try one of these:
            </p>
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-secondary/60 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {history.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm max-w-[92%] ${
              m.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-secondary/60 self-start"
            }`}
          >
            {m.role === "tutor" ? (
              <MarkdownRenderer content={m.text} />
            ) : (
              m.text
            )}
          </div>
        ))}
        {ask.isPending && (
          <div className="self-start bg-secondary/60 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask the tutor… use the symbol keyboard below for ∧ ∨ ¬ → ∀ ∃ ⊢ … (Cmd/Ctrl+Enter to send)"
          className="w-full resize-y min-h-[120px] max-h-72 p-3 text-base font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
        />
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant={showKeyboard ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowKeyboard((v) => !v)}
            className="gap-1.5"
          >
            <Keyboard className="w-4 h-4" />
            {showKeyboard ? "Hide symbols" : "Symbols"}
          </Button>
          <span className="text-xs text-muted-foreground flex-1">
            Cmd/Ctrl+Enter to send
          </span>
          <Button onClick={send} disabled={ask.isPending || !input.trim()} size="sm">
            Send
          </Button>
        </div>
        {showKeyboard && (
          <MathKeyboard
            onInsert={insertAtCursor}
            onBackspace={backspaceAtCursor}
            onClear={clearAll}
          />
        )}
      </div>
    </div>
  );
}
