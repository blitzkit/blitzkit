import { CaretDownIcon, DotFilledIcon } from "@radix-ui/react-icons";
import { useStrings } from "../../hooks/useStrings";
import { Performance, type PlayerCountPeriod } from "../../stores/performance";
import { Select } from "../Select";
import { TankSearchFilters } from "../TankSearchFilters";
import { Text } from "../Text";
import styles from "./index.module.css";

const periods: PlayerCountPeriod[] = [
  "total",
  "d_120",
  "d_90",
  "d_60",
  "d_30",
  "d_7",
  "d_1",
];

export function PerformanceControls() {
  const strings = useStrings();
  const playerCountPeriod = Performance.use(
    (state) => state.player_count_period,
  );

  return (
    <div className={styles.controls}>
      <TankSearchFilters />

      <div className={styles.period}>
        <Text>{strings.performance.player_count}</Text>

        <Select.Root
          value={playerCountPeriod}
          onValueChange={(value) => {
            Performance.mutate((draft) => {
              draft.player_count_period = value as PlayerCountPeriod;
            });
          }}
        >
          <Select.Trigger>
            <Select.Value />

            <Select.Icon>
              <CaretDownIcon />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content>
              <Select.Viewport>
                {periods.map((period) => (
                  <Select.Item key={period} value={period}>
                    <Select.ItemIndicator>
                      <DotFilledIcon />
                    </Select.ItemIndicator>

                    <Select.ItemText>
                      {strings.common.player_count_period[period]}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}
