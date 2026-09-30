import { useEffect } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { issuesByDate } from "../data/newsletter"
import { IssueBody, IssueChart, Lightbox, useLightbox } from "../components/IssueContent"
import { links } from "../data/links"
import GithubMark from "../components/icons/GithubMark"

function useIssueMeta(issue) {
  useEffect(() => {
    if (!issue) return
    const previousTitle = document.title
    document.title = `${issue.title} — Shantanu Somwanshi`

    const metaTags = [
      { name: "description", content: issue.hook },
      { property: "og:title", content: issue.title },
      { property: "og:description", content: issue.hook },
      { property: "og:image", content: issue.coverImage ?? "" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: issue.title },
      { name: "twitter:description", content: issue.hook },
      { name: "twitter:image", content: issue.coverImage ?? "" },
    ]

    const created = metaTags.map(({ name, property, content }) => {
      if (!content) return null
      const el = document.createElement("meta")
      if (name) el.setAttribute("name", name)
      if (property) el.setAttribute("property", property)
      el.setAttribute("content", content)
      document.head.appendChild(el)
      return el
    })

    return () => {
      document.title = previousTitle
      created.forEach((el) => el && document.head.removeChild(el))
    }
  }, [issue])
}

export default function NewsletterIssue() {
  const { slug } = useParams()
  const reduceMotion = useReducedMotion()
  const index = issuesByDate.findIndex((i) => i.id === slug)
  const issue = index === -1 ? null : issuesByDate[index]
  useIssueMeta(issue)
  const [lightboxImage, setLightboxImage] = useLightbox(issue?.id)

  if (!issue) return <Navigate to="/newsletters" replace />

  // `issuesByDate` is newest-first; "previous" reads chronologically
  // earlier (higher array index), "next" chronologically later.
  const prevIssue = issuesByDate[index + 1] ?? null
  const nextIssue = issuesByDate[index - 1] ?? null

  return (
    <>
      <div className="min-h-screen bg-bg px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
        <Link
          to="/newsletters"
          className="group inline-flex items-center gap-1.5 font-mono text-sm text-paper/60 transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          all issues
        </Link>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-2xl"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-paper/45">Shantanu Somwanshi</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            {issue.title}
          </h1>
          {issue.hook && (
            <p className="mt-3 font-display text-lg italic leading-snug text-paper/55">{issue.hook}</p>
          )}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b hr-line pb-6 font-mono text-xs text-paper/40">
            <span className="text-teal">Issue {issue.number}</span>
            <span>·</span>
            <span>{issue.date}</span>
            {issue.readingTime && (
              <>
                <span>·</span>
                <span>{issue.readingTime}</span>
              </>
            )}
          </div>

          <IssueChart issue={issue} />

          <div className="border-t hr-line pt-8">
            <IssueBody content={issue.content} onOpenImage={setLightboxImage} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t hr-line pt-6 font-mono text-sm">
            <a
              href={issue.substackUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
            >
              Read on Substack
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href={issue.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
            >
              <GithubMark size={14} />
              View the code
            </a>
            <a
              href={links.newsletter}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-accent transition-opacity hover:opacity-80"
            >
              Subscribe on Substack
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {(prevIssue || nextIssue) && (
            <div className="mt-10 grid grid-cols-1 gap-4 border-t hr-line pt-6 sm:grid-cols-2">
              {prevIssue ? (
                <Link
                  to={`/newsletters/${prevIssue.id}`}
                  className="group flex flex-col gap-1 border hr-line p-4 transition-colors hover:border-accent/50"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-paper/40">
                    <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
                    Previous issue
                  </span>
                  <span className="text-paper transition-colors group-hover:text-accent">{prevIssue.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {nextIssue && (
                <Link
                  to={`/newsletters/${nextIssue.id}`}
                  className="group flex flex-col gap-1 border hr-line p-4 text-right transition-colors hover:border-accent/50 sm:col-start-2"
                >
                  <span className="inline-flex items-center justify-end gap-1.5 font-mono text-xs text-paper/40">
                    Next issue
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-paper transition-colors group-hover:text-accent">{nextIssue.title}</span>
                </Link>
              )}
            </div>
          )}
        </motion.article>
      </div>
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  )
}
