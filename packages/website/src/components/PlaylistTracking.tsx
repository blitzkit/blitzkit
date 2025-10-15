import { useEffect } from "react";
import { updatePlaylist } from "../core/blitzkit/updatePlaylist";

export function PlaylistTracking() {
  useEffect(() => {
    const interval = setInterval(updatePlaylist, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
