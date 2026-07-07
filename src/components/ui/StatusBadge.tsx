import { ProjectStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const statusConfig = {
  topic_pending: {
    label: "Topic Pending",
    dot: "bg-blue-500",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  under_review: {
    label: "Under Review",
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  correction_required: {
    label: "Correction Required",
    dot: "bg-red-500",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
  approved: {
    label: "Approved",
    dot: "bg-green-500",
    className: "bg-green-50 text-green-600 border border-green-200",
  },
  archived: {
    label: "Archived",
    dot: "bg-gray-400",
    className: "bg-gray-50 text-gray-500 border border-gray-200",
  },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5";
  const textSize = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.className} ${textSize}`}
    >
      <span className={`rounded-full mr-1.5 ${dotSize} ${config.dot}`} />
      {config.label}
    </span>
  );
}