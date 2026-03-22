/**
 * GrowKeeper RBAC (Role-Based Access Control) Service
 * Manages institutional permissions across Organizations and Divisions.
 */

import { logger } from '../observability/logger';

export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'FIELD_AGENT' | 'AUDITOR';

export interface UserPermission {
  canTransfer: boolean;
  canEditProvenance: boolean;
  canViewCompliance: boolean;
  canSignVitals: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermission> = {
  ADMIN: { canTransfer: true, canEditProvenance: true, canViewCompliance: true, canSignVitals: true },
  COMPLIANCE_OFFICER: { canTransfer: true, canEditProvenance: false, canViewCompliance: true, canSignVitals: false },
  FIELD_AGENT: { canTransfer: false, canEditProvenance: false, canViewCompliance: true, canSignVitals: true },
  AUDITOR: { canTransfer: false, canEditProvenance: false, canViewCompliance: true, canSignVitals: false },
};

export class RBACService {
  /**
   * Checks if a user has permission to perform an action.
   */
  hasPermission(role: UserRole, action: keyof UserPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    const allowed = permissions[action];
    
    if (!allowed) {
      logger.warn('Security', `Action DENIED: Role ${role} attempted ${action}`);
    }
    
    return allowed;
  }

  /**
   * Validates organization membership.
   */
  isOrgMember(userOrgId: string, resourceOrgId: string): boolean {
    return userOrgId === resourceOrgId;
  }
}

export const rbac = new RBACService();
