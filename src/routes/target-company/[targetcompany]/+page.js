/** @format */

import { error } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

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

    return {
      company,
      session,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    throw error(500, message);
  }
};
