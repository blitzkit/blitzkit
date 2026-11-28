import { useEffect, useState } from "react";

// TODO: eliminate all skeleton fallbacks
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted;
}
