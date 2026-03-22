"use server";

import { createClient } from "@/lib/supabase-server";

export async function getAuditLogs(limit = 10) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Audit Actions', `FETCH_FAILURE: ${error.message}`);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
