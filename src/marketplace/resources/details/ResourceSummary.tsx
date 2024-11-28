import { FunctionComponent, PropsWithChildren, useMemo } from 'react';
import { Container } from 'react-bootstrap';

import { Field } from '@waldur/resource/summary';

import { Resource } from '../types';

import { getResourceSummaryFields } from './utils';

interface ResourceSummaryProps {
  resource: Resource;
  scope: { error_message?; error_traceback? };
}

export const ResourceSummary: FunctionComponent<
  PropsWithChildren<ResourceSummaryProps>
> = ({ resource, scope, children }) => {
  const fields = useMemo(
    () =>
      getResourceSummaryFields({
        resource,
        scope,
        exclude: ['name', 'status'],
      }),
    [resource],
  );

  return (
    <Container className="container-metadata">
      {fields.map((field) =>
        field.custom ? (
          field.custom
        ) : (
          <Field
            key={field.name}
            label={field.label}
            value={field.value}
            valueClass={field.valueClass}
            helpText={field.helpText}
          />
        ),
      )}
      {children}
    </Container>
  );
};
