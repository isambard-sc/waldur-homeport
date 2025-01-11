import { FunctionComponent } from 'react';

import { IssueTypeOption } from './types';

export const IssueTypeRenderer: FunctionComponent<IssueTypeOption> = (
  option,
) => (
  <div>
    <div className="svg-icon d-inline">{option.iconNode}</div> {option.label}
  </div>
);
