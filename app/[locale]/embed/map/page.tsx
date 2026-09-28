import EmbeddedEventMap from "@/components/Embed/EmbeddedEventMap";

type EmbedMapPageProps = {
  searchParams: {
    apiUrl?: string;
    layerName?: string;
    parentOrigin?: string;
    sseUrl?: string;
    token?: string;
  };
};

export default function EmbedMapPage({ searchParams }: EmbedMapPageProps) {
  return (
    <EmbeddedEventMap
      apiUrl={searchParams.apiUrl ?? "/api/embed/events"}
      layerName={searchParams.layerName ?? "compass-bennet"}
      parentOrigin={searchParams.parentOrigin ?? "*"}
      sseUrl={searchParams.sseUrl ?? "/api/embed/events/stream"}
      token={searchParams.token ?? ""}
    />
  );
}
