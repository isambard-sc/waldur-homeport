import { WarningCircle } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  cloneElement,
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';
import { Card, Table } from 'react-bootstrap';

import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { wrapTooltip } from '@waldur/table/ActionButton';

import './FormTable.scss';

export interface FormTableItemProps {
  label?: ReactNode;
  description?: ReactNode;
  value: ReactNode;
  warnTooltip?: string;
  actions?: ReactNode;
  disabled?: boolean;
}

const FormTableItem: FC<FormTableItemProps> = ({ actions, ...props }) => {
  return (
    <tr className={classNames(props.disabled && 'opacity-50')}>
      {props.description ? (
        <th className="col-md-4">
          <div className="title fw-bolder">
            {props.label}
            {Boolean(props.warnTooltip) &&
              wrapTooltip(
                props.warnTooltip,
                <WarningCircle
                  size={20}
                  className="ms-2 text-warning mb-1"
                  data-testid="warning"
                />,
              )}
          </div>
          <div className="description fw-normal">{props.description}</div>
        </th>
      ) : props.label ? (
        <th className="title col-md-3">
          {props.label}:{' '}
          {Boolean(props.warnTooltip) &&
            wrapTooltip(
              props.warnTooltip,
              <WarningCircle size={20} className="ms-2 text-warning mb-1" />,
            )}
        </th>
      ) : null}
      <td className="value col-md" colSpan={props.label ? undefined : 2}>
        {props.value}
      </td>
      <td className="col-md-auto col-actions">
        {actions ? cloneElement(actions as ReactElement, props) : actions}
      </td>
    </tr>
  );
};

type FormTableCardProps = FC<
  PropsWithChildren<{
    title?: ReactNode;
    className?: string;
    refetch?(): void;
    loading?: boolean;
    actions?: ReactNode;
  }>
>;

const FormTableCard: FormTableCardProps = (props) => {
  return (
    <Card className={classNames('form-table-card', props.className)}>
      {props.title && (
        <Card.Header>
          <Card.Title>
            <h3>{props.title}</h3>
            {props.refetch && (
              <RefreshButton refetch={props.refetch} loading={props.loading} />
            )}
          </Card.Title>
          {props.actions && (
            <div className="card-toolbar gap-3">{props.actions}</div>
          )}
        </Card.Header>
      )}
      <Card.Body>{props.children}</Card.Body>
    </Card>
  );
};

interface FormTableProps {
  hideActions?: boolean;
  /** Bold titles and muted values */
  detailsMode?: boolean;
  alignTop?: boolean;
  className?: string;
}

const TABLE_GY_SPACE_REGEX = /(?<=\s|^)(g[y]?-([1-9]\d*))( ?)(?=\s|$)/;

const FormTable: FC<PropsWithChildren<FormTableProps>> & {
  Item: FC<FormTableItemProps>;
  Card: FormTableCardProps;
} = (props) => {
  return (
    <Table
      bordered={true}
      responsive={true}
      className={classNames(
        'form-table',
        props.hideActions && 'hide-actions',
        props.detailsMode && 'details-mode',
        props.alignTop && 'align-top',
        !TABLE_GY_SPACE_REGEX.test(props.className) && 'gy-6',
        props.className,
      )}
    >
      <tbody>{props.children}</tbody>
    </Table>
  );
};

FormTable.Card = FormTableCard;
FormTable.Item = FormTableItem;

export default FormTable;
