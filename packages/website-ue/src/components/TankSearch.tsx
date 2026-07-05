import { useStrings } from "../hooks/useStrings";
import { TankFilters } from "../stores/tankFilters";
import { TextField } from "./TextField";

export function TankSearch() {
  const strings = useStrings();

  return (
    <TextField
      placeholder={strings.tanks.search.placeholder}
      onChange={(event) => {
        const trimmed = event.target.value.trim();

        if (trimmed.length === 0) {
          TankFilters.mutate((draft) => {
            draft.search = undefined;
          });

          return;
        }

        TankFilters.mutate((draft) => {
          draft.search = trimmed;
        });
      }}
    />
  );
}
