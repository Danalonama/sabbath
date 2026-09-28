import { CampaignWizard } from "@/components/Campaigner/Wizard/CampaignWizard";

export default function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  return <CampaignWizard params={params} />;
}
