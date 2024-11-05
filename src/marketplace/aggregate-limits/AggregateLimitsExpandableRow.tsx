import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const AggregateLimitsExpandableRow = ({ data }) => {
  if (!data) return null;
  return (
    <>
      <Field label={translate('Type')} value={data.type} />
      <Field label={translate('Offering')} value={data.offering_name} />
      <Field label={translate('Unit')} value={data.measured_unit} />
    </>
  );
};
