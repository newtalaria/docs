import type { Metadata } from "next";
import { CopyMarkdown } from "@/components/CopyMarkdown";
import { PlatformPicker } from "@/components/PlatformPicker";
import { SearchForm } from "@/components/SearchForm";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Talaria docs",
};

export default function HomePage() {
  return (
    <Shell path="/" wide headerSearch={false}>
      <div className="hero" data-pagefind-body>
        <div className="page-meta page-meta-end">
          <CopyMarkdown href="/index.md" />
        </div>
        <h1 data-pagefind-meta="title">Set up Talaria in your app</h1>
        <p className="lede">
          Get a first event into Talaria, then add a collector, a feature, or a fix. Search the docs, pick your
          platform, or let an agent do the wiring.
        </p>
        <SearchForm />
        <div className="cards">
          <a className="card agent" href="/agents/">
            <b>Set up with your agent</b>
            <p>Point Cursor, Grok Bot, or another MCP client at the Talaria docs and skills.</p>
          </a>
          <a className="card" href="/cli/">
            <b>Set up from the terminal</b>
            <p>Install the CLI from get.newtalaria.com/cli and generate an otelcol config.</p>
          </a>
        </div>
        <h2>Choose a platform</h2>
        <PlatformPicker />
      </div>
    </Shell>
  );
}
