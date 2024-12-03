/** @format */

import { error } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { supabase } from "$lib/supabase";

export const load = async ({ params, parent }) => {
  // Wait for the parent layout load to complete
  const { session } = await parent();

  if (!session) {
    throw redirect(303, "/login?redirect=/target-company");
  }

  try {
    // Get company from sessionStorage
    const storedCompany = sessionStorage.getItem("selectedCompany");
    if (!storedCompany) {
      throw error(404, "Company not found");
    }

    const company = JSON.parse(storedCompany);

    // Verify the company name matches the URL parameter
    if (company.name.toLowerCase() !== params.targetcompany) {
      throw error(404, "Company not found");
    }

    // Get latest company data to ensure we have current research and citations
    const { data: latestCompany, error: companyError } = await supabase
      .from("targetcompanies")
      .select("*")
      .eq("name", params.targetcompany)
      .single();

    if (companyError) throw companyError;

    return {
      company: latestCompany,
      session,
      research: latestCompany.research_result,
      citations: latestCompany.research_citations || [],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    throw error(500, message);
  }
};

export const prerender = false;
