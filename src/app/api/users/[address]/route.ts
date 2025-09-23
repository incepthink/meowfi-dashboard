// Next.js API route to get specific user data via POST
import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';

// Replace with your actual indexer GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';

// Create GraphQL client instance
 const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});
import { gql } from 'graphql-request';

 interface ApiError {
  error: string;
  message: string;
}

 interface GetUserRequest {
  address: string;
  week?: string;
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

// POST /api/user - Get specific user data
export async function POST(request: NextRequest) {
  try {
    const body: GetUserRequest = await request.json();
    
    if (!body.address) {
      return NextResponse.json(
        { error: 'MISSING_ADDRESS', message: 'Address is required in request body' },
        { status: 400 }
      );
    }
    
    const { address, week } = body;
    
    // Get current week number or use provided week
    const getCurrentWeek = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const sunday = new Date(now);
      sunday.setUTCDate(now.getUTCDate() - dayOfWeek);
      sunday.setUTCHours(0, 0, 0, 0);
      return sunday.toISOString().split('T')[0];
    };
    
    const weekNumber = week || getCurrentWeek();
    
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
    
    return NextResponse.json({
      success: true,
      data: user,
      metadata: {
        address,
        weekNumber,
        timestamp: new Date().toISOString()
      }
    }, {
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

// Optional: Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}