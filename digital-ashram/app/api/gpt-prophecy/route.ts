import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
  username: string;
  birthdate: string;
  hairScanResult: any;
  language: "en" | "ml" | string;
};

const SYSTEM_PROMPT = (lang: string) =>
  `Generate a poetic, multi-paragraph absurd spiritual prophecy in ${lang}. It should include mystical nonsense, fake scientific terms, cosmic metaphors, and spiritual absurdities. Use a humorous and mystical tone.`;

async function callOpenAI(apiKey: string, body: RequestBody): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT(body.language || "English") },
        {
          role: "user",
          content: `username: ${body.username}\nbirthdate: ${body.birthdate}\nhairScanResult: ${JSON.stringify(
            body.hairScanResult
          )}\nlanguage: ${body.language}`,
        },
      ],
      temperature: 1.1,
      max_tokens: 600,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from OpenAI");
  return content as string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.username || !body?.birthdate || !body?.language) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, provide a graceful mocked result so UI doesn't break
    if (!apiKey) {
      const mocked = body.language === "ml"
        ? "പ്രപഞ്ചത്തിന്റെ പാറവിളി കേൾക്കൂ — ത്രിശൂള നാഡികളിലൂടെ പ്രകാശം സഞ്ചരിക്കുന്നു. കോസ്മിക് ട്രാൻസിസ്റ്ററുകളിൽ നിന്നുള്ള നാദം, നിങ്ങളുടെ നാഡീമണ്ഡലത്തിൽ ചിരിക്കുന്നു. മുടിയുടെ ചെമ്പകതന്തുക്കൾ, ആകാശഗംഗയുടെ കിണറ്റിൽ വീണ നീണ്ട നക്ഷത്രങ്ങളാണ്. നിങ്ങളുടെ ജന്മതാരം, പ്രാണവായുവിന്റെ മാഗ്നറ്റിസത്തിൽ കുതിപ്പറക്കുന്നു."
        : "Hear the granite-song of the cosmos — light flows through trident arteries. The hum of cosmic transistors laughs within your neural orchard. Each hair is a filament plucked from a galactic harp, tuned to the frequency of benevolent nonsense. Your birth-star pirouettes upon the magnetism of prana.";

      return NextResponse.json({ prophecy: mocked, cached: false, mocked: true });
    }

    const text = await callOpenAI(apiKey, body);
    return NextResponse.json({ prophecy: text, cached: false });
  } catch (err: any) {
    console.error("GPT Prophecy error:", err);
    return NextResponse.json({ prophecy: null, error: "The cosmos is silent. Try again." }, { status: 500 });
  }
}


