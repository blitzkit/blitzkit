import { assertSecret, idToRegion } from "@blitzkit/core";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../hooks/useLocale";
import { App } from "../../stores/app";
import { CURRENT_POLICIES_AGREEMENT_INDEX } from "../../stores/app/constants";
import { LinkI18n } from "../LinkI18n";
import "./index.css";

type Extension =
  | {
      status: "ok";
      data: {
        access_token: string;
        account_id: number;
        expires_at: number;
      };
    }
  | {
      status: "error";
    };

export function Checks({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

/**
 * Wargaming: 14 (refresh: 7)
 */
function Content() {
  const { locale } = useLocale();
  const logins = App.use((state) => state.logins);
  const policiesAgreementIndex = App.use(
    (state) => state.policiesAgreementIndex
  );
  const isLegal = window.location.pathname.startsWith("/legal");
  const [showPoliciesAgreement, setShowPoliciesAgreement] = useState(false);

  useEffect(() => {
    function unsubscribe() {
      window.removeEventListener("scroll", show);
      window.removeEventListener("pointermove", show);
      window.removeEventListener("pointerdown", show);
    }

    function show() {
      setShowPoliciesAgreement(true);
      unsubscribe();
    }

    if (
      policiesAgreementIndex !== CURRENT_POLICIES_AGREEMENT_INDEX &&
      !isLegal
    ) {
      window.addEventListener("scroll", show);
      window.addEventListener("pointermove", show);
      window.addEventListener("pointerdown", show);
    }

    return unsubscribe;
  }, [policiesAgreementIndex, isLegal]);

  useEffect(() => {
    if (logins.wargaming) {
      const expiresIn = logins.wargaming.expires - Date.now();
      const expiresInDays = expiresIn / 1000 / 60 / 60 / 24;

      if (expiresInDays < 0) {
        App.mutate((draft) => {
          draft.logins.wargaming = undefined;
        });
      } else if (expiresInDays < 7) {
        const { wargaming } = App.state.logins;

        if (!wargaming) return;

        fetch(
          `https://api.worldoftanks.${idToRegion(
            wargaming.id
          )}/wot/auth/prolongate/?application_id=${assertSecret(
            import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID
          )}&access_token=${wargaming.token}`
        )
          .then((response) => response.json() as Promise<Extension>)
          .then((json) => {
            App.mutate((draft) => {
              if (json.status === "error") {
                draft.logins.wargaming = undefined;
              } else {
                draft.logins.wargaming = {
                  id: wargaming.id,
                  token: json.data.access_token,
                  expires: json.data.expires_at * 1000,
                };
              }
            });
          });
      }
    }
  });

  if (!showPoliciesAgreement) return null;

  return (
    <Flex className="policies-agreement" align="end">
      <Flex p="8" className="content-wrapper" justify="center">
        <Flex align="start" gap="4" className="content" direction="column">
          <Flex direction="column" gap="2">
            <Heading>
              {policiesAgreementIndex === -1
                ? "BlitzKit's policies"
                : "BlitzKit's policies have changed"}
            </Heading>

            <Text>
              This website utilizes cookies to perform analytics and personalize
              your experience. You can learn more through{" "}
              <LinkI18n locale={locale} href="/docs/legal/privacy-policy">
                our privacy policy
              </LinkI18n>
              . By using BlitzKit, you also agree to our{" "}
              <LinkI18n locale={locale} href="/docs/legal/terms-of-service">
                terms of service
              </LinkI18n>
              .
            </Text>
          </Flex>

          <Button
            mt="2"
            onClick={() => {
              App.mutate((draft) => {
                draft.policiesAgreementIndex = CURRENT_POLICIES_AGREEMENT_INDEX;
              });
              setShowPoliciesAgreement(false);
            }}
          >
            I agree
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
