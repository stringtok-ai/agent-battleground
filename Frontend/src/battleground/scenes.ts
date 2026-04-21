import * as THREE from 'three'
import type { BattlegroundKind } from './gameRouting'
import { applyCameraForKind, createRefs, setupEnvironment, tickEnvironment, type EnvRefs } from './environments'

export type MountOpts = {
  kind: BattlegroundKind
  /** How many agent meshes to show (clamped). */
  agentCount: number
}

export type MountedBattleground = { dispose: () => void }

const AGENT_COLORS = [
  0x60a5fa, 0xf472b6, 0x34d399, 0xfbbf24, 0xa78bfa, 0xfb7185, 0x2dd4bf, 0xf97316,
]

function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  scene.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose()
      const m = obj.material
      if (Array.isArray(m)) m.forEach((x) => x.dispose())
      else (m as THREE.Material | undefined)?.dispose?.()
    }
  })
  renderer.dispose()
}

function makeAgent(color: number): THREE.Mesh {
  const g = new THREE.BoxGeometry(0.45, 0.95, 0.45)
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.65 })
  const mesh = new THREE.Mesh(g, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function mountBattleground(container: HTMLElement, opts: MountOpts): MountedBattleground {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0c1018)
  scene.fog = null

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120)
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    })
  } catch {
    container.innerHTML =
      '<p class="p-6 text-center text-sm text-fg-soft">WebGL could not start. Update GPU drivers or try another browser.</p>'
    return { dispose: () => {} }
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.verticalAlign = 'top'
  container.appendChild(renderer.domElement)

  const camRig = new THREE.Group()
  scene.add(camRig)
  camRig.add(camera)
  camera.position.set(0, 8.5, 15.5)
  camera.lookAt(0, 0.4, 0)

  scene.add(new THREE.HemisphereLight(0xb8cfff, 0x2a2a32, 1.05))
  const sun = new THREE.DirectionalLight(0xffffff, 1.25)
  sun.position.set(10, 20, 8)
  scene.add(sun)

  const n = Math.max(2, Math.min(8, opts.agentCount))
  const agents: THREE.Mesh[] = []
  for (let i = 0; i < n; i++) {
    const mesh = makeAgent(AGENT_COLORS[i % AGENT_COLORS.length])
    scene.add(mesh)
    agents.push(mesh)
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a2332, metalness: 0.05, roughness: 0.92 }),
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const refs: EnvRefs = createRefs()
  setupEnvironment(opts.kind, scene, ground, agents, refs)
  applyCameraForKind(camera, opts.kind)

  function animate(t: number) {
    tickEnvironment(opts.kind, t, agents, refs, camRig)
  }

  const clock = new THREE.Clock()
  let raf = 0
  function loop() {
    animate(clock.getElapsedTime())
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }

  function resize() {
    const rect = container.getBoundingClientRect()
    let w = Math.floor(rect.width)
    let h = Math.floor(rect.height)
    if (w < 64 || h < 64) {
      w = Math.max(320, container.clientWidth || container.offsetWidth || 640)
      h = Math.max(240, container.clientHeight || container.offsetHeight || 360)
    }
    w = Math.max(280, w)
    h = Math.max(240, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, true)
  }
  resize()
  const ro = new ResizeObserver(() => {
    requestAnimationFrame(resize)
  })
  ro.observe(container)
  requestAnimationFrame(() => {
    requestAnimationFrame(resize)
  })
  raf = requestAnimationFrame(loop)

  return {
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      disposeScene(scene, renderer)
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    },
  }
}
