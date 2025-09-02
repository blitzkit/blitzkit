import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Flex, Spinner, TextField, type FlexProps } from "@radix-ui/themes";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { highlightedRows, highlightedRowsUpdate } from "./Info";

export function StatSearch(props: FlexProps) {
  const { strings } = useLocale();
  const [searching, setSearching] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const count = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const search = useCallback(() => {
    if (!input.current || !count.current) return;

    if (input.current.value.length > 0) {
      setSearching(true);
    } else {
      setSearching(false);
      count.current.textContent = "";
    }

    requestUpdate();
    setIndex(0);
  }, []);
  const requestUpdate = useCallback(
    debounce(() => {
      if (!input.current || !count.current) return;

      if (input.current.value.length === 0) {
        count.current.textContent = "";

        setSearching(false);
        Tankopedia.mutate((draft) => {
          draft.statSearch = undefined;
        });
        return;
      }

      setSearching(false);
      Tankopedia.mutate((draft) => {
        draft.statSearch = input.current!.value;
      });
    }, 500),
    []
  );

  useEffect(() => {
    const handleHighlightedRowsUpdate = () => {
      if (!count.current || !input.current) return;

      count.current.textContent =
        input.current.value.length === 0 ? "" : `0 / ${highlightedRows.size}`;
    };

    highlightedRowsUpdate.on(handleHighlightedRowsUpdate);

    return () => {
      highlightedRowsUpdate.off(handleHighlightedRowsUpdate);
    };
  }, []);

  return (
    <Flex flexGrow="1" maxWidth="20rem" width="100%" {...props}>
      <TextField.Root
        ref={input}
        placeholder={strings.website.tools.tankopedia.search}
        variant="classic"
        style={{ width: "100%" }}
        onChange={search}
        onKeyDown={(event) => {
          if (!count.current) return;

          if (event.key === "Enter") {
            const newIndex = (index + 1) % highlightedRows.size;
            count.current.textContent = `${newIndex + 1} / ${highlightedRows.size}`;
            const array = [...highlightedRows];

            array.forEach((element) => element.classList.remove("focused"));

            if (array[newIndex]) {
              array[newIndex].classList.add("focused");
              array[newIndex].scrollIntoView({
                block: "center",
                inline: "center",
              });
            }

            setIndex((index) => index + 1);
          }
        }}
      >
        <TextField.Slot>
          {searching ? <Spinner /> : <MagnifyingGlassIcon />}
        </TextField.Slot>

        <TextField.Slot ref={count} />
      </TextField.Root>
    </Flex>
  );
}
