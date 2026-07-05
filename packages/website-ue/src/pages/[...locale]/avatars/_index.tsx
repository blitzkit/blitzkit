import { AvatarControls } from "../../../components/AvatarControls";
import { AvatarsList } from "../../../components/AvatarsList";
import { Section } from "../../../components/Section";
import { withLocale } from "../../../hocs/withLocale";

export const Page = withLocale(() => {
  return (
    <>
      <Section>
        <AvatarControls />
      </Section>

      <Section>
        <AvatarsList />
      </Section>
    </>
  );
});
