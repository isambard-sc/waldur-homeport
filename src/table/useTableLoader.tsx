import { useState, useEffect } from 'react';

import { injectSaga, injectReducer } from '@waldur/store/store';

export function useTableLoader() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function injectDependencies() {
      const sagaModule = await import('@waldur/table/effects');
      injectSaga('table', sagaModule.default);
      const reducerModule = await import('@waldur/table/store');
      injectReducer('tables', reducerModule.reducer);
      setLoading(false);
    }
    injectDependencies();
  }, []);
  return loading;
}
