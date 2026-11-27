import {
  CodeIcon,
  HeightIcon,
  ImageIcon,
  ResetIcon,
  TimerIcon,
  WidthIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../../../../../components/Button";
import { CopyButton } from "../../../../../components/CopyButton";
import { Boolean } from "../../../../../components/Embeds/Boolean";
import { Color } from "../../../../../components/Embeds/Color";
import { Enum } from "../../../../../components/Embeds/Enum";
import { GenerateURL } from "../../../../../components/Embeds/GenerateURL";
import { Import } from "../../../../../components/Embeds/Import";
import { PreviewWrapper } from "../../../../../components/Embeds/PreviewWrapper";
import { Radius } from "../../../../../components/Embeds/Radius";
import { RichText } from "../../../../../components/Embeds/RichText";
import { Size } from "../../../../../components/Embeds/Size";
import { SizeWithout0 } from "../../../../../components/Embeds/SizeWithout0";
import { Slider } from "../../../../../components/Embeds/Slider";
import { TextController } from "../../../../../components/Embeds/TextController";
import { Heading } from "../../../../../components/Heading";
import { IconButton } from "../../../../../components/IconButton";
import {
  Scroller,
  ScrollerOrientation,
} from "../../../../../components/Scroller";
import { Text } from "../../../../../components/Text";
import {
  embedConfigurations,
  extractEmbedConfigDefaults,
} from "../../../../../config/embeds";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../../hooks/useLocale";
import { useStrings } from "../../../../../hooks/useStrings";
import { EmbedState, type EmbedConfig } from "../../../../../stores/embedState";
import { EmbedItemType } from "../../../../../stores/embedState/constants";
import styles from "./_index.module.css";

export interface EmbedPreviewControllerProps {
  configKey: string;
}

interface PageProps {
  embed: keyof typeof embedConfigurations;
}

export function Page({ embed, locale }: PageProps & LocaleAcceptorProps) {
  const config = embedConfigurations[embed];

  EmbedState.useInitialization(() => extractEmbedConfigDefaults(config));

  return (
    <LocaleProvider locale={locale}>
      <Content embed={embed} />
    </LocaleProvider>
  );
}

function Content({ embed }: PageProps) {
  const config = embedConfigurations[embed] as EmbedConfig;
  const [backgroundImage, setBackgroundImage] = useState(
    "/media/embed-default.webp",
  );
  const fileInput = useRef<HTMLInputElement>(null!);
  const strings = useStrings();

  useEffect(() => {
    fileInput.current = document.createElement("input");
    fileInput.current.type = "file";
    fileInput.current.style.display = "none";
    fileInput.current.accept = "image/*";
    fileInput.current.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setBackgroundImage(URL.createObjectURL(file));
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <div className={styles.window}>
          <div className={styles.toolbar}>
            <Text lowContrast>{strings.embed.preview.title}</Text>

            <Button
              variant="outline"
              color="gray"
              onClick={() => fileInput.current?.click()}
            >
              <ImageIcon />
              {strings.embed.preview.upload}
            </Button>
          </div>

          <div
            className={styles.preview}
            style={{
              background: `url(${backgroundImage}) center / cover no-repeat`,
            }}
          >
            <PreviewWrapper name={embed} />
          </div>
        </div>
      </div>

      <Scroller
        orientation={ScrollerOrientation.Vertical}
        className={styles.sidebar}
      >
        <div className={styles.controls}>
          <Import />

          <Heading size="3" weight="bold">
            {strings.embed.configuration.export.title}
          </Heading>
          <Text size="minor" lowContrast className={styles.description}>
            {strings.embed.configuration.export.description}
          </Text>

          <div className={styles.exports}>
            <GenerateURL embed={embed} />

            <CopyButton
              variant="outline"
              copy={() =>
                "body { margin: 0; background-color: transparent; overflow: hidden; }"
              }
            >
              <CodeIcon />
              {strings.embed.configuration.export.css}
            </CopyButton>
            <CopyButton
              variant="outline"
              copy={() => `${EmbedState.state.width}`}
            >
              <WidthIcon />
              {strings.embed.configuration.export.width}
            </CopyButton>
            <CopyButton
              variant="outline"
              copy={() => `${EmbedState.state.height}`}
            >
              <HeightIcon />
              {strings.embed.configuration.export.height}
            </CopyButton>
            <CopyButton variant="outline" copy={() => "1"}>
              <TimerIcon />
              {strings.embed.configuration.export.framerate}
            </CopyButton>
          </div>

          <div className={styles.customize}>
            <Heading size="3" weight="bold">
              {strings.embed.configuration.customize.title}
            </Heading>
            <IconButton
              color="red"
              variant="ghost"
              size="minor"
              onClick={() => {
                EmbedState.set(EmbedState.initial);
              }}
            >
              <ResetIcon />
            </IconButton>
          </div>
          <Text size="minor" lowContrast className={styles.description}>
            {strings.embed.configuration.customize.description}
          </Text>

          {Object.keys(config).map((configKey) => {
            const item = config[configKey];
            let control: ReactNode;
            let oneLiner = false;

            switch (item.type) {
              case EmbedItemType.Boolean: {
                control = <Boolean configKey={configKey} />;
                oneLiner = true;
                break;
              }

              case EmbedItemType.Color: {
                control = <Color configKey={configKey} />;
                break;
              }

              case EmbedItemType.Radius: {
                control = <Radius configKey={configKey} />;
                oneLiner = true;
                break;
              }

              case EmbedItemType.Size: {
                control = <Size configKey={configKey} />;
                oneLiner = true;
                break;
              }

              case EmbedItemType.SizeWithout0: {
                control = <SizeWithout0 configKey={configKey} />;
                oneLiner = true;
                break;
              }

              case EmbedItemType.Slider: {
                control = <Slider configKey={configKey} config={item} />;
                oneLiner = true;
                break;
              }

              case EmbedItemType.String: {
                control = <TextController configKey={configKey} />;
                break;
              }

              case EmbedItemType.RichText: {
                control = <RichText configKey={configKey} />;
                break;
              }

              case EmbedItemType.Enum: {
                control = <Enum configKey={configKey} config={item} />;
                oneLiner = true;
                break;
              }
            }

            return (
              <div
                key={configKey}
                className={styles.option}
                data-one-liner={oneLiner}
                data-pad={item.pad}
              >
                <Text>
                  {
                    (
                      strings.embed.types[embed].options as Record<
                        string,
                        string
                      >
                    )[configKey]
                  }
                </Text>
                <div className={styles.control}>{control}</div>
              </div>
            );
          })}
        </div>
      </Scroller>
    </div>
  );
}
