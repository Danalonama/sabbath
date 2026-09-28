import { BasicObject } from "@/types";

export const convertArrayToCSV = (
  headers: string[],
  array: BasicObject[],
  selected?: React.Key[]
) => {
  const rows = array
    .filter((obj) => (selected?.length ? selected.includes(obj.key) : obj))
    .map((obj) =>
      Object.values(obj)
        .map((value) => `"${value}"`)
        .join(",")
    );

  return [headers.join(","), ...rows].join("\n");
};

export const downloadCSV = (csvString: string, fileName = "data") => {
  // Create a Blob from the CSV string
  const blob = new Blob([csvString], { type: "text/csv" });

  // Create a link element and set it up for download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;

  // Programmatically click the link to trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
