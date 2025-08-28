// Define the booking interface
interface Booking {
  id: number;
  name: string;
  address: string;
  dates: string;
  total: string;
  status: string;
}

// Define the bookings object structure
interface Bookings {
  upcoming: Booking[];
  past: Booking[];
  cancelled: Booking[];
}
