import { CampaignWizard } from "@/components/Campaigner/Wizard/CampaignWizard";

export default function NewCampaignPage({
  searchParams,
}: {
  searchParams: { duplicate: string };
}) {
  return (
    <CampaignWizard
      params={{ id: searchParams.duplicate }}
      duplicate={!!searchParams.duplicate}
    />
  );
}
