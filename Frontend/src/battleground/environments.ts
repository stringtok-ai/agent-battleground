import * as THREE from 'three'
import type { BattlegroundKind } from './gameRouting'

/** Visual layout references: Unity ML-Agents Example environments (package `Examples`). */
export type EnvRefs = {
  ball: THREE.Object3D | null
  crate: THREE.Mesh | null
  coopCrate: THREE.Mesh | null
  coopCrate2: THREE.Mesh | null
  foods: THREE.Mesh[]
  hazards: THREE.Mesh[]
  goalGood: THREE.Mesh | null
  goalBad: THREE.Mesh | null
  walls: THREE.Mesh[]
  platforms: THREE.Mesh[]
  matchCells: THREE.Mesh[]
  pyramids: THREE.Mesh[]
  sorterBins: THREE.Mesh[]
  goalStrip: THREE.Mesh | null
  laserBeam: THREE.Mesh | null
  pyramidSwitch: THREE.Mesh | null
  /** GridWorld: half-extent in cells (integer grid). */
  gridHalf: number
}

export function createRefs(): EnvRefs {
  return {
    ball: null,
    crate: null,
    coopCrate: null,
    coopCrate2: null,
    foods: [],
    hazards: [],
    goalGood: null,
    goalBad: null,
    walls: [],
    platforms: [],
    matchCells: [],
    pyramids: [],
    sorterBins: [],
    goalStrip: null,
    laserBeam: null,
    pyramidSwitch: null,
    gridHalf: 4,
  }
}

function stdMat(hex: number, opts?: { emissive?: number; emissiveIntensity?: number; roughness?: number; metalness?: number }) {
  return new THREE.MeshStandardMaterial({
    color: hex,
    emissive: opts?.emissive ?? 0,
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
    metalness: opts?.metalness ?? 0.08,
    roughness: opts?.roughness ?? 0.82,
  })
}

function wallMat() {
  return stdMat(0x8b939e, { roughness: 0.88 })
}

function soccerBallGroup(): THREE.Group {
  const root = new THREE.Group()
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 22, 16),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.02, roughness: 0.42 }),
  )
  core.castShadow = true
  root.add(core)
  const patchM = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.65 })
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6
    const inc = Math.acos(1 - 2 * t)
    const rot = 2 * Math.PI * i * 0.618033988749895
    const v = new THREE.Vector3(Math.sin(inc) * Math.cos(rot), Math.cos(inc), Math.sin(inc) * Math.sin(rot)).multiplyScalar(0.39)
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), patchM)
    patch.position.copy(v)
    root.add(patch)
  }
  return root
}

function addPerimeterWalls(scene: THREE.Scene, refs: EnvRefs, halfW: number, halfD: number, height: number, thickness = 0.22) {
  const mat = wallMat()
  const mk = (x: number, z: number, w: number, d: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), mat)
    m.position.set(x, height / 2, z)
    m.receiveShadow = true
    m.castShadow = true
    scene.add(m)
    refs.walls.push(m)
  }
  const e = thickness / 2
  mk(0, halfD + e, halfW * 2 + thickness * 2, thickness)
  mk(0, -halfD - e, halfW * 2 + thickness * 2, thickness)
  mk(halfW + e, 0, thickness, halfD * 2)
  mk(-halfW - e, 0, thickness, halfD * 2)
}

function addSoccerGoal(scene: THREE.Scene, x: number, postMat: THREE.Material, width = 3.2, postH = 1.15) {
  const postW = 0.22
  const g = new THREE.Group()
  const left = new THREE.Mesh(new THREE.BoxGeometry(postW, postH, postW), postMat)
  left.position.set(0, postH / 2, -width / 2)
  const right = new THREE.Mesh(new THREE.BoxGeometry(postW, postH, postW), postMat)
  right.position.set(0, postH / 2, width / 2)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(postW, postW, width + postW), postMat)
  bar.position.set(0, postH, 0)
  g.add(left, right, bar)
  g.position.set(x, 0, 0)
  scene.add(g)
}

function thinLine(scene: THREE.Scene, x1: number, z1: number, x2: number, z2: number, y: number, color = 0xffffff) {
  const dx = x2 - x1
  const dz = z2 - z1
  const len = Math.hypot(dx, dz) || 0.01
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15, roughness: 0.9 }),
  )
  m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2)
  m.rotation.y = Math.atan2(dz, dx)
  scene.add(m)
}

