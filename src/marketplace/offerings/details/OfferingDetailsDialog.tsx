import React from 'react';
import { useAsync } from 'react-use';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OfferingDetailsDialogProps {
  resolve: { offering: any };
}

async function loadData(offering: any) {
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  return {
    offering,
    tabs,
  };
}

export const OfferingDetailsDialog: React.FC<OfferingDetailsDialogProps> = (
  props,
) => {
  const { loading, error, value } = useAsync(
    () => loadData(props.resolve.offering),
    [props.resolve.offering],
  );
  return (
    <ModalDialog
      title={translate('Offering details')}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <h3>{translate('Unable to load offering details.')}</h3>
      ) : (
        <>
          <h3>{value.offering.name}</h3>
          <p>
            <strong>{translate('Service provider:')}</strong>{' '}
            {value.offering.customer_name}
          </p>

          {value.offering.description && (
            <p className="bs-callout bs-callout-success">
              <FormattedHtml html={value.offering.description} />
            </p>
          )}

          {value.offering.parent_name ? (
            <p>
              <strong>{translate('Parent offering:')}</strong>{' '}
              {value.offering.parent_name}
            </p>
          ) : null}

          {value.offering.parent_description ? (
            <>
              <p>
                <strong>{translate('Parent offering description:')}</strong>
              </p>
              <p className="bs-callout bs-callout-success">
                <FormattedHtml html={value.offering.parent_description} />
              </p>
            </>
          ) : null}

          <OfferingTabsComponent tabs={value.tabs} />
        </>
      )}
    </ModalDialog>
  );
};
