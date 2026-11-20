import {
  CircleIcon,
  FactoryIcon,
  GlobeSimpleIcon,
  GraduationCapIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { useUser, useCustomer } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { ProjectActions } from './dashboard/ProjectActions';
import { getEndDateStatus } from './gracePeriodNotice';
import { useProjectAwardDetails } from './useProjectAwardDetails';
import { useProjectProposals } from './useProjectProposals';

/** An award or call reference: a link when it carries a URL, plain text otherwise. */
const AwardReference = ({
  label,
  link,
}: {
  label: string;
  link: { id?: string | null; url?: string | null };
}) => (
  <>
    <span className="fw-semibold text-dark">{label}</span>
    {link.url ? (
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {link.id || link.url}
      </a>
    ) : (
      <span>{link.id}</span>
    )}
  </>
);

interface ProjectProfileProps {
  project: Project;
}

const HeroTitle = ({ project }: ProjectProfileProps) => {
  const user = useUser();
  const customer = useCustomer();
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
  return (
    <div>
      <h3 className="mb-1 d-flex align-items-center flex-wrap">
        {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
          project.is_industry && (
            <span className="svg-icon svg-icon-3 me-3">
              <FactoryIcon weight="bold" />
            </span>
          )}
        <span>{project.name}</span>
        {project.kind === 'course' ? (
          <Badge
            variant="pink"
            shape="pill"
            tone="outline"
            className="ms-2 text-nowrap"
          >
            {translate('Course')}
          </Badge>
        ) : project.kind === 'public' ? (
          <Badge
            variant="blue"
            shape="pill"
            tone="outline"
            className="ms-2 text-nowrap"
          >
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

const APPROACHING_DAYS = 30;

const ProjectEndDate = ({ project }: ProjectProfileProps) => {
  const status = getEndDateStatus(project, APPROACHING_DAYS);

  let className = '';
  let suffix: string | null = null;
  if (status?.kind === 'grace') {
    className = 'text-warning fw-semibold';
    suffix =
      status.daysLeft === 0
        ? translate('(in grace period, last day)')
        : status.daysLeft === 1
          ? translate('(in grace period, 1 day left)')
          : translate('(in grace period, {n} days left)', {
              n: String(status.daysLeft),
            });
  } else if (status?.kind === 'expired') {
    className = 'text-danger fw-semibold';
    suffix =
      status.daysAgo === 0
        ? translate('(expired today)')
        : status.daysAgo === 1
          ? translate('(expired 1 day ago)')
          : translate('(expired {n} days ago)', {
              n: String(status.daysAgo),
            });
  } else if (status?.kind === 'approaching') {
    className = 'text-warning fw-semibold';
    suffix =
      status.daysLeft === 0
        ? translate('(last day)')
        : status.daysLeft === 1
          ? translate('(in 1 day)')
          : translate('(in {n} days)', { n: String(status.daysLeft) });
  }

  return (
    <span className={className || undefined}>
      {translate('End date:')} {formatDate(project.end_date)}
      {suffix && <span className="ms-1">{suffix}</span>}
    </span>
  );
};

export const ProjectProfile = ({ project }: ProjectProfileProps) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  // The OpenPortal award backing this project, giving the user a way back to
  // where it was granted.
  const { data: awardDetails } = useProjectAwardDetails(project.uuid);
  const proposals = useProjectProposals(project);

  return (
    <PublicDashboardHero
      hideQuickSection={!['public', 'course'].includes(project.kind)}
      logo={project.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      title={<HeroTitle project={project} />}
      mobileBottomActions
      quickBody={
        ['public', 'course'].includes(project.kind) && (
          <ProjectKindCard project={project} />
        )
      }
      actions={<ProjectActions project={project} />}
    >
      <Stack direction="horizontal" className="gap-6 mb-1">
        <span className="fw-semibold text-dark">
          {translate('ID')}: {project.slug}
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
        {project.end_date && <ProjectEndDate project={project} />}
      </Stack>
      {proposals.length > 0 && (
        <Stack direction="horizontal" className="gap-3 mt-2">
          <span className="fw-semibold text-dark">
            {proposals.length === 1
              ? translate('Proposal:')
              : translate('Proposals:')}
          </span>
          {proposals.map((proposal, index) => (
            <span key={proposal.uuid}>
              {/* Archived proposals go straight to the archive rather than
                  through /proposals/{uuid}, which would reach it too but only
                  after a failed live lookup. Live ones use the applicant
                  route: the call-management view this used to link to sits
                  under the managing organisation, which an award holder may
                  have no access to. */}
              <Link
                state={
                  proposal.archived
                    ? 'proposal-archive-proposal'
                    : 'proposals.manage-proposal'
                }
                params={
                  proposal.archived
                    ? { uuid: proposal.uuid }
                    : { proposal_uuid: proposal.uuid }
                }
                label={proposal.slug}
              />
              {index < proposals.length - 1 && ', '}
            </span>
          ))}
        </Stack>
      )}
      {awardDetails && (awardDetails.award || awardDetails.call) && (
        <Stack direction="horizontal" className="gap-6 mt-2">
          {awardDetails.award && (
            <AwardReference
              label={translate('Award:')}
              link={awardDetails.award}
            />
          )}
          {awardDetails.call &&
            (awardDetails.call.id || awardDetails.call.url) && (
              <AwardReference
                label={translate('Call:')}
                link={awardDetails.call}
              />
            )}
        </Stack>
      )}
      {awardDetails?.renewal?.url && (
        <Stack direction="horizontal" className="gap-3 mt-1">
          <a
            href={awardDetails.renewal.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate('Apply for a renewal')} &rarr;
          </a>
        </Stack>
      )}
    </PublicDashboardHero>
  );
};
