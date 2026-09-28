export type EmbeddedMapEvent = {
  id: string;
  latitude: number;
  longitude: number;
  priority?: "high" | "medium" | "low";
  title?: string | null;
  status?: "new" | "active" | "resolved";
  payload?: Record<string, unknown>;
  updatedAt?: string;
};

export type EmbeddedMapTokenPayload = {
  allowedOrigin: string;
  allowed_layers: string[];
  clientId: string;
  exp?: number;
  iat?: number;
  version: number;
};

export type EmbeddedMapMessage =
  | {
      source: "agam-insight-map";
      type: "event:selected";
      eventId: string;
      event: EmbeddedMapEvent;
    }
  | {
      source: "agam-insight-map";
      type: "map:ready";
    };
