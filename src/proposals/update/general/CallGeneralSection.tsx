import Markdown from 'markdown-to-jsx';
import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { RoleEnum } from '@waldur/permissions/enums';
import { Call } from '@waldur/proposals/types';
import { RolePopover } from '@waldur/user/affiliations/RolePopover';

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
                  <Markdown>{props.call.description}</Markdown>
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
              <td className="col-md-3">{translate('Default project role')}</td>
              <td className="col-md-9">
                <RolePopover
                  roleName={
                    props.call.default_project_role_name ||
                    RoleEnum.PROJECT_ADMIN
                  }
                />
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="default_project_role"
                    title={translate('Edit default project role')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
