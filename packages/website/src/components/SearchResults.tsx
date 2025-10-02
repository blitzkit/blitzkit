import {
  Badge,
  Button,
  Flex,
  Text,
  type ButtonProps,
  type FlexProps,
} from "@radix-ui/themes";
import type { ReactNode } from "react";

function Root(props: FlexProps) {
  return <Flex direction="column" gap="2" width="100%" {...props} />;
}

interface ItemProps extends Omit<ButtonProps, "prefix"> {
  prefix?: React.ReactNode;
  text: string;
  discriminator?: ReactNode;
}

function Item({ text, discriminator, prefix, ...props }: ItemProps) {
  return (
    <Button variant="ghost" {...props} highContrast>
      <Flex width="100%" gap="2" align="center">
        {prefix}
        <Text style={{ flex: 1 }} align={prefix ? "left" : "center"}>
          {text}
        </Text>
        {discriminator !== undefined && <Badge>{discriminator}</Badge>}
      </Flex>
    </Button>
  );
}

export const SearchResults = { Root, Item };
