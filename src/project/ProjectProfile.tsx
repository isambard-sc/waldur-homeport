import {
  CircleIcon,
  FactoryIcon,
  GlobeSimpleIcon,
  GraduationCapIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { openportalManagedProjectsList, Project, proposalProposalsList } from 'waldur-js-client';

import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

import { Badge } from '@waldur/core/Badge';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

interface ProjectProfileProps {
  project: Project;
}

const HeroTitle = ({ project }: ProjectProfileProps) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  return (
    <div>
      <h3 className="mb-1">
        {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
          project.is_industry && (
            <span className="svg-icon svg-icon-3 me-3">
              <FactoryIcon />
            </span>
          )}
        {project.name}
        {project.kind === 'course' ? (
          <Badge variant="warning" pill outline className="ms-2">
            {translate('Course')}
          </Badge>
        ) : project.kind === 'public' ? (
          <Badge variant="blue" pill outline className="ms-2">
            {translate('Public')}
          </Badge>
        ) : null}
      </h3>

      {isOwnerOrStaff ? (
        <Link
          state="organization.dashboard"
          params={{ uuid: project.customer_uuid }}
          label={project.customer_name}
        />
      ) : (
        <i>{project.customer_name}</i>
      )}
    </div>
  );
};

const ProjectKindCard = ({ project }: ProjectProfileProps) => {
  return (
    <div className="d-flex gap-7 ms-n2">
      <div className="border rounded w-40px h-40px d-flex flex-center flex-shrink-0">
        <span className="svg-icon svg-icon-2 svg-icon-gray-600">
          {project.kind === 'course' ? (
            <GraduationCapIcon weight="bold" />
          ) : project.kind === 'public' ? (
            <GlobeSimpleIcon weight="bold" />
          ) : (
            <CircleIcon weight="bold" />
          )}
        </span>
      </div>
      <div>
        <h6 className="fw-bold">
          {project.kind === 'course'
            ? translate('This is project course type')
            : project.kind === 'public'
              ? translate('This is project public type')
              : 'N/A'}
        </h6>
        <p className="fs-6 text-muted">
          {project.kind === 'course'
            ? translate(
                'This course project enables creation of short-lived course accounts.',
              )
            : project.kind === 'public'
              ? translate(
                  'Public projects are visible to anonymous users and allow membership applications.',
                )
              : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export const ProjectProfile = ({ project }: ProjectProfileProps) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  // Fetch proposals linked to this project
  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['project-proposals', project.uuid],
    queryFn: async () => {
      const response = await proposalProposalsList({
        query: {
          project_uuid: project.uuid,
          page_size: 100,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: awardDetails } = useQuery({
    queryKey: ['project-managed', project.uuid],
    queryFn: async () => {
      const { data } = await openportalManagedProjectsList({
        query: {
          project_uuid: project.uuid,
          state: ['approved', 'pending', 'rejected'],
          page_size: 1,
        },
      });
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0].details as AwardDetails;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(project.uuid),
  });

  return (
    <PublicDashboardHero
      hideQuickSection={project.kind === 'default'}
      logo={project.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      title={<HeroTitle project={project} />}
      quickBody={
        ['public', 'course'].includes(project.kind) && (
          <ProjectKindCard project={project} />
        )
      }
    >
      <Stack direction="horizontal" className="gap-6 mb-1">
        <span className="fw-semibold text-dark">
          ID: {project.slug}
          <CopyToClipboardButton
            value={project.slug}
            onlyButton
            size={16}
            buttonClassName="ms-2"
          />
        </span>
        {project.oecd_fos_2007_code && (
          <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
        )}
        {project.type && <span>{project.type}</span>}
        {project.start_date && (
          <span>
            {translate('Start date:')} {formatDate(project.start_date)}
          </span>
        )}
        {project.end_date && (
          <span>
            {translate('End date:')} {formatDate(project.end_date)}
          </span>
        )}
      </Stack>
      {awardDetails && (awardDetails.award || awardDetails.call) && (
        <Stack direction="horizontal" className="gap-6 mt-2">
          {awardDetails.award && (
            <>
              <span className="fw-semibold text-dark">{translate('Award:')}</span>
              {awardDetails.award.url ? (
                <a href={awardDetails.award.url} target="_blank" rel="noopener noreferrer">
                  {awardDetails.award.id || awardDetails.award.url}
                </a>
              ) : (
                <span>{awardDetails.award.id}</span>
              )}
            </>
          )}
          {awardDetails.call && (awardDetails.call.id || awardDetails.call.url) && (
            <>
              <span className="fw-semibold text-dark">{translate('Call:')}</span>
              {awardDetails.call.url ? (
                <a href={awardDetails.call.url} target="_blank" rel="noopener noreferrer">
                  {awardDetails.call.id || awardDetails.call.url}
                </a>
              ) : (
                <span>{awardDetails.call.id}</span>
              )}
            </>
          )}
        </Stack>
      )}
      {awardDetails?.renewal?.url && (
        <Stack direction="horizontal" className="gap-3 mt-1">
          <a href={awardDetails.renewal.url} target="_blank" rel="noopener noreferrer">
            {translate('Apply for a renewal')} &rarr;
          </a>
        </Stack>
      )}
      {!isLoadingProposals && proposals && proposals.length > 0 && (
        <Stack direction="horizontal" className="gap-3 mt-2">
          <span className="fw-semibold text-dark">
            {proposals.length === 1
              ? translate('Proposal')
              : translate('Proposals')}
            :
          </span>
          {proposals.map((proposal, index) => (
            <span key={proposal.uuid}>
              <Link
                state="call-management.proposal-details"
                params={{
                  proposal_uuid: proposal.uuid,
                  uuid: project.customer_uuid,
                }}
                label={proposal.slug}
              />
              {index < proposals.length - 1 && ', '}
            </span>
          ))}
        </Stack>
      )}
    </PublicDashboardHero>
  );
};
