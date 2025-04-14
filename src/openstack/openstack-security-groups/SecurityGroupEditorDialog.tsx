import { FC } from 'react';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { RulesForm } from './rule-editor/RulesForm';
import { useRulesEditor } from './rule-editor/utils';

interface SecurityGroupEditorDialogProps {
  resolve: {
    resource: OpenStackSecurityGroup;
  };
}

export const SecurityGroupEditorDialog: FC<SecurityGroupEditorDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useRulesEditor(resource);
  // @ts-ignore
  return <RulesForm {...formState} />;
};
