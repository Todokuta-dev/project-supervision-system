import { SimilarityReport } from "@/lib/types";

export default function SimilarityStatusNotice({
  status,
}: {
  status: SimilarityReport["analysis_status"];
}) {
  if (!status || status === "complete") return null;

  const message = status === "extraction_failed"
    ? "Text could not be extracted from this file. The zero score is not a similarity result; try a text-based PDF or Word document."
    : "The file contained too little readable text for a reliable comparison. Review the document and its sources manually.";

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <strong className="font-semibold">Similarity analysis incomplete. </strong>
      {message}
    </div>
  );
}
