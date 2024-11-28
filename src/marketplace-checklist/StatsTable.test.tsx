import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { initCustomer } from './fixtures';
import { StatsTable } from './StatsTable';

const setupTable = (props = {}) => {
  const customers = [initCustomer(props)];
  render(<StatsTable stats={customers} scopeTitle="Organization" />);
};

describe('StatsTable', () => {
  it('should render th titles', () => {
    setupTable();
    const thLabels = ['#', 'Organization', 'Score'];

    thLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should render index label', () => {
    setupTable();
    const index = screen.getAllByRole('cell')[0];
    expect(index).toHaveTextContent('1');
  });

  it('should render name label', () => {
    setupTable();
    const name = screen.getAllByRole('cell')[1];
    expect(name).toHaveTextContent('Alex');
  });

  describe('score label', () => {
    const getVariant = (props = {}) => {
      setupTable(props);
      return screen.getByTestId('state-indicator').getAttribute('data-variant');
    };

    it('should render danger score label', () => {
      const variant = getVariant();
      expect(variant).toBe('danger');
    });

    it('should render warning score label', () => {
      const variant = getVariant({ score: 50 });
      expect(variant).toBe('warning');
    });

    it('should render primary score label', () => {
      const variant = getVariant({ score: 80 });
      expect(variant).toBe('primary');
    });
  });
});
