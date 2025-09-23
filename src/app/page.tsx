"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import {
  User,
  GetUsersResponse,
  formatUserData,
  getTierName,
} from "@/types/user";

const getTierColor = (
  tier: number
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (tier) {
    case 0:
      return "default";
    case 1:
      return "info";
    case 2:
      return "primary";
    case 3:
      return "warning";
    case 4:
      return "success";
    default:
      return "default";
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [globalStats, setGlobalStats] = useState<any>(null);

  const fetchUsers = async (currentPage = 0, limit = 25) => {
    try {
      setLoading(true);
      setError(null);

      // Convert MUI pagination (0-based) to API pagination (1-based)
      const apiPage = currentPage + 1;

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: apiPage,
          limit,
          sortBy: "total_points_earned",
          sortOrder: "desc",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }

      const data: GetUsersResponse = await response.json();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      if (data.globalStats) {
        setGlobalStats(data.globalStats);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
  };

  if (loading && users.length === 0) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={40} />
          <Typography variant="h6" className="ml-4">
            Loading users...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <div className="mb-6">
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-gray-800 mb-2"
        >
          WMON Users Dashboard
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600 mb-4">
          Total users: {totalUsers.toLocaleString()}
        </Typography>
      </div>

      {/* Global Stats Cards */}
      {globalStats && (
        <div className="flex flex-wrap gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white flex-1 min-w-[200px]">
            <CardContent>
              <Typography variant="h6" className="font-medium">
                Total Users
              </Typography>
              <Typography variant="h4" className="font-bold">
                {parseInt(globalStats.total_users).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white flex-1 min-w-[200px]">
            <CardContent>
              <Typography variant="h6" className="font-medium">
                Total Points
              </Typography>
              <Typography variant="h4" className="font-bold">
                {parseInt(
                  globalStats.total_points_distributed
                ).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white flex-1 min-w-[200px]">
            <CardContent>
              <Typography variant="h6" className="font-medium">
                Current Week
              </Typography>
              <Typography variant="h4" className="font-bold">
                {globalStats.current_week_number}
              </Typography>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-1 min-w-[200px]">
            <CardContent>
              <Typography variant="h6" className="font-medium">
                Last Snapshot
              </Typography>
              <Typography variant="h4" className="font-bold">
                {globalStats.last_snapshot_hour}h
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Paper elevation={2} className="overflow-hidden">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="bg-gray-50 font-semibold">Rank</TableCell>
                <TableCell className="bg-gray-50 font-semibold">
                  Address
                </TableCell>
                <TableCell className="bg-gray-50 font-semibold" align="right">
                  Balance (WMON)
                </TableCell>
                <TableCell className="bg-gray-50 font-semibold" align="center">
                  Tier
                </TableCell>
                <TableCell className="bg-gray-50 font-semibold" align="right">
                  Total Points
                </TableCell>
                <TableCell className="bg-gray-50 font-semibold">
                  Last Update
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => {
                const formatted = formatUserData(user);
                const rank = page * rowsPerPage + index + 1;

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono">
                        {`${formatted.address.slice(
                          0,
                          8
                        )}...${formatted.address.slice(-6)}`}
                      </code>
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-mono text-base font-medium"
                    >
                      {formatted.balance}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getTierName(formatted.tier)}
                        color={getTierColor(formatted.tier)}
                        size="small"
                        variant="filled"
                        className="font-medium"
                      />
                    </TableCell>
                    <TableCell align="right" className="font-bold text-lg">
                      {parseInt(formatted.totalPoints).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(formatted.lastUpdate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}

              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Typography variant="body1" className="text-gray-500">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          className="border-t bg-gray-50"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count : `more than ${to}`} users`
          }
        />
      </Paper>

      {loading && users.length > 0 && (
        <Box display="flex" justifyContent="center" className="mt-4">
          <CircularProgress size={24} />
          <Typography variant="body2" className="ml-2 text-gray-600">
            Loading...
          </Typography>
        </Box>
      )}
    </Container>
  );
}
