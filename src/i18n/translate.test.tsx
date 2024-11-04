import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { formatJsx, formatJsxTemplate } from './translate';

describe('formatJsxTemplate', () => {
  it('allows to use curly braces syntax to interpolate JSX component', () => {
    const supportEmail = 'admin@example.com';
    const { container } = render(
      formatJsxTemplate('Please send an email to {supportEmail}. Thank you!', {
        supportEmail: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>,
      }),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('formatJsx', () => {
  it('allows to use angular braces syntax to interpolate JSX component', () => {
    const { container } = render(
      formatJsx(
        'By submitting the form you are agreeing to the <Link>Terms of Service</Link>.',
        {
          Link: (s) => <a href="example.com">{s}</a>,
        },
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
