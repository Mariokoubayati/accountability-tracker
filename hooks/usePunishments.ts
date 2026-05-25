import { useState, useEffect, useCallback } from 'react';
import { PunishmentRecord } from '../types';
import { fetchUnacknowledgedPunishments, acknowledgePunishment } from '../lib/punishments';
import { cachePunishments, getCachedPunishments } from '../lib/storage';

type UsePunishmentsReturn = {
  unacknowledged: PunishmentRecord[];
  loading: boolean;
  acknowledge: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export function usePunishments(userId: string | undefined): UsePunishmentsReturn {
  const [unacknowledged, setUnacknowledged] = useState<PunishmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPunishments = useCallback(async () => {
    if (!userId) {
      setUnacknowledged([]);
      setLoading(false);
      return;
    }
    try {
      const records = await fetchUnacknowledgedPunishments(userId);
      setUnacknowledged(records);
      await cachePunishments(records);
    } catch {
      const cached = await getCachedPunishments();
      setUnacknowledged(cached.filter((r) => !r.acknowledged));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPunishments();
  }, [fetchPunishments]);

  const acknowledge = useCallback(
    async (id: string): Promise<void> => {
      await acknowledgePunishment(id);
      setUnacknowledged((prev) => prev.filter((r) => r.id !== id));
    },
    []
  );

  return {
    unacknowledged,
    loading,
    acknowledge,
    refresh: fetchPunishments,
  };
}
