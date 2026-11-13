import { useEffect, useState } from "react";
import { getDataSaver, setDataSaver as persistDataSaver } from "@/lib/offlineStore";

export function useDataSaver() {
  const [dataSaver, setDataSaverState] = useState(() =>
    typeof window !== "undefined" ? getDataSaver() : false
  );

  useEffect(() => {
    const sync = () => setDataSaverState(getDataSaver());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setDataSaverState(Boolean(detail));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("ladhaquest:data-saver", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ladhaquest:data-saver", onCustom as EventListener);
    };
  }, []);

  const setDataSaver = (enabled: boolean) => {
    persistDataSaver(enabled);
    setDataSaverState(enabled);
  };

  return { dataSaver, setDataSaver };
}
