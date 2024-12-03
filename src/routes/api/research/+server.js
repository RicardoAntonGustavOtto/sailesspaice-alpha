/** @format */

import { json } from "@sveltejs/kit";
import { OPENAI_API_KEY } from "$env/static/private";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST({ request, locals }) {
  const { targetCompany, prompt } = await request.json();

  try {
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
    const researchContent = data.choices[0].message.content;

    // Parse citations from the AI response
    const citations = researchContent.match(/\[(.*?)\]/g) || [];
    const cleanedCitations = citations.map((citation) =>
      citation.replace(/[\[\]]/g, "")
    );

    // Update the targetcompanies table with both research and citations
    const { data: updatedCompany, error: updateError } = await supabase
      .from("targetcompanies")
      .update({
        research_result: researchContent,
        research_citations: cleanedCitations, // Store citations as an array in the same row
      })
      .eq("name", targetCompany)
      .select()
      .single();

    if (updateError) throw updateError;

    return json({
      research: updatedCompany,
      citations: cleanedCitations,
    });
  } catch (error) {
    console.error("Research generation error:", error);
    return json({ error: "Failed to generate research" }, { status: 500 });
  }
}
