import { connect } from 'react-redux';
import { compose } from 'redux';
import { change, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { submitUsageReport } from '@waldur/marketplace/common/api';
import { OfferingComponent } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { FORM_ID } from '../store/constants';

import { ResourceUsageForm } from './ResourceUsageForm';
import { UsageReportContext, ComponentUsage } from './types';

interface OwnProps {
  components: OfferingComponent[];
  periods: any;
  params: UsageReportContext;
}

const mapComponents = (components: ComponentUsage[]) =>
  components.reduce(
    (collector, component) => ({
      ...collector,
      [component.type]: {
        amount: component.usage,
        description: component.description,
        recurring: component.recurring,
      },
    }),
    {},
  );

const mapStateToProps = (_, ownProps: OwnProps) =>
  ownProps.periods
    ? {
        initialValues: {
          period: ownProps.periods[0],
          components: ownProps.periods[0].value
            ? mapComponents(ownProps.periods[0].value.components)
            : undefined,
        },
      }
    : {};

const mapDispatchToProps = (dispatch) => ({
  onPeriodChange: (option) => {
    const period = option.value;
    for (const component of period.components) {
      dispatch(
        change(FORM_ID, `components.${component.type}.amount`, component.usage),
      );
      dispatch(
        change(
          FORM_ID,
          `components.${component.type}.description`,
          component.description,
        ),
      );
    }
  },
  submitReport: async ({ period, components }) => {
    const payload = {
      plan_period: period.value?.uuid,
      usages: Object.keys(components).map((key) => ({
        type: key,
        ...components[key],
      })),
    };

    try {
      await submitUsageReport(payload);
      dispatch(showSuccess(translate('Usage report has been submitted.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to submit usage report.')),
      );
    }
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const enhance = compose(connector, reduxForm({ form: FORM_ID }));

export const ResourceUsageFormContainer = enhance(ResourceUsageForm);
