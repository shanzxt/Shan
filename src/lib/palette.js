// Opens the command palette from anywhere (the listener lives in Effects).
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("palette:open"))
}
