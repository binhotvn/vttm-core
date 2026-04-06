'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = usePathname().split('/')[1];
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const s = await apiFetch(`/shipments/${params.id}`, { token: token! });
        setShipment(s);
        // Load tracking events via public API
        if (s.trackingNumber) {
          const tracking = await apiFetch(`/tracking/${s.trackingNumber}?lang=${locale}`);
          setEvents(tracking.events || []);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, [params.id]);

  if (!shipment) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-blue-600 text-sm mb-4 hover:underline">← Back</button>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold font-mono">{shipment.trackingNumber}</h1>
        <StatusBadge status={shipment.status} locale={locale} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Info cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-sm text-gray-500 mb-2">Sender</h3>
          <p className="font-medium">{shipment.senderAddress?.contactName}</p>
          <p className="text-sm text-gray-500">{shipment.senderAddress?.phone}</p>
          <p className="text-sm text-gray-500">{shipment.senderAddress?.provinceName}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-sm text-gray-500 mb-2">Recipient</h3>
          <p className="font-medium">{shipment.recipientAddress?.contactName}</p>
          <p className="text-sm text-gray-500">{shipment.recipientAddress?.phone}</p>
          <p className="text-sm text-gray-500">{shipment.recipientAddress?.provinceName}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-sm text-gray-500 mb-2">Details</h3>
          <div className="space-y-1 text-sm">
            <p>Weight: {shipment.weightKg}kg</p>
            <p>Service: {shipment.serviceType}</p>
            <p>COD: {Number(shipment.codAmount).toLocaleString('vi-VN')}₫</p>
            <p>Shipping: {Number(shipment.shippingCost).toLocaleString('vi-VN')}₫</p>
            <p>Attempts: {shipment.deliveryAttempts}/{shipment.maxDeliveryAttempts}</p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="font-semibold mb-4">Tracking Timeline</h3>
        <div className="space-y-0">
          {events.map((event: any, idx: number) => (
            <div key={idx} className="flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                {idx < events.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-medium">{event.title}</p>
                {event.location && <p className="text-xs text-gray-500">{event.location}</p>}
                <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-400 text-sm">No tracking events yet</p>}
        </div>
      </div>
    </div>
  );
}
