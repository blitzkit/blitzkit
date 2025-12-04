import { Code, Flex, Heading, Link, Text } from "@radix-ui/themes";
import { useEffect, useState, type ReactNode } from "react";
import type { MaybeSkeletonComponentProps } from "../types/maybeSkeletonComponentProps";
import { InlineSkeleton } from "./InlineSkeleton";

const TIME = 1764898200 * 1000;

export function Giveaway({ skeleton }: MaybeSkeletonComponentProps) {
  const [timeLeft, setTimeLeft] = useState<number>(TIME - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(TIME - Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  let string: ReactNode;

  if (timeLeft > 0) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((timeLeft / 1000) % 60)
      .toString()
      .padStart(2, "0");

    string = (
      <>
        in{" "}
        <Code highContrast>
          {hours}h {minutes}m {seconds}s
        </Code>
      </>
    );
  } else {
    string = "has ended. Come again later!";
  }

  return (
    <Flex justify="center" px="4">
      <Link
        color="gray"
        highContrast
        style={{ display: "content" }}
        href="https://discord.gg/njQdBhNS?event=1446208951136813117"
        underline="none"
      >
        <Flex
          mt="3"
          px="5"
          py="4"
          style={{
            borderRadius: "var(--radius-3)",
            backgroundImage: "url(https://i.imgur.com/LRYmSkg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxSizing: "border-box",
          }}
          align="center"
          gap="5"
        >
          <img
            src="https://i.imgur.com/mvmJQgB.png"
            style={{
              height: "min(15vw, 5rem)",
              filter: "drop-shadow(0.5rem 0.5rem 1rem #00000080)",
            }}
          />

          <Flex direction="column">
            <Heading size={{ initial: "4", sm: "6" }}>
              Music Box giveaway {!skeleton && string}{" "}
              {skeleton && <InlineSkeleton width="10rem" />}
            </Heading>
            <Text size={{ initial: "2", sm: "3" }}>
              Join the BlitzKit Discord server event
            </Text>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  );
}
