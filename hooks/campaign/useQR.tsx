import { messageAtom } from "@/atoms/message-atom";
import { useCampaignUrlQrCodeQuery } from "@/graphql/campaign/useCampaignUrlQrCodeQuery";
import { UrlObject } from "@/types";
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { getToken as getClerkToken } from "@/lib/clerk/getToken";

export default function useQR() {
  const [getCampaignUrlQrCode] = useCampaignUrlQrCodeQuery();
  const messageApi = useAtomValue(messageAtom);
  const [qrDownloadingUrlId, setQrDownloadingUrlId] = useState<string | null>(
    null,
  );

  const triggerDownload = useCallback((href: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = href;
    if (filename) link.download = filename;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const getBackendUrl = useCallback((href: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    return new URL(href, baseUrl).toString();
  }, []);

  const getFilenameFromHeaders = useCallback((headers: Headers) => {
    const contentDisposition = headers.get("content-disposition");
    const match = contentDisposition?.match(
      /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i,
    );
    const filename = match?.[1] || match?.[2];

    return filename ? decodeURIComponent(filename) : undefined;
  }, []);

  const downloadProtectedUrl = useCallback(
    async (href: string, filename?: string) => {
      const token = await getClerkToken();
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const response = await fetch(getBackendUrl(href), {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to download QR code.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(
        objectUrl,
        filename || getFilenameFromHeaders(response.headers),
      );
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    },
    [getBackendUrl, getFilenameFromHeaders, triggerDownload],
  );

  const downloadSvg = useCallback(
    (svg: string, filename: string) => {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    },
    [triggerDownload],
  );

  const handleQrDownload = useCallback(
    async (record: UrlObject) => {
      if (!record.id) return;

      const filename = `campaign-${record.campaignId?.slice(0, 8)}-url-${record.id?.slice(0, 8)}-qr.svg`;

      if (record.qrCodeSvg) {
        downloadSvg(record.qrCodeSvg, filename);
        return;
      }

      setQrDownloadingUrlId(record.id);
      try {
        const { data } = await getCampaignUrlQrCode({
          variables: { urlId: record.id },
        });
        const qrCode = data?.campaignUrlQrCode;

        if (!qrCode) {
          messageApi?.error?.("Failed to generate QR code.");
          return;
        }

        if (qrCode.downloadUrl) {
          await downloadProtectedUrl(qrCode.downloadUrl, qrCode.filename);
        } else if (qrCode.svg) {
          downloadSvg(qrCode.svg, qrCode.filename || filename);
        } else if (qrCode.dataUri) {
          triggerDownload(qrCode.dataUri, qrCode.filename);
        } else {
          messageApi?.error?.("Failed to download QR code.");
        }
      } catch {
        messageApi?.error?.("Failed to generate QR code.");
      } finally {
        setQrDownloadingUrlId(null);
      }
    },
    [
      downloadProtectedUrl,
      downloadSvg,
      getCampaignUrlQrCode,
      messageApi,
      triggerDownload,
    ],
  );
  return {
    handleQrDownload,
    qrDownloadingUrlId,
  };
}
