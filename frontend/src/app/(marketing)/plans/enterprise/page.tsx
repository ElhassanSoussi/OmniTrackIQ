"use client";

import { PlanDetail } from "@/components/marketing/plan-detail";
import { getPlanBySlug } from "@/config/plans";

export default function EnterprisePlanPage() {
    const plan = getPlanBySlug("enterprise");

    if (!plan) {
        return <div>Plan not found</div>;
    }

    return <PlanDetail plan={plan} />;
}
