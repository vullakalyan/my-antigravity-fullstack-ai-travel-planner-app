// ─────────────────────────────────────────────────────────────────────────────
// Types mirroring the backend data contracts exactly
// ─────────────────────────────────────────────────────────────────────────────

export type Budget = 'budget' | 'moderate' | 'luxury';

export type Interest =
  | 'culture'
  | 'food'
  | 'nature'
  | 'adventure'
  | 'relaxation'
  | 'nightlife'
  | 'shopping'
  | 'history'
  | 'art'
  | 'family';

export interface Activity {
  _id?: string;
  time: string;
  title: string;
  description: string;
  estimatedCost: number;
}

export interface DayItinerary {
  _id?: string;
  day: number;
  title: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  misc: number;
}

export interface EstimatedBudget {
  total: number;
  breakdown: BudgetBreakdown;
}

export interface SuggestedHotel {
  _id?: string;
  name: string;
  priceRange: string;
  rating: number;
  description: string;
}

export interface Trip {
  _id: string;
  owner: string;
  destination: string;
  numberOfDays: number;
  budget: Budget;
  interests: Interest[];
  itinerary: DayItinerary[];
  estimatedBudget: EstimatedBudget | null;
  suggestedHotels: SuggestedHotel[];
  status: 'draft' | 'generated' | 'saved';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trip Creation / Generation Input
// ─────────────────────────────────────────────────────────────────────────────

export interface TripInput {
  destination: string;
  numberOfDays: number;
  budget: Budget;
  interests: Interest[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Generated Itinerary (same as trip itinerary fields but standalone)
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedItinerary {
  itinerary: DayItinerary[];
  estimatedBudget: EstimatedBudget;
  suggestedHotels: SuggestedHotel[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthData {
  token: string;
  user: User;
}

export interface PaginatedTrips {
  trips: Trip[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
