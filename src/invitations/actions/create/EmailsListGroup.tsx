import { Plus, Question, Trash } from '@phosphor-icons/react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { Tip } from '@waldur/core/Tooltip';
import { email, required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { EmailField } from '@waldur/form/EmailField';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { MIN_PAGE_SIZE } from '@waldur/table/constants';
import { TablePagination } from '@waldur/table/TablePagination';

import { LoadUserDetailsButton } from '../LoadUserDetailsButton';
import { GroupInviteRow, StoredUserDetails } from '../types';
import { UserDetailsGroup } from '../UserDetailsGroup';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

export const EmailsListGroup = ({
  fields,
  roles,
  customer,
  project,
  fetchUserDetails,
  usersDetails,
  disabled,
}) => {
  const [warn, setWarn] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MIN_PAGE_SIZE);

  const changePageSize = (newSize) => {
    setPage(1);
    setPageSize(newSize);
  };

  const addRow = useCallback(() => {
    let emptyEmails = 0;
    if (fields._isFieldArray) {
      fields.forEach((_, i) => {
        if (!fields.get(i)?.email) emptyEmails++;
      });
    }
    if (emptyEmails < 5) {
      if (project) fields.push({ project });
      else fields.push({});
      // We have to give pagination a timeout to create the new page, otherwise we will get an error.
      setTimeout(() => {
        setPage(Math.ceil((fields.length + 1) / pageSize));
      }, 250);
    } else {
      setWarn(true);
      setTimeout(() => setWarn(false), 2000);
    }
  }, [fields, project, setPage, pageSize]);

  const removeRow = (index) => {
    const isLastOne = visibleFields.filter(Boolean).length === 1;
    const lastPage = Math.ceil((fields.length + 1) / pageSize);
    fields._isFieldArray && fields.remove(index);
    if (isLastOne && page === lastPage && page !== 1) {
      setPage((prev) => prev - 1);
    }
  };

  const getUserDetails = useCallback(
    (user: GroupInviteRow): StoredUserDetails =>
      usersDetails.find((u) => u.civil_number === user.civil_number),
    [],
  );

  const isRoleDisabled = useCallback(
    (userDetails: StoredUserDetails) =>
      isFeatureVisible(InvitationsFeatures.require_user_details) &&
      !userDetails,
    [],
  );

  // Visible fields for each page without lossing indexes
  const visibleFields = useMemo(() => {
    const end = page * pageSize;
    const start = (page - 1) * pageSize;

    return fields.map((field, i) => (i >= start && i < end ? field : null));
  }, [fields, page, pageSize]);

  return (
    <div className="mb-3">
      <div id="emails-list-group">
        {fields.length > 0 && (
          <Form.Group>
            <table className="table px-0 gy-2 mb-0">
              <thead>
                <tr className="fs-6 fw-bold">
                  <td className="w-250px">{translate('Email')}</td>
                  {!isFeatureVisible(
                    InvitationsFeatures.conceal_civil_number,
                  ) && (
                    <td className="id-column">
                      {ENV.plugins.WALDUR_CORE.INVITATION_CIVIL_NUMBER_LABEL ||
                        translate('Civil number')}
                    </td>
                  )}
                  {isFeatureVisible(InvitationsFeatures.show_tax_number) && (
                    <td className="tax-column">
                      {ENV.plugins.WALDUR_CORE.INVITATION_TAX_NUMBER_LABEL ||
                        translate('Tax number')}
                      <Tip
                        label={translate(
                          'Must start with a country prefix ie EE34501234215',
                        )}
                        id="taxTooltip"
                      >
                        {' '}
                        <Question />
                      </Tip>
                    </td>
                  )}
                  <td className="role-column">{translate('Role')}</td>
                  <td className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {visibleFields.map((user, i) => {
                  if (!user) return null;
                  const userDetails = getUserDetails(fields.get(i));
                  return (
                    <Fragment key={user}>
                      <tr className="fs-6">
                        <td>
                          <Field
                            name={`${user}.email`}
                            placeholder={translate('Enter email address')}
                            required={true}
                            component={EmailField}
                            validate={[required, email]}
                          />
                        </td>
                        {isFeatureVisible(
                          InvitationsFeatures.conceal_civil_number,
                        ) ? null : (
                          <td>
                            <Field
                              name={`${user}.civil_number`}
                              placeholder={translate('e.g. 123456789')}
                              component={InputField}
                              className={null}
                              disabled={disabled}
                              validate={
                                isFeatureVisible(
                                  InvitationsFeatures.civil_number_required,
                                )
                                  ? required
                                  : undefined
                              }
                            />
                          </td>
                        )}
                        {isFeatureVisible(
                          InvitationsFeatures.show_tax_number,
                        ) && (
                          <td>
                            <Field
                              name={`${user}.tax_number`}
                              placeholder={translate('e.g. 123456789')}
                              component={InputField}
                              className={null}
                              disabled={disabled}
                              validate={
                                isFeatureVisible(
                                  InvitationsFeatures.tax_number_required,
                                )
                                  ? required
                                  : undefined
                              }
                            />
                            {isFeatureVisible(
                              InvitationsFeatures.require_user_details,
                            ) && (
                              <LoadUserDetailsButton
                                loading={disabled}
                                onClick={() => fetchUserDetails(fields.get(i))}
                              />
                            )}
                          </td>
                        )}
                        <td className="role-column">
                          <RoleAndProjectSelectField
                            name={`${user}.role_project`}
                            roles={roles}
                            customer={customer}
                            currentProject={project}
                            disabled={isRoleDisabled(userDetails)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="active-light-danger"
                            className="btn-icon btn-icon-danger"
                            onClick={() => removeRow(i)}
                            disabled={fields.length === 1}
                          >
                            <span className="svg-icon svg-icon-1x">
                              <Trash weight="bold" />
                            </span>
                          </Button>
                        </td>
                      </tr>
                      {userDetails && (
                        <tr>
                          <td colSpan={10}>
                            <UserDetailsGroup
                              userDetails={userDetails.details}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </Form.Group>
        )}
        <div>
          <Button
            variant="active-light-primary"
            className="btn-icon-primary btn-text-primary"
            disabled={warn}
            onClick={addRow}
          >
            <div className="svg-icon svg-icon-2">
              <Plus />
            </div>
            {fields.length > 0
              ? translate('Add another user')
              : translate('Add user')}
          </Button>
          {warn && (
            <span className="text-danger ms-2">
              {translate('Too many empty fields')}
            </span>
          )}
        </div>
      </div>

      <TablePagination
        currentPage={page}
        pageSize={pageSize}
        resultCount={fields.length}
        hasRows={fields.length > MIN_PAGE_SIZE}
        showPageSizeSelector
        updatePageSize={changePageSize}
        gotoPage={setPage}
      />
    </div>
  );
};
