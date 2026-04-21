import type { BattlegroundKind } from './gameRouting'
import { ML_AGENTS_EXAMPLES_URL } from './mlAgentsReference'
import { howToPlayLines } from './useMatchSimulation'

type Props = {
  gameLabel: string
  kind: BattlegroundKind
}

function RichLine({ text }: { text: string }) {
  const parts = text.split(/\*\*/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-fg">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function HowToPlayPanel({ gameLabel, kind }: Props) {
  const lines = howToPlayLines(kind, gameLabel)
  return (
    <div>
      <h3 className="font-display text-base font-semibold text-white">How this feed works</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-soft">
        {lines.map((line, idx) => (
          <li key={idx}>
            <RichLine text={line} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-fg-soft">
        Official reference:{' '}
        <a
          className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          href={ML_AGENTS_EXAMPLES_URL}
          target="_blank"
          rel="noreferrer"
        >
          Unity ML-Agents — Example learning environments
        </a>
        .
      </p>
    </div>
  )
}
