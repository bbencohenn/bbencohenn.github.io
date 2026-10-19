import { createHash } from 'node:crypto';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Project = CollectionEntry<'projects'>;
export type TimelineEntry = CollectionEntry<'timeline'>;

const showDrafts = import.meta.env.DEV;

export async function getSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.json');
  return entry.data;
}

export async function getPosts() {
  const posts = await getCollection('posts', (p) => showDrafts || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getCategories() {
  const cats = await getCollection('categories');
  return cats.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

export async function getProjects() {
  const projects = await getCollection('projects', (p) => showDrafts || !p.data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export async function getTimeline() {
  const items = await getCollection('timeline', (t) => showDrafts || !t.data.draft);
  return items.sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
}

/** Short SHA-256 prefix, used as a stable id for posts and projects. */
export function digest(text: string, length = 7) {
  return createHash('sha256').update(text).digest('hex').slice(0, length);
}

export function sha256(text: string) {
  return createHash('sha256').update(text).digest('hex');
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Sydney' });
}

export function fmtMonth(d: Date) {
  return d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric', timeZone: 'Australia/Sydney' });
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function readingTime(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** "Feb 2024 – now", "Jan 2025", "2010 – Nov 2022" */
export function entryWhen(d: TimelineEntry['data']) {
  const start = fmtMonth(d.start);
  if (d.ongoing) return `${start} – now`;
  if (!d.end) return start;
  if (d.start.getFullYear() === d.end.getFullYear() && d.start.getMonth() === d.end.getMonth()) return start;
  return `${start} – ${fmtMonth(d.end)}`;
}

/** Only allow characters that are safe inside a CSS attribute selector and a URL. */
export function safeKey(id: string) {
  return /^[a-z0-9][a-z0-9-_]*$/i.test(id) ? id : null;
}

// ---------------------------------------------------------------------------
// Timeline layout: positions every entry on a month grid and packs entries
// into lanes so nothing overlaps. Used by the timeline component and by the
// generated stylesheet at /styles/timeline.css.
// ---------------------------------------------------------------------------

export const LANE_TOP = 60;
export const LANE_GAP = 84;

export interface LaidOut {
  id: string;
  title: string;
  when: string;
  summary: string;
  colour: string;
  lane: number;
  left: number; // %
  width: number; // %
  projWidth: number; // % of the item's own width
  openStart: boolean;
  single: boolean;
  ongoing: boolean;
  startMonth: number;
  plannedMonth: number | null;
  flipTip: boolean;
}

export interface Layout {
  from: number;
  span: number; // months on the axis
  nowMonth: number;
  nowLeft: number;
  years: { year: number; left: number }[];
  items: LaidOut[];
  lanes: number;
  height: number;
}

const monthOf = (d: Date, from: number) =>
  (d.getFullYear() - from) * 12 + d.getMonth() + (d.getDate() - 1) / 31;

export function layoutTimeline(entries: TimelineEntry[], from: number, now = new Date()): Layout {
  const nowMonth = monthOf(now, from);
  let last = nowMonth;
  for (const e of entries) {
    if (e.data.end) last = Math.max(last, monthOf(e.data.end, from));
    if (e.data.planned_end) last = Math.max(last, monthOf(e.data.planned_end, from));
  }
  const span = Math.ceil(last + 3);
  const pct = (m: number) => (Math.max(0, Math.min(span, m)) / span) * 100;

  const rows = entries
    .map((e) => {
      const d = e.data;
      const single = !d.end && !d.ongoing;
      const s = monthOf(d.start, from);
      const end = single ? s : d.ongoing ? nowMonth : monthOf(d.end!, from);
      const planned = d.planned_end ? monthOf(d.planned_end, from) : null;
      const when = entryWhen(d);
      // Leave room for the label: roughly 7.8px per character on a ~1100px canvas.
      const labelMonths = ((d.title.length + when.length + 1) * 7.8) / 1100 * span;
      const reach = Math.max(end, planned ?? end, Math.max(0, s) + labelMonths) + 1;
      return { e, single, s, end, planned, when, reach };
    })
    .filter((r) => r.end >= 0)
    .sort((a, b) => a.s - b.s);

  const laneEnds: number[] = [];
  const items: LaidOut[] = rows.map((r) => {
    const start = Math.max(0, r.s);
    let lane = laneEnds.findIndex((endAt) => endAt <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(r.reach);
    } else {
      laneEnds[lane] = r.reach;
    }
    const left = pct(r.s);
    const width = r.single ? 0 : Math.max(0, pct(r.end) - left);
    const projWidth = r.planned && width > 0 ? ((pct(r.planned) - pct(r.end)) / width) * 100 : 0;
    return {
      id: r.e.id,
      title: r.e.data.title,
      when: r.when,
      summary: r.e.data.summary,
      colour: r.e.data.colour,
      lane,
      left,
      width,
      projWidth,
      openStart: r.s < 0,
      single: r.single,
      ongoing: r.e.data.ongoing,
      startMonth: r.s,
      plannedMonth: r.planned,
      flipTip: left > 55,
    };
  });

  const years: { year: number; left: number }[] = [];
  for (let y = from; (y - from) * 12 <= span; y++) years.push({ year: y, left: pct((y - from) * 12) });

  const lanes = Math.max(1, laneEnds.length);
  return {
    from,
    span,
    nowMonth,
    nowLeft: pct(nowMonth),
    years,
    items,
    lanes,
    height: LANE_TOP + lanes * LANE_GAP + 150,
  };
}
