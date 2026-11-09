import type { Metadata } from "next";
import { Suspense } from "react";
import { ListScreen } from "@/components/countdown/ListScreen";

export const metadata: Metadata = {
  title: "Your Top 10 – Top10",
};

export default function ListPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ListScreen />
    </Suspense>
  );
}
