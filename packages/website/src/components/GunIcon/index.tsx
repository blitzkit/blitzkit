import type { CaseType } from "@blitzkit/core";
import type { GunDefinition } from "@blitzkit/protos";
import type { ComponentProps, ReactNode } from "react";
import { GunAutoloaderIcon } from "../GunAutoloaderIcon";
import { GunAutoreloaderIcon } from "../GunAutoreloaderIcon";
import { GunRegularIcon } from "../GunRegularIcon";

const typeIcons: Record<
  CaseType<GunDefinition>,
  (props: ComponentProps<"svg">) => ReactNode
> = {
  regular: GunRegularIcon,
  auto_loader: GunAutoloaderIcon,
  auto_reloader: GunAutoreloaderIcon,
};

interface Props extends ComponentProps<"svg"> {
  type: CaseType<GunDefinition>;
}

export function GunIcon({ type, ...props }: Props) {
  const Icon = typeIcons[type];
  return <Icon {...props} />;
}
