// Dev-only visual check: true-width viewport screenshot + horizontal-overflow report via
// Chrome DevTools Protocol (Node's built-in WebSocket, no dependency). Needs `npm run preview` running.
// Headless Chrome's --window-size can't go below ~500px, so this emulates the width instead.
// usage: [MOUSE=x,y] node scripts/screenshot.mjs <url> <width> <out.png> [scrollY] [js-to-run-before-capture]
import { spawn } from "node:child_process"
const [url, width, out, scrollY = "0", js] = process.argv.slice(2)
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + process.env.TEMP + "/cdp-prof", "about:blank"])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let tabs
for (let i = 0; i < 40 && !tabs; i++) { await sleep(250); try { tabs = await (await fetch("http://127.0.0.1:9333/json")).json() } catch {} }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })) })
await send("Emulation.setDeviceMetricsOverride", { width: +width, height: 900, deviceScaleFactor: 1, mobile: +width < 600 })
await send("Page.navigate", { url })
await sleep(2500)
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value
await ev(`window.scrollTo(0, ${scrollY})`); await sleep(1500)
if (js) { await ev(js); await sleep(600) }
// MOUSE="x,y[;x,y...]" moves the real (CDP) pointer through those points, for hover states.
if (process.env.MOUSE) {
  for (const pt of process.env.MOUSE.split(";")) {
    const [x, y] = pt.split(",").map(Number)
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, pointerType: "mouse" })
    await sleep(120)
  }
  await sleep(700)
}
console.log(JSON.stringify(await ev(`({inner: innerWidth, scrollW: document.documentElement.scrollWidth,
  wide: [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest("nav")).slice(0,5).map(e => e.tagName + "." + (e.className+"").slice(0,40))})`)))
const { data } = await send("Page.captureScreenshot", { format: "png" })
;(await import("node:fs")).writeFileSync(out, Buffer.from(data, "base64"))
chrome.kill(); process.exit(0)
