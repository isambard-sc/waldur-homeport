import { FunctionComponent, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { broadcastMessagesRecipientsRetrieve } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { processApiResponse, createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Fetcher } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

// Custom fetcher with logging
const createLoggingFetcher = (): Fetcher => {
  return async (request) => {
    console.log('Fetching recipients with request:', request);
    const mergedQueryParams = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    console.log('API query parameters:', mergedQueryParams);

    const result = await broadcastMessagesRecipientsRetrieve({
      query: mergedQueryParams,
    });

    console.log('API raw response:', result);
    console.log('API response data:', result.data);
    console.log('API response status:', result.response.status);

    const processedResponse = processApiResponse(result);
    console.log('Processed response:', processedResponse);

    return processedResponse;
  };
};

export const RecipientsList: FunctionComponent<{
  query;
  onRemoveRecipient?: (email: string) => void;
  onAddRecipient?: () => void;
  onRestoreRecipient?: (email: string) => void;
}> = ({ query, onRemoveRecipient, onAddRecipient, onRestoreRecipient }) => {
  const filter = useMemo(
    () => {
      const filterObj = {
        all_users: query?.all_users,
        customers: query?.customers?.map((c) => c.uuid),
        offerings: query?.offerings?.map((c) => c.uuid),
        round: query?.round?.uuid,
        proposal_states: query?.proposal_states,
        include_reviewers: query?.include_reviewers,
        send_to_me: query?.send_to_me,
        additional_recipients: query?.additional_recipients?.map((u) => u.email),
        excluded_recipients: query?.excluded_recipients,
      };
      return filterObj;
    },
    [query],
  );
  const props = useTable({
    table: 'broadcast-recipients',
    fetchData: createFetcher(broadcastMessagesRecipientsRetrieve),
    filter,
  });

  const columns = [
    {
      title: translate('Recipient'),
      render: ({ row }) => <>{row.full_name}</>,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email}</>,
    },
  ];

  if (onRemoveRecipient) {
    columns.push({
      title: translate('Action'),
      render: ({ row }) => (
        <div
          onClick={() => {
            onRemoveRecipient(row.email);
          }}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          {translate('Exclude')}
        </div>
      ),
    });
  }

  return (
    <>
      {onAddRecipient && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAddRecipient}>
            <i className="fa fa-plus me-2" />
            {translate('Add recipient')}
          </Button>
        </div>
      )}
      <Table
        {...props}
        hasActionBar={false}
        columns={columns}
        verboseName={translate('recipients')}
      />
      {onRestoreRecipient && query?.excluded_recipients?.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-3">{translate('Excluded recipients')}</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>{translate('Email')}</th>
                  <th>{translate('Action')}</th>
                </tr>
              </thead>
              <tbody>
                {query.excluded_recipients.map((email) => (
                  <tr key={email}>
                    <td>{email}</td>
                    <td>
                      <div
                        onClick={() => {
                          onRestoreRecipient(email);
                        }}
                        style={{ cursor: 'pointer', color: '#007bff' }}
                      >
                        {translate('Include')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
