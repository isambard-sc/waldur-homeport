import { FunctionComponent } from 'react';
import { NestedSection } from 'waldur-js-client';

import { AttributeRow } from './AttributeRow';

interface AttributeSectionProps {
  section: NestedSection;
  attributes: any;
  hideHeader: boolean;
}

export const AttributeSection: FunctionComponent<AttributeSectionProps> = (
  props,
) => (
  <>
    {!props.hideHeader && (
      <tr className="gray-bg">
        <th>{props.section.title}</th>
        <th />
      </tr>
    )}
    {props.section.attributes.map((attr, index) => (
      <AttributeRow
        key={index}
        value={props.attributes[attr.key] || 'N/A'}
        attribute={attr}
      />
    ))}
  </>
);
