import { ORIGINALS } from "../../mock";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadStudioFlow } from "./components/UploadStudioFlow";

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const festivalId = searchParams.get("festivalId") || undefined;
  const setId = searchParams.get("setId") || undefined;

  const handleExit = () => {
    if (festivalId) {
      navigate(`/festivals/${festivalId}`);
    } else if (setId) {
      navigate(`/sets/${setId}`);
    } else {
      navigate("/studio");
    }
  };

  const handleComplete = () => {
    if (festivalId) {
      navigate(`/festivals/${festivalId}`);
    } else if (setId) {
      navigate(`/sets/${setId}`);
    } else {
      navigate("/studio");
    }
  };

  return (
    <UploadStudioFlow
      exitLabel={festivalId || setId ? "Cancel Release" : "Exit Studio"}
      headerEyebrow={festivalId ? "Festival Release" : setId ? "Set Release" : "The Studio Session"}
      title={"Initiate\nRelease"}
      onExit={handleExit}
      onComplete={handleComplete}
      originals={ORIGINALS}
      festivalId={festivalId}
      setId={setId}
    />
  );
}
