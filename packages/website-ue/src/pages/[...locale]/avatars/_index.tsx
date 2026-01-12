import { AvatarCard } from "../../../components/AvatarCard";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";

interface Props {
  skeleton?: boolean;
}

export function Page({ skeleton }: Props) {
  const { avatars } = useAwait(() => api.avatars(), "avatars");

  return (
    <div className="avatars">
      {avatars.map((avatar) => (
        <AvatarCard key={avatar.name} avatar={avatar} />
      ))}
    </div>
  );
}
