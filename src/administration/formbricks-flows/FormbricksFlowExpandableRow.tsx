import { FC } from 'react';
import { FormbricksFlow, FormbricksFlowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const FormbricksFlowExpandableRow: FC<{ row: FormbricksFlow }> = ({
  row,
}) => {
  const tableProps = useTable<FormbricksFlowStep>({
    table: `FormbricksFlowSteps-${row.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: row.steps, resultCount: row.steps.length }),
  });

  return (
    <ExpandableContainer>
      <Table<FormbricksFlowStep>
        {...tableProps}
        columns={[
          {
            title: translate('Step key'),
            render: ({ row: step }) => <>{step.key}</>,
          },
          {
            title: translate('Survey ID'),
            render: ({ row: step }) => <code>{step.survey_id}</code>,
          },
          {
            title: translate('Mapper'),
            render: ({ row: step }) => renderFieldOrDash(step.mapper),
          },
          {
            title: translate('Visible to reviewers'),
            render: ({ row: step }) =>
              step.is_reviewer_visible ? translate('Yes') : translate('No'),
          },
          {
            title: translate('Resources'),
            render: ({ row: step }) =>
              renderFieldOrDash(
                step.resource_options
                  ?.map(
                    (option) =>
                      `${option.choice_label} → ${option.offering_name}`,
                  )
                  .join(', '),
              ),
          },
        ]}
        verboseName={translate('steps')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
      />
    </ExpandableContainer>
  );
};
