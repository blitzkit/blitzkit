import { TankSandbox } from "../../../../../components/Tankopedia/HeroSection/components/TankSandbox";
import { awaitableModelDefinitions } from "../../../../../core/awaitables/modelDefinitions";
import { awaitableProvisionDefinitions } from "../../../../../core/awaitables/provisionDefinitions";
import { awaitableTankDefinitions } from "../../../../../core/awaitables/tankDefinitions";
import { LocaleProvider } from "../../../../../hooks/useLocale";
import { App } from "../../../../../stores/app";
import { Duel } from "../../../../../stores/duel";
import { Tankopedia } from "../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../stores/tankopediaPersistent";

const [provisionDefinitions, tankDefinitions, modelDefinitions] =
  await Promise.all([
    awaitableProvisionDefinitions,
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

  return (
    <LocaleProvider locale="en">
      <App.Provider>
        <TankopediaPersistent.Provider>
          <Duel.Provider data={{ provisionDefinitions, model, tank }}>
            <Content />
          </Duel.Provider>
        </TankopediaPersistent.Provider>
      </App.Provider>
    </LocaleProvider>
  );
}

function Content() {
  return <TankSandbox naked thicknessRange={{ value: 0 }} />;
}
