/** @format */

import { json } from "@sveltejs/kit";
import { OPENAI_API_KEY } from "$env/static/private";

export async function POST({ request }) {
  try {
    const { companyName, companyWebsite } = await request.json();

    if (!companyName || !companyWebsite) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Please provide a comprehensive research analysis for ${companyName} (${companyWebsite}). Include:
    1. Company Overview
    2. Products/Services
    3. Market Position
    4. Key Strengths
    5. Potential Opportunities
    6. Recent Developments
    Please format the response in markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const research = data.choices[0].message.content;

    return json({ research });
  } catch (error) {
    console.error("Research generation error:", error);
    return json({ error: "Failed to generate research" }, { status: 500 });
  }
}
