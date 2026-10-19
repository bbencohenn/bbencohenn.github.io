import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "posts/my-post/index.md" becomes the id "my-post".
const folderId = ({ entry }: { entry: string }) => entry.split('/')[0];

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex value like #6d28d9');

// Blog posts: one folder per post so images sit next to the text.
const posts = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/posts', generateId: folderId }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      date: z.coerce.date(),
      category: z.string().min(1),
      tags: z.array(z.string()).default([]),
      summary: z.string().min(1),
      cover: image().optional(),
      cover_alt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

// Categories are their own collection so new ones can be added from the admin.
const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().default(100),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/projects', generateId: folderId }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      year: z.string().min(1),
      kind: z.string().min(1),
      summary: z.string().min(1),
      link: z.url().optional(),
      repo: z.url().optional(),
      cover: image().optional(),
      cover_alt: z.string().optional(),
      featured: z.boolean().default(true),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

// Timeline entries. Lanes are worked out automatically from the dates.
const timeline = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/timeline', generateId: folderId }),
  schema: z
    .object({
      title: z.string().min(1),
      place: z.string().optional(),
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      ongoing: z.boolean().default(false),
      planned_end: z.coerce.date().optional(),
      colour: hex,
      summary: z.string().min(1),
      kind: z.enum(['work', 'study', 'travel', 'other']).default('other'),
      draft: z.boolean().default(false),
    })
    .refine((d) => !d.end || d.end >= d.start, {
      message: 'End date must be after the start date',
      path: ['end'],
    }),
});

const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/settings' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    hero_lede: z.string(),
    hash_demo: z.array(z.string()).min(2),
    about_lead: z.string(),
    about: z.string(),
    email: z.email(),
    github: z.url(),
    linkedin: z.string().optional(),
    resume_pdf: z.string().optional(),
    pgp: z.string().optional(),
    location: z.string(),
    looking_for: z.string(),
    available: z.string(),
    work_rights: z.string(),
    degree: z.string(),
    languages: z.string(),
    also: z.string(),
    timeline_from: z.number().int(),
  }),
});

// Free-form pages edited as Markdown (the résumé lives here).
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts, categories, projects, timeline, settings, pages };