function resetAgentCube(agents: THREE.Mesh[], size = 0.34, yScale = 0.34) {
  agents.forEach((m) => {
    m.scale.set(1, 1, 1)
    if (m.material instanceof THREE.MeshStandardMaterial) m.material.dispose()
    m.geometry?.dispose()
    m.geometry = new THREE.BoxGeometry(size, yScale, size)
    m.material = stdMat(0x4fc3f7)
  })
}

function resetAgentCapsule(agents: THREE.Mesh[], radius = 0.22, length = 0.52) {
  agents.forEach((m) => {
    m.scale.set(1, 1, 1)
    if (m.material instanceof THREE.MeshStandardMaterial) m.material.dispose()
    m.geometry?.dispose()
    m.geometry = new THREE.CapsuleGeometry(radius, length, 6, 10)
    m.material = stdMat(0x90caf9)
  })
}

function resetAgentBlock(agents: THREE.Mesh[], w: number, h: number, d: number) {
  agents.forEach((m) => {
    m.scale.set(1, 1, 1)
    if (m.material instanceof THREE.MeshStandardMaterial) m.material.dispose()
    m.geometry?.dispose()
    m.geometry = new THREE.BoxGeometry(w, h, d)
    m.material = stdMat(0x64b5f6)
  })
}

/** Unity Editor–style orbit: GridWorld top-down, sports sideline, locomotion chase. */
export function applyCameraForKind(camera: THREE.PerspectiveCamera, kind: BattlegroundKind) {
  switch (kind) {
    case 'gridworld':
      camera.position.set(0, 14.5, 0.05)
      camera.lookAt(0, 0, 0)
      break
    case 'match-3':
      camera.position.set(0, 9.2, 7.4)
      camera.lookAt(0, 0, 0)
      break
    case 'soccer-twos':
    case 'strikers-vs-goalie':
      camera.position.set(0, 11.5, 17.5)
      camera.lookAt(0, 0.2, 0)
      break
    case 'food-collector':
      camera.position.set(-1.2, 12, 11)
      camera.lookAt(0, 0.2, 0)
      break
    case 'wall-jump':
      camera.position.set(-6.5, 6.2, 8.5)
      camera.lookAt(1.5, 1.8, 0)
      break
    case 'pyramids':
      camera.position.set(-5.5, 8.5, 8)
      camera.lookAt(0, 0.4, 0)
      break
    case 'push-block':
    case 'cooperative-push-block':
      camera.position.set(7.2, 9.5, 8.2)
      camera.lookAt(0, 0.35, 0)
      break
    case 'walker':
    case 'crawler':
    case 'worm':
      camera.position.set(-4.5, 5.8, 11)
      camera.lookAt(0.5, 0.6, 1)
      break
    default:
      camera.position.set(0, 8.8, 14.8)
      camera.lookAt(0, 0.35, 0)
  }
}

const TEAM_STRIKER = 0x1976d2
const TEAM_GOALIE = 0x78909c

