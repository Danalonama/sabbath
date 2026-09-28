"use client";
import { useEffect } from "react";
import MapWrapper from "@/components/Map/MapWrapper";
import { useAtomValue, useSetAtom } from "jotai";
import { handleUserAtom, initialPageDataFetch } from "@/atoms/user-atoms";
import { initialFetchMapAtoms } from "@/atoms/map/map-atoms";

export default function Home() {
  const setInitialPageDataFetch = useSetAtom(initialPageDataFetch);
  const user = useAtomValue(handleUserAtom);

  useEffect(() => {
    if (user) {
      setInitialPageDataFetch(initialFetchMapAtoms);
    }
  }, [user]);

  return <MapWrapper />;
}
