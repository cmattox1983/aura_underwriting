"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUnderwriting } from "@/context/UnderwritingContext";
import type {
  FollowUpQuestionAnswer,
  FollowUpStructured,
  HealthConditionId,
} from "@/types/underwriting";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

interface HealthChatModalProps {
  conditions: HealthConditionId[];
  onClose: () => void;
}

const PLACEHOLDER_QUESTIONS: Record<HealthConditionId, string[]> = {
  diabetes: [
    "What type of diabetes have you been diagnosed with?",
    "How long have you had this diagnosis?",
    "Is it currently managed with medication or insulin?",
  ],
  heart_disease: [
    "Can you describe your heart condition diagnosis?",
    "Have you had any cardiac procedures or surgeries?",
    "Are you currently on any heart-related medications?",
  ],
  stroke: [
    "When did you experience your stroke?",
    "Did you make a full recovery, or do you have ongoing symptoms?",
    "Are you currently on any blood-thinning medications?",
  ],
  cancer: [
    "What type of cancer were you diagnosed with?",
    "Are you currently in treatment, or are you in remission?",
    "How long ago was your diagnosis, and has it happened more than once?",
  ],
  hypertension: [],
  asthma: [],
};

const CONDITION_LABELS: Record<HealthConditionId, string> = {
  diabetes: "Diabetes",
  heart_disease: "Heart Disease",
  stroke: "Stroke",
  cancer: "Cancer",
  hypertension: "Hypertension",
  asthma: "Asthma",
};

function buildInitialMessages(conditions: HealthConditionId[]): Message[] {
  const conditionList = conditions
    .map((c) => CONDITION_LABELS[c] ?? c)
    .join(", ");

  return [
    {
      id: "intro",
      role: "assistant",
      text: `Thank you for disclosing your health information. I see you've indicated: **${conditionList}**. I have a few quick follow-up questions to help us find the best coverage for you. You can type your answers below.`,
    },
    {
      id: "q1",
      role: "assistant",
      text:
        PLACEHOLDER_QUESTIONS[conditions[0]]?.[0] ??
        "Can you tell me more about your current health status?",
    },
  ];
}

