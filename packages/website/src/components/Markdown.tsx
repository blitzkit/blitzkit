import { Link, Table } from '@radix-ui/themes';
import MarkdownToJSX from 'markdown-to-jsx';
import type { ComponentProps } from 'react';
import { docImageUrl, isExternalImage } from '../core/blitzkit/docImages';
import { LazyImage } from './LazyImage';

interface MarkdownProps {
  children: string;
}

function Image({ src, ...props }: ComponentProps<'img'>) {
  return (
    <LazyImage
      style={{ maxWidth: '100%' }}
      src={src && isExternalImage(src) ? docImageUrl(src) : src}
      {...props}
    />
  );
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
