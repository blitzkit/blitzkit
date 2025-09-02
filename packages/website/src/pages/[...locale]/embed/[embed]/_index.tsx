import {
  CodeIcon,
  HeightIcon,
  ImageIcon,
  ResetIcon,
  TimerIcon,
  WidthIcon,
} from "@radix-ui/react-icons";
import { Box, Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CopyButton } from "../../../../components/CopyButton";
import { Boolean } from "../../../../components/Embeds/Boolean";
import { Color } from "../../../../components/Embeds/Color";
import { Enum } from "../../../../components/Embeds/Enum";
import { GenerateURL } from "../../../../components/Embeds/GenerateURL";
import { Import } from "../../../../components/Embeds/Import";
import { PreviewWrapper } from "../../../../components/Embeds/PreviewWrapper";
import { Radius } from "../../../../components/Embeds/Radius";
import { RichText } from "../../../../components/Embeds/RichText";
import { Size } from "../../../../components/Embeds/Size";
import { SizeWithout0 } from "../../../../components/Embeds/SizeWithout0";
import { Slider } from "../../../../components/Embeds/Slider";
import { TextController } from "../../../../components/Embeds/TextController";
import { PageWrapper } from "../../../../components/PageWrapper";
import {
  embedConfigurations,
  extractEmbedConfigDefaults,
} from "../../../../constants/embeds";
import { NAVBAR_HEIGHT } from "../../../../constants/navbar";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../../../hooks/useLocale";
import { EmbedState, type EmbedConfig } from "../../../../stores/embedState";
import { EmbedItemType } from "../../../../stores/embedState/constants";

export interface EmbedPreviewControllerProps {
  configKey: string;
}

interface PageProps {
  embed: keyof typeof embedConfigurations;
}

export function Page({ embed, locale }: PageProps & LocaleAcceptorProps) {
  const config = embedConfigurations[embed];

  EmbedState.useInitialization(extractEmbedConfigDefaults(config));

  return (
    <LocaleProvider locale={locale}>
      <Content embed={embed} />
    </LocaleProvider>
  );
}

function Content({ embed }: PageProps) {
  const config = embedConfigurations[embed] as EmbedConfig;
  const [backgroundImage, setBackgroundImage] = useState(
    "/assets/images/backgrounds/embed-default.webp"
  );
  const fileInput = useRef<HTMLInputElement>();
  const { strings } = useLocale();

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
    <PageWrapper padding="0" maxWidth="104rem" color="red">
      <Flex>
        <ScrollArea
          scrollbars="vertical"
          style={{ height: "100%", maxWidth: 320 }}
        >
          <Flex direction="column" gap="2" p="4">
            <Import />

            <Heading>
              {strings.website.tools.embed.configuration.export.title}
            </Heading>
            <Text size="2" color="gray" mb="2">
              {strings.website.tools.embed.configuration.export.description}
            </Text>

            <Flex mb="6" gap="2" wrap="wrap">
              <GenerateURL embed={embed} />

              <CopyButton
                variant="outline"
                copy={() =>
                  "body { margin: 0; background-color: transparent; overflow: hidden; }"
                }
              >
                <CodeIcon />
                {strings.website.tools.embed.configuration.export.css}
              </CopyButton>
              <CopyButton
                variant="outline"
                copy={() => `${EmbedState.state.width}`}
              >
                <WidthIcon />
                {strings.website.tools.embed.configuration.export.width}
              </CopyButton>
              <CopyButton
                variant="outline"
                copy={() => `${EmbedState.state.height}`}
              >
                <HeightIcon />
                {strings.website.tools.embed.configuration.export.height}
              </CopyButton>
              <CopyButton variant="outline" copy={() => "1"}>
                <TimerIcon />
                {strings.website.tools.embed.configuration.export.framerate}
              </CopyButton>
            </Flex>

            <Flex justify="between" align="center">
              <Heading>
                {strings.website.tools.embed.configuration.customize.title}
              </Heading>
              <Button
                color="red"
                variant="ghost"
                onClick={() => {
                  EmbedState.set(EmbedState.initial);
                }}
              >
                <ResetIcon />{" "}
                {strings.website.tools.embed.configuration.customize.reset}
              </Button>
            </Flex>
            <Text size="2" color="gray" mb="2">
              {strings.website.tools.embed.configuration.customize.description}
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
                <Flex
                  key={configKey}
                  direction={oneLiner ? undefined : "column"}
                  gap={oneLiner ? "2" : "1"}
                  justify={oneLiner ? "between" : undefined}
                  mb={oneLiner ? "2" : "4"}
                  pb={item.pad ? "6" : undefined}
                >
                  <Text>
                    {
                      (
                        strings.website.tools.embed.types[embed]
                          .options as Record<string, string>
                      )[configKey]
                    }
                  </Text>
                  <Flex
                    gap="2"
                    align="center"
                    flexGrow="1"
                    justify={oneLiner ? "end" : undefined}
                  >
                    {control}
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </ScrollArea>

        <Box
          p="4"
          flexGrow="1"
          position="sticky"
          top={`${NAVBAR_HEIGHT}px`}
          height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
        >
          <Flex
            direction="column"
            height="100%"
            style={{
              borderRadius: "var(--radius-3)",
              overflow: "hidden",
              boxShadow: "var(--shadow-3)",
            }}
          >
            <Flex
              justify="between"
              align="center"
              p="2"
              pl="3"
              style={{
                backgroundColor: "var(--color-panel-solid)",
              }}
            >
              <Text color="gray">
                {strings.website.tools.embed.preview.title}
              </Text>

              <Button
                variant="outline"
                color="gray"
                onClick={() => fileInput.current?.click()}
              >
                <ImageIcon /> {strings.website.tools.embed.preview.upload}
              </Button>
            </Flex>

            <Box
              flexGrow="1"
              style={{
                background: `url(${backgroundImage}) center / cover no-repeat`,
              }}
              position="relative"
              overflow="hidden"
            >
              <PreviewWrapper name={embed} />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
