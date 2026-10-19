// Images with a title become captioned figures:
//
//   ![Alt text for screen readers](./chart.png "Figure 2: Road types by edge count")
//
// renders as <figure><img …><figcaption>Figure 2: …</figcaption></figure>.
// Only applies when the image is alone in its paragraph. Images without a
// title are left as they are. Hast plugin for Sätteri.

const isBlank = (n) => n.type === 'text' && !n.value.trim();

export const figures = {
  name: 'bencohen-figures',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const kids = (node.children || []).filter((n) => !isBlank(n));
      if (kids.length !== 1) return;
      const img = kids[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;
      const title = img.properties && img.properties.title;
      if (typeof title !== 'string' || !title.trim()) return;

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          img,
          { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: title.trim() }] },
        ],
      });
    },
  },
};
