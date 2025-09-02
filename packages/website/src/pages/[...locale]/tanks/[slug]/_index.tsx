import { TankType } from "@blitzkit/core";
import { PageWrapper } from "../../../../components/PageWrapper";
import { CalloutsSection } from "../../../../components/Tankopedia/CalloutsSection";
import { CharacteristicsSection } from "../../../../components/Tankopedia/CharacteristicsSection";
import { GameModeSection } from "../../../../components/Tankopedia/GameModeSection";
import { GuideSection } from "../../../../components/Tankopedia/GuideSection";
import { HeroSection } from "../../../../components/Tankopedia/HeroSection";
import { MetaSection } from "../../../../components/Tankopedia/MetaSection";
import { TechTreeSection } from "../../../../components/Tankopedia/TechTreeSection";
import { VideoSection } from "../../../../components/Tankopedia/VideoSection";
import { awaitableModelDefinitions } from "../../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../../core/awaitables/tankDefinitions";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { Tankopedia } from "../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";
import type { TankGuide } from "./index.astro";

type PageProps = MaybeSkeletonComponentProps &
  LocaleAcceptorProps & {
    id: number;
    guide?: TankGuide;
  };

const [tankDefinitions, modelDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableModelDefinitions,
]);

export function Page({ id, skeleton, locale, guide }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  Tankopedia.useInitialization(model);
  Duel.useInitialization({ tank, model });

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper p="0" maxWidth="unset" color="purple" gap="9" pb="9">
        <HeroSection skeleton={skeleton} />
        <MetaSection />
        <CalloutsSection />
        {tank.type === TankType.RESEARCHABLE && !tank.deprecated && (
          <TechTreeSection skeleton={skeleton} />
        )}
        <CharacteristicsSection skeleton={skeleton} />
        <GameModeSection />
        {guide && <GuideSection guide={guide} />}
        <VideoSection skeleton={skeleton} />
      </PageWrapper>
    </LocaleProvider>
  );
}
