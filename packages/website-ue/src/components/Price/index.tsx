import { formatCompact } from "@blitzkit/core";
import type { StandardPrice } from "@protos/blitz_static_standard_price";
import type { StandardSinglePrice } from "@protos/blitz_static_standard_single_price";
import type { ComponentProps } from "react";
import { useLocale } from "../../hooks/useLocale";
import { classNames } from "../../ui/classNames";
import { Text } from "../Text";
import styles from "./index.module.css";

interface PriceProps extends ComponentProps<"div"> {
  price: StandardPrice;
}

export function Price({ price, className, ...props }: PriceProps) {
  return (
    <div className={classNames(styles.price, className)} {...props}>
      {price.price_list.map((entry, index) => (
        <PriceEntry key={index} entry={entry} />
      ))}
    </div>
  );
}

interface PriceEntryProps {
  entry: StandardSinglePrice;
}

function PriceEntry({ entry }: PriceEntryProps) {
  if (entry.premium_time_price !== undefined) {
    console.log(entry);

    throw new Error("Unsupported price type");
  }

  return (
    <>
      {entry.currency_price && (
        <PriceInternal
          icon={`/api/currencies/${entry.currency_price.currency_catalog_id}.webp`}
          value={entry.currency_price.amount}
        />
      )}

      {entry.stuff_price && (
        <PriceInternal
          icon={`/api/stuff/${entry.stuff_price.stuff_catalog_id}.webp`}
          value={entry.stuff_price.amount}
        />
      )}
    </>
  );
}

interface PriceInternalProps {
  icon: string;
  value: number;
}

function PriceInternal({ icon, value }: PriceInternalProps) {
  const locale = useLocale();

  return (
    <Text weight="light" size="minor" lowContrast className={styles.entry}>
      <div className={styles.wrapper}>
        <img className={styles.icon} src={icon} />
        {formatCompact(locale, value)}
      </div>
    </Text>
  );
}
