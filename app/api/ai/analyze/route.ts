import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

const toolEnum = z.enum([
  "summary",
  "explain_code",
  "generate_documentation",
  "extract_action_items",
]);

const analyzeSchema = z
  .object({
    tool: toolEnum,
    pasteId: z.string().trim().min(1).optional(),
    content: z.string().trim().optional(),
    instruction: z.string().trim().max(500).optional(),
  })
  .refine((payload) => Boolean(payload.pasteId || payload.content), {
    message: "Provide either pasteId or content",
    path: ["content"],
  });

type ToolType = z.infer<typeof toolEnum>;

function buildToolInstruction(tool: ToolType) {
  if (tool === "summary") {
    return "Summarize the code in concise bullets: purpose, main flow, inputs/outputs, and key risks. Keep it practical.";
  }

  if (tool === "explain_code") {
    return "Explain the code in clear developer language: what each important section does, why it exists, and how data flows through it.";
  }

  if (tool === "generate_documentation") {
    return "Generate concise Markdown documentation: Overview, Dependencies, Inputs, Outputs, Usage, Edge Cases, and Maintenance Notes.";
  }

  return "Extract actionable tasks from this code in a Markdown checklist. Label each with priority (High/Medium/Low) and a one-line reason.";
}

function cleanModelOutput(input: string) {
  return input
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?assistant>/gi, "")
    .trim();
}

function extractMessageContent(messageContent: unknown) {
  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    const textParts = messageContent
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter(Boolean);

    return textParts.join("\n");
  }

  return "";
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = analyzeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini";
  const baseUrl = process.env.OPENROUTER_API_URL?.trim() || "https://openrouter.ai/api/v1/chat/completions";
  const referer = process.env.OPENROUTER_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const appTitle = process.env.OPENROUTER_APP_NAME?.trim() || "FlowPaste";

  if (!apiKey) {
    return NextResponse.json(
      { message: "OpenRouter API key is not configured" },
      { status: 500 },
    );
  }

  const { tool, pasteId, content, instruction } = parsed.data;

  let sourceTitle = "Custom Input";
  let sourceLanguage = "plaintext";
  let sourceContent = content?.trim() ?? "";

  if (pasteId) {
    const paste = await prisma.paste.findFirst({
      where: {
        id: pasteId,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        language: true,
        content: true,
      },
    });

    if (!paste) {
      return NextResponse.json({ message: "Paste not found" }, { status: 404 });
    }

    sourceTitle = paste.title;
    sourceLanguage = paste.language || "plaintext";
    sourceContent = paste.content;
  }

  if (!sourceContent.trim()) {
    return NextResponse.json({ message: "Content is required for AI analysis" }, { status: 400 });
  }

  const userPrompt = [
    `Tool: ${tool}`,
    `Title: ${sourceTitle}`,
    `Language: ${sourceLanguage}`,
    instruction ? `Additional instruction: ${instruction}` : null,
    "",
    "Content:",
    `\`\`\`${sourceLanguage}`,
    sourceContent,
    "```",
    "",
    "Return only Markdown output.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-OpenRouter-Title": appTitle,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer and technical writer. Be precise, practical, and concise. Avoid fluff.",
        },
        {
          role: "system",
          content: buildToolInstruction(tool),
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | {
        model?: string;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        choices?: Array<{ message?: { content?: unknown } }>;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      {
        message: data?.error?.message || "Failed to generate AI response",
      },
      { status: response.status },
    );
  }

  const rawOutput = extractMessageContent(data?.choices?.[0]?.message?.content);
  const result = cleanModelOutput(rawOutput);

  if (!result) {
    return NextResponse.json({ message: "AI returned an empty response" }, { status: 502 });
  }

  return NextResponse.json({
    result,
    model: data?.model ?? model,
    usage: data?.usage ?? null,
    source: {
      title: sourceTitle,
      language: sourceLanguage,
    },
  });
}
