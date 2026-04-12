export const ROUTES = {
  // Public
  HOME: "/",
  BROWSE: "/browse",
  BOOK_DETAIL: (id: string) => `/book/${id}` as const,
  AUTHOR_PROFILE: (id: string) => `/author/${id}` as const,

  // Auth
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  LOGIN: "/login",
  LOGIN_SIGNUP: "/signup",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ONBOARDING: "/onboarding",

  // Reader
  READER_LIBRARY: "/reader/library",
  READER_BROWSE: "/reader/browse",
  READER_BOOK: (id: string) => `/reader/book/${id}` as const,
  READER_ORDERS: "/reader/orders",
  READER_SETTINGS: "/reader/settings",

  // Author
  AUTHOR_WORKSPACE: "/author/workspace",
  AUTHOR_BOOKS: "/author/books",
  AUTHOR_BOOKS_NEW: "/author/books/new",
  AUTHOR_BOOKS_EDIT: (id: string) => `/author/books/${id}/edit` as const,
  AUTHOR_EARNINGS: "/author/earnings",
  AUTHOR_PAYOUTS: "/author/payouts",
  AUTHOR_SETTINGS: "/author/settings",
} as const;
