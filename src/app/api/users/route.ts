// // Next.js API route to get all users data
// import { NextRequest, NextResponse } from 'next/server';
// import { graphqlClient } from '@/lib/graphql-client';
// import { 
//   GET_ALL_USERS_QUERY, 
//   GET_USER_COUNT_QUERY, 
//   GET_GLOBAL_STATS_QUERY 
// } from '@/lib/queries';
// import { 
//   User, 
//   GlobalStats, 
//   GetUsersResponse, 
//   ApiError 
// } from '@/types/user';

// // GET /api/users - Fetch all users with pagination
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
    
//     // Pagination parameters
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '50');
//     const offset = (page - 1) * limit;
    
//     // Sorting parameters
//     const sortBy = searchParams.get('sortBy') || 'total_points_earned';
//     const sortOrder = searchParams.get('sortOrder') || 'desc';
    
//     // Build order by clause
//     const orderBy = [{ [sortBy]: sortOrder }];
    
//     // Execute queries in parallel
//     const [usersResult, countResult, globalStatsResult] = await Promise.all<any>([
//       graphqlClient.request(GET_ALL_USERS_QUERY, {
//         limit,
//         offset,
//         orderBy
//       }),
//     //   graphqlClient.request(GET_USER_COUNT_QUERY),
//     {},
//       graphqlClient.request(GET_GLOBAL_STATS_QUERY)
//     ]);
//     console.log(usersResult);
//     console.log(countResult);
//     console.log(globalStatsResult);
    
//     const users: User[] = usersResult.User || [];
//     const totalUsers: number = globalStatsResult.GlobalStats?.[0].total_users || 0;
//     const globalStats: GlobalStats | undefined = globalStatsResult.GlobalStats?.[0];
    
//     const response: GetUsersResponse = {
//       users,
//       totalUsers,
//       globalStats
//     };
    
//     return NextResponse.json(response, {
//       status: 200,
//       headers: {
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0'
//       }
//     });
    
//   } catch (error) {
//     console.error('Error fetching users:', error);
    
//     const errorResponse: ApiError = {
//       error: 'FETCH_USERS_FAILED',
//       message: error instanceof Error ? error.message : 'Failed to fetch users data'
//     };
    
//     return NextResponse.json(errorResponse, { status: 500 });
//   }
// }