import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell, ErrorState, Loading } from "../../../../shared/ui";
import { expanded, rustabase, text, type RecordRow } from "../../../../shared/rustabase";

export const Route = createFileRoute("/posts/$slug")({
  head: () => ({ meta: [
    { title: "Story — Field Notes" },
    { name: "description", content: "Read the latest story from Field Notes." },
    { property: "og:title", content: "Story — Field Notes" },
    { property: "og:description", content: "Read the latest story from Field Notes." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PostPage,
});

type Post = RecordRow & { title?: string; content?: string };
function PostPage() {
  const { slug } = Route.useParams();
  const post = useQuery({ queryKey: ["post", slug], queryFn: async () => (await rustabase.list<Post>("posts", { filter: `slug=\"${slug.replaceAll('"', "")}\"`, expand: "author" })).items[0] });
  return <AppShell brand="Field Notes" eyebrow="Independent journal" theme="blog">{post.isPending ? <Loading label="Loading story" /> : post.error ? <ErrorState error={post.error} retry={() => post.refetch()} /> : !post.data ? <div className="empty"><h1>Story not found</h1><Link to="/">Return to all stories</Link></div> : <article className="article"><Link className="quiet-link row" to="/"><ArrowLeft size={15} />All stories</Link><p className="eyebrow">Field Notes</p><h1 className="display">{text(post.data.title)}</h1><p className="meta">By {text(expanded(post.data, "author")?.name) || "The team"}</p><div className="article-body"><p>{text(post.data.content)}</p></div></article>}</AppShell>;
}
