"use client";

import { Input } from "@/components/ui/input";

type DatePickerTimeProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
};

export function DatePickerTime({
  value,
  onChange,
  onBlur,
  name,
  disabled,
}: DatePickerTimeProps) {
  return (
    <Input
      type="time"
      step={60}
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      onBlur={onBlur}
      name={name}
      disabled={disabled}
    />
  );
}
