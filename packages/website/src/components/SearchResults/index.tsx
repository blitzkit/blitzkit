import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../ui/classNames";
import { Badge } from "../Badge";
import { Button, type ButtonProps } from "../Button";
import { Text } from "../Text";
import styles from "./index.module.css";

function Root({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.root, className)} {...props} />;
}

interface ItemProps extends Omit<ButtonProps, "prefix"> {
  prefix?: ReactNode;
  text: string;
  discriminator?: ReactNode;
}

function Item({ text, discriminator, prefix, className, ...props }: ItemProps) {
  return (
    <Button
      variant="ghost"
      {...props}
      highContrast
      className={classNames(styles.item, className)}
    >
      {prefix}
      <Text>{text}</Text>
      {discriminator !== undefined && (
        <>
          <div className={styles.spacer} />
          <Badge>{discriminator}</Badge>
        </>
      )}
    </Button>
  );
}

export const SearchResults = { Root, Item };
