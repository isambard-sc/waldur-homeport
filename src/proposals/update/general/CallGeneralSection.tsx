import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Call } from '@waldur/proposals/types';

import { EditGeneralInfoButton } from './EditGeneralInfoButton';

interface CallGeneralSectionProps {
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <ValidationIcon value={props.call.description} />
          <span className="me-2">{translate('General')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Table bordered={true} hover={true} responsive={true}>
          <tbody>
            <tr>
              <td className="col-md-3">{translate('Name')}</td>
              <td className="col-md-9">{props.call.name || 'N/A'}</td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="name"
                    title={translate('Edit name')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Description')}</td>
              <td className="col-md-9">
                {props.call.description ? (
                  <SafeMarkdown text={props.call.description} />
                ) : (
                  'N/A'
                )}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="description"
                    title={translate('Edit description')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Reference code')}</td>
              <td className="col-md-9">{props.call.reference_code || 'N/A'}</td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="reference_code"
                    title={translate('Edit reference code')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">
                {translate('Fixed duration for granted projects (in days)')}
              </td>
              <td className="col-md-9">
                {props.call.fixed_duration_in_days || 'N/A'}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="fixed_duration_in_days"
                    title={translate(
                      'Edit fixed duration for granted projects (in days)',
                    )}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">
                {translate('Reviewer identity visible to submitters')}
              </td>
              <td className="col-md-9">
                {props.call.reviewer_identity_visible_to_submitters
                  ? translate('Yes')
                  : translate('No')}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="reviewer_identity_visible_to_submitters"
                    title={translate(
                      'Edit reviewer identity visibility for submitters',
                    )}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">
                {translate('Reviews visible to submitters')}
              </td>
              <td className="col-md-9">
                {props.call.reviews_visible_to_submitters
                  ? translate('Yes')
                  : translate('No')}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="reviews_visible_to_submitters"
                    title={translate('Edit reviews visibility for submitters')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            {isFeatureVisible(MarketplaceFeatures.call_only) && (
              <tr>
                <td className="col-md-3">{translate('External URL')}</td>
                <td className="col-md-9">{props.call.external_url || 'N/A'}</td>
                <td className="row-actions">
                  <div>
                    <EditGeneralInfoButton
                      call={props.call}
                      name="external_url"
                      title={translate('Edit external URL')}
                      refetch={props.refetch}
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
