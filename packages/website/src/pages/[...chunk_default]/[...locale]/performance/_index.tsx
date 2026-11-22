import { PerformanceControls } from "../../../../components/PerformanceControls";
import { PerformanceTable } from "../../../../components/PerformanceTable";
import { Section } from "../../../../components/Section";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import styles from "./_index.module.css";

export const Page = withLocale(
  withErrorWrapper(() => (
    <>
      <Section>
        <div className={styles.top}>
          <PerformanceControls />
        </div>
      </Section>

      <Section overflow>
        <PerformanceTable />
      </Section>
    </>
  )),
);
