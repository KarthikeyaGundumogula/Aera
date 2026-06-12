import { useState, useCallback, useEffect } from "react";

export interface SocialsData {
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface ProfileFormData {
  username: string;
  name: string;
  bio: string;
  socials: SocialsData;
  portraitFile: File | null;
  portraitPreview: string | null;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  themeTextColor: string;
  themeBgColor: string;
}

export function useProfileForm(initialData?: Partial<ProfileFormData>) {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    name: "",
    bio: "",
    socials: { instagram: "", twitter: "", youtube: "" },
    portraitFile: null,
    portraitPreview: null,
    password: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    themeTextColor: "#fac107",
    themeBgColor: "#0f1a42",
    ...initialData,
  });

  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateSocial = useCallback(
    (platform: keyof SocialsData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        socials: { ...prev.socials, [platform]: value },
      }));
    },
    []
  );

  const setPortrait = useCallback((file: File, preview: string) => {
    setFormData((prev) => {
      // Don't revoke here because the parent might be using strict mode which renders twice
      // and we handle cleanup in the useEffect below
      return {
        ...prev,
        portraitFile: file,
        portraitPreview: preview,
      };
    });
  }, []);

  const clearPortrait = useCallback((defaultPreview: string | null = null) => {
    setFormData((prev) => {
      if (prev.portraitPreview && prev.portraitPreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.portraitPreview);
      }
      return {
        ...prev,
        portraitFile: null,
        portraitPreview: defaultPreview,
      };
    });
  }, []);

  useEffect(() => {
    const preview = formData.portraitPreview;
    return () => {
      if (preview && preview.startsWith("blob:")) {
        // Allow brief time for component unmounting before revoking to prevent flashes
        setTimeout(() => {
          try {
             URL.revokeObjectURL(preview);
          } catch (e) {
             // ignore
          }
        }, 0);
      }
    };
  }, [formData.portraitPreview]);

  return {
    formData,
    updateField,
    updateSocial,
    setPortrait,
    clearPortrait,
    setFormData,
  };
}
