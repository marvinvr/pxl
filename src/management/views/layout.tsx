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
          input[type="checkbox"] { accent-color: #111827; }
        `}</style>
      </head>
      <body class="bg-gray-50 text-gray-900 min-h-screen" hx-boost="true">
        <nav class="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-14">
              <a href="/" class="text-lg font-bold tracking-tight font-mono text-gray-900 hover:text-blue-600 transition-colors">
                pxl
              </a>
              <div class="flex items-center gap-6">
                <a href="/" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">dashboard</a>
                <a href="/pixels" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">pixels</a>
                <a href="/links" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">links</a>
                <a href="/ips" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">ips</a>
                <a href="/providers" class="text-sm font-mono text-gray-500 hover:text-gray-900 transition-colors">providers</a>
              </div>
            </div>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <script dangerouslySetInnerHTML={{ __html: paginationScript }} />
      </body>
    </html>
  );
};

const paginationScript = `
(function() {
  document.querySelectorAll('[data-page-size]').forEach(function(container) {
    var body = container.querySelector('[data-paginate-body]');
    var footer = container.querySelector('[data-paginate-footer]');
    var info = container.querySelector('[data-paginate-info]');
    var prevBtn = container.querySelector('[data-paginate-prev]');
    var nextBtn = container.querySelector('[data-paginate-next]');
    var sizeSelect = container.querySelector('[data-page-size-select]');
    if (!body || !footer) return;

    var rows = Array.from(body.querySelectorAll('tr'));
    var total = rows.length;
    var pageSize = parseInt(container.dataset.pageSize, 10) || 10;
    var page = 0;

    function render() {
      var start = page * pageSize;
      var end = start + pageSize;
      rows.forEach(function(row, i) {
        row.style.display = (i >= start && i < end) ? '' : 'none';
      });
      var showing = Math.min(end, total);
      info.textContent = total === 0 ? '' : (start + 1) + String.fromCharCode(8211) + showing + ' of ' + total;
      prevBtn.disabled = page === 0;
      nextBtn.disabled = end >= total;
    }

    prevBtn.addEventListener('click', function() {
      if (page > 0) { page--; render(); }
    });
    nextBtn.addEventListener('click', function() {
      if ((page + 1) * pageSize < total) { page++; render(); }
    });
    if (sizeSelect) {
      sizeSelect.value = String(pageSize);
      sizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value, 10);
        page = 0;
        render();
      });
    }
    render();
  });
})();
`;
