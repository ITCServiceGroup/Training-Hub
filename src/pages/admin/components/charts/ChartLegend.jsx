const ChartLegend = ({ items, colors, ariaLabel = "Chart legend" }) => (
  <div
    className="flex h-full w-28 shrink-0 items-center overflow-hidden py-2 pl-2"
  >
    <ul className="w-full space-y-2" role="list" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li
          key={item.id ?? item.label ?? index}
          className="flex min-w-0 items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
          title={String(item.fullName ?? item.label ?? item.id)}
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
            aria-hidden="true"
          />
          <span className="truncate">{item.label ?? item.id}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ChartLegend;
