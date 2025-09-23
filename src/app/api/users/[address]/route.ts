// Next.js API route to get specific user data
import { NextRequest, NextResponse } from 'next/server';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
export interface ApiError {
  error: string;
  message: string;
}

// Query for specific user with weekly points
const GET_USER_BY_ADDRESS_QUERY = gql`
  query GetUserByAddress($address: String!, $weekNumber: String!) {
    User(where: { id: { _eq: $address } }) {
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
      snapshots(limit: 10, order_by: { timestamp: desc }) {
        id
        points_awarded
        tier_at_time
        balance_at_time
        snapshot_hour
        timestamp
      }
    }
  }
`;

// GET /api/users/[address] - Get specific user data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const {address} = await params;
    const { searchParams } = new URL(request.url);
    
    // Get current week number or from query params
    const getCurrentWeek = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const sunday = new Date(now);
      sunday.setUTCDate(now.getUTCDate() - dayOfWeek);
      sunday.setUTCHours(0, 0, 0, 0);
      return sunday.toISOString().split('T')[0];
    };
    
    const weekNumber = searchParams.get('week') || getCurrentWeek();
    
    // Validate address format (basic Ethereum address validation)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'INVALID_ADDRESS', message: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }
    
    const result: any = await graphqlClient.request(GET_USER_BY_ADDRESS_QUERY, {
      address,
      weekNumber
    });
    
    const user = result.User?.[0];
    
    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: `User with address ${address} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    
    const errorResponse: ApiError = {
      error: 'FETCH_USER_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch user data'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
