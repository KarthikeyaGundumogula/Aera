import type { Original } from "../../types";

export type UploadCategory = "Edit" | "Poster" | "Script";
export type UploadPlatform = "youtube" | "twitter";
export type UploadStep = "IDENTITY" | "CREDITS" | "SOURCE" | "FORMAT" | "REVIEW";

export interface UploadScriptPage {
  url: string;
  text: string;
}

export interface UploadFormData {
  originalIds: string[];
  title: string;
  category: UploadCategory;
  contentUrl: string;
  scriptPages: UploadScriptPage[];
  aspectRatio: number;
  platform: UploadPlatform;
}

type UploadFormPatch = Partial<UploadFormData>;
export type UpdateUploadFormData = (data: UploadFormPatch) => void;

export interface UploadFlowConfig {
  exitLabel: string;
  headerEyebrow: string;
  title: string;
  accentIcon?: "line" | "sparkles";
  onExit: () => void;
  onComplete: () => void;
  originals: Original[];
  initialOriginalIds?: string[];
  festivalId?: string;
  setId?: string;
}
