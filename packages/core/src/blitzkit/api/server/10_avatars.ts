import { Avatar, fetchGlossary, Gallery } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI9 } from "./9_game";

export abstract class ServerBlitzKitAPI10 extends ServerBlitzKitAPI9 {
  @Cache()
  async gallery() {
    const avatars: Record<string, { avatar: Avatar; url: string }> = {};

    await Promise.all(
      locales.supported.map(async (supported) => {
        const glossary = await fetchGlossary(
          supported.blitz ?? supported.locale,
        );

        console.log(
          `Found ${Object.keys(glossary).length} things for ${supported.locale}`,
        );

        for (const key in glossary) {
          const glossaryEntry = glossary[key];

          if (
            !key.startsWith("avatar") ||
            key.endsWith("_part") ||
            glossaryEntry.image_url === null
          ) {
            continue;
          }

          if (key in avatars) {
            avatars[key].avatar.name!.locales[supported.locale] =
              glossaryEntry.title;
          } else {
            const extension = this.extname!(glossaryEntry.image_url);

            avatars[key] = {
              url: glossaryEntry.image_url,
              avatar: {
                id: key,
                name: { locales: { [supported.locale]: glossaryEntry.title } },
                extension,
              },
            };
          }
        }
      }),
    );

    const gallery: Gallery = { avatars: [] };

    await Promise.all(
      Object.entries(avatars).map(async ([key, { url, avatar }]) => {
        if (!(locales.default in avatars[key].avatar.name!.locales)) {
          console.warn(`Avatar ${key} has no ${locales.default} name`);
          return;
        }

        gallery.avatars.push(avatar);
      }),
    );

    return gallery;
  }
}
