import { ORIGINALS } from "../../mock";
import { useNavigate } from "react-router-dom";
import { UploadStudioFlow } from "./components/UploadStudioFlow";

export default function UploadPage() {
  const navigate = useNavigate();
  return (
    <UploadStudioFlow
      exitLabel="Exit Studio"
      headerEyebrow="The Studio Session"
      title={"Initiate\nRelease"}
      onExit={() => navigate(-1)}
      onComplete={() => navigate("/theatre")}
      originals={ORIGINALS}
    />
  );
}
