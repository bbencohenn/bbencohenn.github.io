import type { APIRoute } from 'astro';
import { getSettings, getTimeline, layoutTimeline, safeKey, LANE_TOP, LANE_GAP } from '../../lib/site';

// Timeline positions and colours come from the content, so they're generated
// into a real stylesheet at build time. That lets the page avoid inline
// style attributes, which the Content-Security-Policy blocks.
export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const entries = await getTimeline();
  const L = layoutTimeline(entries, settings.timeline_from);
  const n = (v: number) => Number(v.toFixed(3));

  const css: string[] = [];
  css.push(`.tl-canvas{height:${L.height}px}`);
  css.push(`.tl-now{left:${n(L.nowLeft)}%}`);
  for (const y of L.years) css.push(`.tl-year[data-y="${y.year}"]{left:${n(y.left)}%}`);

  for (const it of L.items) {
    const key = safeKey(it.id);
    if (!key) continue;
    // Colour is validated as #rrggbb by the content schema.
    css.push(`[data-k="${key}"]{--c:${it.colour}}`);
    css.push(
      `.tl-item[data-k="${key}"]{left:${n(it.left)}%;width:${n(it.width)}%;top:${LANE_TOP + it.lane * LANE_GAP}px}`,
    );
    if (it.projWidth > 0) {
      css.push(`.tl-item[data-k="${key}"] .tl-proj{width:calc(${n(it.projWidth)}% - 10px)}`);
    }
  }

  return new Response(css.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/css; charset=utf-8' },
  });
};
