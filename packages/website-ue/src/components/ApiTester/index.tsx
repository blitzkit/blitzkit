import { useState } from "react";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { Button } from "../Button";
import { Code } from "../Code";
import { Heading } from "../Heading";
import { Link } from "../Link";
import { TextField } from "../TextField";
import styles from "./index.module.css";

interface Props {
  path: string;
}

const slugPattern = /\[\w+\]/g;

function Content({ path }: Props) {
  const strings = useStrings();

  const slugs = (path.match(slugPattern) ?? []).map((slug) =>
    slug.slice(1, -1),
  );
  const [values, setValues] = useState(() => {
    const values: Record<string, string> = {};

    for (const slug of slugs) {
      values[slug] = "";
    }

    return values;
  });

  const href = Object.entries(values).reduce(
    (href, [slug, value]) => href.replace(`[${slug}]`, value),
    `/api/${path}`,
  );

  return (
    <div className={styles.tester}>
      <Heading size="3">
        <Code className={styles.title}>
          {path.split(slugPattern).map((text, index) => {
            const slug = slugs[index - 1];

            return (
              <>
                {index > 0 && (
                  <TextField
                    className={styles.slug}
                    placeholder={`${slug}`}
                    monospace
                    align="center"
                    autoWidth
                    onChange={(event) => {
                      setValues((state) => ({
                        ...state,
                        [slug]: event.target.value,
                      }));
                    }}
                  />
                )}
                <span key={index}>{text}</span>
              </>
            );
          })}
        </Code>
      </Heading>

      <Link underline="never" href={href} target="_blank">
        <Button>{strings.api.test}</Button>
      </Link>
    </div>
  );
}

export function ApiTester({ path, locale }: Props & LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content path={path} />
    </LocaleProvider>
  );
}
