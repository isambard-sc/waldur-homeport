import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { ScriptEditorProps } from './types';

const EditScriptDialog = lazyComponent(() =>
  import('./EditScriptDialog').then((module) => ({
    default: module.EditScriptDialog,
  })),
);

export const EditScriptButton: FunctionComponent<ScriptEditorProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditScriptDialog, {
        resolve: props,
        formId: EDIT_SCRIPT_FORM_ID,
        size: props.type !== 'language' && 'xl',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
