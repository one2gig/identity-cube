/**
 * Redzuan Hiew — Glass Identity
 * Frontend only. Real Three.js WebGL cube, physically inspired glass, and 2D accessible actions.
 * Three.js modules are loaded from the import map in index.html; no build step is required.
 */
const INFO = {
  name: 'Redzuan Hiew', position: 'Head of Tech', company: '12Gig Sdn Bhd',
  phoneDisplay: '012 3977 896', phone: '+60123977896', email: 'redzuan@12gig.com',
  corporate: 'https://12gig.my', webApp: 'https://12gig.com',
  android: 'https://play.google.com/store/apps/details?id=com.gig12.app'
};
const FACES = ['profile', 'company', 'contact', 'apps'];
const TITLES = { profile: 'Profile', company: 'Company', contact: 'Contact', apps: '12GIG App' };
const $ = (s) => document.querySelector(s);
const host = $('#canvas-host');
let active = 'profile';
let cubeControls = null;
let toastTimer;
$('#year').textContent = String(new Date().getFullYear());

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function saveContact() {
  const lines = [
    'BEGIN:VCARD','VERSION:3.0','N:Hiew;Redzuan;;;',
    'FN:Redzuan Hiew','ORG:12Gig Sdn Bhd','TITLE:Head of Tech',
    'TEL;TYPE=CELL:+60123977896','EMAIL;TYPE=INTERNET:redzuan@12gig.com',
    'URL:https://12gig.my','END:VCARD'
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'],{type:'text/vcard;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = 'Redzuan-Hiew.vcf';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  notify('Contact card downloaded');
}
$('#hero-save').addEventListener('click',saveContact);
$('#quick-save').addEventListener('click',saveContact);

const details = {
  profile: {
    kicker: '01 / INTRODUCTION', name:'Redzuan Hiew',
    description:'Head of Tech at 12Gig Sdn Bhd. Building technology that brings people and services closer together.',
    actions:'<button class="detail-action-primary" type="button" data-go="contact">Let\'s connect <span>↗</span></button>'
  },
  company: {
    kicker:'02 / THE COMPANY', name:'12Gig Sdn Bhd',
    description:'Discover the team and the technology behind the 12GIG platform.',
    actions:`<a class="detail-action-primary" target="_blank" rel="noopener noreferrer" href="${INFO.corporate}">Corporate website <span>↗</span></a><a class="detail-action-secondary" target="_blank" rel="noopener noreferrer" href="${INFO.webApp}">12GIG web <span>↗</span></a>`
  },
  contact: {
    kicker:'03 / GET IN TOUCH', name:'Let\'s connect.',
    description:`<div class="contact-detail-row"><a href="tel:${INFO.phone}">↗ &nbsp; ${INFO.phoneDisplay}</a><a href="mailto:${INFO.email}">↗ &nbsp; ${INFO.email}</a></div>`,
    actions:'<button class="detail-action-primary" type="button" data-save-contact>↓ &nbsp; Save contact <span>↗</span></button>'
  },
  apps: {
    kicker:'04 / THE 12GIG PLATFORM', name:'Explore 12GIG.',
    description:'Find local services, connect with skilled people and discover what 12GIG can do.',
    actions:`<a class="detail-action-primary" target="_blank" rel="noopener noreferrer" href="${INFO.android}">Get it on Google Play <span>↗</span></a><a class="detail-action-secondary" target="_blank" rel="noopener noreferrer" href="${INFO.webApp}">Open web app <span>↗</span></a>`
  }
};

function setActive(face, fromCube=false) {
  if(!FACES.includes(face)) return;
  active = face;
  document.querySelectorAll('.face-nav-button').forEach(button => {
    const selected=button.dataset.face === face;
    button.classList.toggle('is-active',selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#current-number').textContent=String(FACES.indexOf(face)+1).padStart(2,'0');
  $('#current-name').textContent=TITLES[face];
  $('#info-counter').textContent=`0${FACES.indexOf(face)+1} — 04`;
  const content=details[face];
  const panel=$('#detail-surface');
  panel.style.animation='none';
  void panel.offsetHeight;
  panel.style.animation='';
  panel.innerHTML=`<div class="detail-copy"><span class="detail-kicker">${content.kicker}</span><h3>${content.name}</h3>${face==='contact'? content.description : `<p>${content.description}</p>`}</div><div class="detail-actions">${content.actions}</div>`;
  panel.querySelector('[data-save-contact]')?.addEventListener('click',saveContact);
  panel.querySelector('[data-go]')?.addEventListener('click', event => setActive(event.currentTarget.dataset.go));
  if(!fromCube)cubeControls?.focus(face);
}
document.querySelectorAll('.face-nav-button').forEach(btn=>btn.addEventListener('click',()=>setActive(btn.dataset.face)));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>setActive(btn.dataset.go)));
$('#skip-intro').addEventListener('click',()=>cubeControls?.skip());
$('#replay-button').addEventListener('click',()=>cubeControls?.replay());
host.addEventListener('keydown', event=>{
  if(['ArrowLeft','ArrowRight'].includes(event.key)) {
    event.preventDefault();
    const sign=event.key==='ArrowRight'?1:-1;
    setActive(FACES[(FACES.indexOf(active)+sign+FACES.length)%FACES.length]);
  } else if(event.key==='Enter'||event.key===' '){event.preventDefault();setActive(FACES[(FACES.indexOf(active)+1)%4]);}
});

function waitForImage(url){return new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url;
});}
const clamp=(a,low,high)=>Math.min(high,Math.max(low,a));
const ease=(t)=>1-Math.pow(1-clamp(t,0,1),3);
const smooth=(t)=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const TAU=Math.PI*2;

