export interface Review {
  _id: string;
  rental: {
    name: string;
  } | null; // Reference to an asset or booking, with at least a name
  renter: {
    firstName: string;
    lastName: string;
    email: string;
  } | null; // Reviewer (renter)
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  } | null; // Reviewed party (owner), optional if not all reviews target owners
  rating: number; // e.g., 1-5
  comment?: string; // Optional comment
  createdAt: Date; // Timestamp of review creation
}
