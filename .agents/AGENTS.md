# Design System Rules
- **No Circle Containers**: Buttons, avatars, nav buttons, and tags should never be perfectly circular (do not use `rounded-full`). Instead, use slightly rounded squares or rectangles (e.g., `rounded-xl`, `rounded-2xl`, `rounded-lg`). The ONLY exception to this rule is the Floating Action Button (FAB).

# API & Robustness Rules
- **Complete Request-Response Cycle with Proper Error Handling**: Always complete every API request-response cycle with strict, comprehensive error handling. Inspect HTTP status codes, parse error payloads, catch network failures, and display user-facing error feedback without masking exceptions or leaving promises unhandled.