import './style.css';
import { gsap, ScrollTrigger } from "gsap/all";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats-js';
import { randInt } from 'three/src/math/MathUtils';

var statsa = new Stats();
let mouseX;
// statsa.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom


const initCursor = () => {
    const cursor = document.querySelector('.cursor');
    const cursorinner = document.querySelector('.cursor-follower');

    const handleMouseMove = (e) => {
        const x = e.clientX;
        const y = e.clientY;
        mouseX = ( x / window.innerWidth ) * 2 - 1;
        cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        cursorinner.style.left = `${x}px`;
        cursorinner.style.top = `${y}px`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const handleLinkHover = (link) => {
        link.addEventListener('mouseover', () => {
            cursor.classList.add('active');
            cursorinner.classList.add('active');
        });

        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorinner.classList.remove('active');
        });
    };

    document.querySelectorAll('a').forEach(handleLinkHover);
};

const initResponsiveClass = () => {
    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('device', isMobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
};

const initAnimation = () => {
    const strings = [
        "linear-gradient(90deg, rgb(255, 218, 122) 0%, rgb(255, 105, 105) 100%)",
        "linear-gradient(90deg, rgb(242, 159, 255) 0%, rgb(124, 153, 255) 100%)",
        "linear-gradient(90deg, rgb(100, 145, 214) 0%, rgb(67, 240, 199) 100%)"
    ];

    const codeItems = document.querySelectorAll('.code-item-colored');
    codeItems.forEach((item) => {
        item.style.background = strings[Math.floor(Math.random() * strings.length)];
    });

    gsap.from(".code-item", {
        x: document.body.clientWidth / 4,
        opacity: 0,
        stagger: 0.1,
    });

    gsap.from(".title", {
        x: document.body.clientWidth / 4,
        opacity: 0,
        delay: 1.2
    });
};

const initThree = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(6, window.innerWidth / window.innerHeight, 0.1, 800);
    let cameraPos = new THREE.Vector3(150, 200, 400);
    camera.position.copy(cameraPos);
    camera.lookAt(scene.position);
    scene.add(camera);
    
    // controls
    // const controls = new OrbitControls(camera, document.body);
    // controls.enableDamping = true;
    // controls.enableZoom = false;
    // controls.enablePan = false;
    // controls.maxPolarAngle = 1.2120256565243244
    // controls.minPolarAngle = 1.2120256565243244

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
		antialias: true,
		logarithmicDepthBuffer: true,
        canvas: document.querySelector('canvas.webgl'),
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // physical renderer
    renderer.physicallyCorrectLights = true;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.toneMappingExposure = 4;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    let defaultOpts = {
        sideLength: 10,
        amount: 15,
        radius: 6,
        thickness: 2,
        offset: 0.3
    };

    function createShape(innerRadius, outerRadius, fineness) {
        const outer = getPath(outerRadius, fineness, false);
        const baseShape = new THREE.Shape(outer);
        const inner = getPath(innerRadius, fineness, true);
        const baseHole = new THREE.Path(inner);
        baseShape.holes.push(baseHole);
        return baseShape;
    }
    
    // Create a path for the shape
    function getPath(radius, fineness, reverse) {
        const path = [];
        const segment = (Math.PI * 2 + .1) / fineness;
    
        for (let i = 0; i <= fineness; i++) {
            const theta = segment * (reverse ? fineness - i : i);
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            path.push(new THREE.Vector2(x, y));
        }
    
        return path;
    }
    
    // Create the tube geometry
    function Tube(amount, radius, thickness) {
        const shape = createShape(radius - thickness, radius, 32);
        const props = {
            steps: 2,
            depth: 5,
            bevelEnabled: true,
            bevelThickness: 0.3,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 1
        };
        const geometry = new THREE.ExtrudeGeometry(shape, props);
        geometry.center();
        geometry.computeVertexNormals();
        // rotate the geometry so that the tube is standing up
        geometry.rotateX(Math.PI / 2);
        return geometry;
    }

    // Define the grid size and the spacing between elements
const gridSize = 10;
const spacing = 6;

// Define materials and geometry outside the loop
const materials = [
    new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 1.0,
        metalness: 0.0,
        emissive: 0x000000
    }),
    new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.6,
        metalness: 0.0,
        emissive: 0x000000
    })
];
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let max = 0;
const spheres = [];
const lights = [];
const mesh = new THREE.Group();
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 13; j++) {
        // Use the same materials and geometry for each sphere
        let sphere;

        // random boolean
        const randomBoolean = Math.random() >= 0.5;

        const group = new THREE.Group();
        let light;
        if (randomBoolean && i >= 3 && j <= 8 && j>=6 && max <= 5) {
            // Create the point light
            light = new THREE.PointLight(0xff0000);
            light.intensity = 4.0;
            light.distance = 4;
            light.decay = 1.0;
            light.castShadow = false; // Disable shadows
            light.position.set(0, 0, 0);
            // add light helper
            group.add(light);
            lights.push(light);


            // Create the sphere
            sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
            spheres.push(sphere);

            gsap.fromTo(sphere.position, {
                y: 0,
            }, {
                y: 10,
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                delay: (i + j) * 0.1
            });

            gsap.fromTo(light.position, {
                y: 0,
            }, {
                y: 10,
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                delay: (i + j) * 0.1
            });
            
            max++;
        }


        // Create the group and add the sphere and light        group.add(sphere);

        // Position the group based on the grid coordinates
        group.position.set(i * 2 * spacing, 0, j * 2 * spacing);
        // Add the group to the scene
        // Animate the group
        gsap.to(group.position, {
            y: 10,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
            delay: (i + j) * 0.1
        });

        // Create the tube
        const tube = Tube(4, 6, 2);
        const tubeMesh = new THREE.Mesh(tube, materials);
        tubeMesh.scale.set(0.5, 0.5, 0.5);

        // Position the tube based on the grid coordinates
        // tubeMesh.position.set(i * spacing, 0, j * spacing);

        // Add the tube to the scene
        group.add(tubeMesh);
        mesh.add(group);
    }
}

    // on click object threejs
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (event) => {
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects( mesh.children, true );
        for ( let i = 0; i < intersects.length; i ++ ) {
            let light = new THREE.PointLight(0xff0000);
            light.intensity = 4.0;
            light.distance = 4;
            light.decay = 1.0;
            light.castShadow = false; // Disable shadows
            light.position.set(0,0,0);
            // add light helper
            intersects[i].object.parent.add(light);
            lights.push(light);
            let sphere = new THREE.Mesh(geometry, material);
            intersects[i].object.parent.add(sphere);
            spheres.push(sphere);
            gsap.fromTo(sphere.position, {
                y: 0,
            }, {
                y: 10,
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
            });

            gsap.fromTo(light.position, {
                y: 0,
            }, {
                y: 10,
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
            });
            
            if (lights.length > 5) {
                lights[0].parent.remove(lights[0]);
                // remove first element of lights array
                lights.shift();
                spheres[0].parent.remove(spheres[0]);
                spheres.shift();
            }
        }
    }
    document.addEventListener( 'click', onClick, false );



    // set mesh group rotation point to center
    scene.add(mesh);
    mesh.position.x = -20;
    mesh.position.y = 0;
    mesh.position.z = -60;

    document.addEventListener('mousemove', function(e){
        let mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
        gsap.to(mesh.position, {
            x: -20 - mouseX * 10,
            duration: 1,
            ease: "linear",
        });
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;      
    },false)

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.03);
    scene.add(ambientLight);

    const sun = new THREE.SpotLight(0xffffff); // 0.1
    sun.intensity = 40;
	sun.distance = 110;
	sun.angle = Math.PI / 2;
	sun.penumbra = 2.0;
	sun.decay = 1.0;
	sun.position.set(-50, 50, 0);
    scene.add(sun);

    // handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        statsa.begin();
        // animate color material of spheres using elapsed tim
        // get mouseX position
        

        spheres.forEach((sphere) => {
            sphere.material.color.setHSL(elapsedTime * 0.1, 0.5, 0.5);
        });
        // animate color of lights using elapsed time
        lights.forEach((light) => {
            light.color.setHSL(elapsedTime * 0.1, 0.5, 0.5);
        });

        // controls.update();
        renderer.render(scene, camera);
        statsa.end();
        requestAnimationFrame(animate);
    };

    animate();
}

initCursor();
initResponsiveClass();
initAnimation();
initThree();