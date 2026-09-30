import { forwardRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { chunkForPath } from "../../lib/routeChunks"
import { transitionTo } from "../../lib/transition"

function preload(to) {
  const path = typeof to === "string" ? to.split("#")[0] : to.pathname
  chunkForPath(path)?.()
}

// Drop-in <Link> that navigates through a View Transition (see
// lib/transition.js) and warms the target route's chunk on hover/focus.
// Modified clicks (new tab, etc.) keep native behaviour.
const TransitionLink = forwardRef(function TransitionLink(
  { to, onClick, onPointerEnter, onFocus, ...rest },
  ref,
) {
  const navigate = useNavigate()

  return (
    <Link
      ref={ref}
      to={to}
      {...rest}
      onPointerEnter={(e) => {
        preload(to)
        onPointerEnter?.(e)
      }}
      onFocus={(e) => {
        preload(to)
        onFocus?.(e)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (rest.target && rest.target !== "_self") return
        e.preventDefault()
        transitionTo(navigate, to)
      }}
    />
  )
})

export default TransitionLink
