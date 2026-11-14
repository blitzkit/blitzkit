import { Var } from "../../core/radix/var";
import { Heading } from "../Heading";
import { Link } from "../Link";
import { Text } from "../Text";
import styles from "./index.module.css";

export function AesonPlug() {
  return (
    <Link
      color="gray"
      highContrast
      href="https://discord.gg/WHdER7ZPAD"
      underline="hover"
    >
      <div
        className={styles.plug}
        style={{
          backgroundColor: Var("green-3"),
          borderRadius: Var("radius-3"),
          overflow: "hidden",
        }}
      >
        <img
          src="/assets/images/third-party/wotb-news.png"
          style={{ width: "6rem", height: "6rem", objectFit: "cover" }}
        />

        <div className={styles.content}>
          <Heading size="5">Preview brought to you by WoT Blitz News</Heading>
          <Text color="gray">
            Join the Discord for the absolute latest news
          </Text>
        </div>
      </div>
    </Link>
  );
}
