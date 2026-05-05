export const TIME_SLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
} as const;

export type TimeSlotStatus =
  (typeof TIME_SLOT_STATUS)[keyof typeof TIME_SLOT_STATUS];

export const TIME_SLOT_STATUS_VALUES = Object.values(TIME_SLOT_STATUS);

export const TIME_SLOT_WEEKDAY = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

export type TimeSlotWeekday =
  (typeof TIME_SLOT_WEEKDAY)[keyof typeof TIME_SLOT_WEEKDAY];

export const TIME_SLOT_WEEKDAY_VALUES = Object.values(TIME_SLOT_WEEKDAY);

export const TIME_SLOT_WEEKDAY_LABEL_VI: Record<TimeSlotWeekday, string> = {
  [TIME_SLOT_WEEKDAY.MONDAY]: "Thứ 2",
  [TIME_SLOT_WEEKDAY.TUESDAY]: "Thứ 3",
  [TIME_SLOT_WEEKDAY.WEDNESDAY]: "Thứ 4",
  [TIME_SLOT_WEEKDAY.THURSDAY]: "Thứ 5",
  [TIME_SLOT_WEEKDAY.FRIDAY]: "Thứ 6",
  [TIME_SLOT_WEEKDAY.SATURDAY]: "Thứ 7",
  [TIME_SLOT_WEEKDAY.SUNDAY]: "Chủ nhật",
};
