import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene Setup
const scene = new THREE.Scene();

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Background Cube Map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const backgroundCubemap = cubeTextureLoader.load([
  "/textures/cubeMap/px.png",
  "/textures/cubeMap/nx.png",
  "/textures/cubeMap/py.png",
  "/textures/cubeMap/ny.png",
  "/textures/cubeMap/pz.png",
  "/textures/cubeMap/nz.png",
]);
scene.background = backgroundCubemap;

// Sun
const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), sunMaterial);
scene.add(sun);

// Planets Configuration
const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.02,
    texture: "/textures/2k_mercury.jpg",
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.015,
    texture: "/textures/2k_venus_surface.jpg",
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.01,
    texture: "/textures/2k_earth_daymap.jpg",
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 2,
        speed: 0.05,
        texture: "/textures/2k_moon.jpg",
      },
    ],
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.008,
    texture: "/textures/2k_mars.jpg",
    moons: [
      {
        name: "Phobos",
        radius: 0.2,
        distance: 1.5,
        speed: 0.06,
        texture: "/textures/2k_moon.jpg",
      },
      {
        name: "Deimos",
        radius: 0.1,
        distance: 2,
        speed: 0.04,
        texture: "/textures/2k_moon.jpg",
      },
    ],
  },
  {
    name: "Jupiter",
    radius: 3,
    distance: 35,
    speed: 0.005,
    texture: "/textures/realj2k.jpg",
    moons: [],
  },
  {
    name: "Saturn",
    radius: 2.5,
    distance: 45,
    speed: 0.003,
    texture: "/textures/2k_saturn.jpg",
    moons: [],
  },
  {
    name: "Uranus",
    radius: 2,
    distance: 55,
    speed: 0.002,
    texture: "/textures/2k_uranus.jpg",
    moons: [],
  },
  {
    name: "Neptune",
    radius: 2,
    distance: 65,
    speed: 0.0015,
    texture: "/textures/2k_neptune.jpg",
    moons: [],
  },
];

// Create Planet and Moon Meshes
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const createMesh = (radius, texture) => {
  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.scale.setScalar(radius);
  return mesh;
};

const planetMeshes = planets.map((planet) => {
  const planetMesh = createMesh(planet.radius, planet.texture);
  planetMesh.userData = { distance: planet.distance, speed: planet.speed };
  planet.moons.forEach((moon) => {
    const moonMesh = createMesh(moon.radius, moon.texture);
    moonMesh.userData = { distance: moon.distance, speed: moon.speed };
    planetMesh.add(moonMesh);
  });
  scene.add(planetMesh);
  return planetMesh;
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 20, 100);

// Renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// Handle Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const animate = () => {
  const time = Date.now() * 0.0001;

  planetMeshes.forEach((planet, index) => {
    const { distance, speed } = planets[index];
    planet.position.x = Math.cos(time * speed) * distance;
    planet.position.z = Math.sin(time * speed) * distance;

    // Update moons
    planet.children.forEach((moon, moonIndex) => {
      const moonData = planets[index].moons[moonIndex];
      moon.position.x = Math.cos(time * moonData.speed) * moonData.distance;
      moon.position.z = Math.sin(time * moonData.speed) * moonData.distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
