/** @format */

import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  try {
    const { companyName, companyWebsite } = await request.json();

    // Here you would typically call your AI service
    // For now, let's return a mock response
    const research = `
# Research Report for ${companyName}

## Company Overview
${companyName} is a company that can be found at ${companyWebsite}.

## Key Findings
1. Company operates in the technology sector
2. Has a strong online presence
3. Offers various products and services

## Recommendations
1. Reach out via LinkedIn
2. Focus on their pain points
3. Prepare case studies

## Next Steps
1. Connect with decision makers
2. Schedule initial meeting
3. Present tailored solution
    `;

    return json({ research });
  } catch (error) {
    console.error("Research generation failed:", error);
    return json({ error: "Failed to generate research" }, { status: 500 });
  }
}
