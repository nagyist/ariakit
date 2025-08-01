import "./global.css";

import { Analytics } from "@vercel/analytics/react";
import { QueryProvider } from "components/query-provider.tsx";
import { GeistSans } from "geist/font/sans";
import type { PropsWithChildren } from "react";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";

const darkModeScript = `
function classList(action) {
  document.documentElement.classList[action]("dark");
}
classList(localStorage.theme === "dark" ? "add" : "remove");
if (!("theme" in localStorage)) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  classList(query.matches ? "add" : "remove");
  if ("addEventListener" in query) {
    query.addEventListener("change", (event) => {
      classList(event.matches ? "add" : "remove");
    })
  }
}
window.addEventListener("storage", (event) => {
  if (event.key === "theme") {
    classList(event.newValue === "dark" ? "add" : "remove");
  }
});
`;

// See https://github.com/facebook/react/issues/19841#issuecomment-694978234
const dblClickWorkaround = `
if (typeof window !== "undefined") {
  const addEventListener = Node.prototype.addEventListener;
  Node.prototype.addEventListener = function (type, callback, options) {
    if (type === "dblclick" && (options === true || options === false)) {
      return;
    }
    return addEventListener.call(this, type, callback, options);
  };
}
`;

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <html lang="en" suppressHydrationWarning className={GeistSans.className}>
        <body
          suppressHydrationWarning
          className="m-0 bg-gray-50 p-0 text-black antialiased dark:bg-gray-800 dark:text-white"
        >
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
          <script dangerouslySetInnerHTML={{ __html: dblClickWorkaround }} />
          {children}
          <Analytics />
        </body>
      </html>
    </QueryProvider>
  );
}
