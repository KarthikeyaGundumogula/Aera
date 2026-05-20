import { useNavigate, useParams } from "react-router-dom";
import { ORIGINALS_DATA } from "../../mock";
import { UploadStudioFlow } from "./components/UploadStudioFlow";

export default function OriginalReleaseUploadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const original = id ? ORIGINALS_DATA[id] : null;

  if (!original) return null;

  return (
    <UploadStudioFlow
      exitLabel={`Return to ${original.title}`}
      headerEyebrow={`Studio Session: ${original.title}`}
      title={"Initiate\nOfficial Release"}
      accentIcon="sparkles"
      onExit={() => navigate(-1)}
      onComplete={() => navigate(`/originals/${id}`)}
      originals={[original]}
      initialOriginalIds={id ? [id] : []}
    />
  );
}
