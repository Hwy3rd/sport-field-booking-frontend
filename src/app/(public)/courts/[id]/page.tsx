import { notFound } from "next/navigation";

import { serverGet } from "@/lib/api/server-api";
import type { Court } from "@/types/court.type";
import { CourtDetailClient } from "./court-detail-client";

interface CourtDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourtDetailPage({ params }: CourtDetailPageProps) {
  const { id } = await params;

  try {
    const court = await serverGet<Court>(`/court/${id}`, {}, { next: { revalidate: 60 } });

    return <CourtDetailClient court={court} />;
  } catch {
    notFound();
  }
}
