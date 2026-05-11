import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Nordic hiring intelligence",
  description:
    "Data-backed analysis of Nordic tech hiring: AI capability signals, leadership moves, fundraise-prep patterns, hardware bets. Every post built on our daily scrape of 150+ Nordic startups.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <>
      <Nav />
      <main>
        <section className="border-b border-[var(--color-border)]">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
              Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              Nordic hiring intelligence
            </h1>
            <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-2xl">
              Data-backed analysis of what Nordic tech companies are actually doing — drawn straight from our daily scrape of 150+ career pages.
            </p>
          </div>
        </section>
        <section>
          <div className="max-w-4xl mx-auto px-6 py-14">
            {posts.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No posts yet. First one drops soon.</p>
            ) : (
              <ul className="space-y-8">
                {posts.map((p) => (
                  <li key={p.slug} className="border-b border-[var(--color-border)] pb-8 last:border-0">
                    <a href={`/blog/${p.slug}`} className="block group">
                      <div className="text-xs text-[var(--color-text-dim)] mb-2">
                        {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        {p.tags.length > 0 && (
                          <span className="ml-2">
                            {p.tags.map((t) => (
                              <span key={t} className="ml-2 px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px]">
                                {t}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-medium text-white group-hover:text-[var(--color-accent)] transition-colors">
                        {p.title}
                      </h2>
                      {p.description && (
                        <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">{p.description}</p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
