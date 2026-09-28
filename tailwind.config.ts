import type { Config } from "tailwindcss";
const colors = require("./styles/colors");
const mapView = require("./styles/map-layout");

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./constants/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
      width: {
        mapCard: "650px",
      },
      height: {
        mapCard: `calc(100vh - 175px)`,
        mapCardSmall: `calc(100vh)`,
      },
      maxHeight: {
        "card-max-height": `calc(100vh - ${mapView.viewCardStart}px)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dotted-quartiles": `linear-gradient(to bottom, ${colors["neutral-3"]} 40%,transparent 50%)`,
      },
      backgroundSize: {
        "dotted-quartiles": "1px 5px",
      },
      gridTemplateColumns: {
        waffle: "repeat(10, 24px)",
        mapLayout: `${mapView.viewCardWidth}px minmax(0,1fr)`,
        layerSelectLabel: `24px minmax(0,1fr)`,
        layerSelectLayout: `minmax(0,1fr) 98px`,
        layerSelectLayoutExtended: `minmax(0,1fr) 64px`,
        campaignHeader: "1fr max-content",
        campaignSmallStat: "max-content 1fr",
        genericCollapsable:
          "minmax(0,1fr) minmax(0,0.75fr) 96px minmax(0,0.75fr) 94px minmax(0,1fr)",
        genericCollapsableExtended:
          "minmax(0,1fr) minmax(0,0.75fr) 96px minmax(0,0.75fr) 94px minmax(0,0.75fr) 90px minmax(0,1fr)",
      },
      gridTemplateRows: {
        mapLayout: `${mapView.viewHeaderHeight}px minmax(0,1fr)`,
        waffle: "repeat(10, 24px)",
        subCampaignLayout: "max-content minmax(0, 1fr)",
        campaignLayout: "max-content minmax(0, 1fr) max-content",
        channelsLayout: "1fr max-content",
      },
      gridTemplateAreas: {
        "plakat-legend-layout": [
          "encouragement encouragement support support",
          "encouragement encouragement support support",
          "persuasion persuasion persuasion persuasion",
          "none none none none",
        ],
      },
      keyframes: {
        grow: {
          from: { "max-height": "0", opacity: "0" },
          to: { "max-height": "28px", opacity: "1" },
        },
        shrink: {
          from: { "max-height": "28px", opacity: "1" },
          to: { "max-height": "0", opacity: "0" },
        },
      },
      animation: {
        grow: "grow 0.5s ease-in-out forwards",
        shrink: "shrink 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [require("@savvywombat/tailwindcss-grid-areas")],
};
export default config;
