import { ArrowsClockwise } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { Category } from '@waldur/marketplace/types';
import { Table, createFetcher, useTable } from '@waldur/table';

import { CategoryCreateButton } from './CategoryCreateButton';
import { CategoryRowActions } from './CategoryRowActions';

const categoryFields = {
  fields: ['uuid', 'title', 'description', 'icon', 'offering_count', 'group'],
};

export const AdminCategoriesPage: FunctionComponent = () => {
  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch,
  } = useQuery(['MarketplaceCategoryGroups'], () => getCategoryGroups(), {
    staleTime: 30 * 1000,
  });

  const tableProps = useTable({
    table: 'CategoriesList',
    fetchData: createFetcher('marketplace-categories'),
    queryField: 'title',
    filter: categoryFields,
  });

  return (
    <Table<Category>
      {...tableProps}
      columns={[
        {
          title: translate('Title'),
          render: ({ row }) => (
            <>
              <div className="d-inline-block align-middle me-2">
                {row.icon ? (
                  <Image src={row.icon} size={30} isContain />
                ) : (
                  <ImagePlaceholder width="30px" height="30px" />
                )}
              </div>
              <CategoryLink item={row}>{row.title}</CategoryLink>
            </>
          ),
        },
        {
          title: translate('Group'),
          render: ({ row }) => {
            if (row.group) {
              if (loadingGroups) {
                return (
                  <span className="svg-icon svg-icon-4 animation-spin me-2">
                    <ArrowsClockwise />
                  </span>
                );
              } else if (errorGroups) {
                return (
                  <>
                    <span className="text-danger">
                      {translate('Error in fetching groups')}
                    </span>
                    <Button
                      variant="flush"
                      size="sm"
                      className="btn-icon ms-1"
                      onClick={() => refetch()}
                    >
                      <span className="svg-icon svg-icon-4 me-2">
                        <ArrowsClockwise />
                      </span>
                    </Button>
                  </>
                );
              }
              const group = categoryGroups.find((g) => g.url === row.group);
              return group ? (
                <Link
                  state="public.marketplace-category-group"
                  params={{ group_uuid: group.uuid }}
                >
                  {group.title}
                </Link>
              ) : (
                <span className="text-warning fw-bold">
                  {translate('Unknown group')}
                </span>
              );
            } else {
              return <i>{translate('No group')}</i>;
            }
          },
        },
        {
          title: translate('Offerings count'),
          render: ({ row }) => <>{row.offering_count}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{truncate(row.description, 60)}</>,
        },
      ]}
      verboseName={translate('Categories')}
      initialSorting={{ field: 'title', mode: 'desc' }}
      rowActions={({ row }) => (
        <CategoryRowActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      tableActions={<CategoryCreateButton refetch={tableProps.fetch} />}
    />
  );
};
