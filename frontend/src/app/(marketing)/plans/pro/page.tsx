import type { Metadata } from "next";
import { PlanDetail } from "@/components/marketing";
import { getPlanById } from "@/config/plans";

const plan = getPlanById("pro")!;

export const metadata: Metadata = {
  title: `${plan.name} Plan - OmniTrackIQ`,
  description: plan.description,
  openGraph: {
    title: `${plan.name} Plan - OmniTrackIQ`,
    description: plan.description,
  },
};

export default function ProPlanPage() {
  return <PlanDetail plan={plan} />;
}
