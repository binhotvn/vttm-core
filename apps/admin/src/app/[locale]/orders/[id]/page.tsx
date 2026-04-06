'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function OrderDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const data = await apiFetch(`/orders/${params.id}`, { token: token! });
        setOrder(data);
      } catch (e) { console.error(e); }
    };
    load();
  }, [params.id]);

  if (!order) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-blue-600 text-sm mb-4 hover:underline">← Back</button>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <StatusBadge status={order.status} locale={locale} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Sender</h3>
          <p className="text-sm">{order.senderAddress?.contactName}</p>
          <p className="text-sm text-gray-500">{order.senderAddress?.phone}</p>
          <p className="text-sm text-gray-500">{order.senderAddress?.streetAddress}</p>
          <p className="text-sm text-gray-500">{order.senderAddress?.districtName}, {order.senderAddress?.provinceName}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Recipient</h3>
          <p className="text-sm">{order.recipientAddress?.contactName}</p>
          <p className="text-sm text-gray-500">{order.recipientAddress?.phone}</p>
          <p className="text-sm text-gray-500">{order.recipientAddress?.streetAddress}</p>
          <p className="text-sm text-gray-500">{order.recipientAddress?.districtName}, {order.recipientAddress?.provinceName}</p>
          {order.recipientAddress?.landmark && <p className="text-sm text-blue-500 mt-1">{order.recipientAddress.landmark}</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="font-semibold mb-3">Details</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Service:</span> {order.serviceType}</div>
          <div><span className="text-gray-500">Payment:</span> {order.paymentMethod}</div>
          <div><span className="text-gray-500">COD:</span> {Number(order.codAmount).toLocaleString('vi-VN')}₫</div>
          <div><span className="text-gray-500">Total:</span> {Number(order.totalAmount).toLocaleString('vi-VN')}₫</div>
        </div>
      </div>

      {order.items?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="font-semibold mb-3">Items ({order.items.length})</h3>
          <table className="min-w-full text-sm">
            <thead><tr className="text-gray-500 text-left">
              <th className="pb-2">Description</th><th className="pb-2">Qty</th><th className="pb-2">Weight</th><th className="pb-2">Value</th>
            </tr></thead>
            <tbody>
              {order.items.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="py-2">{item.description} {item.isFragile && '🔴'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.weightKg}kg</td>
                  <td>{Number(item.declaredValue).toLocaleString('vi-VN')}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
