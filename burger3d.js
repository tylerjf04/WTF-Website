import * as THREE from 'https://esm.sh/three@0.165.0';
import { GLTFLoader } from 'https://esm.sh/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.165.0/examples/jsm/environments/RoomEnvironment.js';

/* ─── Load GLB ───────────────────────────────── */
function loadGLB() {
  return new Promise((resolve, reject) =>
    new GLTFLoader().load('public/burger.glb', gltf => resolve(gltf.scene), undefined, reject)
  );
}

/* ─── Centre + scale (scale first, then offset) */
function fitModel(obj, targetSize) {
  obj.updateMatrixWorld(true);
  const box    = new THREE.Box3().setFromObject(obj);
  const size   = new THREE.Vector3();
  const centre = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(centre);
  const s = targetSize / Math.max(size.x, size.y, size.z, 0.001);
  obj.scale.setScalar(s);
  /* Offset AFTER scaling so pivot math works correctly */
  obj.position.set(-centre.x * s, -centre.y * s, -centre.z * s);
}

/* ─── Environment + lights ───────────────────── */
function setupScene(renderer) {
  const scene = new THREE.Scene();
  /* PMREMGenerator bakes RoomEnvironment into a cubemap for PBR */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  /* Extra lights for dramatic look */
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xfff8e0, 2.0);
  key.position.set(3, 5, 5);
  scene.add(key);
  const fill = new THREE.PointLight(0xff3300, 1.2, 20);
  fill.position.set(-4, 1, 2);
  scene.add(fill);
  return scene;
}

/* ─── Hero display ───────────────────────────── */
async function initHero() {
  const wrap = document.getElementById('heroBurgerWrap');
  if (!wrap) return;

  const model = await loadGLB();
  await new Promise(r => requestAnimationFrame(r));

  const w = wrap.clientWidth  || 480;
  const h = wrap.clientHeight || 480;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  wrap.appendChild(renderer.domElement);

  const scene  = setupScene(renderer);
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 1000);
  camera.position.set(0, 0, 4);
  camera.lookAt(0, 0, 0);

  fitModel(model, 2.5);
  scene.add(model);

  new ResizeObserver(() => {
    const nw = wrap.clientWidth || w;
    const nh = wrap.clientHeight || h;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  }).observe(wrap);

  let tx = 0, ty = 0, cx = 0, cy = 0, t = 0;
  document.addEventListener('mousemove', e => {
    tx = ((e.clientX / window.innerWidth)  - 0.5) *  0.5;
    ty = ((e.clientY / window.innerHeight) - 0.5) * -0.25;
  });

  (function frame() {
    requestAnimationFrame(frame);
    t += 0.016;
    model.rotation.y += 0.008;
    model.position.y += Math.sin(t * 0.9) * 0.001;
    cx += (tx - cx) * 0.05;
    model.rotation.x = cy += (ty - cy) * 0.05;
    renderer.render(scene, camera);
  })();
}

/* ─── Cursor orbiter ─────────────────────────── */
async function initCursor() {
  const model = await loadGLB();

  const SIZE = 120;
  const dpr  = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement('canvas');
  canvas.id = 'cursorBurger';
  canvas.width  = SIZE * dpr;
  canvas.height = SIZE * dpr;
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene  = setupScene(renderer);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 0, 3.5);
  camera.lookAt(0, 0, 0);

  fitModel(model, 2.0);
  scene.add(model);

  const ORBIT_R    = 64;
  const ORBIT_SPEED = 0.015; /* radians per frame */

  let angle = 0;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let visible = false;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; visible = true; });
  document.addEventListener('mouseleave', () => { visible = false; });

  (function frame() {
    requestAnimationFrame(frame);
    canvas.style.opacity = visible ? '1' : '0';
    if (!visible) return;

    angle += ORBIT_SPEED;

    canvas.style.left = (mx + ORBIT_R * Math.cos(angle)) + 'px';
    canvas.style.top  = (my + ORBIT_R * Math.sin(angle)) + 'px';

    model.rotation.y += 0.04;

    renderer.render(scene, camera);
  })();
}

/* ─── Boot ───────────────────────────────────── */
Promise.all([initHero(), initCursor()])
  .catch(err => console.error('burger3d error:', err));
