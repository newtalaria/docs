export type Platform = {
  id: string;
  title: string;
  href: string;
  family?: string;
};

export const platforms: Platform[] = [
  { id: "javascript", title: "JavaScript", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "react", title: "React", href: "/sdk/javascript/react/", family: "JavaScript" },
  { id: "nextjs", title: "Next.js", href: "/sdk/javascript/nextjs/", family: "JavaScript" },
  { id: "node", title: "Node.js", href: "/sdk/javascript/node/", family: "JavaScript" },
  { id: "flutter", title: "Flutter", href: "/sdk/flutter/", family: "Dart and Flutter" },
  { id: "dart", title: "Dart", href: "/sdk/dart/", family: "Dart and Flutter" },
  { id: "php", title: "PHP", href: "/sdk/php/", family: "PHP" },
  { id: "laravel", title: "Laravel", href: "/sdk/laravel/", family: "PHP" },
  { id: "silverstripe", title: "Silverstripe", href: "/sdk/silverstripe/", family: "PHP" },
  { id: "serverpod", title: "Serverpod", href: "/sdk/serverpod/", family: "Dart and Flutter" },
];
