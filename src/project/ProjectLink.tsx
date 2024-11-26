import { Factory } from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';

export const ProjectLink = ({ row, onClick = undefined }) => (
  <div>
    <Link
      state="project.dashboard"
      params={{ uuid: row.uuid }}
      label={row.name}
      onClick={onClick}
    />
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      row.is_industry && (
        <span className="svg-icon svg-icon-4 ms-3">
          <Factory />
        </span>
      )}
  </div>
);
