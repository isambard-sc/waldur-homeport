import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { destroy, initialize } from 'redux-form';

import { router } from '@waldur/router';

import { isEmpty } from './utils';

const formatParam = (param: string) => {
  const decoded = (decodeURIComponent(param) as any).replaceAll('+', ' ');
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
};

export const getQueryParams = () => {
  const search = router.urlService.search();
  let urlParams = {};
  for (const [key, value] of Object.entries(search)) {
    urlParams = {
      ...urlParams,
      [key]: Array.isArray(value)
        ? value.map((v) => formatParam(v)).filter(Boolean)
        : formatParam(value),
    };
  }
  return urlParams;
};

// Refer to https://stackoverflow.com/a/41542008
export const syncFiltersToURL = (form: any) => {
  if (!form || isEmpty(form)) {
    return;
  }
  if ('URLSearchParams' in window) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(form)) {
      if (key && value) {
        searchParams.set(key, JSON.stringify(value));
      }
      if (!value) {
        searchParams.delete(key);
      }
    }
    const newRelativePathQuery =
      window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  }
};

export const getInitialValues = (initialValues?) => {
  const queryParams = getQueryParams();
  if (isEmpty(queryParams)) {
    return initialValues;
  }
  let queryParamValues = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (key && (Array.isArray(value) ? value.length : value)) {
      queryParamValues = {
        ...queryParamValues,
        [key]: value,
      };
    }
  }
  return queryParamValues;
};

/** When switching between pages, existing filters are removed from the URL, we need to restore them. */
export const useSyncInitialFiltersToURL = (initialValues) => {
  useEffect(() => {
    syncFiltersToURL(initialValues);
  }, []);
};

export const useReinitializeFilterFromUrl = (
  form: string,
  initialValues?: any,
  initializeFn: (urlInitialValues: any) => any = (v) => v,
) => {
  const dispatch = useDispatch();
  useEffectOnce(() => {
    const values = initializeFn(getInitialValues(initialValues));
    dispatch(initialize(form, values));
  });
};

export const useDestroyFilterOnLeave = (form: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(destroy(form));
    };
  });
};
