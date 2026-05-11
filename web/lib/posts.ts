import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface Post extends PostMeta {
  html: string;
}

async function readPostsDir(): Promise<string[]> {
  try {
    return await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await readPostsDir();
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(POSTS_DIR, f), "utf-8");
        const { data } = matter(raw);
        return {
          slug: f.replace(/\.md$/, ""),
          title: String(data.title || "Untitled"),
          date: String(data.date || "1970-01-01"),
          description: String(data.description || ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        };
      })
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.md`), "utf-8");
    const { data, content } = matter(raw);
    const html = await marked.parse(content, { gfm: true });
    return {
      slug,
      title: String(data.title || "Untitled"),
      date: String(data.date || "1970-01-01"),
      description: String(data.description || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      html,
    };
  } catch {
    return null;
  }
}
