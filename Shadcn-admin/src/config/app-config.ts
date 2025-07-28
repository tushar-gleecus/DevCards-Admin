import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "DevHub Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, DevHubs Admin.`,
  meta: {
    title: "DevHubs Admin - Modern Next.js Dashboard ",
    description: "DevHubs Admin is a modern admin dashboard built with Next.js 15, Tailwind CSS v4, and shadcn/ui. ",
  },
};
