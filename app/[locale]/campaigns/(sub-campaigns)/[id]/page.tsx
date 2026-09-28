import Campaign from "@/components/Campaigner/campaign/CampaignPage";
import React from "react";

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <Campaign id={params.id} />;
}
