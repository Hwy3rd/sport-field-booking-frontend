export interface SummaryStats {
  totalRevenue: number;
  totalBookings: number;
  activeVenues: number;
  activeUsers?: number; // Admin context only
  activeCourts?: number; // Owner context only
}

export interface RevenueChartItem {
  date: string;
  revenue: number;
  bookingCount: number;
}

export interface SportSplitItem {
  sportName: string;
  count: number;
  revenue: number;
}

export interface OccupancyRate {
  totalSlots: number;
  bookedSlots: number;
  occupancyRate: number;
}

export interface TopVenueItem {
  venueName: string;
  revenue: number;
  bookingsCount: number;
}

export interface UserGrowthItem {
  date: string;
  newUsers: number;
}
