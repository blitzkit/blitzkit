import { HeartFilledIcon } from "@radix-ui/react-icons";
import { Button, Em, Flex, Strong, Text } from "@radix-ui/themes";
import { donationTiers } from "../../config/donations";
import styles from "./index.module.css";

export function Beg() {
  return (
    <Flex align="center" gap="4" direction="column" className={styles.outer}>
      <Text size="3" className={styles.important}>
        <Flex gap="2" align="center">
          <img src="https://github.com/tresabhi.png" />
          <Em>We need your attention</Em>
        </Flex>
      </Text>

      <Flex direction="column" className={styles.center} gap="4">
        <Flex direction="column" gap="3">
          <Text color="tomato">
            We can no longer keep BlitzKit sustainable for <Strong>free</Strong>
            .
          </Text>

          <Text>
            We want to add tank modules, player statistics, rebalancing patch
            notes, bring back the Discord bot, and more.
          </Text>

          <Text>
            But paying out of pocket makes that impossible. We are an earnest
            non-profit, so consider donating to make the above possible. 100% of
            your money goes back into BlitzKit.
          </Text>
        </Flex>

        <Flex gap="3">
          {donationTiers.map(({ name, value, link }) => (
            <a target="_blank" key={name} href={link}>
              <Button size="3" color="crimson">
                {value === null && <HeartFilledIcon />}
                {value === null ? "Custom" : `$${value}`}
              </Button>
            </a>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
