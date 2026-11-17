import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { enquiryService, reviewService } from '../services/marketingService';
import { contentService } from '../services/contentService';

/**
 * Builds the owner's alert feed: new orders, payments to verify, enquiries,
 * pending reviews, low stock and fully-booked delivery dates. Polls every minute.
 */
export const useAdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [orders, products, enquiries, reviews, settings] = await Promise.all([
        // Staff without a permission may get 403s from the API — treat as empty
        orderService.list().catch(() => []),
        productService.list({ admin: true }).catch(() => []),
        enquiryService.list().catch(() => []),
        reviewService.list().catch(() => []),
        contentService.getSettings().catch(() => ({})),
      ]);
      const list = [];
      orders.filter((o) => o.status === 'New').forEach((o) =>
        list.push({ id: `o-${o._id}`, type: 'order', unread: !o.seen, title: `New order ${o.orderNumber}`, text: `${o.customer.name} · ${o.shipping.city}`, at: o.createdAt, link: `/admin/orders/${o._id}` })
      );
      orders.filter((o) => o.payment.status === 'Awaiting Verification').forEach((o) =>
        list.push({ id: `p-${o._id}`, type: 'payment', unread: true, title: `Verify payment for ${o.orderNumber}`, text: `Ref: ${o.payment.reference || '—'}`, at: o.createdAt, link: `/admin/orders/${o._id}` })
      );
      enquiries.filter((e) => e.status === 'new').forEach((e) =>
        list.push({ id: `e-${e._id}`, type: 'enquiry', unread: true, title: e.type === 'custom' ? 'New custom order request' : 'New contact message', text: `${e.name} — ${e.subject || e.occasion || ''}`, at: e.createdAt, link: '/admin/enquiries' })
      );
      reviews.filter((r) => r.status === 'pending').forEach((r) =>
        list.push({ id: `r-${r._id}`, type: 'review', unread: true, title: 'Review awaiting approval', text: `${r.name}: “${r.comment.slice(0, 50)}”`, at: r.createdAt, link: '/admin/reviews' })
      );
      products
        .filter((p) => p.type === 'ready-made' && p.status === 'published' && (p.stock ?? 0) <= (p.lowStockThreshold || 0))
        .forEach((p) =>
          list.push({ id: `s-${p._id}`, type: 'stock', unread: true, title: p.stock ? `Low stock: ${p.name}` : `Out of stock: ${p.name}`, text: `${p.stock || 0} left (threshold ${p.lowStockThreshold})`, at: p.updatedAt || p.createdAt, link: '/admin/inventory' })
        );
      // Capacity alerts
      if (settings.dailyCapacity > 0) {
        const counts = {};
        orders.filter((o) => o.status !== 'Cancelled').forEach((o) => { counts[o.requestedDate] = (counts[o.requestedDate] || 0) + 1; });
        Object.entries(counts)
          .filter(([date, n]) => n >= settings.dailyCapacity && date >= new Date().toISOString().slice(0, 10))
          .forEach(([date, n]) =>
            list.push({ id: `c-${date}`, type: 'capacity', unread: true, title: `Fully booked: ${date}`, text: `${n}/${settings.dailyCapacity} orders scheduled`, at: new Date().toISOString(), link: '/admin/settings' })
          );
      }
      list.sort((a, b) => new Date(b.at) - new Date(a.at));
      setAlerts(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  return { alerts, loading, reload: load };
};
