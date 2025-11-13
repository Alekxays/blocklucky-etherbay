import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ThreeScene() {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 1000)
        camera.position.z = 3

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(el.clientWidth, el.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        // Light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambient)
        const point = new THREE.PointLight(0xffffff, 0.8)
        point.position.set(5, 5, 5)
        scene.add(point)

        // Geometry (animated torus knot with neon-like material)
        const geom = new THREE.TorusKnotGeometry(0.6, 0.18, 128, 32)
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x7b61ff),
            metalness: 0.7,
            roughness: 0.15,
            emissive: new THREE.Color(0x006bff),
            emissiveIntensity: 0.9,
            envMapIntensity: 0.5
        })
        const mesh = new THREE.Mesh(geom, mat)
        scene.add(mesh)

        // Particles (subtle neon points)
        const particlesCount = 220
        const positions = new Float32Array(particlesCount * 3)
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 6
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6
        }
        const pointsGeo = new THREE.BufferGeometry()
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const pointsMat = new THREE.PointsMaterial({ size: 0.03, color: 0x00f0ff, transparent: true, opacity: 0.85 })
        const points = new THREE.Points(pointsGeo, pointsMat)
        scene.add(points)

        // Subtle background gradient plane
        const planeGeo = new THREE.PlaneGeometry(10, 10)
        const planeMat = new THREE.MeshBasicMaterial({ color: 0x06071a, side: THREE.BackSide })
        const bg = new THREE.Mesh(planeGeo, planeMat)
        bg.position.z = -5
        scene.add(bg)

        // Resize handling
        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight)
            camera.aspect = el.clientWidth / el.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        // GSAP drive: rotate mesh and react to scroll
        const ctx = gsap.context(() => {
            gsap.to(mesh.rotation, {
                x: Math.PI * 2,
                y: Math.PI * 2,
                duration: 40,
                repeat: -1,
                ease: 'none'
            })

            // particles gentle float
            gsap.to(points.rotation, { y: Math.PI * 2, duration: 80, repeat: -1, ease: 'none' })

            ScrollTrigger.create({
                trigger: el,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
                onUpdate: (self) => {
                    // rotate based on scroll progress for interactivity
                    mesh.rotation.x = self.progress * Math.PI * 2 * 0.5
                    mesh.rotation.y = self.progress * Math.PI * 2 * 0.7
                    // subtle emissive pulse with progress
                    const t = Math.max(0.15, self.progress)
                    mat.emissiveIntensity = 0.4 + t * 1.2
                    points.material.opacity = 0.35 + t * 0.6
                }
            })
        }, el)

        let rafId
        const animate = () => {
            renderer.render(scene, camera)
            rafId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', onResize)
            ctx.revert()
            renderer.dispose()
            el.removeChild(renderer.domElement)
        }
    }, [])

    return (
        <div className="three-scene" ref={mountRef} aria-hidden="true" />
    )
}
