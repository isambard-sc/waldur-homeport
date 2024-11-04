import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { QuotaPie } from './QuotaPie';

describe('Quota pie', () => {
  it('renders SVG chart', () => {
    expect(render(<QuotaPie value={0.33} />).container).toMatchSnapshot();
  });
});