async function bootCube(){
  try {
    const [THREE,{RoundedBoxGeometry},{RoomEnvironment}] = await Promise.all([
      import('three'),
      import('three/addons/geometries/RoundedBoxGeometry.js'),
      import('three/addons/environments/RoomEnvironment.js')
    ]);
    if(!document.createElement('canvas').getContext('webgl2') && !document.createElement('canvas').getContext('webgl')) throw new Error('WebGL is unavailable');
    const portrait = await waitForImage('./assets/redzuan-portrait.png');
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(36,1,.1,100);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.36;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');

    // A procedural studio environment provides real reflections without downloading an HDRI.
    try{
      const pmrem=new THREE.PMREMGenerator(renderer);
      const environment=new RoomEnvironment();
      const envMap=pmrem.fromScene(environment,.05).texture;
      scene.environment=envMap;
      environment.dispose();pmrem.dispose();
    }catch(error){console.warn('Studio environment fallback',error);}
    scene.add(new THREE.HemisphereLight(0xe9ffe8,0x123b2a,1.8));
    function light(color,intensity,x,y,z){const p=new THREE.PointLight(color,intensity,13,2);p.position.set(x,y,z);scene.add(p);return p;}
    const keyLight=light(0xeefff0,75,-3,5,5);
    const mintLight=light(0x64ffb7,48,4,0,4);
    light(0xcaffdb,42,-2,-2,-4);
    light(0x89ddb4,30,3,3,-3);

    // Parent group flies and bounces; child rotates independently under user gestures.
    const flight=new THREE.Group();scene.add(flight);
    const rotator=new THREE.Group();flight.add(rotator);
    const cube=new THREE.Group();rotator.add(cube);
    const half=1.29;
    const shell=new THREE.Mesh(
      new RoundedBoxGeometry(half*2,half*2,half*2,5,.105),
      new THREE.MeshPhysicalMaterial({color:0xdfffe5,metalness:0,roughness:.055,transmission:.96,thickness:.6,ior:1.48,transparent:true,opacity:1,attenuationColor:0x7adc99,attenuationDistance:3.6,envMapIntensity:1.4,clearcoat:1,clearcoatRoughness:.045,side:THREE.FrontSide,depthWrite:false})
    );
    shell.renderOrder=0;cube.add(shell);
    const innerShell=new THREE.Mesh(
      new RoundedBoxGeometry(2.38,2.38,2.38,4,.065),
      new THREE.MeshPhysicalMaterial({color:0x87cfa4,roughness:.16,metalness:.25,transparent:true,opacity:.07,side:THREE.BackSide,depthWrite:false})
    );
    innerShell.renderOrder=1;cube.add(innerShell);

    const edgeCore=new THREE.MeshPhysicalMaterial({color:0xe4ffed,metalness:.25,roughness:.13,emissive:0x69dba0,emissiveIntensity:.28,clearcoat:1});
    const edgeGlow=new THREE.MeshBasicMaterial({color:0x74e7a7,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false});
    const vector=(x,y,z)=>new THREE.Vector3(x,y,z);
    function rod(a,b,radius,material){
      const middle=a.clone().add(b).multiplyScalar(.5);
      const direction=b.clone().sub(a);
      const part=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,direction.length(),7),material);
      part.position.copy(middle);part.quaternion.setFromUnitVectors(vector(0,1,0),direction.normalize());
      cube.add(part);
    }
    const edge=half-.035;
    for(const a of [-edge,edge])for(const b of [-edge,edge]){
      const segments=[ [vector(-edge,a,b),vector(edge,a,b)], [vector(a,-edge,b),vector(a,edge,b)], [vector(a,b,-edge),vector(a,b,edge)]];
      segments.forEach(([start,end])=>{rod(start,end,.014,edgeCore);rod(start,end,.033,edgeGlow);});
    }
    const cornerMaterial=new THREE.MeshPhysicalMaterial({color:0xebfff0,metalness:.35,roughness:.14,emissive:0x73d69c,emissiveIntensity:.26});
    const cornerGeo=new THREE.SphereGeometry(.035,10,10);
    for(const x of [-edge,edge])for(const y of [-edge,edge])for(const z of [-edge,edge]){
      const node=new THREE.Mesh(cornerGeo,cornerMaterial);node.position.set(x,y,z);cube.add(node);
    }
    // 4 floating print-on-glass panels; textures are generated locally from canvas.
    const panelSides=[
      {name:'profile',position:[0,0,half+.017],rotation:[0,0,0]},
      {name:'company',position:[half+.017,0,0],rotation:[0,Math.PI/2,0]},
      {name:'contact',position:[0,0,-half-.017],rotation:[0,Math.PI,0]},
      {name:'apps',position:[-half-.017,0,0],rotation:[0,-Math.PI/2,0]},
      {name:'top',position:[0,half+.017,0],rotation:[-Math.PI/2,0,0]},
      {name:'bottom',position:[0,-half-.017,0],rotation:[Math.PI/2,0,0]}
    ];
    const sideMeshes=[];
    for(const panel of panelSides){
      const texture=createFaceTexture(THREE,panel.name,portrait);
      const mesh=new THREE.Mesh(
        new THREE.PlaneGeometry(2.36,2.36),
        new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.FrontSide,toneMapped:false})
      );
      mesh.position.set(...panel.position);
      mesh.rotation.set(...panel.rotation);
      mesh.userData.face=panel.name;
      mesh.renderOrder=5;
      cube.add(mesh);
      if(FACES.includes(panel.name))sideMeshes.push(mesh);
    }
    // Engraved ribs slightly behind the front lip for genuine glass depth.
    const ribs=new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4,2.4,2.4)),
      new THREE.LineBasicMaterial({color:0xa7f7c8,transparent:true,opacity:.19})
    );cube.add(ribs);

    // Suspended plinth, dust and a short impact shockwave.
    const floor=new THREE.Group();scene.add(floor);floor.position.y=-1.65;
    const plinthMat=new THREE.MeshBasicMaterial({color:0x73e9a2,transparent:true,opacity:.25,depthWrite:false,blending:THREE.AdditiveBlending});
    for(const [radius,tube,opacity] of [[1.22,.012,.42],[1.56,.007,.20],[1.9,.004,.09]]){
      const torus=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,5,128),plinthMat.clone());
      torus.material.opacity=opacity;torus.rotation.x=Math.PI/2;floor.add(torus);
    }
    const glowRing=new THREE.Mesh(new THREE.TorusGeometry(1.3,.024,8,100),new THREE.MeshBasicMaterial({color:0xc9ffdb,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    glowRing.rotation.x=Math.PI/2;floor.add(glowRing);
    const dustCount=145;
    const dustPos=new Float32Array(dustCount*3);
    for(let i=0;i<dustCount;i++){
      dustPos[i*3]=(Math.random()-.5)*8;
      dustPos[i*3+1]=(Math.random()-.5)*7;
      dustPos[i*3+2]=-3+Math.random()*5;
    }
    const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
    const dustMat=new THREE.PointsMaterial({color:0xb5fbd0,size:.016,transparent:true,opacity:.45,depthWrite:false,sizeAttenuation:true});
    const dust=new THREE.Points(dustGeo,dustMat);scene.add(dust);

    const choices={profile:-.26,company:-Math.PI/2-.26,contact:-Math.PI-.26,apps:Math.PI/2-.26};
    let desiredYaw=choices.profile;
    let desiredX=-.14;
    let currentYaw=choices.profile;
    let currentX=-.14;
    let pointer=null;
    let dragVelocity=0;
    let intro=true;
    let elapsed=0;
    let lastInteraction=performance.now();
    const mediaReduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(mediaReduce)intro=false;

    function stopIntro(){
      if(!intro)return;
      intro=false;elapsed=99;
      flight.position.set(0,.2,0);flight.scale.setScalar(1);
      rotator.rotation.set(-.14,choices.profile,0);
      desiredYaw=currentYaw=choices.profile;desiredX=currentX=-.14;
      $('#intro-overlay').classList.add('is-hidden');
      $('#gesture-hint').classList.add('is-visible');
    }
    function startIntro(){
      intro=true;elapsed=0;pointer=null;
      $('#intro-overlay').classList.remove('is-hidden');
      $('#gesture-hint').classList.remove('is-visible');
      setActive('profile',true);
    }
    function focus(face){
      stopIntro();
      const raw=choices[face];
      const rounded=Math.round((desiredYaw-raw)/TAU);
      desiredYaw=raw+rounded*TAU;
      desiredX=-.14;
      lastInteraction=performance.now();
    }
    function snapNearest(){
      const candidates=[];
      for(const face of FACES){
        for(let k=-3;k<=3;k++) candidates.push({face,yaw:choices[face]+k*TAU});
      }
      candidates.sort((a,b)=>Math.abs(a.yaw-desiredYaw)-Math.abs(b.yaw-desiredYaw));
      const closest=candidates[0];desiredYaw=closest.yaw;desiredX=-.14;
      setActive(closest.face,true);
      lastInteraction=performance.now();
    }
    const raycaster=new THREE.Raycaster();
    const pointer2D=new THREE.Vector2();
    function targetFromTap(e){
      const rect=host.getBoundingClientRect();
      pointer2D.x=((e.clientX-rect.left)/rect.width)*2-1;
      pointer2D.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(pointer2D,camera);
      const hits=raycaster.intersectObjects(sideMeshes,false);
      if(hits.length)setActive(hits[0].object.userData.face);
    }
    const pointerDown=(event)=>{
      if(intro)stopIntro();
      if(event.button!==0)return;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:performance.now(),moved:false};
      dragVelocity=0;
      host.setPointerCapture?.(event.pointerId);
      lastInteraction=performance.now();
    };
    const pointerMove=(event)=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      const dx=event.clientX-pointer.x;const dy=event.clientY-pointer.y;
      if(Math.abs(event.clientX-pointer.startX)+Math.abs(event.clientY-pointer.startY)>5)pointer.moved=true;
      desiredYaw+=dx*.009;desiredX=clamp(desiredX+dy*.005,-.65,.56);
      dragVelocity=dx*.009;
      pointer.x=event.clientX;pointer.y=event.clientY;
    };
    const pointerUp=(event)=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      const wasDragged=pointer.moved;
      pointer=null;
      try{host.releasePointerCapture?.(event.pointerId)}catch(_){/* already released */}
      if(wasDragged){desiredYaw+=clamp(dragVelocity,-.27,.27);snapNearest();}
      else targetFromTap(event);
    };
    host.addEventListener('pointerdown',pointerDown);
    host.addEventListener('pointermove',pointerMove);
    host.addEventListener('pointerup',pointerUp);
    host.addEventListener('pointercancel',()=>{pointer=null;snapNearest()});
    cubeControls={focus,skip:stopIntro,replay:startIntro};
    if(mediaReduce)stopIntro();
    else setTimeout(()=>$('#intro-label').textContent='GLASS IDENTITY LOADING',650);

    // Throw -> impact -> recoil -> bounce -> levitation, with full 3-axis tumbles.
    // The first and last rotations differ by full turns, so the cube faces forward perfectly at rest.
    const frames=[
      {t:0,   x:-5.2,y:4.8,z:-3.0,s:.24,rx:-12.7,ry:-19.2,rz:-9.4},
      {t:.45, x:-2.25,y:2.8,z:-1.5,s:.76,rx:-9.9,ry:-17.1,rz:-7.1},
      {t:1.15,x:.04,y:-.29,z:0,s:1.13,rx:-5.7,ry:-14.8,rz:-3.8},
      {t:1.42,x:.22,y:.62,z:.0,s:.97,rx:-3.8,ry:-14.0,rz:-2.1},
      {t:1.78,x:-.08,y:-.18,z:0,s:1.025,rx:-2.0,ry:-13.4,rz:-.85},
      {t:2.05,x:0,y:.31,z:0,s:1,rx:-.6,ry:-13.05,rz:-.22},
      {t:2.63,x:0,y:.20,z:0,s:1,rx:-.14,ry:choices.profile-TAU*2,rz:0}
    ];
    function animateThrow(t){
      const last=frames.at(-1);
      if(t>=last.t){
        intro=false;
        currentX=desiredX=-.14;
        currentYaw=desiredYaw=choices.profile;
        rotator.rotation.set(-.14,choices.profile,0);
        flight.position.set(0,.2,0);flight.scale.setScalar(1);
        $('#intro-overlay').classList.add('is-hidden');
        $('#gesture-hint').classList.add('is-visible');
        return;
      }
      let i=0;while(i<frames.length-2&&frames[i+1].t<t)i++;
      const a=frames[i],b=frames[i+1];
      let q=(t-a.t)/(b.t-a.t);
      q=(i===1)?ease(q):smooth(q);
      flight.position.set(a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q,a.z+(b.z-a.z)*q);
      flight.scale.setScalar(a.s+(b.s-a.s)*q);
      rotator.rotation.set(a.rx+(b.rx-a.rx)*q,a.ry+(b.ry-a.ry)*q,a.rz+(b.rz-a.rz)*q);
      const impact=Math.max(0,1-Math.abs(t-1.15)/.42);
      glowRing.material.opacity=impact*.72;
      glowRing.scale.setScalar(1+impact*1.35);
      if(t>1.15&&t<1.42){const bounce=(t-1.15)/.27;flight.position.y+=Math.sin(bounce*Math.PI)*.1;}
    }
    let raf=0;
    function sizeCanvas(){
      const rect=host.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const w=rect.width,h=rect.height;
      camera.aspect=w/h;
      camera.position.set(0,.35,w<450?6.95:7.35);
      camera.lookAt(0,.12,0);
      camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
    }
    sizeCanvas();
    const resizeObserver=new ResizeObserver(sizeCanvas);
    resizeObserver.observe(host);
    let prev=performance.now();
    function frame(now){
      raf=requestAnimationFrame(frame);
      if(document.hidden){prev=now;return;}
      const dt=Math.min((now-prev)/1000,.065);prev=now;
      elapsed+=dt;
      if(intro)animateThrow(elapsed);
      else{
        currentYaw+=(desiredYaw-currentYaw)*(1-Math.exp(-dt*9));
        currentX+=(desiredX-currentX)*(1-Math.exp(-dt*9));
        rotator.rotation.set(currentX,currentYaw,0);
        const idle=(now-lastInteraction)>2200&&!pointer;
        flight.position.set(0,.2+(idle?Math.sin(now*.00125)*.085:Math.sin(now*.0013)*.033),0);
        flight.scale.setScalar(1);
        glowRing.material.opacity*=.90;
      }
      dust.rotation.y+=dt*.006;
      floor.rotation.y+=dt*.052;
      keyLight.position.x=-3+Math.sin(now*.00047)*.75;
      mintLight.position.y=Math.cos(now*.00037)*1.1;
      renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(frame);
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);resizeObserver.disconnect();renderer.dispose();},{once:true});
  }catch(error){
    console.warn('3D graphics could not load; accessible profile stays available.',error);
    $('#fallback-cube').classList.add('is-visible');
    $('#intro-overlay').classList.add('is-hidden');
    $('#gesture-hint').classList.remove('is-visible');
    $('#gesture-hint').textContent='EXPLORE MY PROFILE WITH THE BUTTONS BELOW';
    $('#gesture-hint').classList.add('is-visible');
    $('#replay-button').style.display='none';
    cubeControls={focus:()=>{},skip:()=>{},replay:()=>{}};
  }
}

