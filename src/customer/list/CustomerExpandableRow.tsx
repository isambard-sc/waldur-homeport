import { DateTime } from 'luxon';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';
import { invoicesList } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AgreementInfo } from '@waldur/invoices/list/AgreementInfo';
import { InvoicesStatsList } from '@waldur/invoices/list/InvoicesStatsList';
import { type RootState } from '@waldur/store/reducers';

export const CustomerExpandableRow = memo((props: any) => {
  const accountingPeriod = useSelector((state: RootState) =>
    formValueSelector('customerListFilter')(state, 'accounting_period'),
  );
  const now = DateTime.now().startOf('month');
  const { loading, error, value } = useAsync(
    () =>
      invoicesList({
        query: {
          customer_uuid: props.row.uuid,
          year: accountingPeriod ? accountingPeriod.value.year : now.year,
          month: accountingPeriod ? accountingPeriod.value.month : now.month,
        },
      }).then((response) => response.data[0]),
    [props.row, accountingPeriod],
  );
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load organization resources.')}</>;
  } else {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '5px',
          }}
        >
          <AgreementInfo paymentProfiles={props.row.payment_profiles} />
        </div>
        {value ? (
          <InvoicesStatsList
            organization={props.row}
            invoiceUuid={value.uuid}
            providerUUID={props.providerUUID}
          />
        ) : (
          <p className="text-center">
            {translate('No invoice data available.')}
          </p>
        )}
      </>
    );
  }
});
