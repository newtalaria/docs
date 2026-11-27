export type Platform = {
  id: string;
  title: string;
  href: string;
  family?: string;
};

export const platforms: Platform[] = [
  { id: "javascript", title: "JavaScript", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "react", title: "React", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "nextjs", title: "Next.js", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "node", title: "Node.js", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "flutter", title: "Flutter", href: "/sdk/", family: "Dart and Flutter" },
  { id: "dart", title: "Dart", href: "/sdk/", family: "Dart and Flutter" },
  { id: "php", title: "PHP", href: "/guides/collectors/sitehost/", family: "PHP" },
  { id: "laravel", title: "Laravel", href: "/guides/collectors/sitehost/", family: "PHP" },
  { id: "silverstripe", title: "Silverstripe", href: "/guides/collectors/sitehost/", family: "PHP" },
  { id: "serverpod", title: "Serverpod", href: "/sdk/", family: "Dart and Flutter" },
];
