import { useQuery } from '@tanstack/react-query';
import Axios from 'axios';
import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';

import { LoadingSpinner } from './core/LoadingSpinner';
import { translate } from './i18n';

export const USER_AGREEMENT_TYPES = {
  privacy_policy: 'PP',
  terms_of_service: 'TOS',
};

interface TemplateComponentProps {
  agreement_type: string;
  title: string;
}

async function getUserAgreement(agreement_type) {
  const response = await Axios.get(`${ENV.apiEndpoint}api/user-agreements/`, {
    params: { agreement_type: agreement_type },
  });
  return response.data[0];
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
      <div className="mb-6 card">
        <div className="card-body">
          <Markdown>{option.content}</Markdown>
        </div>
      </div>
    </div>
  );
};
