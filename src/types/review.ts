export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string; // ISO
};

export type ReviewStats = {
  average: number;
  total: number;
};
