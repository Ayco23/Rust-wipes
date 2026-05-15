"use client";

import { DayDetail } from "@/components/DayDetail";
import type { WipeEvent } from "@/types/wipes";

export function DayDetailPreviewClient({
  date,
  wipes,
}: {
  date: Date;
  wipes: WipeEvent[];
}) {
  return <DayDetail open={true} onClose={() => {}} date={date} wipes={wipes} />;
}