function toNullableNumber(value: string | undefined) {
  if (!value) return null;
  const match = value.match(/\d+/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isNaN(num) ? null : num;
}

function countOccurrencesFromText(value: string | undefined) {
  if (!value) return null;
  const text = value.toLowerCase();

  if (
    text.includes("2") ||
    text.includes("two") ||
    text.includes("twice") ||
    text.includes("second") ||
    text.includes("multiple") ||
    text.includes("more than one") ||
    text.includes("recurrence") ||
    text.includes("recurred") ||
    text.includes("returned") ||
    text.includes("again")
  ) {
    return 2;
  }

  if (text.includes("3") || text.includes("three") || text.includes("third")) {
    return 3;
  }

  if (text.includes("1") || text.includes("one") || text.includes("once")) {
    return 1;
  }

  return null;
}

function mapStructuredConditionData(
  condition: HealthConditionId,
  answers: FollowUpQuestionAnswer[],
): FollowUpStructured {
  if (condition === "cancer") {
    const status = answers[1]?.answer ?? "";
    const timingAndOccurrences = answers[2]?.answer ?? "";
    const combined = `${status} ${timingAndOccurrences}`.toLowerCase();

    return {
      cancer: {
        type: answers[0]?.answer ?? "",
        status,
        yearsAgo: toNullableNumber(timingAndOccurrences),
        occurrences: countOccurrencesFromText(timingAndOccurrences),
        isActive:
          combined.includes("active") ||
          combined.includes("current") ||
          combined.includes("treatment") ||
          combined.includes("chemo") ||
          combined.includes("chemotherapy") ||
          combined.includes("radiation") ||
          combined.includes("immunotherapy"),
      },
    };
  }

  if (condition === "diabetes") {
    return {
      diabetes: {
        type: answers[0]?.answer ?? "",
        yearsAgo: toNullableNumber(answers[1]?.answer),
        controlled: answers[2]?.answer ?? "",
      },
    };
  }

  if (condition === "heart_disease") {
    return {
      heart_disease: {
        diagnosis: answers[0]?.answer ?? "",
        procedures: answers[1]?.answer ?? "",
        medications: answers[2]?.answer ?? "",
      },
    };
  }

  if (condition === "stroke") {
    return {
      stroke: {
        yearsAgo: toNullableNumber(answers[0]?.answer),
        recovery: answers[1]?.answer ?? "",
        medications: answers[2]?.answer ?? "",
      },
    };
  }

  return {};
}

async function interpretConditionWithAI(
  condition: HealthConditionId,
  answers: FollowUpQuestionAnswer[],
): Promise<FollowUpStructured | null> {
  try {
    const response = await fetch("/api/underwriting/interpret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ condition, answers }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      structured?: FollowUpStructured;
    };

    return data.structured ?? null;
  } catch {
    return null;
  }
}

export default function HealthChatModal({
  conditions,
  onClose,
}: HealthChatModalProps) {
  const router = useRouter();
  const { setFollowUpAnswers, setFollowUpStructured } = useUnderwriting();

  const [messages, setMessages] = useState<Message[]>(() =>
    buildInitialMessages(conditions),
  );
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const [conditionIndex, setConditionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(1);

  const [answersByCondition, setAnswersByCondition] = useState<
    Partial<Record<HealthConditionId, FollowUpQuestionAnswer[]>>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && !isNavigating) {
      inputRef.current?.focus();
    }
  }, [isLoading, isNavigating, messages]);

  const totalQuestions = conditions.reduce((acc, c) => {
    return acc + (PLACEHOLDER_QUESTIONS[c]?.length ?? 1);
  }, 0);

  const answeredCount = messages.filter((m) => m.role === "user").length;
  const progressPercent = Math.min(
    Math.round((answeredCount / totalQuestions) * 100),
    100,
  );

  const getNextQuestion = (
    cIdx: number,
    qIdx: number,
  ): { text: string; cIdx: number; qIdx: number } | null => {
    const condition = conditions[cIdx];
    const questions = PLACEHOLDER_QUESTIONS[condition] ?? [];

    if (qIdx < questions.length) {
      return { text: questions[qIdx], cIdx, qIdx };
    }

    const nextCIdx = cIdx + 1;

    if (nextCIdx < conditions.length) {
      const nextCondition = conditions[nextCIdx];
      const nextQuestions = PLACEHOLDER_QUESTIONS[nextCondition] ?? [];

      if (nextQuestions.length > 0) {
        return { text: nextQuestions[0], cIdx: nextCIdx, qIdx: 1 };
      }
    }

    return null;
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || isDone) return;

    const currentCondition = conditions[conditionIndex];
    const currentQuestion =
      PLACEHOLDER_QUESTIONS[currentCondition]?.[questionIndex - 1] ?? "";

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setInputValue("");
    setMessages((prev) => [...prev, userMsg]);

    setAnswersByCondition((prev) => ({
      ...prev,
      [currentCondition]: [
        ...(prev[currentCondition] ?? []),
        {
          question: currentQuestion,
          answer: trimmed,
        },
      ],
    }));

    setIsLoading(true);

    setTimeout(() => {
      const next = getNextQuestion(conditionIndex, questionIndex);

      if (next) {
        setConditionIndex(next.cIdx);
        setQuestionIndex(next.qIdx + 1);

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: next.text,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
      } else {
        const doneMsg: Message = {
          id: `done-${Date.now()}`,
          role: "assistant",
          text: "Thank you — that's everything I need. Your responses have been noted and will be factored into your coverage assessment. Click **Continue** when you're ready to proceed.",
        };

        setMessages((prev) => [...prev, doneMsg]);
        setIsLoading(false);
        setIsDone(true);
      }
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContinue = async () => {
    setIsNavigating(true);

    let structuredData: FollowUpStructured = {};

    for (const condition of conditions) {
      const answers = answersByCondition[condition] ?? [];
      setFollowUpAnswers(condition, answers);

      const aiStructured = await interpretConditionWithAI(condition, answers);
      const fallbackStructured = mapStructuredConditionData(condition, answers);

      structuredData = {
        ...structuredData,
        ...(aiStructured ?? fallbackStructured),
      };
    }

    setFollowUpStructured(structuredData);

    setTimeout(() => {
      router.push("/underwriting/coverage");
    }, 600);
  };

  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
    );
  };

  if (isNavigating) {
    return (
      <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-headline text-2xl text-primary-container">
            Analysing your profile
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Preparing your personalised coverage options…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="bg-primary-container px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">
                health_and_safety
              </span>
            </div>
            <div>
              <p className="font-headline text-lg text-on-primary leading-tight">
                Health Assessment
              </p>
              <p className="font-body text-xs text-on-primary-container mt-0.5">
                Aura Underwriting — Confidential
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-primary-container hover:text-on-primary transition-colors mt-0.5 shrink-0"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="h-1 bg-surface-container-high shrink-0">
          <div
            className="h-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex gap-2 flex-wrap px-6 pt-4 shrink-0">
          {conditions.map((c) => (
            <span
              key={c}
              className="text-[11px] font-label font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant"
            >
              {CONDITION_LABELS[c] ?? c}
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <span className="material-symbols-outlined text-white text-[14px]">
                    smart_toy
                  </span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-surface-container-low text-on-surface rounded-tl-sm"
                    : "bg-secondary text-white rounded-tr-sm"
                }`}
              >
                {renderText(msg.text)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[14px]">
                  smart_toy
                </span>
              </div>
              <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10">
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-outline-variant/10 shrink-0">
          {!isDone ? (
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Type your answer…"
                className="flex-1 h-12 px-4 bg-surface-container-lowest rounded-lg ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-secondary outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                aria-label="Send"
              >
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full editorial-gradient text-white py-4 rounded-lg font-label font-semibold tracking-wide flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Continue to Coverage Details
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          )}

          <p className="text-[11px] text-on-surface-variant/50 text-center mt-3 font-body italic">
            Your responses are encrypted and handled under private banking
            standards.
          </p>
        </div>
      </div>
    </div>
  );
}
