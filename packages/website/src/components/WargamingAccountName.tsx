import { getAccountInfo, idToRegion } from "@blitzkit/core";
import { Text } from "@radix-ui/themes";
import { useMemo } from "react";
import usePromise from "react-promise-suspense";
import { App } from "../stores/app";

export function WargamingAccountName() {
  const wargaming = App.use((state) => state.logins.wargaming);
  const promise = useMemo(async () => {
    if (!wargaming) return null;

    const data = await getAccountInfo(
      idToRegion(wargaming.id),
      wargaming.id,
      [],
      { access_token: wargaming.token }
    );

    return data?.nickname as string | undefined;
  }, [wargaming]);
  const nickname = usePromise(() => promise, []);

  return nickname ?? <Text color="gray">Unknown Account</Text>;
}
