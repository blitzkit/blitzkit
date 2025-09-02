import { PersonIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  IconButton,
  Popover,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { Suspense } from "react";
import { App } from "../../stores/app";
import { BlitzKitTheme } from "../BlitzKitTheme";
import { WargamingAccountName } from "../WargamingAccountName";
import { WargamingIcon } from "../WargamingIcon";
import { WargamingLoginButton } from "../WargamingLoginButton";

export function NavbarAccount() {
  const logins = App.use((state) => state.logins);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="ghost" color="gray">
          <PersonIcon />
        </IconButton>
      </Popover.Trigger>

      <BlitzKitTheme style={{ display: "contents" }}>
        <Popover.Content
          align="end"
          width="320px"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {logins.wargaming && (
            <Flex direction="column" gap="2">
              <Text align="center" color="gray">
                Logged in accounts
              </Text>

              {logins.wargaming && (
                <Flex align="center" gap="2" justify="center">
                  <WargamingIcon width={15} height={15} />
                  <Text>
                    <Suspense fallback={<Skeleton height="1em" width="5rem" />}>
                      <WargamingAccountName />
                    </Suspense>
                  </Text>
                  <Button
                    color="red"
                    variant="ghost"
                    onClick={() => {
                      App.mutate((draft) => {
                        draft.logins.wargaming = undefined;
                      });
                    }}
                  >
                    Logout
                  </Button>
                </Flex>
              )}
            </Flex>
          )}

          {/* {!logins. !== !logins.wargaming && (
              <Inset side="x">
                <Separator my="4" size="4" />
              </Inset>
            )} */}

          {!logins.wargaming && (
            <Flex direction="column" gap="2">
              <Text align="center" color="gray">
                Log in with...
              </Text>

              {!logins.wargaming && <WargamingLoginButton />}
            </Flex>
          )}
        </Popover.Content>
      </BlitzKitTheme>
    </Popover.Root>
  );
}
