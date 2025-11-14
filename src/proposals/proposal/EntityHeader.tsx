import { ReactNode } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

interface EntityHeaderProps {
  title: string;
  slug: string;
  badge: ReactNode;
  helpText?: string;
  className?: string;
}

export const EntityHeader = ({
  title,
  slug,
  badge,
  helpText,
  className,
}: EntityHeaderProps) => (
  <div className={className}>
    <div className="d-flex align-items-center mb-1">
      <h1 className="mb-0 fs-1x">{title}</h1>
      <div className="ms-4">{badge}</div>
    </div>
    <div className="d-flex align-items-center gap-2 mb-1">
      <span className="fs-5 fw-semibold text-dark">ID: {slug}</span>
      <CopyToClipboardButton
        value={slug}
        onlyButton
        size={20}
        buttonClassName="ms-1"
      />
    </div>
    {helpText && <p className="fs-6 text-muted mb-0">{helpText}</p>}
  </div>
);
