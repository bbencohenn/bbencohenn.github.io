// Turns GitHub-style alerts into callouts:
//
//   > [!NOTE] Example expression
//   > The lexer tokenises this cleanly.
//
// Types: NOTE, TIP, IMPORTANT, WARNING, CAUTION. Text after the marker on the
// same line becomes the title; without one, the type name is used. Plain
// blockquotes (no marker) are left as they are. The output is classes only,
// so it works under the strict style-src policy.
//
// This is a hast plugin for Sätteri, Astro's default Markdown processor.

const TYPES = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

const MARKER = /^\s*\\?\[!(note|tip|important|warning|caution)\][ \t]*/i;

const isBlank = (n) => n.type === 'text' && !n.value.trim();

export const callouts = {
  name: 'bencohen-callouts',
  element: {
    filter: ['blockquote'],
    visit(node, ctx) {
      const kids = node.children || [];
      const firstIdx = kids.findIndex((n) => !isBlank(n));
      const first = kids[firstIdx];
      if (!first || first.type !== 'element' || first.tagName !== 'p') return;
      const pKids = first.children || [];
      const lead = pKids[0];
      if (!lead || lead.type !== 'text') return;
      const m = lead.value.match(MARKER);
      if (!m) return;

      const type = m[1].toLowerCase();

      // Split the first paragraph into title (rest of line one) and body.
      const title = [];
      const body = [];
      let onFirstLine = true;
      pKids.forEach((child, i) => {
        if (!onFirstLine) return body.push(child);
        if (child.type === 'text') {
          const value = i === 0 ? child.value.slice(m[0].length) : child.value;
          const nl = value.indexOf('\n');
          if (nl === -1) {
            if (value) title.push({ type: 'text', value });
          } else {
            const before = value.slice(0, nl);
            const after = value.slice(nl + 1);
            if (before) title.push({ type: 'text', value: before });
            if (after) body.push({ type: 'text', value: after });
            onFirstLine = false;
          }
        } else if (child.type === 'element' && child.tagName === 'br') {
          onFirstLine = false;
        } else {
          title.push(child);
        }
      });
      const hasTitle = title.some((n) => n.type !== 'text' || n.value.trim());

      const children = [
        {
          type: 'element',
          tagName: 'p',
          properties: { className: ['callout-title'] },
          children: hasTitle ? title : [{ type: 'text', value: TYPES[type] }],
        },
      ];
      if (body.some((n) => !isBlank(n))) {
        children.push({ type: 'element', tagName: 'p', properties: {}, children: body });
      }
      kids.slice(firstIdx + 1).forEach((k) => {
        if (!isBlank(k)) children.push(k);
      });

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'aside',
        properties: { className: ['callout', `callout-${type}`] },
        children,
      });
    },
  },
};
