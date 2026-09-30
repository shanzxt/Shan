// Stable anchor ids for an issue's "h2" blocks, shared by the body (which
// renders the ids) and the table of contents (which links to them).
export function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function issueHeadings(content = []) {
  return content.filter((b) => b.type === "h2").map((b) => ({ id: headingId(b.text), text: b.text }))
}
