// We now use an open emoji system, so ReactionId is just the string emoji character.
export type ReactionId = string;

// The default set of emojis to seed the user's quick-tray, enforcing a positive cinematic vibe initially.
export const DEFAULT_QUICK_REACTIONS: ReactionId[] = ["🔥", "❤️", "🙌", "⚡", "🤌"];
