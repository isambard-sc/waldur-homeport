import { CaretRight } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { FeaturesEnum, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

import './ReportingWidgets.scss';

interface ReportingWidget {
  title: string;
  description?: string;
  data?: Array<{
    label: string;
    value: number | string;
    type: 'Number' | 'String' | 'Date';
  }>;
  to: { state; params? };
  feature?: FeaturesEnum;
}

const generateWidgetsData = (): ReportingWidget[] => [
  {
    title: translate('Capacity'),
    description: translate('Shows available capacity of offering plans.'),
    to: { state: 'marketplace-support-plan-usages' },
  },
  {
    title: translate('Growth'),
    description: translate(
      'Shows change in aggregated monthly revenues over time.',
    ),
    to: { state: 'invoicesGrowth' },
  },
  {
    title: translate('Monthly revenue'),
    description: translate('Shows monthly revenue split by organization.'),
    to: { state: 'reporting.organizations' },
  },
  {
    title: translate('Organization quotas'),
    description: translate('Shows quotas aggregated by organization.'),
    to: { state: 'reporting.quotas' },
  },
  {
    title: translate('Pricelist'),
    description: translate(
      'Shows a common pricelist for all offerings in the marketplace.',
    ),
    to: { state: 'reporting.pricelist' },
    feature: SupportFeatures.pricelist,
  },
  {
    title: translate('Usage reports'),
    description: translate(
      'Shows usage of resources reported by service providers by month.',
    ),
    to: { state: 'marketplace-support-usage-reports' },
  },
];

const WidgetItem = ({ item }: { item: ReportingWidget }) => (
  <Card
    as={Link}
    state={item.to.state}
    params={item.to.params}
    className="reporting-widget-card bg-light min-h-100px h-125px h-sm-100px h-md-125px h-xl-150px h-xxl-125px border border-secondary border-hover"
  >
    <Card.Body className="pe-5">
      <div className="d-flex align-items-center h-100">
        <div className="d-flex flex-column justify-content-between h-100 flex-grow-1">
          <div>
            <h1 className="fs-2 text-nowrap fw-boldest">{item.title}</h1>
            {item.description && (
              <p className="fs-6 text-dark mb-0">{item.description}</p>
            )}
          </div>
          {item.data?.length && (
            <div className="text-dark fw-bold">
              {item.data.map((info, i) => (
                <p
                  key={i}
                  className={
                    'fs-6' + (i === item.data.length - 1 ? ' mb-0' : ' mb-2')
                  }
                >
                  {info.label}: {info.value}
                </p>
              ))}
            </div>
          )}
        </div>
        <div>
          <CaretRight className="icon-arrow display-5 fw-light text-dark" />
        </div>
      </div>
    </Card.Body>
  </Card>
);

export const ReportingWidgets = () => {
  const widgets = useMemo(() => generateWidgetsData(), []);

  const filteredWidgets = widgets.filter((item) => {
    return (item.feature && isFeatureVisible(item.feature)) || !item.feature;
  });

  return (
    <Row>
      {filteredWidgets.map((item, i) => (
        <Col key={i} xs={12} md={6} xl={4} className="mb-6">
          <WidgetItem item={item} />
        </Col>
      ))}
    </Row>
  );
};
