'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function SettingsPage() {
  const t = useTranslations();
  const [org, setOrg] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const [wh] = await Promise.all([
          apiFetch('/webhooks', { token: token! }).catch(() => []),
        ]);
        setWebhooks(Array.isArray(wh) ? wh : []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('app.settings')}</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Webhooks</h3>
          {webhooks.length === 0 ? (
            <p className="text-gray-400 text-sm">No webhooks configured</p>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh: any) => (
                <div key={wh.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-mono">{wh.url}</p>
                    <p className="text-xs text-gray-500">{wh.events.join(', ')}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${wh.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
