import { AutoCompleteProps } from "antd";

export const formatSearchResults = (
  rows: any
): AutoCompleteProps["options"] => {
  return rows?.map((row: any) => {
    return {
      key: row.id,
      value: row.name,
      label: <span>{row.name}</span>,
    };
  });
};

export function hash8Fast(str: string) {
  let h = 5381; // djb2 seed
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) + h + str.charCodeAt(i); // h * 33 + c
  }
  h >>>= 0; // unsigned 32-bit
  return h.toString(36).padStart(8, "0"); // base-36, len 8
}
