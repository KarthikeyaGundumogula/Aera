import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ORIGINALS_DATA, ORIGINALS } from "../../mock";
import { UploadStudioFlow } from "./components/UploadStudioFlow";
import { apiFetch } from "@/lib/api";
import { FHLoader } from "@/components/FHLoader";

export default function OriginalReleaseUploadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Look up initial static mock or fallback
  const initialMock = id ? ORIGINALS_DATA[id] || ORIGINALS.find((o) => o.id === id) || null : null;
  const [original, setOriginal] = useState<any>(initialMock);
  const [loading, setLoading] = useState<boolean>(!initialMock && !!id);

  useEffect(() => {
    if (!id || original) return;
    let isMounted = true;

    // Fetch dynamic Original from backend when id is a UUID or missing from mock
    apiFetch(`/originals/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const remote = json.data || json;
          if (remote && isMounted) {
            setOriginal({
              id: remote.id,
              title: remote.title || "Untitled Original",
              coverImage: remote.coverImage || remote.cover_img || "",
              description: remote.description || "",
            });
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch original details for release:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, original]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080807] flex items-center justify-center">
        <FHLoader label="Initializing Release Studio…" />
      </div>
    );
  }

  // Safe fallback if original record is not yet in DB/mock
  const activeOriginal = original || {
    id: id || "unknown",
    title: "Official Release",
    coverImage: "",
    description: "",
  };

  return (
    <UploadStudioFlow
      exitLabel={`Return to ${activeOriginal.title}`}
      headerEyebrow={`Studio Session: ${activeOriginal.title}`}
      title={"Initiate\nOfficial Release"}
      accentIcon="sparkles"
      onExit={() => navigate(-1)}
      onComplete={() => navigate(`/originals/${id}`)}
      originals={[activeOriginal]}
      initialOriginalIds={id ? [id] : []}
      isOriginalRelease={true}
      originalId={id}
    />
  );
}
