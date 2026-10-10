import { useEffect, useState } from "react";
import { Tankopedia } from "../../../../../../../stores/tankopedia";
import { Tracker } from "./Tracker";

const SHOW_DELAY = 150;

interface Props {
  fontSize: string;
}

export function SkinTracker({ fontSize }: Props) {
  const skin = Tankopedia.use((state) => state.skin);
  const skinLoading = Tankopedia.use((state) => state.skinLoading);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);

    if (!skinLoading) return;

    const timeout = setTimeout(() => setVisible(true), SHOW_DELAY);

    return () => clearTimeout(timeout);
  }, [skin, skinLoading]);

  if (!visible) return null;

  return <Tracker key={skin} fontSize={fontSize} />;
}
