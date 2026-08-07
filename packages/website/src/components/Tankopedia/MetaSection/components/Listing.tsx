import { Flex, Text, type TextProps } from "@radix-ui/themes";
import { Var } from "../../../../core/radix/var";

type ListingProps = TextProps & {
  label: string;
};

export function Listing({ label, ...props }: ListingProps) {
  return (
    <Flex
      minWidth="17rem"
      justify="between"
      gap="4"
      style={{ borderBottom: `1px solid ${Var("gray-a9")}` }}
    >
      <Text size="4">{label}</Text>
      <Text align="right" size="4" weight="medium" {...props} />
    </Flex>
  );
}
