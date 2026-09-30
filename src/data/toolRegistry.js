import { lazy } from "react"

// Maps a newsletter issue's `tool` field (and a content block's
// `{ type: "tool", name }`) to the actual interactive component already
// built for it — reused as-is, never forked.
export const toolRegistry = {
  "fund-picker": lazy(() => import("../components/PortfolioBuilder/FundPickerTool")),
}
