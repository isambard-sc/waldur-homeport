import { FC, PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
    uuid: string;
    className?: string;
    onClick?(): void;
    asButton?: boolean;
}

export const ProjectTemplateLink: FC<PropsWithChildren<OwnProps>> = ({
    uuid,
    onClick,
    className,
    asButton,
    children,
}) => {
    return (
        <Link
            params={{ uuid }}
            onClick={onClick}
            className={className}
        >
            {children}
        </Link>
    );
};
