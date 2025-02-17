import { Question } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { ResourceUsageChart } from '@waldur/marketplace/resources/usage/ResourceUsageChart';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ResourceUsageTable } from './ResourceUsageTable';
import { ComponentUsage, ComponentUserUsage } from './types';
import { getBillingTypeLabel } from './utils';

interface ResourceUsageTabsProps {
  resource?: { name };
  components: OfferingComponent[];
  usages: ComponentUsage[];
  userUsages?: ComponentUserUsage[];
  months?: number;
  colors: string[];
  displayMode?: 'chart' | 'table';
  hasExport?: boolean;
}

export const ResourceUsageTabs: FunctionComponent<ResourceUsageTabsProps> = (
  props,
) => (
  <div className="tabs-container">
    <Tabs
      defaultActiveKey="tab-0"
      id="resource-usage-component-tabs"
      unmountOnExit
      mountOnEnter
    >
      {props.components.map((component, index: number) => (
        <Tab
          title={
            <>
              <Tip
                id={`tab-${index}-tooltip`}
                label={getBillingTypeLabel(component.billing_type)}
              >
                <Question />
              </Tip>{' '}
              {component.name}
            </>
          }
          key={index}
          eventKey={`tab-${index}`}
        >
          {props.displayMode === 'table' ? (
            <ResourceUsageTable
              offeringComponent={component}
              usages={props.usages}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResourceUsageChart
                resource={props.resource}
                offeringComponent={component}
                usages={props.usages}
                userUsages={props.userUsages}
                months={props.months}
                chartColor={props.colors[index]}
                hasExport={props.hasExport}
              />
            </div>
          )}
        </Tab>
      ))}
    </Tabs>
  </div>
);
