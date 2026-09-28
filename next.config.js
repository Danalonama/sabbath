/** @type {import('next').NextConfig} */
const path = require("path");

const codespacesHost = process.env.CODESPACE_NAME
  ? `${process.env.CODESPACE_NAME}-3000.app.github.dev`
  : "https://improved-parakeet-9xv55g4xg7vhgj4-3000.app.github.dev";


const experimental = process.env.NEXT_PUBLIC_ENV === "Development" || !process.env.NEXT_PUBLIC_ENV ?{
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
      ...(codespacesHost ? [codespacesHost] : []),
        "*.app.github.dev",
        "*.preview.app.github.dev",
      ],
    },
  }:  {};

const withNextIntl = require("next-intl/plugin")();
const nextConfig = {
  experimental: experimental,
  webpack(config) {
    config.resolve.alias["types"] = path.resolve(__dirname, "types");
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "graphql-tag/loader",
        },
      ],
    });

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
