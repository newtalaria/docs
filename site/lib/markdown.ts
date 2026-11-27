import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { createCssVariablesTheme } from "shiki";

const talariaCode = createCssVariablesTheme({ name: "talaria", variablePrefix: "--shiki-", fontStyle: true });

export async function renderMarkdown(source: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      test: ["h2", "h3"],
      properties: { className: ["heading-anchor"], ariaLabel: "Link to this section" },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, {
      theme: talariaCode,
      keepBackground: false,
    } as never)
    .use(rehypeStringify)
    .process(source);
  return String(file);
}
