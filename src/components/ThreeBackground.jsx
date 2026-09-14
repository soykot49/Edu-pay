import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A quiet, single animated moment for the login screen: a slowly tumbling
// low-poly wireframe form, rendered in the app's own teal ink so it reads
// as part of the ledger motif rather than generic decoration.
export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 7)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()

    const geo = new THREE.IcosahedronGeometry(2.3, 1)
    const wire = new THREE.WireframeGeometry(geo)
    const line = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({ color: 0x1f8a70, transparent: true, opacity: 0.35 }))
    group.add(line)

    const dotsGeo = new THREE.IcosahedronGeometry(2.3, 1)
    const dots = new THREE.Points(dotsGeo, new THREE.PointsMaterial({ color: 0xce8f22, size: 0.045, transparent: true, opacity: 0.55 }))
    group.add(dots)

    scene.add(group)

    let frameId
    function animate() {
      if (!reduceMotion) {
        group.rotation.y += 0.0022
        group.rotation.x += 0.0009
      }
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      mount.removeChild(renderer.domElement)
      geo.dispose()
      wire.dispose()
      dotsGeo.dispose()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}
