export interface AdminMetrics {
  totalUsers: number;
  totalAssets: number;
  pendingRequests?: number;
  totalBookings: number;
  totalReviews: number;
  usersByRole: Array<{ _id: string; count: number }>;
  bookingsByStatus: Array<{ _id: string; count: number }>;
}
