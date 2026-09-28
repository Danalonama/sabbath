import { useLocale } from "next-intl";
import { getDirection } from "../utils";

const useDirection = () => {
  const locale = useLocale();
  const dir = getDirection(locale);
  return dir;
};

export default useDirection;
