export interface Review {
  _id: string;
  // Backend sends rental as populated object or ObjectId
  rental:
    | {
        _id: string;
        name: string;
      }
    | string;
  // Backend sends renter as populated object or ObjectId
  renter:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        email: string;
      }
    | string;
  // Backend sends owner as populated object or ObjectId (optional)
  owner?:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        email: string;
      }
    | string;
  rating: number; // 1-5
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
