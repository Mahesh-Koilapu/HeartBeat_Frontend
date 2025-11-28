import { useCallback, useEffect, useState } from 'react';
import client from '../api/client';

const useFetch = (url, { immediate = true, params, method = 'get', body } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (override = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await client.request({
          url,
          method: override.method || method,
          params: override.params || params,
          data: override.body || body,
        });
        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method, params, body]
  );

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
};

export default useFetch;
