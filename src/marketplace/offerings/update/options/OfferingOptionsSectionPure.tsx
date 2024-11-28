import { FC, useContext } from 'react';
import { Card, Table } from 'react-bootstrap';

import { FormFieldsContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddOptionButton } from './AddOptionButton';
import { FIELD_TYPES } from './constants';
import { DeleteOptionButton } from './DeleteOptionButton';
import { EditOptionButton } from './EditOptionButton';

export const OfferingOptionsSectionPure: FC<
  OfferingSectionProps & { title; type }
> = (props) => {
  const { readOnlyFields } = useContext(FormFieldsContext);
  const data = props.offering[props.type];
  return (
    <Card id={props.type} className="card-bordered">
      <Card.Header>
        <Card.Title className="h5">
          {props.title}
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        {!readOnlyFields.includes(props.type) ? (
          <div className="card-toolbar">
            <AddOptionButton {...props} />
          </div>
        ) : null}
      </Card.Header>
      <Card.Body>
        {!data?.order?.length ? (
          <NoResult
            callback={props.refetch}
            title={translate('No input variables found')}
            message={translate("Offering doesn't have input variables.")}
            buttonTitle={translate('Search again')}
            className="mt-n5"
          />
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {data?.order?.map((key) => (
                <tr key={key}>
                  <td className="col-md-3">
                    {
                      FIELD_TYPES.find(
                        (fieldType) =>
                          fieldType.value === data?.options[key]?.type,
                      ).label
                    }
                  </td>
                  <td className="col-md-3">{data.options[key]?.label}</td>
                  <td className="col-md-6">{data.options[key]?.help_text}</td>
                  <td className="row-actions">
                    <div>
                      <EditOptionButton
                        {...props}
                        option={{
                          ...data?.options[key],
                          name: key,
                        }}
                      />
                      <DeleteOptionButton
                        {...props}
                        optionKey={key}
                        optionLabel={data?.options[key]?.label}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
