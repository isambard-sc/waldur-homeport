import { CheckCircle, XCircle } from '@phosphor-icons/react';
import Axios from 'axios';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const BackendHealthStatusDialog = lazyComponent(() =>
  import('./BackendHealthStatusDialog').then((module) => ({
    default: module.BackendHealthStatusDialog,
  })),
);

export const getBackendHealthStatus = async () => {
  try {
    const response = await Axios.get(`${ENV.apiEndpoint}health-check/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const isWorking = (data: Record<string, string>): boolean => {
  if (!data) return false;
  return Object.values(data).every((item) => item === 'working');
};

export const BackendHealthStatusIndicator: FC = () => {
  const dispatch = useDispatch();
  const { value } = useAsync(getBackendHealthStatus, []);

  if (!value) return null;

  return (
    <span className="me-2">
      <button
        type="button"
        className="text-btn"
        onClick={() =>
          dispatch(openModalDialog(BackendHealthStatusDialog, { size: 'lg' }))
        }
      >
        {isWorking(value) ? (
          <CheckCircle size={20} className="text-success" />
        ) : (
          <XCircle size={20} className="text-danger" />
        )}
      </button>
    </span>
  );
};
