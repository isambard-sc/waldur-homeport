import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsRetrieve,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ResourceRequestWizardFormSecondPage } from './ResourceRequestWizardFormSecondPage';

// The Formbricks GPU-hour allocation: a resource option, no limit component.
const isambard = {
  uuid: 'offering-isambard',
  name: 'isambard-ai',
  category_title: 'brics-offering',
  components: [],
  plans: [{ uuid: 'plan-basic', name: 'Basic Plan' }],
  options: { order: [], options: {} },
  resource_options: {
    order: ['allocation'],
    options: { allocation: { type: 'integer', label: 'GPUh' } },
  },
};

const renderPage = (data: Record<string, unknown>) =>
  renderWithProviders(
    <Form
      onSubmit={vi.fn()}
      initialValues={{
        offering: {
          uuid: 'call-offering-isambard',
          offering_uuid: isambard.uuid,
        },
        plan: 'plan-basic',
        attributes: { allocation: 30000 },
      }}
    >
      {() => (
        <ResourceRequestWizardFormSecondPage
          title="Edit"
          step={1}
          steps={[
            { key: 'offering', label: 'Select offering', completed: true },
            { key: 'configure', label: 'Configure', completed: false },
          ]}
          onPrev={vi.fn()}
          onStep={vi.fn()}
          data={{ call: { uuid: 'call-1' }, ...data }}
        />
      )}
    </Form>,
  );

describe('ResourceRequestWizardFormSecondPage', () => {
  beforeEach(() => {
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: {},
    } as any);
    vi.mocked(marketplacePublicOfferingsRetrieve).mockResolvedValue({
      data: isambard,
    } as any);
  });

  it('lets the award change an amount held in a resource option', async () => {
    renderPage({ award: true });

    expect(await screen.findByText('Resource options')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
    expect(screen.getByText('GPUh')).toBeInTheDocument();
  });

  it('leaves resource options out of the applicant request', async () => {
    renderPage({});

    expect(await screen.findByText(/isambard-ai/)).toBeInTheDocument();
    expect(screen.queryByText('Resource options')).not.toBeInTheDocument();
  });
});
