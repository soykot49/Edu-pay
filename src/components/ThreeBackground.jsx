import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext'

// variant="hero"    → the original dark desktop panel animation, unchanged.
// variant="ambient" → a quieter full-page background used on phones/tablets,
//                     tinted to blend with whichever theme is active: soft
//                     teal/amber lines on the light paper background, or
//                     white lines with a colorful additive glow on dark.
export default function ThreeBackground({ variant = 'hero' }) {
  const mountRef = useRef(null)
  const { theme } = useTheme()
  const isAmbient = variant === 'ambient'
  const isDark = theme === 'dark'

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

    // Color/opacity tuning: identical to the original for variant="hero"
    // (dark desktop panel). The ambient variant reads the live theme so it
    // always sits quietly behind the login form instead of fighting it.
    const wireColor = isAmbient ? (isDark ? 0xffffff : 0x1f8a70) : 0x1f8a70
    const wireOpacity = isAmbient ? (isDark ? 0.22 : 0.16) : 0.35
    const dotSize = isAmbient ? (isDark ? 0.055 : 0.035) : 0.045
    const dotOpacity = isAmbient ? (isDark ? 0.9 : 0.28) : 0.55

    const geo = new THREE.IcosahedronGeometry(2.3, 1)
    const wire = new THREE.WireframeGeometry(geo)
    const line = new THREE.LineSegments(
      wire,
      new THREE.LineBasicMaterial({
        color: wireColor,
        transparent: true,
        opacity: wireOpacity,
        blending: isAmbient && isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      })
    )
    group.add(line)

    const dotsGeo = new THREE.IcosahedronGeometry(2.3, 1)
    const dots = new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({
        color: isAmbient ? 0xce8f22 : 0xce8f22,
        size: dotSize,
        transparent: true,
        opacity: dotOpacity,
        blending: isAmbient && isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      })
    )
    group.add(dots)

    // A second, teal-toned point layer only for the dark ambient background —
    // this is what gives the "colorful glow" rather than a single flat color.
    let dots2 = null
    if (isAmbient && isDark) {
      const dots2Geo = new THREE.IcosahedronGeometry(2.9, 1)
      dots2 = new THREE.Points(
        dots2Geo,
        new THREE.PointsMaterial({
          color: 0x2e9c7c,
          size: 0.05,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
        })
      )
      group.add(dots2)
    }

    // Ambient mode spans the whole screen, so scale/reposition slightly to
    // feel like a loose backdrop rather than a centered hero object.
    if (isAmbient) {
      group.scale.setScalar(1.6)
      camera.position.set(0.6, -0.3, 7)
    }

    scene.add(group)

    let frameId
    function animate() {
      if (!reduceMotion) {
        group.rotation.y += isAmbient ? 0.0009 : 0.0022
        group.rotation.x += isAmbient ? 0.0004 : 0.0009
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
      if (dots2) dots2.geometry.dispose()
    }
  }, [isAmbient, isDark])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}
