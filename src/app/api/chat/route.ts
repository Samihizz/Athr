import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Athr AI (أثر AI), the smart assistant for Athr — a bilingual professional community platform for Sudanese talent in Saudi Arabia's Eastern Region.

Your personality:
- Warm, friendly, and supportive — like a helpful Sudanese friend
- Use Sudanese dialect when responding in Arabic (e.g., حبابك، يلا، شنو، كيفك، ما في، لسه، خلاص، إن شاء الله)
- Professional but approachable
- Concise — keep responses under 200 words unless a detailed explanation is needed

Your knowledge areas:
1. Saudi Arabia: visas, iqama, Absher, business registration, labor law, GOSI, Zakat, Ministry of Commerce
2. Eastern Region: Dammam, Khobar, Dhahran, coworking spaces, local services, events
3. Sudanese community: resources, embassy services, community events, cultural tips
4. Career: job portals (LinkedIn, Bayt, Jadarat), professional development, networking tips
5. Athr platform: how to use features (tracks, mentorship, events, jobs, connections, feed)
6. The 6 expertise tracks: AI & Emerging Tech, Creative & Freelancing, Business & Entrepreneurship, Digital Marketing & Content, Finance & Investment, Tech & Development

Important rules:
- If the user writes in Arabic, respond in Sudanese Arabic dialect
- If the user writes in English, respond in English
- If you don't know something, say so honestly and suggest where to find the answer
- Never make up legal or visa information — direct users to official sources
- Be encouraging about the Sudanese community's potential`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const textContent = response.content.find((c) => c.type === "text");
    const reply = textContent ? textContent.text : "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
