// GraphQL queries for fetching user data from the indexer
import { gql } from 'graphql-request';

// Query to get all users with their current data
export const GET_ALL_USERS_QUERY = gql`
  query GetAllUsers($limit: Int, $offset: Int, $orderBy: [User_order_by!]) {
    User(limit: $limit, offset: $offset, order_by: $orderBy) {
      id
      current_balance_wei
      current_balance
      current_tier
      total_points_earned
      last_update_timestamp
    }
  }
`;

// Query to get users with their weekly points for current week
export const GET_USERS_WITH_WEEKLY_POINTS_QUERY = gql`
  query GetUsersWithWeeklyPoints($weekNumber: String!) {
    User {
      id
      current_balance_wei
      current_balance
      current_tier
      total_points_earned
      last_update_timestamp
      weeklyPoints(where: { week_number: { _eq: $weekNumber } }) {
        week_number
        points_earned_this_week
        weekly_cap
        is_cap_reached
      }
    }
  }
`;

// Query to get global stats
export const GET_GLOBAL_STATS_QUERY = gql`
  query GetGlobalStats {
    GlobalStats(where: { id: { _eq: "global" } }) {
      id
      total_users
      total_points_distributed
      current_week_number
      last_snapshot_hour
      tier_distribution
    }
  }
`;

// Query to get user count for pagination
export const GET_USER_COUNT_QUERY = gql`
  query MyQuery {
  User_aggregate {
    aggregate {
      count
    }
  }
}
`;