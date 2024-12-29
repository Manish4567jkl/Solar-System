import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";


const scene = new THREE.Scene();


const textureLoader = new THREE.TextureLoader();


const starGeometry = new THREE.BufferGeometry();
const starCount = 90000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);


const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 32), sunMaterial);
sun.castShadow = true;
scene.add(sun);

const planets = [
    {
      name: "Mercury",
      radius: 1.5,
      distance: 18,
      speed: 0.02,
      texture: "/textures/2k_mercury.jpg",
      moons: [],
    },
    {
      name: "Venus",
      radius: 2,
      distance: 26,
      speed: 0.015,
      texture: "/textures/2k_venus_surface.jpg",
      moons: [],
    },
    {
      name: "Earth",
      radius: 3,
      distance: 35,
      speed: 0.01,
      texture: "/textures/2k_earth_daymap.jpg",
      moons: [
        {
          name: "Moon",
          radius: 0.4,
          distance: 3,
          speed: 0.05,
          texture: "/textures/2k_moon.jpg",
        },
      ],
    },
    {
      name: "Mars",
      radius: 2.5,
      distance: 45,
      speed: 0.008,
      texture: "/textures/2k_mars.jpg",
      moons: [
        {
          name: "Phobos",
          radius: 0.3,
          distance: 1.5,
          speed: 0.04,
          texture: "/textures/2k_moon.jpg",
        },
        {
          name: "Deimos",
          radius: 0.2,
          distance: 2.5,
          speed: 0.03,
          texture: "/textures/2k_moon.jpg",
        },
      ],
    },
    {
      name: "Jupiter",
      radius: 6,
      distance: 60,
      speed: 0.005,
      texture: "/textures/realj2k.jpg",
      moons: [],
    },
    {
      name: "Saturn",
      radius: 5,
      distance: 80,
      speed: 0.003,
      texture: "/textures/2k_saturn.jpg",
      moons: [],
    },
    {
      name: "Uranus",
      radius: 4.5,
      distance: 100,
      speed: 0.002,
      texture: "/textures/2k_uranus.jpg",
      moons: [],
    },
    {
      name: "Neptune",
      radius: 4,
      distance: 120,
      speed: 0.0015,
      texture: "/textures/2k_neptune.jpg",
      moons: [],
    },
  ];
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

const createMesh = (radius, texture) => {
  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.scale.setScalar(radius);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const planetMeshes = planets.map((planet) => {
  const planetMesh = createMesh(planet.radius, planet.texture);
  planetMesh.userData = { distance: planet.distance, speed: planet.speed };

  planet.moons.forEach((moon) => {
    const moonMesh = createMesh(moon.radius, moon.texture);
    moonMesh.userData = { distance: moon.distance, speed: moon.speed };
    moonMesh.castShadow = true;
    planetMesh.add(moonMesh);
  });

  scene.add(planetMesh);
  return planetMesh;
});


const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2.5);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
scene.add(pointLight);


const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 50, 150);


const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 250;
controls.minDistance = 25;


const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});


const animate = () => {
  planetMeshes.forEach((planet, planetIndex) => {
    const planetData = planets[planetIndex];
    planet.rotation.y += planetData.speed;
    planet.position.x = Math.cos(planet.rotation.y) * planetData.distance;
    planet.position.z = Math.sin(planet.rotation.y) * planetData.distance;

    planet.children.forEach((moon, moonIndex) => {
      const moonData = planetData.moons[moonIndex];
      moon.rotation.y += moonData.speed;
      moon.position.x = Math.cos(moon.rotation.y) * moonData.distance;
      moon.position.z = Math.sin(moon.rotation.y) * moonData.distance;
    });
  });

  controls.update();
  composer.render();
  requestAnimationFrame(animate);
};

animate();
