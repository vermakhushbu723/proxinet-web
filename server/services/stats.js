import { collections, collectionKeys } from '../collections.js';
import { Lead, Assessment, Ticket } from '../models/index.js';
import { serialize } from '../models/helpers.js';

const dayKey = (d, tz) => new Date(d).toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD

/** Everything the admin dashboard shows, computed server-side. */
export async function dashboardStats({ tz = 'Asia/Kolkata' } = {}) {
  const now = new Date();
  const since14 = new Date(now.getTime() - 14 * 86400000);
  const since7 = new Date(now.getTime() - 7 * 86400000);
  const today = dayKey(now, tz);

  const perCollection = await Promise.all(collectionKeys.map(async (key) => {
    const { model } = collections[key];
    const [total, unread, recentDates, latest] = await Promise.all([
      model.countDocuments(),
      model.countDocuments({ read: false }),
      model.find({ createdAt: { $gte: since14 } }, { createdAt: 1 }).lean(),
      model.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    return { key, total, unread, recentDates: recentDates.map((r) => r.createdAt), latest: latest.map((r) => ({ ...serialize(r), col: key })) };
  }));

  const allDates = perCollection.flatMap((c) => c.recentDates);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 86400000);
    const key = dayKey(d, tz);
    return { key, value: allDates.filter((x) => dayKey(x, tz) === key).length };
  });

  const [leadStatus, upcoming, openTickets, p1] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Assessment.find({ status: { $in: ['Requested', 'Confirmed'] }, date: { $gte: today } }).sort({ date: 1, time: 1 }).limit(10).lean(),
    Ticket.countDocuments({ status: { $in: ['Open', 'In progress'] } }),
    Ticket.countDocuments({ status: { $in: ['Open', 'In progress'] }, pri: 'P1' }),
  ]);
  const byStatus = Object.fromEntries(leadStatus.map((s) => [s._id, s.n]));
  const won = byStatus.Won || 0;
  const lost = byStatus.Lost || 0;

  return {
    total: perCollection.reduce((n, c) => n + c.total, 0),
    today: allDates.filter((d) => dayKey(d, tz) === today).length,
    week: allDates.filter((d) => d >= since7).length,
    unread: perCollection.reduce((n, c) => n + c.unread, 0),
    openLeads: Object.entries(byStatus).filter(([s]) => !['Won', 'Lost'].includes(s)).reduce((n, [, v]) => n + v, 0),
    newLeads: byStatus.New || 0,
    winRate: won + lost ? Math.round((won / (won + lost)) * 100) : 0,
    openTickets,
    p1,
    days,
    byForm: Object.fromEntries(perCollection.map((c) => [c.key, { total: c.total, unread: c.unread }])),
    pipeline: Lead.schema.path('status').enumValues.map((s) => ({ key: s, value: byStatus[s] || 0 })),
    upcoming: upcoming.map(serialize),
    recent: perCollection.flatMap((c) => c.latest).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
  };
}

/** Unread counts per form plus the newest unread items (for the bell + toasts). */
export async function unreadSummary(limit = 20) {
  const parts = await Promise.all(collectionKeys.map(async (key) => {
    const { model } = collections[key];
    const [count, items] = await Promise.all([
      model.countDocuments({ read: false }),
      model.find({ read: false }).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);
    return { key, count, items: items.map((r) => ({ ...serialize(r), col: key })) };
  }));
  return {
    counts: Object.fromEntries(parts.map((p) => [p.key, p.count])),
    total: parts.reduce((n, p) => n + p.count, 0),
    items: parts.flatMap((p) => p.items).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit),
  };
}
