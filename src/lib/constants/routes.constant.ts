export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  PROFILE_BOOKINGS: "/profile/bookings",
  VENUES: "/venues",
  COURTS: "/courts",
  OWNER: "/owner",
  ADMIN: "/admin",
} as const;

export const OWNER_ROUTES = {
  DASHBOARD: ROUTES.OWNER,
  VENUES: `${ROUTES.OWNER}/venues`,
  COURTS: `${ROUTES.OWNER}/courts`,
  BOOKINGS: `${ROUTES.OWNER}/bookings`,
  TIME_SLOTS: `${ROUTES.OWNER}/time-slots`,
  TIME_SLOT_TEMPLATES: `${ROUTES.OWNER}/time-slot-templates`,
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: ROUTES.ADMIN,
  USERS: `${ROUTES.ADMIN}/users`,
  VENUES: `${ROUTES.ADMIN}/venues`,
  COURTS: `${ROUTES.ADMIN}/courts`,
  BOOKINGS: `${ROUTES.ADMIN}/bookings`,
  SPORTS: `${ROUTES.ADMIN}/sports`,
  TIME_SLOTS: `${ROUTES.ADMIN}/time-slots`,
  TIME_SLOT_TEMPLATES: `${ROUTES.ADMIN}/time-slot-templates`,
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];
export const PROTECTED_ROUTES = [ROUTES.PROFILE, ROUTES.OWNER, ROUTES.ADMIN];
