/** @format */
import { redirect } from "@sveltejs/kit";
import { supabase } from "$lib/supabase";

export const load = async ({ parent }) => {
  // First get the root layout data
  const parentData = await parent();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect(303, "/login?redirect=/target-company");
  }

  return {
    ...parentData,
    session,
  };
};
