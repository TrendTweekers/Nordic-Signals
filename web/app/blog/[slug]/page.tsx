import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getAllPosts, getPost } from "@/lib/posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPost(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Nordic Signals" },
    publisher: { "@type": "Organization", name: "Nordic Signals" },
  };

  return (
    <>
      <Nav />
      <main>
        <article className="border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <a href="/blog" className="text-sm text-[var(--color-accent)] hover:underline">
              ← Back to blog
            </a>
            <div className="text-xs text-[var(--color-text-dim)] mt-8 mb-3">
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {post.tags.length > 0 && (
                <>
                  {post.tags.map((t) => (
                    <span key={t} className="ml-2 px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px]">
                      {t}
                    </span>
                  ))}
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-4 text-xl text-[var(--color-text-muted)] leading-relaxed">
                {post.description}
              </p>
            )}
            <div
              className="prose-content mt-12 text-[var(--color-text)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>
        </article>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  );
}
