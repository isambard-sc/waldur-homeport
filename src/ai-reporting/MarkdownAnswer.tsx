import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC, ReactNode } from 'react';

// Copied from the AI assistant's MarkdownBlock rather than imported, since
// that one takes the assistant's internal block type.

// markdown-to-jsx treats underscores inside words as emphasis, so a
// filename like projects_per_university.png shows "per" in italics.
// Escape underscores in anything that looks like a filename first.
const FILENAME_RE =
  /\b[\w-]+(?:_[\w-]+)+\.(?:png|jpe?g|gif|svg|csv|pdf|json|xlsx?|txt|zip)\b/gi;

const escapeFilenameUnderscores = (text: string): string =>
  text.replace(FILENAME_RE, (match) => match.replace(/_/g, '\\_'));

// The answer can repeat text from Waldur data, which anyone may write, so
// no raw HTML and no images: an outside image URL could carry report data
// away. Charts are shown separately, by ReportFiles.
const ImageAltText: FC<{ alt?: string }> = ({ alt }) =>
  alt ? <span>{alt}</span> : null;

// Links aren't clickable for the same reason: a link's address could carry
// report data, or lead to a fake login page. The address is shown instead.
const PlainLink: FC<{ href?: string; children?: ReactNode }> = ({
  href,
  children,
}) => (
  <span>
    {children}
    {href && href !== children ? (
      <span className="text-muted"> ({href})</span>
    ) : null}
  </span>
);

export const MarkdownAnswer: FC<{ content: string }> = ({ content }) => {
  return (
    <div className="aui-md">
      <Markdown
        options={{
          disableParsingRawHTML: true,
          overrides: {
            img: { component: ImageAltText },
            a: { component: PlainLink },
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
