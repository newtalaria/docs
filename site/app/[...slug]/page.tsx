import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allSlugs, docsInSection, getDoc } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { CodeCopy } from "@/components/CodeCopy";
import { CopyMarkdown } from "@/components/CopyMarkdown";
import { Shell } from "@/components/Shell";
import { sectionForPath } from "@/lib/nav";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug.join("/"));
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: parts } = await params;
  const slug = parts.join("/");
  const doc = getDoc(slug);
  if (!doc) notFound();
  const html = await renderMarkdown(doc.body);
  const path = `/${slug}/`;
  const section = sectionForPath(path);
  const sidebar = section ? docsInSection(section.id) : [];

  return (
    <Shell path={path} sidebar={sidebar}>
      <div className="page-meta">
        <p className="crumb">
          <a href="/">Docs</a>
          {section ? (
            <>
              {" › "}
              <a href={section.href}>{section.title}</a>
            </>
          ) : null}
        </p>
        <CopyMarkdown href={`/${slug}.md`} />
      </div>
      <article className="prose" data-pagefind-body>
        <h1 data-pagefind-meta="title">{doc.title}</h1>
        {doc.description ? <p className="lede">{doc.description}</p> : null}
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <CodeCopy />
      </article>
    </Shell>
  );
}
