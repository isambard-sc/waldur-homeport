import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC, ReactNode } from 'react';

import { getAIReportingLinkDomains, isTrustedLink } from './utils';

// Copied from the AI assistant's MarkdownBlock rather than imported, since
// that one takes the assistant's internal block type.

// markdown-to-jsx treats underscores inside words as emphasis, so a
// filename like projects_per_university.png shows "per" in italics.
// Escape underscores in anything that looks like a filename first.
// Parts between underscores exclude "_", so the pattern can't backtrack
// exponentially on long underscore-separated text (any user can write that).
const FILENAME_RE =
  /\b[A-Za-z0-9-]{1,100}(?:_[A-Za-z0-9-]{1,100})+\.(?:png|jpe?g|gif|svg|csv|pdf|json|xlsx?|txt|zip)\b/gi;

const escapeFilenameUnderscores = (text: string): string =>
  text.replace(FILENAME_RE, (match) => match.replace(/_/g, '\\_'));

// The answer can repeat text from Waldur data, which anyone may write, so
// no raw HTML and no images: an outside image URL could carry report data
// away. Charts are shown separately, by ReportFiles.
const ImageAltText: FC<{ alt?: string }> = ({ alt }) =>
  alt ? <span>{alt}</span> : null;

const textOf = (children: ReactNode): string | null => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children) && children.every((c) => typeof c === 'string'))
    return children.join('');
  return null;
};

// Only links to allowed domains are clickable: a link's address could carry
// report data, or lead to a fake login page. Others show their address.
const AnswerLink: FC<{ href?: string; children?: ReactNode }> = ({
  href,
  children,
}) => {
  if (href && isTrustedLink(href, getAIReportingLinkDomains())) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <span>
      {children}
      {href && textOf(children) !== href ? (
        <span className="text-muted"> ({href})</span>
      ) : null}
    </span>
  );
};

export const MarkdownAnswer: FC<{ content: string }> = ({ content }) => {
  return (
    <div className="aui-md">
      <Markdown
        options={{
          disableParsingRawHTML: true,
          overrides: {
            img: { component: ImageAltText },
            a: { component: AnswerLink },
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