export function setupEnvironment(kind: BattlegroundKind, scene: THREE.Scene, ground: THREE.Mesh, agents: THREE.Mesh[], refs: EnvRefs) {
  const gmat = ground.material as THREE.MeshStandardMaterial
  const setGround = (w: number, d: number, hex: number, rough = 0.9) => {
    ground.geometry.dispose()
    ground.geometry = new THREE.PlaneGeometry(w, d)
    gmat.color.setHex(hex)
    gmat.roughness = rough
    gmat.metalness = 0.02
  }

  const push = (o: THREE.Object3D) => scene.add(o)

  refs.gridHalf = 4

  switch (kind) {
    case 'gridworld': {
      setGround(14, 14, 0xbfc8d4, 0.92)
      const n = 10
      const cell = 1
      const off = (-n * cell) / 2 + cell / 2
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const alt = (i + j) % 2 === 0
          const tile = new THREE.Mesh(
            new THREE.PlaneGeometry(cell * 0.998, cell * 0.998),
            stdMat(alt ? 0xd1d9e3 : 0xc2cad6, { roughness: 0.94 }),
          )
          tile.rotation.x = -Math.PI / 2
          tile.position.set(off + i * cell, 0.008, off + j * cell)
          tile.receiveShadow = true
          push(tile)
        }
      }
      const grid = new THREE.GridHelper(n * cell + 0.2, n, 0x6b7280, 0x9aa4b2)
      grid.position.y = 0.018
      push(grid)
      refs.gridHalf = 4
      addPerimeterWalls(scene, refs, 5.15, 5.15, 0.55, 0.24)
      const goalH = 0.42
      refs.goalGood = new THREE.Mesh(new THREE.BoxGeometry(0.92, goalH, 0.92), stdMat(0x43a047, { emissive: 0x1b5e20, emissiveIntensity: 0.35 }))
      refs.goalGood.position.set(3, goalH / 2 + 0.01, 3)
      push(refs.goalGood)
      refs.goalBad = new THREE.Mesh(new THREE.BoxGeometry(0.92, goalH, 0.92), stdMat(0xe53935, { emissive: 0x5c1010, emissiveIntensity: 0.28 }))
      refs.goalBad.position.set(-3, goalH / 2 + 0.01, -3)
      push(refs.goalBad)
      resetAgentCube(agents, 0.38, 0.38)
      agents.forEach((a, i) => {
        ;(a.material as THREE.MeshStandardMaterial).color.setHex([0x29b6f6, 0xab47bc, 0xffca28, 0x66bb6a][i % 4])
      })
      break
    }
    case 'push-block': {
      setGround(16, 16, 0xa8b0bc, 0.91)
      addPerimeterWalls(scene, refs, 7.5, 7.5, 0.65, 0.28)
      refs.crate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 1.6), stdMat(0x8d6e63, { roughness: 0.72 }))
      refs.crate.position.set(0, 0.48, 0)
      refs.crate.castShadow = true
      push(refs.crate)
      refs.goalStrip = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), stdMat(0x66bb6a, { emissive: 0x2e7d32, emissiveIntensity: 0.55 }))
      refs.goalStrip.rotation.x = -Math.PI / 2
      refs.goalStrip.position.set(4.8, 0.04, 0)
      push(refs.goalStrip)
      resetAgentCube(agents, 0.36, 0.36)
      agents.forEach((a, i) => ((a.material as THREE.MeshStandardMaterial).color.setHex(i % 2 ? 0x5c6bc0 : 0x7e57c2)))
      break
    }
    case 'cooperative-push-block': {
      setGround(18, 18, 0xa8b0bc, 0.91)
      addPerimeterWalls(scene, refs, 8.2, 8.2, 0.65, 0.28)
      const mkCrate = (sx: number, sy: number, sz: number, x: number, z: number, hex: number) => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), stdMat(hex, { roughness: 0.7 }))
        c.position.set(x, sy / 2 + 0.02, z)
        c.castShadow = true
        push(c)
        return c
      }
      refs.crate = mkCrate(1.25, 0.85, 1.25, -0.8, 0.6, 0xa1887f)
      refs.coopCrate = mkCrate(1.0, 0.7, 1.0, 0.9, -0.4, 0xbcaaa4)
      refs.coopCrate2 = mkCrate(0.75, 0.55, 0.75, 0.2, 1.1, 0xd7ccc8)
      refs.goalStrip = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), stdMat(0x66bb6a, { emissive: 0x2e7d32, emissiveIntensity: 0.5 }))
      refs.goalStrip.rotation.x = -Math.PI / 2
      refs.goalStrip.position.set(5.5, 0.04, 0)
      push(refs.goalStrip)
      resetAgentCube(agents, 0.34, 0.34)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0x7986cb)))
      break
    }
    case 'wall-jump': {
      setGround(18, 18, 0x90a4ae, 0.9)
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 8), wallMat())
      wall.position.set(4.2, 2.6, 0)
      wall.castShadow = true
      push(wall)
      refs.walls.push(wall)
      const platZ = [-2.8, -0.2, 2.6]
      const platY = [0.14, 1.35, 2.75]
      platZ.forEach((z, i) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 2.2), stdMat(0x78909c, { roughness: 0.85 }))
        p.position.set(-0.8, platY[i], z)
        p.receiveShadow = true
        push(p)
        refs.platforms.push(p)
      })
      const goalPlat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 2), stdMat(0x66bb6a, { emissive: 0x1b5e20, emissiveIntensity: 0.25 }))
      goalPlat.position.set(-3.2, 3.95, 0)
      push(goalPlat)
      refs.platforms.push(goalPlat)
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.12), stdMat(0x43a047, { emissive: 0x14532d, emissiveIntensity: 0.3 }))
      flag.position.set(-3.2, 4.55, 0.5)
      push(flag)
      resetAgentCube(agents, 0.32, 0.32)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0x42a5f5)))
      break
    }
    case 'soccer-twos': {
      setGround(24, 16, 0x4caf50, 0.88)
      const lineY = 0.045
      thinLine(scene, -10, 0, 10, 0, lineY)
      thinLine(scene, -12, -8, 12, -8, lineY)
      thinLine(scene, -12, 8, 12, 8, lineY)
      thinLine(scene, -12, -8, -12, 8, lineY)
      thinLine(scene, 12, -8, 12, 8, lineY)
      const circle = new THREE.Mesh(
        new THREE.RingGeometry(1.55, 1.7, 48),
        new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9 }),
      )
      circle.rotation.x = -Math.PI / 2
      circle.position.y = 0.042
      push(circle)
      const post = stdMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.06 })
      addSoccerGoal(scene, -11.2, post)
      addSoccerGoal(scene, 11.2, post)
      refs.ball = soccerBallGroup()
      refs.ball.position.set(0, 0.46, 0)
      push(refs.ball)
      resetAgentCube(agents, 0.34, 0.42)
      const half = Math.ceil(agents.length / 2)
      agents.forEach((a, i) => {
        ;(a.material as THREE.MeshStandardMaterial).color.setHex(i < half ? 0x1e88e5 : 0xe53935)
      })
      break
    }
    case 'strikers-vs-goalie': {
      setGround(20, 14, 0x43a047, 0.88)
      thinLine(scene, -8, 0, 8, 0, 0.045)
      const post = stdMat(0xf5f5f5, { emissive: 0xffffff, emissiveIntensity: 0.05 })
      addSoccerGoal(scene, -9.1, post, 3.6, 1.05)
      refs.ball = soccerBallGroup()
      refs.ball.position.set(0, 0.46, 1.5)
      push(refs.ball)
      agents.forEach((a, i) => {
        if (i === agents.length - 1) {
          resetAgentBlock([a], 0.55, 1.15, 0.45)
          ;(a.material as THREE.MeshStandardMaterial).color.setHex(TEAM_GOALIE)
        } else {
          resetAgentCube([a], 0.32, 0.38)
          ;(a.material as THREE.MeshStandardMaterial).color.setHex(TEAM_STRIKER)
        }
      })
      break
    }
    case 'food-collector': {
      setGround(22, 22, 0x78909c, 0.9)
      const spread = 9
      for (let i = 0; i < 32; i++) {
        const f = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 10, 8),
          stdMat(0x66bb6a, { emissive: 0x1b5e20, emissiveIntensity: 0.4 }),
        )
        const u = (i * 0.6180339) % 1
        const v = (i * 0.381966) % 1
        f.position.set((u - 0.5) * 2 * spread, 0.16, (v - 0.5) * 2 * spread)
        push(f)
        refs.foods.push(f)
      }
      for (let i = 0; i < 14; i++) {
        const h = new THREE.Mesh(
          new THREE.SphereGeometry(0.17, 10, 8),
          stdMat(0xef5350, { emissive: 0x5c1010, emissiveIntensity: 0.35 }),
        )
        h.position.set((Math.sin(i * 2.1) * 0.5 + 0.3) * spread, 0.17, (Math.cos(i * 1.7) * 0.5 - 0.2) * spread)
        push(h)
        refs.hazards.push(h)
      }
      resetAgentCapsule(agents)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0x90caf9)))
      refs.laserBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6),
        new THREE.MeshStandardMaterial({
          color: 0x81d4fa,
          emissive: 0x0277bd,
          emissiveIntensity: 0.55,
          transparent: true,
          opacity: 0.85,
        }),
      )
      refs.laserBeam.rotation.x = Math.PI / 2
      push(refs.laserBeam)
      break
    }
    case 'match-3': {
      setGround(12, 10, 0x5d4037, 0.92)
      const board = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 5.6), stdMat(0x3e2723, { roughness: 0.95 }))
      board.position.set(0, 0.08, 0)
      push(board)
      const cols = [0xec407a, 0x42a5f5, 0xffca28, 0x66bb6a, 0xab47bc, 0xff7043]
      const cols8 = 8
      const rows8 = 8
      const step = 0.58
      const ox = (-(cols8 - 1) * step) / 2
      const oz = (-(rows8 - 1) * step) / 2
      for (let x = 0; x < cols8; x++) {
        for (let z = 0; z < rows8; z++) {
          const gem = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 14, 12),
            stdMat(cols[(x + z * 2) % cols.length], { emissive: 0x222222, emissiveIntensity: 0.08, roughness: 0.25, metalness: 0.15 }),
          )
          gem.position.set(ox + x * step, 0.22, oz + z * step)
          push(gem)
          refs.matchCells.push(gem)
        }
      }
      resetAgentCube(agents, 0.3, 0.3)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0xb0bec5)))
      break
    }
    case 'walker': {
      setGround(28, 20, 0x78909c, 0.9)
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(14, 0.14, 6), stdMat(0x607d8b, { roughness: 0.88 }))
      ramp.position.set(0, 0.07, -0.5)
      ramp.rotation.x = 0.14
      ramp.receiveShadow = true
      push(ramp)
      refs.platforms.push(ramp)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), stdMat(0xb0bec5))
      pole.position.set(5.5, 0.9, 3)
      push(pole)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 8, 24), stdMat(0xffca28, { emissive: 0x795548, emissiveIntensity: 0.35 }))
      ring.rotation.x = Math.PI / 2
      ring.position.set(5.5, 1.35, 3)
      push(ring)
      resetAgentBlock(agents, 0.22, 0.95, 0.38)
      agents.forEach((a, i) => {
        ;(a.material as THREE.MeshStandardMaterial).color.setHex([0xff8f00, 0xfb8c00, 0xffa726][i % 3])
      })
      break
    }
    case 'crawler': {
      setGround(24, 18, 0x78909c, 0.9)
      resetAgentBlock(agents, 0.55, 0.22, 0.85)
      agents.forEach((a, i) => {
        ;(a.material as THREE.MeshStandardMaterial).color.setHex([0xff6f00, 0x424242, 0xff8f00][i % 3])
      })
      break
    }
    case 'worm': {
      setGround(22, 18, 0x78909c, 0.9)
      resetAgentBlock(agents, 0.38, 0.28, 0.95)
      agents.forEach((a, i) => {
        ;(a.material as THREE.MeshStandardMaterial).color.setHex([0x7cb342, 0x558b2f, 0x9ccc65][i % 3])
      })
      break
    }
    case 'pyramids': {
      setGround(20, 20, 0xd7ccc8, 0.9)
      refs.pyramidSwitch = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.22, 16), stdMat(0x00bcd4, { emissive: 0x006064, emissiveIntensity: 0.35 }))
      refs.pyramidSwitch.position.set(-2.8, 0.12, 2.4)
      push(refs.pyramidSwitch)
      refs.goalGood = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.65), stdMat(0xffd54f, { emissive: 0xff8f00, emissiveIntensity: 0.45 }))
      refs.goalGood.position.set(0, 0.22, 0)
      push(refs.goalGood)
      const brick = (x: number, z: number, y: number, sx: number, sy: number, sz: number) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), stdMat(0x8d6e63, { roughness: 0.8 }))
        b.position.set(x, y, z)
        push(b)
        refs.pyramids.push(b)
      }
      brick(2.2, 2.2, 0.2, 1.8, 0.35, 1.8)
      brick(2.2, 2.2, 0.55, 1.4, 0.35, 1.4)
      brick(2.2, 2.2, 0.88, 1.0, 0.35, 1.0)
      brick(-2.4, -1.8, 0.2, 1.6, 0.35, 1.6)
      brick(-2.4, -1.8, 0.52, 1.2, 0.35, 1.2)
      brick(-1.5, 2.8, 0.2, 1.4, 0.35, 1.0)
      brick(-1.5, 2.8, 0.48, 1.0, 0.35, 0.75)
      resetAgentCube(agents, 0.32, 0.32)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0x5c6bc0)))
      break
    }
    case 'sorter': {
      setGround(18, 14, 0xb0bec5, 0.9)
      const belt = new THREE.Mesh(new THREE.BoxGeometry(10, 0.08, 2.2), stdMat(0x546e7a, { roughness: 0.85 }))
      belt.position.set(0, 0.06, 1.5)
      push(belt)
      const colors = [0x1e88e5, 0xe53935, 0x43a047]
      ;[-2.4, 0, 2.4].forEach((x, i) => {
        const bin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 1.5), stdMat(colors[i]))
        bin.position.set(x, 0.3, -2.2)
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 6, 24), stdMat(0x263238))
        rim.rotation.x = Math.PI / 2
        rim.position.set(x, 0.58, -2.2)
        push(bin)
        push(rim)
        refs.sorterBins.push(bin)
      })
      resetAgentCube(agents, 0.3, 0.28)
      agents.forEach((a) => ((a.material as THREE.MeshStandardMaterial).color.setHex(0xeceff1)))
      break
    }
    default: {
      setGround(40, 40, 0x1a2332, 0.92)
      resetAgentBlock(agents, 0.45, 0.95, 0.45)
    }
  }
}

