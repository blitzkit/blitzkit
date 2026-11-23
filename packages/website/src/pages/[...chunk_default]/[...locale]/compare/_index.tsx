import { createDefaultEnvironment } from "@blitzkit/core";
import { useEffect } from "react";
import { api } from "../../../../api/dynamic";
import { CompareControls } from "../../../../components/CompareControls";
import { CompareTable } from "../../../../components/CompareTable";
import { EmptyState } from "../../../../components/EmptyState";
import { Section } from "../../../../components/Section";
import { tankToCompareMember } from "../../../../core/blitzkit/tankToCompareMember";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { useStrings } from "../../../../hooks/useStrings";
import { CompareEphemeral } from "../../../../stores/compareEphemeral";
import styles from "./_index.module.css";

const [skillDefinitions, tankDefinitions] = await Promise.all([
  api.skills(),
  api.tanks(),
]);

export const Page = withLocale(
  withErrorWrapper(() => {
    CompareEphemeral.useInitialization(() =>
      createDefaultEnvironment(skillDefinitions),
    );

    return <Content />;
  }),
);

function Content() {
  const strings = useStrings();
  const members = CompareEphemeral.use((state) => state.members);

  // Tanks come from the url on load
  useEffect(() => {
    const tanks = new URLSearchParams(window.location.search).get("tanks");

    if (tanks === null) return;

    CompareEphemeral.mutate((draft) => {
      draft.members = tanks
        .split(",")
        .map((id) => tankDefinitions.tanks[Number(id)])
        .filter((tank) => tank !== undefined)
        .map(tankToCompareMember);
    });
  }, []);

  // ...and are written back whenever they change
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);

    search.set("tanks", members.map(({ state }) => state.tank).join(","));

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${search.toString()}`,
    );
  }, [members]);

  return (
    <>
      <Section>
        <div className={styles.top}>
          <CompareControls />
        </div>
      </Section>

      {members.length > 0 && (
        <Section overflow>
          <CompareTable />
        </Section>
      )}

      {members.length === 0 && (
        <Section>
          <EmptyState
            title={strings.compare.no_tanks.title}
            body={strings.compare.no_tanks.body}
          />
        </Section>
      )}
    </>
  );
}
