import EmbedHostDemo from "@/components/Embed/EmbedHostDemo";

type EmbedHostPageProps = {
  params: {
    locale: string;
  };
};

export default function EmbedHostPage({ params }: EmbedHostPageProps) {
  return <EmbedHostDemo locale={params.locale} />;
}
