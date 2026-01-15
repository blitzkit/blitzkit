import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useStrings } from "../../hooks/useStrings";
import { TextField } from "../TextField";
import "./index.css";

export function AvatarControls() {
  const strings = useStrings();

  return (
    <div>
      <TextField placeholder={strings.avatars.search}>
        <MagnifyingGlassIcon />
      </TextField>
    </div>
  );
}
