import { useEffect } from 'react';
import { awaitableTankDefinitions } from '../../core/awaitables/tankDefinitions';
import { generateTierListParams } from '../../core/blitzkit/generateTierListParams';
import { TierList } from '../../stores/tierList';

const tankDefinitions = await awaitableTankDefinitions;

export function URLManager() {
  const rows = TierList.use((state) => state.rows);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      if (key.startsWith('row-')) {
        const index = Number.parseInt(key.slice(4), 10);
        const values = value
          .split(',')
          .map(Number)
          .filter((id) => id in tankDefinitions.tanks);

        TierList.mutate((draft) => {
          draft.rows[index].tanks = values;
        });
      }
    });
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `?${generateTierListParams(rows)}`);
  }, [rows]);

  return null;
}
