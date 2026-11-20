import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FormbricksConnectionTest,
  PatchedFormbricksConnectionRequest,
  formbricksConnectionPartialUpdate,
  formbricksConnectionRetrieve,
  formbricksConnectionTest,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton, CopyButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  BooleanEditField,
  EditFieldProvider,
  SecretEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { isStaff } from '@/workspace/selectors';

export const FORMBRICKS_CONNECTION_QUERY_KEY = ['FormbricksConnection'];

const STAFF_ONLY = translate(
  'Only staff can change the Formbricks connection.',
);

const secretState = (isSet: boolean) =>
  isSet ? (
    <Badge variant="success" shape="pill">
      {translate('Set')}
    </Badge>
  ) : (
    <Badge variant="neutral" shape="pill">
      {translate('Not set')}
    </Badge>
  );

/**
 * How Waldur reaches the site's Formbricks instance, and how Formbricks
 * reaches back.
 *
 * The API key and the webhook secret are never sent back by the API, only
 * whether each is set, so their rows show that and take a new value. The
 * connection can only be enabled once both URLs and both secrets are in
 * place; applicants see nothing of form flows until it is.
 */
export const FormbricksConnectionCard = () => {
  const canEdit = useSelector(isStaff);
  const queryClient = useQueryClient();
  const { showErrorResponse } = useNotify();
  const [testResult, setTestResult] = useState<FormbricksConnectionTest>();
  const [testing, setTesting] = useState(false);

  const {
    data: connection,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FORMBRICKS_CONNECTION_QUERY_KEY,
    queryFn: () =>
      formbricksConnectionRetrieve().then((response) => response.data),
  });

  const { mutateAsync: update } = useManagedMutation({
    mutationFn: (body: PatchedFormbricksConnectionRequest) =>
      formbricksConnectionPartialUpdate({ body }),
    successMessage: translate('The Formbricks connection has been updated.'),
    errorMessage: translate('Unable to update the Formbricks connection.'),
    onSuccess: async () => {
      setTestResult(undefined);
      await queryClient.invalidateQueries({
        queryKey: FORMBRICKS_CONNECTION_QUERY_KEY,
      });
    },
    closeModal: false,
  });

  const runTest = async () => {
    setTesting(true);
    try {
      const { data } = await formbricksConnectionTest();
      setTestResult(data);
    } catch (e) {
      showErrorResponse(e, translate('Unable to test the connection.'));
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !connection) {
    return (
      <LoadingErred
        message={translate('Unable to load the Formbricks connection.')}
        loadData={refetch}
      />
    );
  }

  const enableBlocked = !connection.enabled && !connection.is_configured;

  return (
    <FormTable.Card
      title={translate('Formbricks connection')}
      className="card-bordered mb-5"
      actions={
        <BaseButton
          variant="tertiary"
          onClick={runTest}
          pending={testing}
          disabled={!connection.is_configured}
          disabledReason={translate(
            'Set both URLs, the API key and the webhook secret first.',
          )}
          label={translate('Test connection')}
        />
      }
    >
      {testResult && (
        <AlertItem
          className="mb-5"
          variant={testResult.ok ? 'success' : 'error'}
          title={
            testResult.ok
              ? translate('Formbricks answered')
              : translate('The connection failed')
          }
          body={testResult.detail}
        />
      )}
      <EditFieldProvider
        scope={connection}
        callback={update}
        readOnlyReason={canEdit ? undefined : STAFF_ONLY}
      >
        <FormTable>
          <BooleanEditField
            name="enabled"
            label={translate('Enabled')}
            description={translate(
              'Calls can take applications through form flows only while this is on.',
            )}
            disabled={!canEdit || enableBlocked}
            tooltip={
              canEdit && enableBlocked
                ? translate(
                    'Set both URLs, the API key and the webhook secret before enabling.',
                  )
                : undefined
            }
          />
          <StringEditField
            name="base_url"
            label={translate('Public URL')}
            description={translate(
              "Formbricks' address as applicants' browsers reach it; survey links are built on it.",
            )}
            disabled={!canEdit}
          />
          <StringEditField
            name="management_api_url"
            label={translate('Management API URL')}
            description={translate(
              'Where Waldur calls the Formbricks management API, which can be an internal address.',
            )}
            disabled={!canEdit}
          />
          <SecretEditField
            name="api_key"
            label={translate('API key')}
            description={translate(
              'A Formbricks API key with write access to the environment holding the surveys: Waldur sets up their hidden fields and endings. It is never shown again once saved.',
            )}
            disabled={!canEdit}
            renderValue={() => secretState(connection.api_key_set)}
          />
          <SecretEditField
            name="webhook_secret"
            label={translate('Webhook secret')}
            description={translate(
              'The signing secret of the Formbricks webhook below. It is never shown again once saved.',
            )}
            disabled={!canEdit}
            renderValue={() => secretState(connection.webhook_secret_set)}
          />
          <FormTable.Item
            label={translate('Webhook URL')}
            description={translate(
              'Add a webhook in Formbricks with this URL, triggered on "Response finished" and "Response updated".',
            )}
            value={<code className="text-break">{connection.webhook_url}</code>}
            actions={
              <CopyButton
                value={connection.webhook_url}
                label={translate('Copy')}
                copiedLabel={translate('Copied')}
              />
            }
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
