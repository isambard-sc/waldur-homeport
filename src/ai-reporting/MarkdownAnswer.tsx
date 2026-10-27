import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC } from 'react';

// Copied from @/ai-assistant/components/blocks/MarkdownBlock rather than
// imported - that component's prop type (UIBlock) is internal to the
// assistant-ui block protocol (id/key/status fields we have no use for);
// this only needs the rendering, decoupled from that feature's internals.

// The model's answers routinely include plain filenames like
// "projects_per_university.png" in a "Files:" line. Unlike strict CommonMark
// (which never treats an underscore as emphasis between two word characters),
// markdown-to-jsx does - "projects_per_university.png" renders with "per"
// italicised. Escape underscores inside anything that looks like a filename
// (word characters, at least one underscore, a recognised extension) before
// handing the text to the parser, so filenames always render literally.
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
