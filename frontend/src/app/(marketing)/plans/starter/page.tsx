import type { Metadata } from "next";
import { PlanDetail } from "@/components/marketing";
import { getPlanById } from "@/config/plans";

const plan = getPlanById("starter")!;

export const metadata: Metadata = {
  title: `${plan.name} Plan - OmniTrackIQ`,
  description: plan.description,
  openGraph: {
    title: `${plan.name} Plan - OmniTrackIQ`,
    description: plan.description,
  },
};

export default function StarterPlanPage() {
  return <PlanDetail plan={plan} />;
}
