import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Feedback } from "@/lib/types";

interface SubmissionReviewStatusProps {
  feedback?: Pick<Feedback, "decision" | "comments"> | null;
  compact?: boolean;
}

export default function SubmissionReviewStatus({
  feedback,
  compact = false,
}: SubmissionReviewStatusProps) {
  const approved = feedback?.decision === "approve";
  const Icon = feedback ? (approved ? CheckCircle2 : AlertCircle) : Clock;
  const title = feedback
    ? approved
      ? "Chapter approved"
      : "Revisions requested"
    : "Awaiting supervisor review";
  const color = feedback
    ? approved
      ? "green"
      : "amber"
    : "slate";
  const colors = {
    green: "border-green-200 bg-green-50 text-green-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    slate: "border-border bg-background text-content-secondary",
  }[color];
  const iconColors = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-background-surface text-content-secondary",
  }[color];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border ${colors} ${compact ? "px-3 py-2" : "p-4"}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg ${iconColors} ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`${compact ? "text-xs" : "text-sm"} font-semibold`}>
          {title}
        </p>
        {!compact && feedback?.comments && (
          <p className="mt-1 text-sm leading-relaxed opacity-90 line-clamp-3">
            {feedback.comments}
          </p>
        )}
        {!feedback && !compact && (
          <p className="mt-1 text-xs leading-relaxed">
            Your supervisor will add a decision and feedback here.
          </p>
        )}
      </div>
    </div>
  );
}
