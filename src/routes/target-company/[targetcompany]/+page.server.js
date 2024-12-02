/** @format */

import { error } from "@sveltejs/kit";
import { supabase } from "$lib/supabase";

export const actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
      case "updateResearch":
        // Handle research update
        return await handleResearchUpdate(formData, params);
      case "updateAnnualReport":
        // Handle annual report update
        return await handleAnnualReportUpdate(formData, params);
      default:
        throw error(400, "Invalid action");
    }
  },
};

async function handleResearchUpdate(formData, params) {
  const content = formData.get("content");

  const { data, error: err } = await supabase
    .from("targetcompanies")
    .update({ research_result: content })
    .eq("name", params.targetCompany)
    .select()
    .single();

  if (err) throw error(500, err.message);
  return { success: true, data };
}

async function handleAnnualReportUpdate(formData, params) {
  const content = formData.get("content");

  const { data, error: err } = await supabase
    .from("targetcompanies")
    .update({ annual_report: content })
    .eq("name", params.targetCompany)
    .select()
    .single();

  if (err) throw error(500, err.message);
  return { success: true, data };
}
