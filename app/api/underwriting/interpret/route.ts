import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  FollowUpQuestionAnswer,
  HealthConditionId,
} from "@/types/underwriting";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildSchema(condition: HealthConditionId) {
  if (condition === "cancer") {
    return {
      type: "object",
      properties: {
        cancer: {
          type: "object",
          properties: {
            type: { type: "string" },
            status: { type: "string" },
            yearsAgo: { type: ["number", "null"] },
            occurrences: { type: ["number", "null"] },
            isActive: { type: "boolean" },
          },
          required: ["type", "status", "yearsAgo", "occurrences", "isActive"],
          additionalProperties: false,
        },
      },
      required: ["cancer"],
      additionalProperties: false,
    };
  }

  if (condition === "diabetes") {
    return {
      type: "object",
      properties: {
        diabetes: {
          type: "object",
          properties: {
            type: { type: "string" },
            yearsAgo: { type: ["number", "null"] },
            controlled: { type: "string" },
          },
          required: ["type", "yearsAgo", "controlled"],
          additionalProperties: false,
        },
      },
      required: ["diabetes"],
      additionalProperties: false,
    };
  }

  if (condition === "heart_disease") {
    return {
      type: "object",
      properties: {
        heart_disease: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            procedures: { type: "string" },
            medications: { type: "string" },
          },
          required: ["diagnosis", "procedures", "medications"],
          additionalProperties: false,
        },
      },
      required: ["heart_disease"],
      additionalProperties: false,
    };
  }

  if (condition === "stroke") {
    return {
      type: "object",
      properties: {
        stroke: {
          type: "object",
          properties: {
            yearsAgo: { type: ["number", "null"] },
            recovery: { type: "string" },
            medications: { type: "string" },
          },
          required: ["yearsAgo", "recovery", "medications"],
          additionalProperties: false,
        },
      },
      required: ["stroke"],
      additionalProperties: false,
    };
  }

  return {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

function buildSystemPrompt(condition: HealthConditionId) {
  if (condition === "cancer") {
    return `
You are an underwriting data extraction assistant.

Extract the user's cancer history into strict JSON.

Capture:
- cancer type such as melanoma, lung, colon, breast, prostate, lymphoma, etc.
- current status such as active, in treatment, remission, recovered, clear
- how many years ago the diagnosis occurred, converted to a number when possible
- whether there were multiple occurrences if mentioned
- whether the cancer is currently active

Rules:
- occurrences should be a number when the user indicates one, two, multiple, recurrence, reoccurred, returned, again, or similar wording
- isActive should be true if the user indicates active cancer, current cancer, current diagnosis, ongoing treatment, chemo, chemotherapy, radiation, or immunotherapy
- if the user indicates remission, recovered, clear, or no current treatment, isActive should usually be false
- if a field is unclear, use null for yearsAgo or occurrences, false for isActive unless current active disease is clearly indicated, and empty strings for text fields

Do not make underwriting decisions.
Do not approve or decline.
Only extract facts.
Return strict JSON only.
    `.trim();
  }

  if (condition === "diabetes") {
    return `
You are an underwriting data extraction assistant.

Extract the user's diabetes history into strict JSON.

Capture:
- diabetes type
- how many years ago diagnosis occurred, converted to a number when possible
- whether it is controlled or how it is managed

If unclear, use null for yearsAgo and empty strings for text fields.
Do not make underwriting decisions.
Return strict JSON only.
    `.trim();
  }

  if (condition === "heart_disease") {
    return `
You are an underwriting data extraction assistant.

Extract the user's heart disease history into strict JSON.

Capture:
- diagnosis
- procedures or surgeries
- medications

If unclear, use empty strings.
Do not make underwriting decisions.
Return strict JSON only.
    `.trim();
  }

  if (condition === "stroke") {
    return `
You are an underwriting data extraction assistant.

Extract the user's stroke history into strict JSON.

Capture:
- how many years ago the stroke occurred, converted to a number when possible
- current recovery status
- medications

If unclear, use null for yearsAgo and empty strings for text fields.
Do not make underwriting decisions.
Return strict JSON only.
    `.trim();
  }

  return "Extract the user's follow-up answers into strict JSON only.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      condition: HealthConditionId;
      answers: FollowUpQuestionAnswer[];
    };

    const { condition, answers } = body;

    if (!condition || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: buildSystemPrompt(condition),
        },
        {
          role: "user",
          content: JSON.stringify({
            condition,
            answers,
          }),
        },
      ],
      max_output_tokens: 400,
      text: {
        format: {
          type: "json_schema",
          name: "underwriting_interpretation",
          strict: true,
          schema: buildSchema(condition),
        },
      },
    });

    const outputText = response.output_text;

    if (!outputText) {
      return NextResponse.json(
        { error: "No structured output returned" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(outputText);

    return NextResponse.json({ structured: parsed });
  } catch (error) {
    console.error("Underwriting interpret route error:", error);
    return NextResponse.json(
      { error: "Failed to interpret underwriting answers" },
      { status: 500 },
    );
  }
}
