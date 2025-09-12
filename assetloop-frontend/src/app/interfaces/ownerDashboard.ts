export interface DashboardStats {
  totalAssets: number;
  activeBookings: number;
  totalEarnings: number;
  pendingReviews: number;
}

export interface RenterDashboardStats {
  activeRentals: number;
  pendingRequests: number;
  wishlistItems: number;
  totalSpent: number;
}