export function tickEnvironment(kind: BattlegroundKind, t: number, agents: THREE.Mesh[], refs: EnvRefs, camRig: THREE.Group) {
  camRig.rotation.y += kind === 'gridworld' || kind === 'match-3' ? 0.0008 : 0.0016

  const gh = refs.gridHalf
  const step = 1

  if (kind === 'gridworld') {
    agents.forEach((a, i) => {
      const gx = Math.max(-gh, Math.min(gh, Math.round(Math.sin(t * 0.42 + i * 0.73) * gh)))
      const gz = Math.max(-gh, Math.min(gh, Math.round(Math.cos(t * 0.35 + i * 1.1) * gh)))
      a.position.set(gx * step, 0.19, gz * step)
      a.rotation.y = t * 0.85 + i * 0.5
    })
    return
  }

  if (kind === 'push-block') {
    const push = Math.sin(t * 0.82) * 2.4
    agents.forEach((a, i) => {
      const side = i % 2 === 0 ? -1 : 1
      a.position.set(side * 2.1, 0.2, 0.9 + Math.sin(t * 1.05 + i) * 0.45)
      a.rotation.y = side * t * 0.32
    })
    if (refs.crate) refs.crate.position.x = push
    return
  }

  if (kind === 'cooperative-push-block') {
    const push = Math.sin(t * 0.75) * 1.8
    agents.forEach((a, i) => {
      const ang = (i / agents.length) * Math.PI * 2 + t * 0.4
      a.position.set(Math.cos(ang) * 2.2, 0.2, Math.sin(ang) * 2.2)
    })
    if (refs.crate) refs.crate.position.set(push * 0.35 - 0.5, refs.crate.position.y, 0.6 + Math.sin(t) * 0.15)
    if (refs.coopCrate) refs.coopCrate.position.set(push * 0.5 + 0.4, refs.coopCrate.position.y, -0.35)
    if (refs.coopCrate2) refs.coopCrate2.position.set(push * 0.65, refs.coopCrate2.position.y, 0.9)
    return
  }

  if (kind === 'wall-jump') {
    agents.forEach((a, i) => {
      const px = Math.sin(t * 0.95 + i) * 1.1 - 0.6
      const py = 0.2 + Math.max(0, Math.sin(t * 2.35 + i)) * 2.85
      const pz = -2.6 + (i / Math.max(1, agents.length - 1)) * 5.2
      a.position.set(px, py, pz)
    })
    return
  }

  if (kind === 'soccer-twos') {
    const bx = Math.sin(t * 0.5) * 5.5
    const bz = Math.cos(t * 0.44) * 3.2
    if (refs.ball) refs.ball.position.set(bx, 0.46 + Math.sin(t * 3) * 0.03, bz)
    const half = Math.ceil(agents.length / 2)
    agents.forEach((a, i) => {
      const team = i < half ? 1 : -1
      const ang = (i / agents.length) * Math.PI * 2 + t * 0.36
      const r = 3.1 + (i % 2) * 0.95
      a.position.set(bx + Math.cos(ang) * r * team, 0.22, bz + Math.sin(ang) * r * 0.82)
      a.lookAt(bx, 0.35, bz)
    })
    return
  }

  if (kind === 'strikers-vs-goalie') {
    const bx = Math.sin(t * 0.62) * 2.4
    const bz = 0.8 + Math.cos(t * 0.48) * 1.4
    if (refs.ball) refs.ball.position.set(bx, 0.46 + Math.sin(t * 2.8) * 0.02, bz)
    agents.forEach((a, i) => {
      if (i === agents.length - 1) {
        a.position.set(Math.sin(t * 0.4) * 1.0, 0.575, -3.85)
        a.lookAt(bx, 0.4, bz)
      } else {
        a.position.set(bx + Math.cos(t * 1.2 + i) * 1.8, 0.19, bz + 1.1)
        a.lookAt(-9.1, 0.55, 0)
      }
    })
    return
  }

  if (kind === 'food-collector') {
    agents.forEach((a, i) => {
      const ang = t * 0.46 + i * 1.35
      a.position.set(Math.cos(ang) * 4.8, 0.35, Math.sin(ang * 0.9) * 4.8)
      a.rotation.y = -ang
    })
    refs.foods.forEach((f, i) => {
      f.position.y = 0.16 + Math.sin(t * 2.4 + i * 0.2) * 0.05
    })
    if (refs.laserBeam && agents[0]) {
      const ag = agents[0]
      const fx = Math.sin(ag.rotation.y)
      const fz = Math.cos(ag.rotation.y)
      refs.laserBeam.position.set(ag.position.x + fx * 0.88, ag.position.y + 0.08, ag.position.z + fz * 0.88)
      refs.laserBeam.rotation.order = 'YXZ'
      refs.laserBeam.rotation.y = ag.rotation.y
      refs.laserBeam.rotation.x = Math.PI / 2
    }
    return
  }

  if (kind === 'match-3') {
    refs.matchCells.forEach((c, i) => {
      c.position.y = 0.22 + Math.sin(t * 2.2 + i * 0.12) * 0.04
    })
    agents.forEach((a, i) => {
      a.position.set(-2.8 + (i % 4) * 1.2, 0.2, 4.2)
    })
    return
  }

  if (kind === 'walker') {
    agents.forEach((a, i) => {
      const z = -0.8 + (i / Math.max(1, agents.length - 1)) * 3.2
      a.position.set(Math.sin(t * 1.28 + i) * 2.2, 0.52 + Math.abs(Math.sin(t * 2.85 + i)) * 0.22, z)
      a.rotation.z = Math.sin(t * 2 + i) * 0.14
    })
    return
  }

  if (kind === 'crawler') {
    agents.forEach((a, i) => {
      const lag = i * 0.38
      a.position.set(Math.sin(t * 0.78 + lag) * 4.2, 0.15, Math.cos(t * 0.62 + lag) * 2.6)
      a.rotation.y = t * 0.48 + lag
    })
    return
  }

  if (kind === 'worm') {
    agents.forEach((a, i) => {
      const s = t * 1.15 - i * 0.42
      a.position.set(Math.sin(s) * 3.2, 0.16, Math.cos(s * 0.88) * 2.6)
      a.rotation.y = s
    })
    return
  }

  if (kind === 'pyramids') {
    if (refs.pyramidSwitch) refs.pyramidSwitch.rotation.y = t * 0.8
    agents.forEach((a, i) => {
      const ang = (i / agents.length) * Math.PI * 2 + t * 0.2
      a.position.set(Math.cos(ang) * 2.6, 0.2, Math.sin(ang) * 2.6)
    })
    return
  }

  if (kind === 'sorter') {
    agents.forEach((a, i) => {
      const x = -2.4 + (i % 3) * 2.4
      a.position.set(x + Math.sin(t * 1.1 + i) * 0.2, 0.18 + Math.sin(t * 2.1 + i) * 0.12, 1.8)
    })
    return
  }

  agents.forEach((a, i) => {
    const ang = (i / agents.length) * Math.PI * 2
    const r = 4 + Math.sin(t * 0.28 + i) * 1.1
    a.position.set(Math.cos(ang + t * 0.22) * r, 0.48, Math.sin(ang + t * 0.22) * r)
    a.rotation.y = t + i
  })
}
