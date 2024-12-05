/** @format */

export const prompts = {
  prompts: {
    targetcompany_research: {
      id: "research_targetcompany",
      model: "llama-3.1-sonar-large-128k-online",
      provider: "perplexity",
      content: `You are an expert at researching companies and writing detailed descriptions of the products and services they provide and the benefits they provide their customers.

      Please research the company {{targetcompany_name}} and write a comprehensive description of (1) their products and services and (2) the benefits they provide their customers. Your only source for information should be their own website. Here is the URL: {{targetcompany_website}}

      Your research results should include naming the location of the company's headquarters. You must use the company headquarters location as a quality check for your other research. Do not include sources that have no logical connection to that location. Be very cautious to avoid referencing sources or companies that may not be related to {{targetcompany_name}}.

      Important: You may only reference {{targetcompany_name}}'s official website.`,
    },
    analyze_annualreport: {
      id: "analyze_annualreport",
      model: "gpt-4o-mini",
      provider: "openai",
      content: `You are an expert in the analysis of corporate annual reports with a focus on strategic business alignment. I have provided you with the latest annual report of {{targetcompany_name}}. Here is the annual report: {{targetcompany_annualreport}}

      Please create a thorough analysis that:

      (1) Identifies key themes, priorities, and strategic goals highlighted in the report, with an emphasis on areas of growth, challenges, and future direction.

      (2) Examines areas of overlap between {{targetcompany_name}}'s business needs and the solutions offered by {{owncompany_name}}, including specific opportunities where {{owncompany_name}} can add value.

      (3) Highlights financial metrics, operational developments, and strategic initiatives from the report that are most relevant to {{owncompany_name}}'s offerings.

      (4) Offers actionable insights on how {{owncompany_name}} can effectively position its solutions to address {{targetcompany_name}}'s identified needs or challenges.

      Here is a description of {{owncompany_name}}'s products, solutions, and services: {{owncompany_info}}

      Ensure your analysis is clear, well-structured, and provides concrete connections between the findings in the annual report and the potential solutions {{owncompany_name}} offers.`,
    },
    cold_calling: {
      id: "generate_targetcompany_coldcallingguide",
      model: "gpt-4o-mini",
      provider: "openai",
      content: `Based on this company information, generate a cold calling script prospect name: {{prospectName}}.

      for company: {{targetcompany_research}}
      for annual report: {{targetcompany_annualreport}}
      for prospect: {{prospect_info}}

      I am calling from {{owncompany_name}}.

      Please generate a detailed cold calling guide including:
      1. Introduction {{prospect_name}}
      2. Value proposition
      3. Key talking points
      4. Handling objections
      5. Next steps`,
    },
  },
};
