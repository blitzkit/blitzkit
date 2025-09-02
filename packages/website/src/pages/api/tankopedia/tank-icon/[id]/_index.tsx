import { TankSandbox } from "../../../../../components/Tankopedia/HeroSection/components/TankSandbox";
import { awaitableModelDefinitions } from "../../../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../../../core/awaitables/tankDefinitions";
import { LocaleProvider } from "../../../../../hooks/useLocale";
import { Duel } from "../../../../../stores/duel";
import { Tankopedia } from "../../../../../stores/tankopedia";

const [tankDefinitions, modelDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableModelDefinitions,
]);

interface PageProps {
  id: number;
}

export function Page({ id }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  Tankopedia.useInitialization(model);
  Duel.useInitialization({ tank, model });

  return (
    <LocaleProvider locale="en">
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  return <TankSandbox naked thicknessRange={{ value: 0 }} />;
}
