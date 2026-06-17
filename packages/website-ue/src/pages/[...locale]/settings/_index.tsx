import { Carousel } from "../../../components/Carousel";
import { Heading } from "../../../components/Heading";
import { Text } from "../../../components/Text";
import {
  SettingBoolean,
  SettingQuality3,
  settings,
  settingsOrder,
  SettingType,
  type Setting,
  type SettingName,
  type SettingsGroup,
} from "../../../config/settings";
import { withLocale } from "../../../hocs/withLocale";
import { useSetting } from "../../../hooks/useSetting";
import { useStrings } from "../../../hooks/useStrings";
import { Settings } from "../../../stores/settings";

export const Page = withLocale(() => {
  return settingsOrder.map((group) => <Group group={group} />);
});

interface GroupProps {
  group: SettingsGroup;
}

function Group({ group }: GroupProps) {
  return (
    <div>
      <Heading>{group.name}</Heading>

      <div>
        {group.settings.map((setting) => (
          <Setting name={setting} />
        ))}
      </div>
    </div>
  );
}

interface SettingProps {
  name: SettingName;
}

function Setting({ name }: SettingProps) {
  const setting = settings[name];

  return (
    <div>
      <Text>{name}</Text>

      {setting.type === SettingType.Boolean && <TypeBoolean name={name} />}
      {setting.type === SettingType.Quality3 && <TypeQuality3 name={name} />}
    </div>
  );
}

function TypeBoolean({ name }: SettingProps) {
  const value = useSetting<SettingBoolean>(name);

  return null;
}

function TypeQuality3({ name }: SettingProps) {
  const value = useSetting<SettingQuality3>(name);
  const strings = useStrings();

  return (
    <Carousel
      value={value}
      onChange={(value) => {
        Settings.mutate((draft) => {
          draft[name] = value;
        });
      }}
      options={[
        strings.settings.quality3.low,
        strings.settings.quality3.medium,
        strings.settings.quality3.high,
      ]}
    />
  );
}
