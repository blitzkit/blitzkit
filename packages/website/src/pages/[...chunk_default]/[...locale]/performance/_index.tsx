import { PerformanceControls } from "../../../../components/PerformanceControls";
import { PerformanceTable } from "../../../../components/PerformanceTable";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import styles from "./_index.module.css";

export const Page = withLocale(
  withErrorWrapper(() => (
    <div className={styles.page}>
      <div className={styles.top}>
        <PerformanceControls />
      </div>

      <div className={styles.table}>
        <PerformanceTable />
      </div>
    </div>
  )),
);
