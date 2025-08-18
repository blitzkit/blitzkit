import { Link, Table } from '@radix-ui/themes';
import MarkdownToJSX from 'markdown-to-jsx';
import type { ComponentProps } from 'react';

interface MarkdownProps {
  children: string;
}

function Image(props: ComponentProps<'img'>) {
  return <img style={{ maxWidth: '100%' }} {...props} />;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <MarkdownToJSX
      options={{
        overrides: {
          a: { component: Link },
          table: { component: Table.Root },
          thead: { component: Table.Header },
          tbody: { component: Table.Body },
          tr: { component: Table.Row },
          th: { component: Table.ColumnHeaderCell },
          td: { component: Table.Cell },
          img: { component: Image },
        },
      }}
    >
      {children}
    </MarkdownToJSX>
  );
}
