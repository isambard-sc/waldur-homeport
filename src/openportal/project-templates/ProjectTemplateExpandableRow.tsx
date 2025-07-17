import { FC } from 'react';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ProjectTemplate } from '../types';

interface OwnProps {
    row: ProjectTemplate;
}

const stringify = (value: any) => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return JSON.stringify(value);
}

const stringify_customer = (customer: any) => {
    if (!customer) {
        return 'Not set';
    }
    // customer.url is the URL. Render it as a link, using customer.name as the display text.
    const url = `/organizations/${customer.uuid}/dashboard/`;
    return <a key={customer.uuid} href={url} target="_blank" rel="noopener noreferrer">{customer.display_name}</a>;
}

const stringify_offerings = (offerings: any[]) => {
    if (!offerings || offerings.length === 0) {
        return 'No offerings';
    }

    // offerings.url is the URL. Render these as links, using offering.name
    // as the display text.
    // URL is /providers/{offering.customer_uuid}/marketplace-provider-offering-details/{offering.uuid}/
    const urlfunc = (offering) => `/providers/${offering.customer_uuid}/marketplace-provider-offering-details/${offering.uuid}/`;

    return offerings.map((offering) => (
        <a key={offering.url} href={urlfunc(offering)} target="_blank" rel="noopener noreferrer">
            {offering.name}
        </a>
    )).reduce((prev, curr) => [prev, ', ', curr]);
}

export const ProjectTemplateExpandableRow: FC<OwnProps> = (props) => {
    const project = props.row;

    if (!project) {
        return null;
    }

    return (
        <ExpandableContainer>
            <div className="overflow-auto" unmountOnExit={true}>
                <div>
                    <strong>Name:</strong> {stringify(project.name)}
                </div>
                <div>
                    <strong>Portal:</strong> {stringify(project.portal)}
                </div>
                <div>
                    <strong>Customer:</strong> {stringify_customer(project.customer_data)}
                </div>
                <div>
                    <strong>Shortname:</strong> {stringify(project.shortname)}
                </div>
                <div>
                    <strong>Offerings:</strong> {stringify_offerings(project.offerings_data)}
                </div>
                <div>
                    <strong>Approval limit:</strong> {stringify(project.approval_limit)}
                </div>
                <div>
                    <strong>Max credit limit:</strong> {stringify(project.max_credit_limit)}
                </div>
                <div>
                    <strong>Role mapping:</strong> {stringify(project.role_mapping)}
                </div>
            </div>
        </ExpandableContainer>
    );
}
