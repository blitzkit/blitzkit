import { youtubers } from "@blitzkit/core";
import { awaitableReviews } from "../../core/awaitables/reviews";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import { Heading } from "../Heading";
import { Text } from "../Text";
import { VerifiedIcon } from "../VerifiedIcon";
import styles from "./index.module.css";

const reviews = await awaitableReviews;

export function TankopediaVideos() {
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const videos = reviews.reviews[tank.id]?.videos;

  if (videos === undefined || videos.length === 0) return null;

  return (
    <section className={styles.section}>
      <Heading size="3">{strings.tanks.videos.title}</Heading>

      <div className={styles.cards}>
        {videos.map((video) => {
          const image = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
          const youtuber = youtubers.find(
            (youtuber) => youtuber.id === video.author,
          );

          if (!youtuber) return null;

          return (
            <a
              key={video.id}
              className={styles.card}
              style={{ backgroundImage: `url(${image})` }}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={styles.thumbnail}
                style={{ backgroundImage: `url(${image})` }}
              />

              <div className={styles.info}>
                <Text>{youtuber.name}</Text>
                <VerifiedIcon width="1em" height="1em" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
