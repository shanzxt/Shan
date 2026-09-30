import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

const motionTags = {}
const motionTag = (tag) => (motionTags[tag] ??= motion.create(tag))

// Kinetic heading: each word rises out of its own mask while Anybody's
// width axis settles from stretched to rest — the signal "tuning in".
// The heading element itself watches the viewport and drives the words
// through variants (a word hidden inside its mask can't be observed on its
// own). Words are aria-hidden; the element carries the full text as its
// label. Reduced motion: plain static text.
export default function SplitHeading({ as = "h2", text, className = "", delay = 0, stagger = 0.06, id }) {
  const reduceMotion = useReducedMotion()
  const Tag = as

  if (reduceMotion) {
    return (
      <Tag id={id} className={className}>
        {text}
      </Tag>
    )
  }

  const MotionTag = motionTag(as)
  const words = text.split(" ")

  return (
    <MotionTag
      id={id}
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0 }}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "105%", fontStretch: "150%" },
              show: {
                y: "0%",
                fontStretch: "100%",
                transition: {
                  y: { duration: 0.8, ease: EASE_OUT, delay: delay + i * stagger },
                  fontStretch: { duration: 1.2, ease: EASE_OUT, delay: delay + i * stagger + 0.1 },
                },
              },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && "\u00a0"}
        </span>
      ))}
    </MotionTag>
  )
}
