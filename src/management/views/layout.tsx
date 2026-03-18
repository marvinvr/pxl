import type { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren<{ title?: string }>> = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} — Pxl` : "Pxl"}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <style>{`
          [hx-indicator] .htmx-indicator { display: none; }
          [hx-indicator].htmx-request .htmx-indicator { display: inline; }
          .htmx-request .htmx-indicator { display: inline; }
        `}</style>
      </head>
      <body class="bg-gray-50 text-gray-900 min-h-screen">
        <nav class="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-14">
              <a href="/" class="text-lg font-bold tracking-tight font-mono text-gray-900 hover:text-blue-600 transition-colors">
                pxl
              </a>
              <div class="flex items-center gap-6">
                <a href="/" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">dashboard</a>
                <a href="/pixels" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">pixels</a>
                <a href="/providers" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">providers</a>
              </div>
            </div>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
};
