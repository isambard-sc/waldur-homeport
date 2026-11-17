import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarkdownAnswer } from './MarkdownAnswer';

describe('MarkdownAnswer', () => {
  it('shows raw HTML as text instead of rendering it', () => {
    render(
      <MarkdownAnswer content='<iframe src="https://evil.example"></iframe>' />,
    );

    expect(screen.getByText(/<iframe/)).toBeInTheDocument();
  });

  it('does not load images, which could send data to another site', () => {
    render(<MarkdownAnswer content="![chart](https://evil.example/?d=x)" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('chart')).toBeInTheDocument();
  });

  it('still renders normal Markdown', () => {
    render(<MarkdownAnswer content="**Seventeen** projects" />);

    expect(
      screen.getByText('Seventeen', { selector: 'strong' }),
    ).toBeInTheDocument();
  });
});
