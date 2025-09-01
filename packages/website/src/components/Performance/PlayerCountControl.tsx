import { Flex, Select, Text } from '@radix-ui/themes';
import { useLocale } from '../../hooks/useLocale';
import { Performance, type PlayerCountPeriod } from '../../stores/performance';

export function PlayerCountControl() {
  const playerCountPeriod = Performance.use((state) => state.playerCountPeriod);
  const { strings } = useLocale();

  return (
    <Flex justify="center" align="center" gap="2">
      <Text>{strings.website.tools.performance.player_count.label}</Text>
      <Select.Root
        value={playerCountPeriod}
        onValueChange={(period) => {
          Performance.mutate((draft) => {
            draft.playerCountPeriod = period as PlayerCountPeriod;
          });
        }}
      >
        <Select.Trigger variant="classic" />
        <Select.Content>
          <Select.Item value="total">
            {strings.common.player_count_period.total}
          </Select.Item>
          <Select.Item value="d_120">
            {strings.common.player_count_period.d_120}
          </Select.Item>
          <Select.Item value="d_90">
            {strings.common.player_count_period.d_90}
          </Select.Item>
          <Select.Item value="d_60">
            {strings.common.player_count_period.d_60}
          </Select.Item>
          <Select.Item value="d_30">
            {strings.common.player_count_period.d_30}
          </Select.Item>
          <Select.Item value="d_7">
            {strings.common.player_count_period.d_7}
          </Select.Item>
          <Select.Item value="d_1">
            {strings.common.player_count_period.d_1}
          </Select.Item>
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
