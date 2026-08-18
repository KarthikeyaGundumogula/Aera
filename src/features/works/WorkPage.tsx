import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import type { WorkDetail, EditWorkDetail, PosterWorkDetail, ScriptWorkDetail } from "../../types";
import { EditViewer } from "./layouts/EditViewer";
import { PosterViewer } from "./layouts/PosterViewer";
import { StoryboardViewer } from "./layouts/StoryboardViewer";
import { FHLoader } from "@/components/FHLoader";

export default function WorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workDetail, setWorkDetail] = useState<WorkDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchWork = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await apiFetch(`/works/${id}`);
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.data) {
            setWorkDetail(json.data);
          } else {
            setHasError(true);
          }
        } else if (isMounted) {
          setHasError(true);
        }
      } catch (err) {
        console.error("[WorkPage] Failed to fetch work details:", err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWork();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080807]">
        <FHLoader label="Retrieving Scene..." />
      </div>
    );
  }

  if (hasError || !workDetail) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080807]">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
          Work not found
        </p>
        <button
          onClick={() => navigate("/theatre")}
          className="mt-6 px-6 py-2.5 rounded-xl border border-white/15 text-white/50 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all"
        >
          Return to Theatre
        </button>
      </div>
    );
  }

  switch (workDetail.category) {
    case "POSTER":
      return <PosterViewer work={workDetail as PosterWorkDetail} />;
    case "SCRIPT":
      return <StoryboardViewer work={workDetail as ScriptWorkDetail} />;
    case "EDIT":
    default:
      return <EditViewer work={workDetail as EditWorkDetail} />;
  }
}
