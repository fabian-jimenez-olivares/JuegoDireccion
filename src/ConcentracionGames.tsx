import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { GOLD } from './stubs/data/goldRewards'
import { bumpToolUse } from './stubs/hooks/useToolUse'
import { awardGold } from './stubs/hooks/useWallet'
import { formatRunMs, readBestTime, saveBestTime } from './stubs/lib/concentracionRecords'
import { GOLD_FX_TOAST_MS } from './stubs/lib/goldFx'
import { usePreferences } from './stubs/lib/preferences'

type GameId = 'numeros' | 'colores' | 'direccion' | 'abc'

const GAMES: { id: GameId; label: string; accent: string; icon: ReactNode }[] = [
  {
    id: 'numeros',
    label: 'Números',
    accent: '#d4a24a',
    icon: (
      <>
        <path d="M8 5v14M8 5h4.5a3 3 0 0 1 0 6H8" />
        <path d="M16 19c1.2 0 2-.8 2-2s-.8-2-2-2-2 .8-2 2 .8 2 2 2Z" />
      </>
    ),
  },
  {
    id: 'colores',
    label: 'Colores',
    accent: '#e06b4f',
    icon: (
      <>
        <path d="M12 3.5 19 18H5L12 3.5Z" />
        <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    id: 'direccion',
    label: 'Dirección',
    accent: '#5bb8a8',
    icon: (
      <>
        <path d="M5 17V7h6l2 4h6v6" />
        <circle cx="7" cy="17" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    id: 'abc',
    label: 'ABC',
    accent: '#7eb8e6',
    icon: (
      <>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M9.2 16 12 8.5 14.8 16M10 13.2h4" />
      </>
    ),
  },
]

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function ConcentraHud({
  game,
  level,
  runId,
  done,
  onRaise,
  onStart,
  onDone,
}: {
  game: GameId
  level: number
  runId: number
  done: boolean
  onRaise: () => void
  onStart: () => void
  onDone?: (fresh: boolean) => void
}) {
  const started = useRef(performance.now())
  const marked = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const [best, setBest] = useState(() => readBestTime(game, level))
  const [session, setSession] = useState<number | null>(null)
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    started.current = performance.now()
    marked.current = false
    setSession(null)
    setBest(readBestTime(game, level))
    setFresh(false)
  }, [game, level, runId])

  function captureRecord() {
    if (!done || marked.current) return
    marked.current = true
    const elapsed = performance.now() - started.current
    const previous = readBestTime(game, level)
    const next = saveBestTime(game, level, elapsed)
    const isFresh = previous == null || next < previous
    setSession(elapsed)
    setBest(next)
    setFresh(isFresh)
    onDoneRef.current?.(isFresh)
  }

  useEffect(() => {
    if (done) captureRecord()
  }, [done, runId])

  return (
    <div className="concentra-hud">
      <div className="concentra-hud-actions">
        <button type="button" className="concentra-hud-btn" onClick={onStart}>
          Empezar
        </button>
        <button type="button" className="concentra-hud-btn is-record" disabled={!done} onClick={captureRecord}>
          Récord
        </button>
        <button
          type="button"
          className={`concentra-hud-btn is-level${level > 1 ? ' is-on' : ''}`}
          onClick={onRaise}
        >
          Nivel {level}
        </button>
      </div>
      <p className={`concentra-hud-times${fresh ? ' is-new' : ''}`}>
        <span>
          Sesión <strong>{session == null ? '—' : formatRunMs(session)}</strong>
        </span>
        <span>
          {best == null ? (
            'Sin récord'
          ) : (
            <>
              {fresh ? 'Nuevo récord' : 'Récord'} <strong>{formatRunMs(best)}</strong>
            </>
          )}
        </span>
      </p>
    </div>
  )
}

const SIZES = [3, 4, 5, 5, 6]

function dealNumeros(count: number) {
  const values = Array.from({ length: count }, (_, index) => index + 1)
  return { cells: shuffle(values), order: shuffle(values) }
}

