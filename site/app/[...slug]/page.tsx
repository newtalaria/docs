import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allSlugs, docsInSection, getDoc } from "@/lib/content";
import { headingsFromMarkdown } from "@/lib/headings";
import { renderMarkdown } from "@/lib/markdown";
import { githubBlobUrl, lastReviewedIso } from "@/lib/reviewed";
import { CodeCopy } from "@/components/CodeCopy";
import { CopyMarkdown } from "@/components/CopyMarkdown";
import { MobileOnThisPage, OnThisPage } from "@/components/OnThisPage";
import { PageActions } from "@/components/PageActions";
import { PlatformNotice } from "@/components/PlatformNotice";
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
  const headings = headingsFromMarkdown(doc.body);
  const path = `/${slug}/`;
  const section = sectionForPath(path);
  const sidebar = section ? docsInSection(section.id) : [];
  const reviewed = lastReviewedIso(doc.file);
  const editHref = githubBlobUrl(doc.file);

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
      <MobileOnThisPage headings={headings} />
      <div className="article-with-toc">
        <article className="prose" data-pagefind-body>
          <PlatformNotice />
          <h1 data-pagefind-meta="title">{doc.title}</h1>
          {doc.description ? <p className="lede">{doc.description}</p> : null}
          <div dangerouslySetInnerHTML={{ __html: html }} />
          <CodeCopy />
        </article>
        <OnThisPage headings={headings} />
      </div>
      <PageActions path={path} reviewed={reviewed} editHref={editHref} />
    </Shell>
  );
}
