import { literals } from "@blitzkit/i18n/src/literals";
import { EyeClosedIcon, EyeOpenIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Button, Checkbox, Flex, Text } from "@radix-ui/themes";
import { Suspense } from "react";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";
import type { MaybeSkeletonComponentProps } from "../../../../../../types/maybeSkeletonComponentProps";
import type { ThicknessRange } from "../../../../../Armor/components/StaticArmor";
import { DynamicArmorSwitcher } from "./DynamicArmorSwitcher";

type ThicknessesProps = MaybeSkeletonComponentProps & {
  thicknessRange: ThicknessRange;
};

export function Thicknesses({ thicknessRange, skeleton }: ThicknessesProps) {
  const display = Tankopedia.use((state) => state.display);
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.showExternalModules
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.showSpacedArmor
  );
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.showPrimaryArmor
  );
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const editStatic = Tankopedia.use((state) => state.editStatic);
  const { strings } = useLocale();

  return (
    <Flex
      position="absolute"
      right={display === TankopediaDisplay.StaticArmor ? "0" : "-6rem"}
      top="50%"
      mr="4"
      style={{
        transform: "translateY(-50%)",
        userSelect: "none",
        transitionDuration: "200ms",
      }}
      direction="column"
      gap="5"
      align="end"
    >
      <Flex direction="column" align="end" gap="3">
        <Flex
          height="64px"
          gap="2"
          style={{ opacity: showPrimaryArmor ? 1 : 0.5, cursor: "pointer" }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showPrimaryArmor = !draft.showPrimaryArmor;
            });
            Tankopedia.mutate((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, [
                (thicknessRange.value * 1.5).toFixed(0),
              ])}
            </Text>
            <Text size="1">
              {strings.website.tools.tankopedia.sandbox.static.primary}
            </Text>
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, ["0"])}
            </Text>
          </Flex>

          <Flex
            align="center"
            width="1rem"
            style={{
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
              background: `linear-gradient(rgb(64, 0, 0), rgb(255, 0, 0) 33%, rgb(255, 255, 0) 66%, rgb(0, 255, 0))`,
              color: "black",
            }}
          >
            {showPrimaryArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>

        <Flex
          height="64px"
          gap="2"
          style={{ opacity: showSpacedArmor ? 1 : 0.5, cursor: "pointer" }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showSpacedArmor = !draft.showSpacedArmor;
            });
            Tankopedia.mutate((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, [
                thicknessRange.value.toFixed(0),
              ])}
            </Text>
            <Text size="1">
              {strings.website.tools.tankopedia.sandbox.static.spaced}
            </Text>
            <Text color="gray" size="1">
              {literals(strings.common.units.mm, ["0"])}
            </Text>
          </Flex>

          <Flex
            align="center"
            width="1rem"
            style={{
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
              background: `linear-gradient(rgb(32, 0, 225), rgb(255, 0, 255))`,
            }}
          >
            {showSpacedArmor ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>

        <Flex
          gap="2"
          style={{ opacity: showExternalModules ? 1 : 0.5, cursor: "pointer" }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.showExternalModules = !draft.showExternalModules;
            });
            Tankopedia.mutate((draft) => {
              draft.highlightArmor = undefined;
            });
          }}
        >
          <Flex direction="column" align="end" justify="between">
            <Text size="1">
              {strings.website.tools.tankopedia.sandbox.static.external}
            </Text>
          </Flex>

          <Flex
            justify="center"
            width="1rem"
            height="1rem"
            style={{
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
              backgroundColor: "#c0c0c0",
              color: "black",
            }}
          >
            {showExternalModules ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" align="end" gap="2">
        <Flex align="center" gap="2">
          <Flex
            gap="2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.editStatic = !draft.editStatic;
                draft.highlightArmor = undefined;
              });
            }}
          >
            <Text size="1">
              {strings.website.tools.tankopedia.sandbox.static.edit.label}
            </Text>
            <Checkbox variant="classic" size="2" checked={editStatic} />
          </Flex>
        </Flex>

        <Button
          color="red"
          size="1"
          variant="ghost"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.editStatic = false;
              draft.model = Tankopedia.initial.model;
            });
          }}
        >
          <ReloadIcon />
          {strings.website.tools.tankopedia.sandbox.static.edit.reset}
        </Button>
      </Flex>

      {!skeleton && (
        <Suspense>
          <DynamicArmorSwitcher />
        </Suspense>
      )}
    </Flex>
  );
}