export function Numeros() {
  const { gamified } = usePreferences()
  const [level, setLevel] = useState(1)
  const [runId, setRunId] = useState(0)
  const size = SIZES[level - 1]
  const [pack, setPack] = useState(() => dealNumeros(9))
  const [cursor, setCursor] = useState(0)
  const [bad, setBad] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const next = pack.order[cursor]

  function deal(nextLevel = level) {
    const count = SIZES[nextLevel - 1] ** 2
    setPack(dealNumeros(count))
    setCursor(0)
    setBad(null)
    setDone(false)
    setRunId((current) => current + 1)
  }

  function press(value: number) {
    if (done) return
    if (value !== next) {
      setBad(value)
      window.setTimeout(() => setBad(null), 280)
      return
    }
    if (cursor >= pack.order.length - 1) {
      setCursor(pack.order.length)
      setDone(true)
      return
    }
    setCursor(cursor + 1)
  }

  return (
    <div className="memoria-game">
      <ConcentraHud
        game="numeros"
        level={level}
        runId={runId}
        done={done}
        onStart={() => deal()}
        onRaise={() => {
          const raised = level >= SIZES.length ? 1 : level + 1
          setLevel(raised)
          deal(raised)
        }}
        onDone={(fresh) => {
          if (!gamified) return
          const complete = GOLD.numerosComplete[level - 1] ?? GOLD.numerosComplete[0]
          awardGold(complete, `¡Números completado! +${complete} de oro 🪙`)
          if (!fresh) return
          const extra = GOLD.numerosRecord[level - 1] ?? GOLD.numerosRecord[0]
          window.setTimeout(() => {
            awardGold(extra, `¡Récord de números! +${extra} de oro 🪙`)
          }, GOLD_FX_TOAST_MS + 200)
        }}
      />
      <p>{done ? 'Completaste la tabla.' : `Aprieta el ${next}.`}</p>
      <div className="memoria-cells is-count" style={{ '--cols': size } as CSSProperties}>
        {pack.cells.map((value) => (
          <button
            key={value}
            type="button"
            className={pack.order.indexOf(value) < cursor ? 'is-on' : bad === value ? 'is-bad' : ''}
            onClick={() => press(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

const COLORES_MAX = 8

const INKS = [
  { id: 'rojo', label: 'Rojo', color: '#e06b4f' },
  { id: 'verde', label: 'Verde', color: '#3ea87a' },
  { id: 'azul', label: 'Azul', color: '#5b8def' },
  { id: 'negro', label: 'Negro', color: '#1a1a1a' },
  { id: 'violeta', label: 'Violeta', color: '#8b5cf6' },
  { id: 'gris', label: 'Gris', color: '#8a8f98' },
  { id: 'amarillo', label: 'Amarillo', color: '#e0b400' },
  { id: 'rosado', label: 'Rosado', color: '#e06b9a' },
]

function colorTrial(level: number) {
  const pool = INKS.slice(0, Math.min(INKS.length, 3 + level))
  const word = pool[Math.floor(Math.random() * pool.length)]
  let ink = pool[Math.floor(Math.random() * pool.length)]
  const mismatch = level > 1 || Math.random() >= 0.5
  if (mismatch) {
    while (ink.id === word.id) ink = pool[Math.floor(Math.random() * pool.length)]
  } else {
    ink = word
  }
  return { word, ink, pool }
}

export function Colores() {
  const [level, setLevel] = useState(1)
  const [runId, setRunId] = useState(0)
  const total = 5 + level
  const [step, setStep] = useState(0)
  const [hits, setHits] = useState(0)
  const [trial, setTrial] = useState(() => colorTrial(1))
  const done = step >= total

  function restart(nextLevel = level) {
    setStep(0)
    setHits(0)
    setTrial(colorTrial(nextLevel))
    setRunId((current) => current + 1)
  }

  function answer(id: string) {
    if (done) return
    if (id === trial.ink.id) setHits((current) => current + 1)
    const next = step + 1
    setStep(next)
    if (next < 5 + level) setTrial(colorTrial(level))
  }

  return (
    <div className="memoria-game">
      <ConcentraHud
        game="colores"
        level={level}
        runId={runId}
        done={done}
        onStart={() => restart()}
        onRaise={() => {
          const raised = level >= COLORES_MAX ? 1 : level + 1
          setLevel(raised)
          restart(raised)
        }}
      />
      <p>{done ? `Acertaste ${hits} de ${total}.` : 'Aprieta el color de la tinta, no el de la palabra.'}</p>
      {done ? null : (
        <p className="concentra-word" style={{ color: trial.ink.color }}>
          {trial.word.label}
        </p>
      )}
      {done ? null : (
        <div className="concentra-choices">
          {trial.pool.map((ink) => (
            <button key={ink.id} type="button" className="concentra-choice" onClick={() => answer(ink.id)}>
              {ink.label}
            </button>
          ))}
        </div>
      )}
      {done ? (
        <button type="button" className="primary-btn" onClick={() => restart()}>
          Otra vez
        </button>
      ) : null}
    </div>
  )
}

const RUTA_MAX = 5
type MoveId = 'avanza' | 'salta2' | 'retro' | 'salta1'
const RUTA_STEP: Record<MoveId, number> = { avanza: 1, salta1: 2, salta2: 3, retro: -1 }
const RUTA_RULES: { id: MoveId; glyph: string; text: string }[] = [
  { id: 'avanza', glyph: '■', text: 'Avanza 1' },
  { id: 'salta2', glyph: '▲', text: 'Salta 2' },
  { id: 'retro', glyph: '●', text: 'Retrocede 1' },
  { id: 'salta1', glyph: '◆', text: 'Salta 1' },
]

function pathMoves(moves: (MoveId | null)[], goal: number) {
  const seen = new Set<number>()
  const taken: MoveId[] = []
  let pos = 0
  while (pos !== goal) {
    const move = moves[pos]
    if (move == null || seen.has(pos)) return null
    seen.add(pos)
    taken.push(move)
    pos += RUTA_STEP[move]
    if (pos < 0 || pos > goal) return null
  }
  return taken
}

function freeMove(moves: (MoveId | null)[], index: number) {
  return index >= 0 && index < moves.length && moves[index] == null
}

function fillRuta(moves: (MoveId | null)[]) {
  return moves.map((move) => move ?? RUTA_RULES[Math.floor(Math.random() * RUTA_RULES.length)].id)
}

function plantRetro(moves: (MoveId | null)[], pos: number, remain: number) {
  if (remain >= 4 && freeMove(moves, pos + 1) && freeMove(moves, pos + 2) && freeMove(moves, pos + 3) && Math.random() < 0.5) {
    const cont: MoveId = remain >= 5 && Math.random() < 0.5 ? 'salta2' : 'salta1'
    moves[pos] = 'salta2'
    moves[pos + 3] = 'retro'
    moves[pos + 2] = cont
    return pos + 2 + RUTA_STEP[cont]
  }
  if (remain >= 3 && freeMove(moves, pos + 1) && freeMove(moves, pos + 2)) {
    const cont: MoveId = remain >= 4 && Math.random() < 0.5 ? 'salta2' : 'salta1'
    moves[pos] = 'salta1'
    moves[pos + 2] = 'retro'
    moves[pos + 1] = cont
    return pos + 1 + RUTA_STEP[cont]
  }
  return null
}

function rutaMoves(steps: number, level: number) {
  const goal = steps - 1
  const wantRetro = level === 1 ? (Math.random() < 0.8 ? 1 : 0) : 1 + Math.floor(Math.random() * Math.min(level, 3))
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const moves: (MoveId | null)[] = Array.from({ length: steps }, () => null)
    let pos = 0
    let guard = 0
    let retros = 0
    while (pos < goal && guard < goal * 12) {
      guard += 1
      if (moves[pos] != null) {
        pos += RUTA_STEP[moves[pos]!]
        continue
      }
      const remain = goal - pos
      if (retros < wantRetro && (attempt > 8 || Math.random() < 0.5)) {
        const next = plantRetro(moves, pos, remain)
        if (next != null) {
          pos = next
          retros += 1
          continue
        }
      }
      const bag: MoveId[] = ['avanza']
      if (remain >= 2) bag.push('salta1', 'avanza')
      if (remain >= 3) bag.push('salta2')
      if (level >= 3 && remain >= 3) bag.push('salta2')
      const move = bag[Math.floor(Math.random() * bag.length)]
      moves[pos] = move
      pos += RUTA_STEP[move]
    }
    const taken = pathMoves(moves, goal)
    if (!taken) continue
    const got = taken.filter((move) => move === 'retro').length
    if (got >= Math.min(wantRetro, 1) || (wantRetro === 0 && got === 0)) return fillRuta(moves)
  }
  const moves: (MoveId | null)[] = Array.from({ length: steps }, () => null)
  let pos = 0
  let usedRetro = false
  while (pos < goal) {
    if (moves[pos] != null) {
      pos += RUTA_STEP[moves[pos]!]
      continue
    }
    const remain = goal - pos
    if (!usedRetro && remain >= 4) {
      const next = plantRetro(moves, pos, remain)
      if (next != null) {
        pos = next
        usedRetro = true
        continue
      }
    }
    const move: MoveId = remain >= 3 ? 'salta2' : remain >= 2 ? 'salta1' : 'avanza'
    moves[pos] = move
    pos += RUTA_STEP[move]
  }
  return fillRuta(moves)
}

function buildRuta(cols: number, rows: number, level: number, cell = 52) {
  return {
    cols,
    rows,
    cell,
    flip: false,
    moves: rutaMoves(cols * rows, level),
    goal: cols * rows - 1,
  }
}

function rutaCoord(index: number, cols: number, flip: boolean) {
  const y = Math.floor(index / cols)
  const xIn = index % cols
  const reverse = flip ? y % 2 === 0 : y % 2 === 1
  return { x: reverse ? cols - 1 - xIn : xIn, y }
}

export function Direccion() {
  const [level, setLevel] = useState(1)
  const [runId, setRunId] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [board, setBoard] = useState(() => buildRuta(7, 6, 1))
  const [pos, setPos] = useState(0)
  const [bad, setBad] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const here = board.moves[pos]
  const gap = 22

  function restart(nextLevel = level, box = scrollRef.current) {
    const cols = 5 + nextLevel + Math.floor(Math.random() * 3)
    const rows = 4 + nextLevel + Math.floor(Math.random() * 3)
    const width = box?.clientWidth || 320
    const height = box?.clientHeight || 280
    const cell = Math.max(48, Math.ceil(Math.max((width + 48) / cols, (height + 48) / rows) - gap))
    setBoard(buildRuta(cols, rows, nextLevel, cell))
    setPos(0)
    setBad(null)
    setDone(false)
    setRunId((current) => current + 1)
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => restart(level))
    return () => window.cancelAnimationFrame(frame)
  }, [level])

  useEffect(() => {
    scrollRef.current?.querySelector('.is-player')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pos, board])

  function press(index: number) {
    if (done || index === pos) return
    const next = pos + RUTA_STEP[here]
    if (index !== next) {
      setBad(index)
      return
    }
    setBad(null)
    setPos(next)
    if (next === board.goal) setDone(true)
  }

  const pitch = board.cell + gap
  const arrows = Array.from({ length: board.goal }, (_, index) => {
    const from = rutaCoord(index, board.cols, board.flip)
    const to = rutaCoord(index + 1, board.cols, board.flip)
    const down = from.y !== to.y
    return {
      index,
      glyph: down ? '↓' : from.x < to.x ? '→' : '←',
      left: down ? from.x * pitch + board.cell / 2 - 11 : Math.min(from.x, to.x) * pitch + board.cell,
      top: down ? from.y * pitch + board.cell : from.y * pitch + board.cell / 2 - 11,
    }
  })

  return (
    <div className="memoria-game ruta-game">
      <ConcentraHud
        game="direccion"
        level={level}
        runId={runId}
        done={done}
        onStart={() => restart()}
        onRaise={() => setLevel((current) => (current >= RUTA_MAX ? 1 : current + 1))}
      />
      <div className="ruta-leyenda">
        {RUTA_RULES.map((rule) => (
          <span key={rule.id}>
            <b aria-hidden="true">{rule.glyph}</b>
            {rule.text}
          </span>
        ))}
      </div>
      <p>{done ? 'Llegaste a la meta.' : bad != null ? 'Error.' : 'Toca el cuadro que indica la figura.'}</p>
      <div className="ruta-scroll" ref={scrollRef}>
        <div className="ruta-board" style={{ '--cols': board.cols, '--rows': board.rows, '--cell': `${board.cell}px` } as CSSProperties}>
          {board.moves.map((move, index) => {
            const at = rutaCoord(index, board.cols, board.flip)
            const figure = RUTA_RULES.find((rule) => rule.id === move)?.glyph
            const meta = index === board.goal
            return (
              <button
                key={index}
                type="button"
                className={`ruta-cell${index === pos ? ' is-player' : ''}${meta ? ' is-meta' : ''}${bad === index ? ' is-bad' : ''}`}
                style={{ gridColumn: at.x + 1, gridRow: at.y + 1 }}
                onClick={() => press(index)}
              >
                {figure}
                {meta ? <small>Meta</small> : null}
              </button>
            )
          })}
          {arrows.map((arrow) => (
            <span key={`arrow-${arrow.index}`} className="ruta-arrow" style={{ left: arrow.left, top: arrow.top }} aria-hidden="true">
              {arrow.glyph}
            </span>
          ))}
        </div>
      </div>
      {done ? (
        <button type="button" className="primary-btn" onClick={() => restart()}>
          Otra vez
        </button>
      ) : null}
    </div>
  )
}

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ABC_TINTS = ['#7ec8e3', '#f2b5d4', '#f7d08a', '#8fd3b6', '#c5b4e3', '#f5a88a', '#8fd3c8', '#e8c1f0', '#a8c5f0', '#f0c98a']
const ABC_LEVELS = [
  { last: 8, missing: 2, speed: 0.72, size: 74 },
  { last: 12, missing: 3, speed: 0.95, size: 66 },
  { last: 16, missing: 4, speed: 1.16, size: 58 },
  { last: 21, missing: 5, speed: 1.16, size: 52 },
  { last: 26, missing: 7, speed: 1.16, size: 46 },
] as const

type AbcBubble = {
  letter: string
  color: string
  x: number
  y: number
  vx: number
  vy: number
}

function dealAbc(level: number) {
  const rule = ABC_LEVELS[level - 1]
  const pool = shuffle(ABC.split('')).slice(0, rule.last)
  const missing = new Set(shuffle(pool).slice(0, rule.missing))
  const kept = pool.filter((letter) => !missing.has(letter))
  const colors = shuffle(ABC_TINTS)
  const letters = kept.map((letter, index) => {
    const angle = Math.random() * Math.PI * 2
    const speed = (0.11 + Math.random() * 0.16) * rule.speed
    return {
      letter,
      color: colors[index % colors.length],
      x: 14 + Math.random() * 72,
      y: 16 + Math.random() * 68,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    } satisfies AbcBubble
  })
  return { letters, order: [...kept].sort(), size: rule.size }
}

export function Abc() {
  const [level, setLevel] = useState(1)
  const [runId, setRunId] = useState(0)
  const [pack, setPack] = useState(() => dealAbc(1))
  const [cursor, setCursor] = useState(0)
  const [bad, setBad] = useState<string | null>(null)
  const [pop, setPop] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const nodes = useRef<Record<string, HTMLButtonElement | null>>({})
  const motion = useRef(pack.letters)
  const next = pack.order[cursor]

  useEffect(() => {
    motion.current = pack.letters.map((bubble) => ({ ...bubble }))
  }, [pack])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67)
      last = now
      for (const bubble of motion.current) {
        const node = nodes.current[bubble.letter]
        if (!node || node.classList.contains('is-pop')) continue
        bubble.x += bubble.vx * dt
        bubble.y += bubble.vy * dt
        if (bubble.x < 8) {
          bubble.x = 8
          bubble.vx = Math.abs(bubble.vx)
        } else if (bubble.x > 92) {
          bubble.x = 92
          bubble.vx = -Math.abs(bubble.vx)
        }
        if (bubble.y < 10) {
          bubble.y = 10
          bubble.vy = Math.abs(bubble.vy)
        } else if (bubble.y > 90) {
          bubble.y = 90
          bubble.vy = -Math.abs(bubble.vy)
        }
        node.style.left = `${bubble.x}%`
        node.style.top = `${bubble.y}%`
      }
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [pack])

  function deal(nextLevel = level) {
    setPack(dealAbc(nextLevel))
    setCursor(0)
    setBad(null)
    setPop(null)
    setDone(false)
    setRunId((current) => current + 1)
  }

  function press(letter: string) {
    if (done || pop) return
    if (letter !== next) {
      setBad(letter)
      window.setTimeout(() => setBad((current) => (current === letter ? null : current)), 280)
      return
    }
    setPop(letter)
    window.setTimeout(() => {
      if (cursor >= pack.order.length - 1) {
        setDone(true)
        setCursor(pack.order.length)
      } else {
        setCursor((current) => current + 1)
      }
      setPop((current) => (current === letter ? null : current))
    }, 260)
  }

  const gone = new Set(pack.order.slice(0, cursor))

  return (
    <div className="memoria-game abc-game" style={{ '--abc-size': `${pack.size}px` } as CSSProperties}>
      <ConcentraHud
        game="abc"
        level={level}
        runId={runId}
        done={done}
        onStart={() => deal()}
        onRaise={() => {
          const raised = level >= 5 ? 1 : level + 1
          setLevel(raised)
          deal(raised)
        }}
      />
      <p>
        {done
          ? 'Completaste el abecedario.'
          : `Aprieta la ${next}. Faltan letras al azar.`}
      </p>
      <div className="abc-pond" aria-label="Burbujas del abecedario">
        {pack.letters
          .filter((bubble) => !gone.has(bubble.letter) || pop === bubble.letter)
          .map((bubble) => (
            <button
              key={bubble.letter}
              ref={(node) => {
                nodes.current[bubble.letter] = node
              }}
              type="button"
              className={`abc-bubble${pop === bubble.letter ? ' is-pop' : ''}${bad === bubble.letter ? ' is-bad' : ''}`}
              style={
                {
                  '--tint': bubble.color,
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                } as CSSProperties
              }
              aria-label={bubble.letter}
              onClick={() => press(bubble.letter)}
            >
              {bubble.letter}
            </button>
          ))}
      </div>
      {done ? (
        <button type="button" className="primary-btn" onClick={() => deal()}>
          Otra vez
        </button>
      ) : null}
    </div>
  )
}

