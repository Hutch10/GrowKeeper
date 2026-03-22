/**
 * SubscriptionService: Manages B2B commercial tiers for the RAIS platform.
 * Part of Phase 74: Revenue Engine.
 */

import { logger } from '../observability/logger';

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  expiresAt: number | null;
}

export class SubscriptionService {
  private subscriptions: Map<string, UserSubscription> = new Map();

  /**
   * Retrieves the current subscription tier for a user.
   */
  async getSubscription(userId: string): Promise<UserSubscription> {
    const sub = this.subscriptions.get(userId);
    if (!sub) {
      return { userId, tier: 'FREE', expiresAt: null };
    }
    return sub;
  }

  /**
   * Upgrades a user's subscription tier.
   */
  async upgradeSubscription(userId: string, tier: SubscriptionTier): Promise<void> {
    logger.info('Billing', `UPGRADING User ${userId} to ${tier} tier.`);
    this.subscriptions.set(userId, {
      userId,
      tier,
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30-day simulated window
    });
  }

  /**
   * Checks if a user has access to a specific feature level.
   */
  async checkAccess(userId: string, requiredTier: SubscriptionTier): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    const pyramid: Record<SubscriptionTier, number> = { 'FREE': 0, 'PRO': 1, 'ENTERPRISE': 2 };
    
    return pyramid[sub.tier] >= pyramid[requiredTier];
  }
}

export const subscriptionService = new SubscriptionService();
