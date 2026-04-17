import { memo } from "react";
import { PersonProfile } from "./PersonProfile";
import { OriginalMaker } from "../../../types";

interface MakerProfileProps {
  person: OriginalMaker;
  index?: number;
  delay?: number;
}

export const MakerProfile = memo((props: MakerProfileProps) => (
  <PersonProfile {...props} type="Maker" />
));
