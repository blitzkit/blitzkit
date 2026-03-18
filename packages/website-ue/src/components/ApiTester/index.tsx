import { useState } from "react";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { Button } from "../Button";
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
      {slugs.map((slug) => (
        <div className={styles.slug}>
          {slug}:{" "}
          <TextField
            value={values[slug]}
            onChange={(event) => {
              setValues((state) => ({ ...state, [slug]: event.target.value }));
            }}
          />
        </div>
      ))}

      <Link href={href} target="_blank">
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