// Procedurally print all six cube surfaces onto high-resolution transparent canvas.
function createFaceTexture(THREE,face,portrait){
  const size=1024;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const c=canvas.getContext('2d');
  const W='#f0fff4', M='#b9f2c9', MUT='#a0c8ad', DIM='#80a992';
  function roundRect(x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function text(value,x,y,font,color=W,align='left'){c.fillStyle=color;c.font=font;c.textAlign=align;c.fillText(value,x,y);c.textAlign='left';}
  function line(x1,y1,x2,y2,color='#97eac061',width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
  const gradient=c.createLinearGradient(0,0,size,size);
  gradient.addColorStop(0,'rgba(11,43,29,.58)');gradient.addColorStop(.52,'rgba(3,20,14,.60)');gradient.addColorStop(1,'rgba(16,57,35,.52)');
  roundRect(18,18,988,988,38);c.fillStyle=gradient;c.fill();
  c.strokeStyle='rgba(202,255,222,.49)';c.lineWidth=2;c.stroke();
  roundRect(33,33,958,958,27);c.strokeStyle='rgba(161,237,189,.16)';c.stroke();
  line(64,98,265,98,'#b6edc84b',2);
  text('R / H',64,83,'700 34px Manrope',M);
  text('DIGITAL IDENTITY',953,82,'600 23px Manrope',DIM,'right');
  text('12GIG SDN BHD',64,951,'600 25px Manrope',M);
  text(face==='profile'?'01 / 04':face==='company'?'02 / 04':face==='contact'?'03 / 04':face==='apps'?'04 / 04':'R / H',947,951,'600 23px Manrope',DIM,'right');
  if(face==='profile'){
    roundRect(75,131,874,610,27);c.save();c.clip();
    c.fillStyle='#153e29';c.fillRect(75,131,874,610);
    if(portrait){
      const ratio=874/610;
      const sw=portrait.width;
      const sh=sw/ratio;
      const sy=Math.min(portrait.height-sh,Math.max(0,portrait.height*.15));
      c.drawImage(portrait,0,sy,sw,sh,75,131,874,610);
      const vignette=c.createLinearGradient(0,430,0,760);
      vignette.addColorStop(0,'rgba(4,17,13,0)');vignette.addColorStop(1,'rgba(4,17,13,.58)');
      c.fillStyle=vignette;c.fillRect(75,131,874,610);
    }
    c.restore();
    roundRect(75,131,874,610,27);c.strokeStyle='#d9ffe467';c.lineWidth=3;c.stroke();
    text('REDZUAN HIEW',74,808,'800 72px Manrope',W);
    text('HEAD OF TECH',79,864,'700 32px Manrope',M);
  }else if(face==='company'){
    text('02 / THE COMPANY',74,188,'700 27px Manrope',M);
    c.strokeStyle='#ccffdc80';c.lineWidth=9;
    roundRect(75,258,874,392,34);c.stroke();
    const lg=c.createLinearGradient(150,280,850,620);lg.addColorStop(0,'#f0fff3');lg.addColorStop(1,'#a7ecc0');
    c.fillStyle=lg;c.font='800 172px Manrope';c.textAlign='center';c.fillText('12GIG',512,488);c.textAlign='left';
    line(360,537,663,537,'#bbfcd8b0',3);
    text('12GIG SDN BHD',512,603,'600 37px Manrope',W,'center');
    text('THE COMPANY',74,759,'700 52px Manrope',W);
    text('Technology that connects people.',77,822,'400 29px DM Sans',M);
  }else if(face==='contact'){
    text('03 / STAY IN TOUCH',74,188,'700 27px Manrope',M);
    text('LET\'S',72,340,'800 116px Manrope',W);
    text('CONNECT.',72,456,'800 104px Manrope',M);
    line(75,516,949,516,'#b3ffd284',3);
    roundRect(74,562,876,105,19);c.fillStyle='#b3ffc312';c.fill();c.strokeStyle='#b3ffc33e';c.stroke();
    text('CALL',104,606,'700 23px Manrope',DIM);
    text('012 3977 896',104,644,'600 37px Manrope',W);
    roundRect(74,686,876,112,19);c.fillStyle='#b3ffc312';c.fill();c.strokeStyle='#b3ffc33e';c.stroke();
    text('EMAIL',104,730,'700 23px Manrope',DIM);
    text('redzuan@12gig.com',104,777,'600 37px Manrope',W);
    text('ONE TAP AWAY',76,867,'700 26px Manrope',M);
  }else if(face==='apps'){
    text('04 / DISCOVER MORE',74,188,'700 27px Manrope',M);
    roundRect(137,258,750,380,49);c.strokeStyle='#b8f7c66a';c.lineWidth=4;c.stroke();
    text('12GIG',512,473,'800 172px Manrope',W,'center');
    text('LOCAL SERVICES. REAL PEOPLE.',512,558,'600 28px Manrope',M,'center');
    text('DISCOVER',74,755,'800 82px Manrope',W);
    text('THE APP.',74,847,'800 82px Manrope',M);
  }else{
    line(147,512,880,512,'#b4fbd567',3);
    text(face==='top'?'R.':'12GIG',512,580,face==='top'?'800 270px Manrope':'800 184px Manrope',W,'center');
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=8;
  texture.needsUpdate=true;
  return texture;
}

bootCube();
