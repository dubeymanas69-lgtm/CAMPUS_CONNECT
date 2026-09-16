import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
    OrbitControls,
} from "three/examples/jsm/controls/OrbitControls.js";

function GalaxyBackground() {
    const canvasRef =
        useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        // =====================================================
        // SCENE
        // =====================================================

        const scene = new THREE.Scene();

        // =====================================================
        // SIZES
        // =====================================================

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // =====================================================
        // CAMERA
        // =====================================================

        const camera =
            new THREE.PerspectiveCamera(
                75,
                sizes.width / sizes.height,
                0.1,
                100
            );

        camera.position.set(3, 3, 3);

        scene.add(camera);

        // =====================================================
        // RENDERER
        // =====================================================

        const renderer =
            new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
            });

        renderer.setSize(
            sizes.width,
            sizes.height
        );

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        renderer.setClearColor(
            0x000000,
            0
        );

        // =====================================================
        // GALAXY PARAMETERS
        // =====================================================

        const parameters = {
            count: 100000,
            size: 0.01,
            radius: 2.15,
            branches: 3,
            spin: 3,
            randomness: 5,
            randomnessPower: 4,
            insideColor: "#ff6030",
            outsideColor: "#0949f0",
        };

        // =====================================================
        // GALAXY GEOMETRY
        // =====================================================

        const geometry =
            new THREE.BufferGeometry();

        const positions =
            new Float32Array(
                parameters.count * 3
            );

        const colors =
            new Float32Array(
                parameters.count * 3
            );

        const colorInside =
            new THREE.Color(
                parameters.insideColor
            );

        const colorOutside =
            new THREE.Color(
                parameters.outsideColor
            );

        for (
            let i = 0;
            i < parameters.count;
            i++
        ) {
            const i3 = i * 3;

            // -----------------------------
            // Radius
            // -----------------------------

            const radius =
                Math.pow(
                    Math.random() *
                    parameters.randomness,
                    Math.random() *
                    parameters.radius
                );

            // -----------------------------
            // Spin
            // -----------------------------

            const spinAngle =
                radius *
                parameters.spin;

            // -----------------------------
            // Branch
            // -----------------------------

            const branchAngle =
                ((i %
                    parameters.branches) /
                    parameters.branches) *
                Math.PI *
                2;

            const negPos = [1, -1];

            // -----------------------------
            // Random X
            // -----------------------------

            const randomX =
                Math.pow(
                    Math.random(),
                    parameters.randomnessPower
                ) *
                negPos[
                Math.floor(
                    Math.random() *
                    negPos.length
                )
                ];

            // -----------------------------
            // Random Y
            // -----------------------------

            const randomY =
                Math.pow(
                    Math.random(),
                    parameters.randomnessPower
                ) *
                negPos[
                Math.floor(
                    Math.random() *
                    negPos.length
                )
                ];

            // -----------------------------
            // Random Z
            // -----------------------------

            const randomZ =
                Math.pow(
                    Math.random(),
                    parameters.randomnessPower
                ) *
                negPos[
                Math.floor(
                    Math.random() *
                    negPos.length
                )
                ];

            // -----------------------------
            // Position
            // -----------------------------

            positions[i3] =
                Math.cos(
                    branchAngle +
                    spinAngle
                ) *
                radius +
                randomX;

            positions[i3 + 1] =
                randomY;

            positions[i3 + 2] =
                Math.sin(
                    branchAngle +
                    spinAngle
                ) *
                radius +
                randomZ;

            // -----------------------------
            // Color
            // -----------------------------

            const mixedColor =
                colorInside.clone();

            mixedColor.lerp(
                colorOutside,
                Math.random() *
                (radius /
                    parameters.radius)
            );

            colors[i3] =
                mixedColor.r;

            colors[i3 + 1] =
                mixedColor.g;

            colors[i3 + 2] =
                mixedColor.b;
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );

        // =====================================================
        // MATERIAL
        // =====================================================

        const material =
            new THREE.PointsMaterial({
                size: parameters.size,
                sizeAttenuation: true,
                depthWrite: false,
                blending:
                    THREE.AdditiveBlending,
                vertexColors: true,
            });

        // =====================================================
        // GALAXY
        // =====================================================

        const points =
            new THREE.Points(
                geometry,
                material
            );

        scene.add(points);

        // =====================================================
        // ORBIT CONTROLS
        // =====================================================

        const controls =
            new OrbitControls(
                camera,
                canvas
            );

        controls.enableDamping = true;
        controls.dampingFactor = 0.06;

        // Left mouse drag
        controls.enableRotate = true;
        controls.rotateSpeed = 0.9;

        // Scroll wheel
        controls.enableZoom = true;
        controls.zoomSpeed = 1.0;

        // Disable pan
        controls.enablePan = false;

        // Zoom limits
        controls.minDistance = 1.2;
        controls.maxDistance = 12;

        // Galaxy center
        controls.target.set(
            0,
            0,
            0
        );

        controls.update();

        // =====================================================
        // MOUSE / POINTER MOVEMENT
        // =====================================================

        let mouseX = 0;
        let mouseY = 0;

        // Smoothed values
        let currentMouseX = 0;
        let currentMouseY = 0;

        const handlePointerMove = (
            event: PointerEvent
        ) => {
            // Normalize pointer position
            // from -1 to +1

            mouseX =
                (event.clientX /
                    window.innerWidth) *
                2 -
                1;

            mouseY =
                (event.clientY /
                    window.innerHeight) *
                2 -
                1;
        };

        window.addEventListener(
            "pointermove",
            handlePointerMove
        );

        // =====================================================
        // RESIZE
        // =====================================================

        const handleResize = () => {
            sizes.width =
                window.innerWidth;

            sizes.height =
                window.innerHeight;

            camera.aspect =
                sizes.width /
                sizes.height;

            camera.updateProjectionMatrix();

            renderer.setSize(
                sizes.width,
                sizes.height
            );

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio,
                    2
                )
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        // =====================================================
        // ANIMATION
        // =====================================================

        const clock =
            new THREE.Clock();

        let animationFrame = 0;

        const tick = () => {
            const elapsedTime =
                clock.getElapsedTime();

            // =================================================
            // SMOOTH MOUSE FOLLOW
            // =================================================

            currentMouseX +=
                (mouseX - currentMouseX) *
                0.035;

            currentMouseY +=
                (mouseY - currentMouseY) *
                0.035;

            // =================================================
            // AUTOMATIC GALAXY ROTATION
            // =================================================

            const autoY =
                elapsedTime * 0.08;

            const autoX =
                Math.sin(
                    elapsedTime * 0.18
                ) * 0.012;

            // =================================================
            // MOUSE-BASED GALAXY MOVEMENT
            // =================================================

            const mouseRotationY =
                currentMouseX * 0.1;

            const mouseRotationX =
                currentMouseY * 0.10;

            // Smoothly combine automatic rotation
            // with mouse movement.

            points.rotation.y =
                autoY +
                mouseRotationY;

            points.rotation.x =
                autoX +
                mouseRotationX;

            // Slight Z movement for a more
            // noticeable parallax effect.

            points.rotation.z =
                currentMouseX * 0.18;

            // =================================================
            // ORBIT CONTROLS
            // =================================================

            controls.update();

            // =================================================
            // RENDER
            // =================================================

            renderer.render(
                scene,
                camera
            );

            animationFrame =
                requestAnimationFrame(
                    tick
                );
        };

        tick();

        // =====================================================
        // CLEANUP
        // =====================================================

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            window.removeEventListener(
                "pointermove",
                handlePointerMove
            );

            controls.dispose();

            geometry.dispose();

            material.dispose();

            renderer.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="galaxy-background"
        />
    );
}

export default GalaxyBackground;