import { Theme, type ThemeProps } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface BlitzKitThemeProps extends ThemeProps {
  children: ReactNode;
}

export function BlitzKitTheme({
  children,
  className,
  style,
  ...props
}: BlitzKitThemeProps) {
  return (
    <Theme
      style={{ minHeight: "unset", display: "contents", ...style }}
      className={`blitzkit-theme ${className}`}
      grayColor="mauve"
      appearance="dark"
      panelBackground="solid"
      radius="full"
      accentColor="indigo"
      suppressHydrationWarning
      suppressContentEditableWarning
      {...props}
    >
      {children}
    </Theme>
  );
}
