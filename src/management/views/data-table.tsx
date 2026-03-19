import type { FC } from "hono/jsx";

interface DataTableProps {
  columns: string[];
  empty?: string;
  pageSize?: number;
  children: any;
}

export const DataTable: FC<DataTableProps> = ({ columns, empty, pageSize, children }) => {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;

  if (!hasRows && empty) {
    return <div class="px-6 py-8 text-center text-gray-400">{empty}</div>;
  }

  return (
    <div data-page-size={pageSize}>
      <table class="w-full">
        <thead>
          <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
            {columns.map((col) => (
              <th class="px-6 py-3 font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody data-paginate-body>{children}</tbody>
      </table>
      {pageSize && (
        <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between" data-paginate-footer>
          <span class="text-xs font-mono text-gray-400" data-paginate-info></span>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-400 font-mono">Show</label>
              <select
                class="text-xs font-mono border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                data-page-size-select
              >
                {[5, 10, 25, 50].map((n) => (
                  <option value={String(n)} selected={n === pageSize}>{n}</option>
                ))}
              </select>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                data-paginate-prev
                class="flex items-center gap-1 px-2 py-1 text-xs font-mono tracking-wide rounded transition-colors cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-gray-100"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <button
                type="button"
                data-paginate-next
                class="flex items-center gap-1 px-2 py-1 text-xs font-mono tracking-wide rounded transition-colors cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-gray-100"
              >
                Next
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
