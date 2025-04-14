import { ProposalBadge } from '../ProposalBadge';

export const ProposalHeader = ({ proposal, className = undefined }) => (
  <div className={className}>
    <div className="d-flex align-items-center gap-4 mb-1">
      <h1 className="mb-0 fs-1x">{proposal.name}</h1>
      <ProposalBadge state={proposal.state} />
    </div>
    <p className="fs-6 text-muted mb-0">UUID: {proposal.uuid}</p>
  </div>
);
