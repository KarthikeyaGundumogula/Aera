import { memo } from "react";
import { StarProfile } from "./StarProfile";
import { OriginalMaker } from "../../../types";

interface MakerProfileProps {
  person: OriginalMaker;
  index?: number;
  delay?: number;
}

export const MakerProfile = memo((props: MakerProfileProps) => (
  <StarProfile {...props} type="Maker" />
));
