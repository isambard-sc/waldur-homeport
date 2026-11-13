import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC } from 'react';

// Copied from the AI assistant's MarkdownBlock rather than imported, since
// that one takes the assistant's internal block type.

// markdown-to-jsx treats underscores inside words as emphasis, so a
// filename like projects_per_university.png shows "per" in italics.
// Escape underscores in anything that looks like a filename first.
const FILENAME_RE =
  /\b[\w-]+(?:_[\w-]+)+\.(?:png|jpe?g|gif|svg|csv|pdf|json|xlsx?|txt|zip)\b/gi;

const escapeFilenameUnderscores = (text: string): string =>
  text.replace(FILENAME_RE, (match) => match.replace(/_/g, '\\_'));

export const MarkdownAnswer: FC<{ content: string }> = ({ content }) => {
  return (
    <div className="aui-md">
      <Markdown
        options={{
          overrides: {
            a: {
              props: {
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
          },
          renderRule: (next, node, _, state) => {
            if (node.type === RuleType.codeBlock) {
              return <p key={state.key}>{String.raw`${node.text}`}</p>;
            }
            return next();
          },
        }}
      >
        {escapeFilenameUnderscores(content)}
      </Markdown>
    </div>
  );
};
