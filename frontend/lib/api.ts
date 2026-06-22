// ─────────────────────────────────────────────────────────────────────────────
// Centralized API Client
//
// Storage strategy: JWT stored in localStorage.
// Rationale: Next.js App Router with client-side auth; httpOnly cookies would
// require a BFF proxy layer beyond this spec. localStorage is industry-standard
// for SPA JWT storage when the backend enforces short-lived tokens and CORS.
// The 7-day token expiry and server-side ownership checks limit exposure.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ApiResponse,
  AuthData,
  GeneratedItinerary,
  PaginatedTrips,
  Trip,
  TripInput,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const REQUEST_TIMEOUT_MS = 10_000;
const TOKEN_KEY = 'ai_travel_token';
const USER_KEY = 'ai_travel_user';

// ─────────────────────────────────────────────────────────────────────────────
// Token Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setUser: (user: object): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: <T>(): T | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Fetch Wrapper
// ─────────────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
  retryOnNetworkError?: boolean;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, authenticated = true, retryOnNetworkError = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = tokenStorage.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const fetchConfig: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const attemptFetch = async (): Promise<Response> => {
    try {
      const response = await fetch(`${BASE_URL}${path}`, fetchConfig);
      return response;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError(
          'Request timed out after 10 seconds. Please check your connection and try again.',
          'REQUEST_TIMEOUT',
          408
        );
      }
      throw err;
    }
  };

  let response: Response;
  try {
    response = await attemptFetch();
  } catch (networkErr: unknown) {
    // One retry on network error (not timeout)
    if (
      retryOnNetworkError &&
      networkErr instanceof Error &&
      networkErr.name !== 'AbortError'
    ) {
      console.warn('[API] Network error, retrying once...', networkErr.message);
      try {
        response = await attemptFetch();
      } catch (retryErr: unknown) {
        throw new ApiError(
          'Network error. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
    } else {
      throw networkErr;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 — redirect to login globally
  if (response.status === 401 || response.status === 403) {
    tokenStorage.remove();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session=expired';
    }
    throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED', response.status);
  }

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      `Server returned an invalid response (HTTP ${response.status}).`,
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (!data.success) {
    throw new ApiError(
      data.error.message,
      data.error.code,
      response.status
    );
  }

  return data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (payload: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthData> => {
    return apiFetch<AuthData>('/auth/register', {
      method: 'POST',
      body: payload,
      authenticated: false,
    });
  },

  login: async (payload: { email: string; password: string }): Promise<AuthData> => {
    return apiFetch<AuthData>('/auth/login', {
      method: 'POST',
      body: payload,
      authenticated: false,
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Trips API
// ─────────────────────────────────────────────────────────────────────────────

export const tripsApi = {
  generate: async (input: TripInput): Promise<GeneratedItinerary> => {
    return apiFetch<GeneratedItinerary>('/trips/generate', {
      method: 'POST',
      body: input,
    });
  },

  create: async (
    input: TripInput & Partial<GeneratedItinerary>
  ): Promise<Trip> => {
    return apiFetch<Trip>('/trips', {
      method: 'POST',
      body: input,
    });
  },

  list: async (page = 1, limit = 20): Promise<PaginatedTrips> => {
    return apiFetch<PaginatedTrips>(`/trips?page=${page}&limit=${limit}`);
  },

  getById: async (id: string): Promise<Trip> => {
    return apiFetch<Trip>(`/trips/${id}`);
  },

  update: async (id: string, updates: Partial<Trip>): Promise<Trip> => {
    return apiFetch<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    return apiFetch<{ message: string; id: string }>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
