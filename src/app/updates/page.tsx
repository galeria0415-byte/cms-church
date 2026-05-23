import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSafePublishedPosts } from "@/lib/public-content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const posts = await getSafePublishedPosts();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-16 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Latest updates</p>
          <h1 className="mt-2 font-serif text-5xl text-[var(--ink)]">Church news, updates, and featured announcements.</h1>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <p className="text-sm text-[var(--muted)]">{formatDate(post.publishDate)}</p>
              <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.content}</p>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}