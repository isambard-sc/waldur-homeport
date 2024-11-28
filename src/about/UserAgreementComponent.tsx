import { useQuery } from '@tanstack/react-query';
import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '../core/LoadingSpinner';
import { translate } from '../i18n';

import { getUserAgreement } from './api';

interface TemplateComponentProps {
  agreement_type: string;
  title: string;
}

export const UserAgreementComponent: FunctionComponent<
  TemplateComponentProps
> = (props) => {
  const {
    isLoading: loading,
    error,
    data: option,
  } = useQuery(
    ['userAgreementData'],
    async () => await getUserAgreement(props.agreement_type),
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load page')}</>;
  }

  if (!option) {
    return (
      <h2>
        {props.title} {translate('is not defined.')}
      </h2>
    );
  }

  return (
    <div>
      <div className="mb-6 card card-bordered">
        <div className="card-body">
          <Markdown>{option.content}</Markdown>
        </div>
      </div>
    </div>
  );
};
