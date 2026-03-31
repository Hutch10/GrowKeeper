import { createClient } from "@/lib/supabase-server";

export type UserRole = 'USER' | 'ADMIN' | 'FOUNDER';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
  FOUNDER: 3,
};

export type ActionType = 
  | 'VIEW_ALL_SPECIMENS'
  | 'DELETE_ANY_SPECIMEN'
  | 'MANAGE_AUDIT_LEDGER'
  | 'ELEVATE_ROLES'
  | 'STANDARD_MUTATION';

const PERMISSIONS: Record<ActionType, UserRole> = {
  VIEW_ALL_SPECIMENS: 'ADMIN',
  DELETE_ANY_SPECIMEN: 'ADMIN',
  MANAGE_AUDIT_LEDGER: 'ADMIN',
  ELEVATE_ROLES: 'FOUNDER',
  STANDARD_MUTATION: 'USER',
};

/**
 * Fetches the institutional role for a specific user.
 * Defaults to 'USER' if profile is not found or error occurs.
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  // Support for development guest mode
  if (userId === "guest-user") return "FOUNDER";

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn(`Role lookup failed for ${userId}, defaulting to USER.`);
      return 'USER';
    }

    return (data as unknown as { role: UserRole }).role;
  } catch (err) {
    console.error("Critical error in role lookup:", err);
    return 'USER';
  }
}

/**
 * Hardened operational guard for institutional actions.
 */
export function hasPermission(role: UserRole, action: ActionType): boolean {
  const requiredRole = PERMISSIONS[action];
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Helper for role-restricted UI elements.
 */
export function isAtLeast(current: UserRole, target: UserRole): boolean {
  return ROLE_HIERARCHY[current] >= ROLE_HIERARCHY[target];
}
