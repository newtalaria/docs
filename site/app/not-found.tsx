import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell path="/404/" wide>
      <h1>Page not found</h1>
      <p className="lede">
        That path is not in this build of the docs. Try <a href="/search/">search</a> or go back to the{" "}
        <a href="/">home page</a>.
      </p>
    </Shell>
  );
}
