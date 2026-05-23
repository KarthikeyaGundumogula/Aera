import { createContext, useContext } from "react";
import { TheatreItem } from "../types";

export const FeedContext = createContext<TheatreItem[] | undefined>(undefined);

export function useFeedContext() {
  return useContext(FeedContext);
}
