// 3D Dive Visualization using Three.js
function render3DViz(containerId, dive) {
  const el = document.getElementById(containerId);
  if (!el || !dive.depthProfile || dive.depthProfile.length < 3) return;

  const profile = dive.depthProfile;
  const maxD = Math.max(...profile.map(p => p.depth));
  const maxT = profile[profile.length - 1].time;

  // Build path: if GPS track exists use it, otherwise create a straight line
  let pathPoints = [];
  if (dive.gpsTrack && dive.gpsTrack.length >= 2) {
    // Normalize GPS to local coords (meters approx)
    const lat0 = dive.gpsTrack[0].lat, lng0 = dive.gpsTrack[0].lng;
    const gpsNorm = dive.gpsTrack.map(p => ({
      x: (p.lng - lng0) * 111320 * Math.cos(lat0 * Math.PI / 180),
      z: (p.lat - lat0) * 110540,
      time: p.time
    }));
    // Interpolate depth profile along GPS path
    profile.forEach(p => {
      const ratio = p.time / maxT;
      // Lerp along GPS track
      let gx = 0, gz = 0;
      if (gpsNorm.length === 1) { gx = 0; gz = ratio * 20; }
      else {
        const totalGpsTime = gpsNorm[gpsNorm.length - 1].time || maxT;
        const t = ratio * totalGpsTime;
        for (let i = 0; i < gpsNorm.length - 1; i++) {
          if (t >= gpsNorm[i].time && t <= gpsNorm[i + 1].time) {
            const seg = (t - gpsNorm[i].time) / (gpsNorm[i + 1].time - gpsNorm[i].time || 1);
            gx = gpsNorm[i].x + seg * (gpsNorm[i + 1].x - gpsNorm[i].x);
            gz = gpsNorm[i].z + seg * (gpsNorm[i + 1].z - gpsNorm[i].z);
            break;
          }
        }
        if (t > (gpsNorm[gpsNorm.length - 1].time || 0)) {
          gx = gpsNorm[gpsNorm.length - 1].x;
          gz = gpsNorm[gpsNorm.length - 1].z;
        }
      }
      pathPoints.push({ x: gx, y: -p.depth, z: gz, depth: p.depth, time: p.time });
    });
  } else {
    // No GPS - simulate realistic dive path with curves
    const totalDist = 30;
    profile.forEach(p => {
      const ratio = p.time / maxT;
      // Create a natural-looking dive path with turns
      const angle = ratio * Math.PI * 1.8;
      const r = 5 + Math.sin(ratio * Math.PI * 3) * 3;
      pathPoints.push({
        x: Math.cos(angle) * r + ratio * 8,
        y: -p.depth,
        z: Math.sin(angle) * r + ratio * 6,
        depth: p.depth,
        time: p.time
      });
    });
  }

  // Normalize to fit nicely
  const xs = pathPoints.map(p => p.x), zs = pathPoints.map(p => p.z);
  const xRange = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const zRange = Math.max(1, Math.max(...zs) - Math.min(...zs));
  const hRange = Math.max(xRange, zRange);
  const scale = 30 / hRange;
  const xOff = (Math.max(...xs) + Math.min(...xs)) / 2;
  const zOff = (Math.max(...zs) + Math.min(...zs)) / 2;
  const depthScale = 20 / Math.max(1, maxD);

  pathPoints = pathPoints.map(p => ({
    ...p,
    x: (p.x - xOff) * scale,
    z: (p.z - zOff) * scale,
    y: p.y * depthScale
  }));

  // Setup Three.js
  const width = el.clientWidth || el.parentElement.clientWidth || 400;
  const height = 280;
  el.style.width = '100%';
  el.style.height = height + 'px';
  el.style.position = 'relative';
  el.style.borderRadius = '8px';
  el.style.overflow = 'hidden';
  el.innerHTML = '';

  // Wait for element to have actual dimensions
  requestAnimationFrame(() => {
  const actualWidth = el.clientWidth || 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2744);
  scene.fog = new THREE.Fog(0x1a2744, 60, 120);

  const camera = new THREE.PerspectiveCamera(50, actualWidth / height, 0.1, 200);
  camera.position.set(25, 15, 25);
  camera.lookAt(0, -maxD * depthScale * 0.4, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(actualWidth, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);

  // Grid at surface (y=0)
  const gridSize = 40;
  const gridGeo = new THREE.BufferGeometry();
  const gridVerts = [];
  for (let i = -gridSize; i <= gridSize; i += 4) {
    gridVerts.push(-gridSize, 0, i, gridSize, 0, i);
    gridVerts.push(i, 0, -gridSize, i, 0, gridSize);
  }
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: 0x3a4a6b, transparent: true, opacity: 0.3 });
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  // Surface line (red) - path projected on y=0
  const surfacePoints = pathPoints.map(p => new THREE.Vector3(p.x, 0, p.z));
  const surfaceCurve = new THREE.BufferGeometry().setFromPoints(surfacePoints);
  const surfaceLine = new THREE.Line(surfaceCurve, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
  scene.add(surfaceLine);

  // Depth line (colored by depth)
  const depthPositions = [];
  const depthColors = [];
  const tealColor = new THREE.Color(0x2dd4bf);
  const purpleColor = new THREE.Color(0x8b5cf6);

  pathPoints.forEach(p => {
    depthPositions.push(p.x, p.y, p.z);
    const ratio = p.depth / maxD;
    const c = tealColor.clone().lerp(purpleColor, ratio);
    depthColors.push(c.r, c.g, c.b);
  });

  const depthGeo = new THREE.BufferGeometry();
  depthGeo.setAttribute('position', new THREE.Float32BufferAttribute(depthPositions, 3));
  depthGeo.setAttribute('color', new THREE.Float32BufferAttribute(depthColors, 3));
  const depthLine = new THREE.Line(depthGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
  scene.add(depthLine);

  // Vertical drop lines (every Nth point)
  const dropStep = Math.max(1, Math.floor(pathPoints.length / 40));
  const dropGeo = new THREE.BufferGeometry();
  const dropVerts = [], dropColors = [];
  for (let i = 0; i < pathPoints.length; i += dropStep) {
    const p = pathPoints[i];
    dropVerts.push(p.x, 0, p.z, p.x, p.y, p.z);
    const ratio = p.depth / maxD;
    const c = new THREE.Color(0x1e293b).lerp(new THREE.Color(0x2dd4bf), ratio * 0.3);
    dropColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }
  dropGeo.setAttribute('position', new THREE.Float32BufferAttribute(dropVerts, 3));
  dropGeo.setAttribute('color', new THREE.Float32BufferAttribute(dropColors, 3));
  scene.add(new THREE.LineSegments(dropGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 })));

  // Depth wall (mesh between surface and depth)
  const wallPositions = [], wallColors = [];
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const a = pathPoints[i], b = pathPoints[i + 1];
    // Triangle 1: surface-a, depth-a, depth-b
    wallPositions.push(a.x, 0, a.z, a.x, a.y, a.z, b.x, b.y, b.z);
    // Triangle 2: surface-a, depth-b, surface-b
    wallPositions.push(a.x, 0, a.z, b.x, b.y, b.z, b.x, 0, b.z);
    for (let j = 0; j < 2; j++) {
      const ra = a.depth / maxD, rb = b.depth / maxD;
      if (j === 0) {
        wallColors.push(0.25, 0.28, 0.35);
        wallColors.push(0.15, 0.17, 0.22);
        wallColors.push(0.15, 0.17, 0.22);
      } else {
        wallColors.push(0.25, 0.28, 0.35);
        wallColors.push(0.15, 0.17, 0.22);
        wallColors.push(0.25, 0.28, 0.35);
      }
    }
  }
  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallPositions, 3));
  wallGeo.setAttribute('color', new THREE.Float32BufferAttribute(wallColors, 3));
  wallGeo.computeVertexNormals();
  const wallMesh = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.7, side: THREE.DoubleSide
  }));
  scene.add(wallMesh);

  // Ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // Orbit controls (manual)
  let isDragging = false, prevX = 0, prevY = 0;
  let theta = Math.PI / 4, phi = Math.PI / 5, radius = 40;
  let targetX = 0, targetZ = 0;

  function updateCamera() {
    camera.position.x = targetX + radius * Math.sin(theta) * Math.cos(phi);
    camera.position.y = radius * Math.sin(phi);
    camera.position.z = targetZ + radius * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(targetX, -maxD * depthScale * 0.35, targetZ);
  }
  updateCamera();

  const cvs = renderer.domElement;
  cvs.style.touchAction = 'pan-y';

  let pointerDown = false, prevX = 0, prevY = 0, pointerMoved = false;

  cvs.addEventListener('pointerdown', e => {
    pointerDown = true; pointerMoved = false;
    prevX = e.clientX; prevY = e.clientY;
  });
  cvs.addEventListener('pointermove', e => {
    if (!pointerDown) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    if (!pointerMoved && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
      pointerMoved = true;
      cvs.setPointerCapture(e.pointerId);
      cvs.style.touchAction = 'none';
    }
    if (pointerMoved) {
      theta -= dx * 0.008;
      phi = Math.max(0.05, Math.min(Math.PI / 2.2, phi + dy * 0.008));
      updateCamera();
    }
    prevX = e.clientX; prevY = e.clientY;
  });
  cvs.addEventListener('pointerup', e => {
    pointerDown = false;
    if (pointerMoved) { cvs.releasePointerCapture(e.pointerId); }
    pointerMoved = false;
    cvs.style.touchAction = 'pan-y';
  });
  cvs.addEventListener('pointercancel', () => {
    pointerDown = false; pointerMoved = false;
    cvs.style.touchAction = 'pan-y';
  });

  // Zoom
  cvs.addEventListener('wheel', e => {
    e.preventDefault();
    radius = Math.max(15, Math.min(80, radius + e.deltaY * 0.05));
    updateCamera();
  }, { passive: false });

  // Pinch zoom
  let lastPinchDist = 0;
  cvs.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });
  cvs.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      radius = Math.max(15, Math.min(80, radius - (dist - lastPinchDist) * 0.15));
      lastPinchDist = dist;
      updateCamera();
    }
  }, { passive: true });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Depth labels
  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'position:absolute;bottom:8px;left:8px;font-size:0.6rem;color:var(--text-muted);letter-spacing:1px;pointer-events:none;';
  labelDiv.innerHTML = `MAX ${maxD.toFixed(1)}m · ${Math.round(maxT/60)} min · <span style="color:#ef4444">━</span> surface <span style="color:#2dd4bf">━</span> depth`;
  el.appendChild(labelDiv);
  }); // end requestAnimationFrame
}
