function render3DViz(containerId, dive) {
  var el = document.getElementById(containerId);
  if (!el || !dive.depthProfile || dive.depthProfile.length < 3) return;

  el.style.cssText = 'width:100%;height:280px;position:relative;border-radius:8px;overflow:hidden;background:#1a2744;';
  el.innerHTML = '';

  // Use dive id as unique seed
  var idSeed = 0;
  if (dive.id) for(var i=0;i<dive.id.length;i++) idSeed += dive.id.charCodeAt(i) * (i*37+1);

  setTimeout(function() {
    try {
      var W = el.clientWidth || 400, H = 280;
      var profile = dive.depthProfile;
      var maxD = 0, maxT = profile[profile.length-1].time;
      for (var i=0;i<profile.length;i++) if(profile[i].depth>maxD) maxD=profile[i].depth;

      // Unique path per dive based on data
      var seed = idSeed || Date.now();
      function rng(){ seed=(seed*16807+12345)%2147483647; return (seed&0xffff)/0xffff; }
      // Pre-generate path parameters to ensure uniqueness
      var pathAngle = 1.2 + rng()*1.5;
      var pathWave = 1.5 + rng()*3;
      var pathDriftX = 4 + rng()*10;
      var pathDriftZ = 3 + rng()*8;
      var pathBaseR = 3 + rng()*5;
      var pathWaveR = 2 + rng()*4;

      var pts = [];
      profile.forEach(function(p) {
        var r = p.time / maxT;
        var a = r * Math.PI * pathAngle;
        var rad = pathBaseR + Math.sin(r * Math.PI * pathWave) * pathWaveR;
        pts.push({ x: Math.cos(a)*rad + r*pathDriftX, y: -p.depth, z: Math.sin(a)*rad + r*pathDriftZ, depth: p.depth });
      });

      // Normalize
      var minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
      pts.forEach(function(p){if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;if(p.z<minZ)minZ=p.z;if(p.z>maxZ)maxZ=p.z;});
      var range = Math.max(1, Math.max(maxX-minX, maxZ-minZ));
      var sc = 30/range, ox=(maxX+minX)/2, oz=(maxZ+minZ)/2, ds=20/Math.max(1,maxD);
      pts = pts.map(function(p){return{x:(p.x-ox)*sc, y:p.y*ds, z:(p.z-oz)*sc, depth:p.depth};});

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a2744);
      scene.fog = new THREE.Fog(0x1a2744, 60, 120);
      var camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 200);
      var renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.innerHTML = '';
      el.appendChild(renderer.domElement);

      // Grid
      var gv=[];
      for(var i=-40;i<=40;i+=4){gv.push(-40,0,i,40,0,i);gv.push(i,0,-40,i,0,40);}
      var gg=new THREE.BufferGeometry();
      gg.setAttribute('position',new THREE.Float32BufferAttribute(gv,3));
      scene.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0x3a4a6b,transparent:true,opacity:0.3})));

      // Surface line (red)
      var sp=pts.map(function(p){return new THREE.Vector3(p.x,0,p.z);});
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(sp),new THREE.LineBasicMaterial({color:0xef4444})));

      // Depth line (teal to purple)
      var dp=[],dc=[],tc=new THREE.Color(0x2dd4bf),pc=new THREE.Color(0x8b5cf6);
      pts.forEach(function(p){dp.push(p.x,p.y,p.z);var c=tc.clone().lerp(pc,p.depth/maxD);dc.push(c.r,c.g,c.b);});
      var dg=new THREE.BufferGeometry();
      dg.setAttribute('position',new THREE.Float32BufferAttribute(dp,3));
      dg.setAttribute('color',new THREE.Float32BufferAttribute(dc,3));
      scene.add(new THREE.Line(dg,new THREE.LineBasicMaterial({vertexColors:true})));

      // Drop lines
      var step=Math.max(1,Math.floor(pts.length/40)),dv=[],dvc=[];
      for(var i=0;i<pts.length;i+=step){var p=pts[i];dv.push(p.x,0,p.z,p.x,p.y,p.z);var c=new THREE.Color(0x1e293b).lerp(new THREE.Color(0x2dd4bf),p.depth/maxD*0.3);dvc.push(c.r,c.g,c.b,c.r,c.g,c.b);}
      var dvg=new THREE.BufferGeometry();
      dvg.setAttribute('position',new THREE.Float32BufferAttribute(dv,3));
      dvg.setAttribute('color',new THREE.Float32BufferAttribute(dvc,3));
      scene.add(new THREE.LineSegments(dvg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.5})));

      // Depth wall
      var wp=[],wc=[];
      for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1];
        wp.push(a.x,0,a.z,a.x,a.y,a.z,b.x,b.y,b.z);
        wp.push(a.x,0,a.z,b.x,b.y,b.z,b.x,0,b.z);
        for(var j=0;j<2;j++){wc.push(0.25,0.28,0.35,0.15,0.17,0.22,0.15,0.17,0.22);}
      }
      var wg=new THREE.BufferGeometry();
      wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));
      wg.setAttribute('color',new THREE.Float32BufferAttribute(wc,3));
      scene.add(new THREE.Mesh(wg,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.7,side:THREE.DoubleSide})));

      scene.add(new THREE.AmbientLight(0xffffff,0.5));

      // Camera orbit
      var theta=Math.PI/4, phi=Math.PI/5, radius=40;
      function updateCam(){
        camera.position.set(radius*Math.sin(theta)*Math.cos(phi), radius*Math.sin(phi), radius*Math.cos(theta)*Math.cos(phi));
        camera.lookAt(0,-maxD*ds*0.35,0);
      }
      updateCam();

      // Pointer controls
      var cvs=renderer.domElement, pDown=false, pMoved=false, px=0, py=0;
      cvs.style.touchAction='pan-y';
      cvs.addEventListener('pointerdown',function(e){pDown=true;pMoved=false;px=e.clientX;py=e.clientY;});
      cvs.addEventListener('pointermove',function(e){
        if(!pDown)return;
        var dx=e.clientX-px,dy=e.clientY-py;
        if(!pMoved&&Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>5){pMoved=true;cvs.setPointerCapture(e.pointerId);cvs.style.touchAction='none';}
        if(pMoved){theta-=dx*0.008;phi=Math.max(0.05,Math.min(1.4,phi+dy*0.008));updateCam();}
        px=e.clientX;py=e.clientY;
      });
      cvs.addEventListener('pointerup',function(e){pDown=false;if(pMoved)cvs.releasePointerCapture(e.pointerId);pMoved=false;cvs.style.touchAction='pan-y';});
      cvs.addEventListener('pointercancel',function(){pDown=false;pMoved=false;cvs.style.touchAction='pan-y';});
      cvs.addEventListener('wheel',function(e){e.preventDefault();radius=Math.max(15,Math.min(80,radius+e.deltaY*0.05));updateCam();},{passive:false});

      // Pinch zoom
      var pinchD=0;
      cvs.addEventListener('touchstart',function(e){if(e.touches.length===2){var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;pinchD=Math.sqrt(dx*dx+dy*dy);}},{passive:true});
      cvs.addEventListener('touchmove',function(e){if(e.touches.length===2){var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.sqrt(dx*dx+dy*dy);radius=Math.max(15,Math.min(80,radius-(d-pinchD)*0.15));pinchD=d;updateCam();}},{passive:true});

      (function animate(){requestAnimationFrame(animate);renderer.render(scene,camera);})();

      var lbl=document.createElement('div');
      lbl.style.cssText='position:absolute;bottom:8px;left:8px;font-size:0.6rem;color:#3a4a6b;letter-spacing:1px;pointer-events:none;';
      lbl.innerHTML='MAX '+maxD.toFixed(1)+'m · '+Math.round(maxT/60)+' min · <span style="color:#ef4444">━</span> surface <span style="color:#2dd4bf">━</span> depth';
      el.appendChild(lbl);
    } catch(e) {
      el.innerHTML='<div style="color:#ef4444;text-align:center;padding:20px;font-size:0.7rem;">3D: '+e.message+'</div>';
    }
  }, 500);
}
