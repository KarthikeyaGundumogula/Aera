import { createContext } from "react";
import { TheatreItem } from "../types";

export const FeedContext = createContext<TheatreItem[] | undefined>(undefined);
