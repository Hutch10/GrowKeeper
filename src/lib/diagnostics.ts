/**
 * Supabase connection diagnostics
 * Checks environment variables and connection health
 */

export interface DiagnosticResult {
  status: "success" | "warning" | "error";
  checks: {
    envVarsConfigured: boolean;
    connectionSuccessful: boolean;
    tableAccessible: boolean;
  };
  messages: string[];
}

/**
 * Check if Supabase environment variables are configured
 * Safe to call from client or server
 */
export function checkEnvVars(): { configured: boolean; missing: string[] } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];

  if (!supabaseUrl || supabaseUrl.includes("your-project")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key") {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}

/**
 * Test connection to Supabase by attempting to query the plants table
 * Server-side only
 */
export async function testSupabaseConnection(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    status: "success",
    checks: {
      envVarsConfigured: false,
      connectionSuccessful: false,
      tableAccessible: false,
    },
    messages: [],
  };

  // Check 1: Environment variables
  const { configured, missing } = checkEnvVars();
  result.checks.envVarsConfigured = configured;

  if (!configured) {
    result.status = "error";
    result.messages.push(
      `Missing environment variables: ${missing.join(", ")}`
    );
    result.messages.push(
      "Please configure these in your .env.local file"
    );
    return result;
  }

  // Check 2: Try to connect and query
  try {
    const { createClient } = await import("@/lib/supabase-server");
    const supabase = createClient();

    const { error } = await supabase
      .from("plants")
      .select("id")
      .limit(1);

    if (error) {
      result.status = "error";
      result.checks.connectionSuccessful = false;
      result.messages.push(`Database connection failed: ${error.message}`);

      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        result.messages.push(
          "The plants table doesn't exist. Run the migration in Supabase Dashboard."
        );
      } else if (error.message.includes("Invalid API key")) {
        result.messages.push(
          "Invalid Supabase credentials. Check your NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
      }
    } else {
      result.checks.connectionSuccessful = true;
      result.checks.tableAccessible = true;
      result.status = "success";
      result.messages.push("Supabase connection successful");
    }
  } catch (error) {
    result.status = "error";
    result.checks.connectionSuccessful = false;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.messages.push(`Connection test failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Get user-friendly status badge based on diagnostic result
 */
export function getStatusBadge(status: DiagnosticResult["status"]): {
  color: string;
  text: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case "success":
      return {
        color: "text-green-800",
        text: "Connected",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    case "warning":
      return {
        color: "text-amber-800",
        text: "Warning",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      };
    case "error":
      return {
        color: "text-red-800",
        text: "Error",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
  }
}
