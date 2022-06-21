import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace-checklist/api';

import { CategoryUserCard } from './CategoryUserCard';

export const CategoryUserList = () => {
  const { loading, value: categories, error } = useAsync(getCategories, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">{translate('Unable to load categories.')}</h3>
    );
  }

  return (
    <Row>
      {categories.map((category, index) =>
        category.checklists_count !== 0 ? (
          <Col key={index} md={2} sm={6}>
            <CategoryUserCard category={category} />
          </Col>
        ) : null,
      )}
    </Row>
  );
};
