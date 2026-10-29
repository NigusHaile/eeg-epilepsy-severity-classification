import type { OutlierRow } from "@/lib/eeg";
import { cn } from "@/lib/utils";

type OutlierTableProps = {
  rows: OutlierRow[];
  selected: number;
  onSelect: (index: number) => void;
};

export function OutlierTable({ rows, selected, onSelect }: OutlierTableProps) {
  const ranked = rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => b.row.distanceStd - a.row.distanceStd);

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b text-left">
          <tr className="eyebrow">
            <th className="p-3 font-normal">Signal</th>
            <th className="p-3 font-normal">Class</th>
            <th className="p-3 font-normal">Outside band</th>
            <th className="p-3 font-normal">Distance (σ)</th>
            <th className="p-3 font-normal">Status</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {ranked.map(({ row, index }) => (
            <tr
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted",
                index === selected && "bg-secondary",
              )}
            >
              <td className="p-3">{row.id}</td>
              <td className="p-3">{row.label ?? "—"}</td>
              <td className="p-3">{(row.fracOutside * 100).toFixed(1)}%</td>
              <td className="p-3">{row.distanceStd.toFixed(3)}</td>
              <td className="p-3">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    row.isOutlier
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {row.isOutlier ? "outlier" : "within"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
