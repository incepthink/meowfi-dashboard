export interface User {
  id: string;
  current_balance_wei: string;
  current_balance: string;
  current_tier: number;
  total_points_earned: string;
  last_update_timestamp: string;
}

export interface UserWeeklyPoints {
  week_number: string;
  points_earned_this_week: string;
  weekly_cap: string;
  is_cap_reached: boolean;
}

export interface UserWithWeeklyPoints extends User {
  weeklyPoints: UserWeeklyPoints[];
}

export interface GlobalStats {
  id: string;
  total_users: string;
  total_points_distributed: string;
  current_week_number: string;
  last_snapshot_hour: string;
  tier_distribution: string;
}

export interface TierDistribution {
  tier0: number;
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
}

// API Response types
export interface GetUsersResponse {
  users: User[];
  totalUsers: number;
  globalStats?: GlobalStats;
}

export interface ApiError {
  error: string;
  message: string;
}

// Helper function to format user data for display
export function formatUserData(user: User) {
  return {
    address: user.id,
    balance: parseFloat(user.current_balance).toFixed(6),
    balanceWei: user.current_balance_wei,
    tier: user.current_tier,
    totalPoints: user.total_points_earned,
    lastUpdate: new Date(Number(user.last_update_timestamp) * 1000).toISOString(),
  };
}

// Helper function to get tier name
export function getTierName(tier: number): string {
  switch (tier) {
    case 0: return 'No Tier (< 10 WMON)';
    case 1: return 'Tier 1 (10-30 WMON)';
    case 2: return 'Tier 2 (30-100 WMON)';
    case 3: return 'Tier 3 (100-500 WMON)';
    case 4: return 'Tier 4 (500+ WMON)';
    default: return 'Unknown Tier';
  }
}

// Helper function to get current week number (Sunday start)
export function getCurrentWeekNumber(): string {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const sunday = new Date(now);
  sunday.setUTCDate(now.getUTCDate() - dayOfWeek);
  sunday.setUTCHours(0, 0, 0, 0);
  return sunday.toISOString().split('T')[0]; // Returns "2025-09-28" format
}
