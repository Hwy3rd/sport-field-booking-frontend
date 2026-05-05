import { notFound } from "next/navigation";

import { serverGet } from "@/lib/api/server-api";
import type { ApiListResponse } from "@/types/api.type";
import type { Court } from "@/types/court.type";
import type { TimeSlot } from "@/types/time-slot.type";
import { CourtDetailClient } from "./court-detail-client";

interface CourtDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourtDetailPage({ params }: CourtDetailPageProps) {
  const { id } = await params;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  try {
    const [court, timeSlots] = await Promise.all([
      serverGet<Court>(`/court/${id}`, {}, { next: { revalidate: 60 } }),
      serverGet<ApiListResponse<TimeSlot>>(
        "/time-slot",
        {
          courtId: id,
          date: today,
          status: "available",
          current: 1,
          limit: 24,
        },
        { next: { revalidate: 20 } },
      ),
    ]);

    return <CourtDetailClient court={court} timeSlots={timeSlots} />;
  } catch {
    notFound();
  }
}
