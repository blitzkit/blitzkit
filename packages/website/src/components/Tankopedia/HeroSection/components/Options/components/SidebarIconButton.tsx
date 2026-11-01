import { Flex, IconButton, type FlexProps } from "@radix-ui/themes";
import type { ComponentProps, CSSProperties } from "react";

type SidebarIconButtonProps = ComponentProps<typeof IconButton> & {
  selected: boolean;
  src: string;
  alt: string;
  imageStyle?: CSSProperties;
};

export function SidebarIconGroup({ style, ...props }: FlexProps) {
  return (
    <Flex
      direction="column"
      overflow="hidden"
      style={{ borderRadius: "var(--radius-full)", ...style }}
      {...props}
    />
  );
}

export function SidebarIconButton({
  selected,
  src,
  alt,
  imageStyle,
  ...props
}: SidebarIconButtonProps) {
  return (
    <IconButton
      color={selected ? undefined : "gray"}
      variant="soft"
      size={{ initial: "2", sm: "3" }}
      radius="none"
      {...props}
    >
      <img
        alt={alt}
        src={src}
        style={{ width: "50%", height: "50%", ...imageStyle }}
      />
    </IconButton>
  );
}
