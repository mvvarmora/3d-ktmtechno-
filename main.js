import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class NeuralPortfolio {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.nodes = [];
        this.connections = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredNode = null;

        this.init();
        this.createNeuralNetwork();
        this.addStars();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 15;
        this.scene.fog = new THREE.FogExp2(0x050505, 0.05);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00f2ff, 2, 50);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }

    createNeuralNetwork() {
        const nodeData = [
            { name: 'Premura', pos: [5, 2, 0], desc: 'Advanced Agentic Platform for enterprise automation.', link: '#', color: 0x00f2ff },
            { name: 'CHIC AI', pos: [-5, 3, 2], desc: 'Revolutionizing fashion with generative AI design.', link: '#', color: 0xff00ff },
            { name: 'Lead Gen', pos: [-4, -3, -1], desc: 'High-intent marketing lead generation system.', link: '#', color: 0xffff00 },
            { name: 'Web 3D', pos: [4, -4, 3], desc: 'Interactive immersive architectures for the web.', link: '#', color: 0x00ff00 },
            { name: 'Core', pos: [0, 0, 0], desc: 'The heart of Agentic Intelligence.', link: '#', color: 0xffffff }
        ];

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

        nodeData.forEach((data) => {
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.5,
                shininess: 100
            });

            const mesh = new THREE.Mesh(sphereGeometry, material);
            mesh.position.set(...data.pos);
            mesh.userData = data;
            
            // Add a glow ring
            const ringGeo = new THREE.RingGeometry(0.6, 0.7, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: data.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            mesh.add(ring);

            this.scene.add(mesh);
            this.nodes.push(mesh);
        });

        // Connections
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 });
        this.nodes.forEach((node, i) => {
            this.nodes.forEach((target, j) => {
                if (i !== j && Math.random() > 0.6) {
                    const points = [node.position, target.position];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    this.scene.add(line);
                    this.connections.push(line);
                }
            });
        });
    }

    addStars() {
        const vertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = THREE.MathUtils.randFloatSpread(100);
            const y = THREE.MathUtils.randFloatSpread(100);
            const z = THREE.MathUtils.randFloatSpread(100);
            vertices.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.5 });
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            // Subtle camera movement
            const targetX = this.mouse.x * 2;
            const targetY = this.mouse.y * 2;
            this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        });

        window.addEventListener('click', () => {
            if (this.hoveredNode) {
                this.showPanel(this.hoveredNode.userData);
            } else {
                this.hidePanel();
            }
        });

        document.querySelector('.close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hidePanel();
        });
    }

    showPanel(data) {
        const panel = document.getElementById('info-panel');
        document.getElementById('node-title').innerText = data.name;
        document.getElementById('node-description').innerText = data.desc;
        document.getElementById('node-link').href = data.link;
        panel.classList.remove('hidden');
    }

    hidePanel() {
        document.getElementById('info-panel').classList.add('hidden');
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Rotate nodes slightly
        this.nodes.forEach(node => {
            node.rotation.y += 0.01;
            node.children[0].rotation.z += 0.02;
            
            // Floating effect
            node.position.y += Math.sin(Date.now() * 0.001 + node.position.x) * 0.005;
        });

        // Raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodes);

        if (intersects.length > 0) {
            if (this.hoveredNode !== intersects[0].object) {
                if (this.hoveredNode) this.hoveredNode.scale.set(1, 1, 1);
                this.hoveredNode = intersects[0].object;
                this.hoveredNode.scale.set(1.5, 1.5, 1.5);
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (this.hoveredNode) this.hoveredNode.scale.set(1, 1, 1);
            this.hoveredNode = null;
            document.body.style.cursor = 'default';
        }

        this.renderer.render(this.scene, this.camera);
    }
}

new NeuralPortfolio();
