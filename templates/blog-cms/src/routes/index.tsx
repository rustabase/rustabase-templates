import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppShell, Card, Empty, ErrorState, Loading } from "../../../../shared/ui";
import { expanded, rustabase, text, type RecordRow } from "../../../../shared/rustabase";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Field Notes — Ideas worth sharing" },
    { name: "description", content: "Stories, ideas, and practical guides from your team." },
    { property: "og:title", content: "Field Notes — Ideas worth sharing" },
    { property: "og:description", content: "Stories, ideas, and practical guides from your team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: BlogHome,
});

type Category = RecordRow & { name?: string };
type Post = RecordRow & { slug?: string; title?: string; cover?: string };

function BlogHome() {
  const [category, setCategory] = useState("");
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => rustabase.list<Category>("categories", { sort: "name" }) });
  const posts = useQuery({ queryKey: ["posts", category], queryFn: () => rustabase.list<Post>("posts", { sort: "-created", expand: "author,category", ...(category ? { filter: `category=\"${category}\"` } : {}) }) });
  return <AppShell brand="Field Notes" eyebrow="Independent journal" theme="blog">
    <section><p className="eyebrow">Fresh perspectives</p><h1 className="display">Ideas worth keeping, from people doing the work.</h1><p className="lede">Stories, practical guides, and thoughtful notes from our team.</p></section>
    <div className="toolbar"><h2 className="section-title">Latest stories</h2><select aria-label="Filter by topic" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All topics</option>{categories.data?.items.map((item) => <option key={item.id} value={item.id}>{text(item.name)}</option>)}</select></div>
    {posts.isPending ? <Loading label="Loading stories" /> : posts.error ? <ErrorState error={posts.error} retry={() => posts.refetch()} /> : posts.data.items.length === 0 ? <Empty title="No stories yet" detail="Publish the first post from your RustaBase collection." /> : <div className="grid">{posts.data.items.map((post) => { const author = expanded(post, "author"); const topic = expanded(post, "category"); return <Card key={post.id}>{post.cover ? <img className="cover" src={rustabase.file(post, post.cover)} alt="" /> : null}<p className="meta">{text(topic?.name) || "Journal"}</p><h2>{text(post.title)}</h2><p className="meta">By {text(author?.name) || "The team"}</p><Link className="quiet-link row" to="/posts/$slug" params={{ slug: post.slug || post.id }}>Read story <ArrowRight size={15} /></Link></Card>; })}</div>}
  </AppShell>;
}
