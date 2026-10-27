(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=[
    {name:'intro',section:'#hero',sticky:'.framer-80ra3e',end:'#problem'},
    {name:'brain',section:'#why-hussam',sticky:'.framer-15vw8k5'},
    {name:'arcade',section:'#maze',sticky:'.framer-pokk01'},
    {name:'dallah',section:'#maze',sticky:'.framer-pokk01'}
  ];
  const clamp=n=>Math.max(0,Math.min(1,n));
  
  
  
  
  let raster=1;
  const setRaster=()=>{raster=Math.min(3,Math.max(1,devicePixelRatio||1));document.documentElement.style.setProperty('--raster',String(raster))};
  setRaster();
  const smooth=t=>t*t*(3-2*t),accelerate=t=>t*t*t;
  let frame=0,installFrame=0;
  
  
  function spring(from,to,{stiffness=190,damping=12,duration=1300,steps=52}={}){
    const w=Math.sqrt(stiffness),zeta=damping/(2*w),wd=w*Math.sqrt(1-zeta*zeta),values=[];
    for(let i=0;i<=steps;i++){const t=i/steps*duration/1000;values.push(to+(from-to)*Math.exp(-zeta*w*t)*(Math.cos(wd*t)+zeta*w/wd*Math.sin(wd*t)))}
    values[steps]=to;return values;
  }
  
  
  
  function fitHeroLines(scene){
    const lines=scene.parts.lines;
    lines.forEach(line=>{line.style.fontSize='';line.textContent=line.dataset.text});
    const widest=Math.max(...lines.map(line=>line.getComputedTextLength()));
    const size=parseFloat(getComputedStyle(lines[0]).fontSize)*Math.min(1,470/Math.max(1,widest));
    lines.forEach(line=>{line.style.fontSize=size+'px';line.textContent=scene.typed?line.dataset.text:''});
  }
  function typeHero(scene,pair,delay,then){
    const {lines}=scene.parts,characters=pair.map(text=>Array.from(text)),run=++scene.typing;let index=0,lineIndex=0;
    lines.forEach((line,i)=>{line.dataset.text=pair[i]||'';line.textContent=''});
    const step=()=>{
      if(run!==scene.typing||!scene.media.isConnected)return;
      if(lineIndex>=characters.length)return then?.();
      lines[lineIndex].textContent=characters[lineIndex].slice(0,++index).join('');
      if(index>=characters[lineIndex].length){lineIndex++;index=0}
      setTimeout(step,lineIndex<characters.length&&index===0?220:46);
    };
    setTimeout(step,delay);
  }
  
  
  function pokeHero(scene){
    if(scene.media.dataset.phase!=='open')return;
    scene.quip=(scene.quip+1)%scene.quips.length;
    const pair=scene.quips[scene.quip],{parts}=scene;
    if(!reduced.matches){
      const boing=spring(70,0,{stiffness:320,damping:11,duration:900,steps:36});
      parts.jack.animate(boing.map(y=>({transform:`translateY(${y}px)`})),{duration:900,easing:'linear'});
      parts.spring.animate(boing.map(y=>({transform:`scaleY(${Math.max(.01,(53-y)/46)})`})),{duration:900,easing:'linear'});
      parts.bubble.animate([{transform:'scale(.82)'},{transform:'scale(1.05)',offset:.6},{transform:'scale(1)'}],{duration:340,easing:'ease-out'});
    }
    if(reduced.matches){parts.lines.forEach((line,i)=>line.textContent=line.dataset.text=pair[i]||'');fitHeroLines(scene);return}
    parts.lines.forEach((line,i)=>line.dataset.text=pair[i]||'');scene.typed=false;fitHeroLines(scene);
    typeHero(scene,pair,120,()=>{scene.typed=true});
  }
  function setLid(scene,open){scene.lidOpen=open;scene.parts.closed.style.opacity=open?'0':'1';scene.parts.open.style.opacity=open?'1':'0'}
  function openHero(scene){
    const {parts}=scene,root=scene.media;
    const done=()=>{scene.typed=true;parts.lines.forEach(line=>line.textContent=line.dataset.text);root.dataset.phase='open';setTimeout(()=>loadHeroZoom(scene),600)};
    if(reduced.matches){setLid(scene,true);parts.spring.style.transform='scaleY(1.15)';done();return}
    const at=(element,keyframes,delay,duration,options={})=>element.animate(keyframes,{delay,duration,fill:'both',...options});
    at(parts.rattle,[0,-9,0,-6,0,-3,0].map((y,i)=>({transform:`translateY(${y}px) rotate(${[0,-2.5,2,-1.5,1,-.6,0][i]}deg)`})),200,620,{easing:'ease-in-out'});
    
    at(parts.rattle,[{transform:'scale(1,1)'},{transform:'scale(1.05,.93)',offset:.28},{transform:'scale(.98,1.03)',offset:.62},{transform:'scale(1,1)'}],790,380,{fill:'none',easing:'ease-out'});
    setTimeout(()=>{if(!root.isConnected)return;setLid(scene,true);parts.closed.animate([{opacity:1},{opacity:0}],{duration:110});parts.open.animate([{opacity:0},{opacity:1}],{duration:80})},820);
    at(parts.pop,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.08)',offset:.35},{opacity:0,transform:'scale(1.2)'}],880,420);
    const rise=spring(360,0);
    at(parts.jack,rise.map(y=>({transform:`translateY(${y}px)`})),840,1300,{easing:'linear'});
    at(parts.spring,rise.map(y=>({transform:`scaleY(${Math.max(.01,(53-y)/46)})`})),840,1300,{easing:'linear'});
    at(parts.head,spring(-16,0,{stiffness:120,damping:7,duration:1600}).map(r=>({transform:`rotate(${r}deg)`})),900,1600,{easing:'linear'});
    at(parts.bubble,[{transform:'scale(0)'},{transform:'scale(1.07)',offset:.7},{transform:'scale(1)'}],1350,380,{easing:'cubic-bezier(.3,1.4,.5,1)'});
    typeHero(scene,scene.quips[0],1700,done);
  }
  function installHero(scene,sticky){
    const template=document.getElementById('hussam-hero-template');if(!template)return;
    sticky.append(template.content.cloneNode(true));
    const root=sticky.lastElementChild,q=selector=>root.querySelector(selector),lang=document.documentElement.lang;
    scene.media=root;scene.typed=false;scene.typing=0;scene.quip=0;
    scene.parts={push:q('.hero-push'),rattle:q('.hero-rattle'),jack:q('.hero-jack'),jackScroll:q('.hero-jack-scroll'),spring:q('.hero-spring'),head:q('.hero-head'),closed:q('.hero-chest-closed'),open:q('.hero-chest-open'),pop:q('.hero-pop'),bubble:q('.hero-bubble'),bubbleScroll:q('.hero-bubble-scroll'),backdrop:q('.hero-backdrop'),near:q('.hero-near'),close:q('.hero-close'),iris:q('.hero-iris'),irisHole:q('.hero-light'),irisClip:q('.hero-keyhole-shape'),irisDesk:q('.hero-desk'),swirl:q('.hero-swirl'),hint:q('.hero-hint'),poke:q('.hero-poke'),lines:[...root.querySelectorAll('.hero-line')]};
    scene.quips=[scene.parts.lines.map(line=>line.dataset.text),...[...root.querySelectorAll('.hero-quips p')].map(p=>p.dataset[lang].split('|'))];
    scene.parts.poke.setAttribute('aria-label',scene.parts.poke.dataset[lang]);
    scene.parts.poke.addEventListener('click',()=>pokeHero(scene));
    fitHeroLines(scene);document.fonts?.ready.then(()=>{if(root.isConnected)fitHeroLines(scene)});
    openHero(scene);
  }
  
  
  
  
  
  
  const heroKey={x:1276.6,y:966,h:80},heroLayers=[[729,658,1095,616],[1121.32,877.77,310.754,176.458]],heroImage={w:2752,h:1536},heroIris={x:1375.5,y:580,r:152};
  const inOut=t=>t<.5?4*t*t*t:1-(2-2*t)**3/2;
  
  
  function loadHeroZoom(scene){
    if(scene.zoomLoaded)return;scene.zoomLoaded=true;
    
    Promise.all([scene.parts.near,scene.parts.close].map(image=>{image.src=image.dataset.src;return image.decode?image.decode().catch(()=>{}):null})).then(()=>{scene.zoomReady=true;for(const image of [scene.parts.near,scene.parts.close])if(!+image.style.opacity)image.style.opacity='.001'});
    scene.parts.irisDesk.setAttribute('href',scene.parts.irisDesk.dataset.href);
    (window.requestIdleCallback||(fn=>setTimeout(fn,150)))(()=>prepareWhirl(scene),{timeout:1500});
  }
  function prepareWhirl(scene){
    if(scene.whirl!==undefined)return;
    scene.whirl=makeSwirl(scene.parts.swirl);
    if(scene.whirl){scene.whirl.load('plate',scene.parts.close.dataset.src);scene.whirl.load('office',scene.parts.irisDesk.dataset.href);scene.whirl.draw({cx:0,cy:0,twirl:0,twirlR:0,R:[0,0,0],spin:[0,0,0],curl:[0,0,0],plate:null,office:null});scene.media.classList.add('has-swirl')}
  }
  function heroCamera(scene,progress,motion){
    const {parts}=scene,box=scene.media.getBoundingClientRect(),size=box.width+'x'+box.height;
    if(scene.cameraFor!==size){
      const previous=parts.push.style.transform;parts.push.style.transform='none';
      const chest=parts.closed.getBoundingClientRect(),z=chest.width/2048;parts.push.style.transform=previous;
      scene.camera={z,unit:chest.width/430,x:chest.left-box.left+heroKey.x*z,y:chest.top-box.top+heroKey.y*z};scene.cameraFor=size;
    }
    const VW=box.width,VH=box.height,{z:z0,unit,x:x0,y:y0}=scene.camera,end=Math.max(VH*.5,VW*.26)/heroKey.h;
    
    const u=motion*smooth(clamp((progress-.34)/.36)),through=motion*accelerate(clamp((progress-.7)/.28));
    const z=z0*Math.pow(end/z0,u)*(1+.3*through),x=x0+(VW/2-x0)*u,y=y0+(VH/2-y0)*u;
    parts.push.style.transform=u?`translate(${((x-x0)/unit).toFixed(2)}px,${((y-y0)/unit).toFixed(2)}px) scale(${(z/z0).toFixed(4)})`:'';
    
    parts.backdrop.style.transformOrigin=`${x0.toFixed(1)}px ${y0.toFixed(1)}px`;parts.backdrop.style.transform=u?`scale(${(1+.22*u).toFixed(4)})`:'';
    const shown=(motion*smooth(clamp((progress-.33)/.04))).toFixed(3);
    const [near,close]=[parts.near,parts.close].map((image,i)=>{
      const [lx,ly,lw,lh]=heroLayers[i],sx=lw*z/heroImage.w,sy=lh*z/heroImage.h,X=x+(lx-heroKey.x)*z,Y=y+(ly-heroKey.y)*z;
      image.style.transform=`translate(${X.toFixed(1)}px,${Y.toFixed(1)}px) scale(${(sx*raster).toFixed(5)},${(sy*raster).toFixed(5)})`;image.style.opacity=+shown?shown:scene.zoomReady?'.001':'0';
      return {X,Y,sx,sy};
    });
    return {close,VW,VH};
  }
  
  
  
  
  let officeAt=null,officeFor='';
  function deskPlace(){
    const size=innerWidth+'x'+innerHeight;if(officeAt&&officeFor===size)return officeAt;
    const root=document.querySelector('.hussam-product-demo')?.shadowRoot,frame=root?.querySelector('.office-frame'),sticky=root?.querySelector('.integration-sticky');
    if(!frame||!sticky)return null;
    const f=frame.getBoundingClientRect(),s=sticky.getBoundingClientRect();
    officeAt={x:f.left,y:f.top-s.top,w:f.width,h:f.height};officeFor=size;return officeAt;
  }
  
  
  
  
  
  const swirlShader=`precision highp float;
uniform vec2 res,center;uniform float dpr,twirl,twirlR,R1,R2,R3,spin1,spin2,spin3,curl1,curl2,curl3,hasPlate,hasOffice;
uniform vec4 plateRect,officeRect;uniform sampler2D plate,office;
const vec3 INK=vec3(.09,.086,.078),YELLOW=vec3(.957,.792,.314),VIOLET=vec3(.506,.471,.769);
vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
// The edge of a splash: a pinwheel whose blades sweep back as they reach out
// (the angle turns with distance), so they curl like paint stirred in water.
// Negative inside.
float splash(vec2 d,float R,float spin,float curl,float seed,float blades){
 float L=length(d),a=atan(d.y,d.x)+spin-curl*L/R,x=blades*a+seed;
 float blade=.5+.5*sin(x+.8*sin(x)),reach=.36*(.72+.28*sin(a+seed*2.3))*(.85+.15*sin(2.*a-seed));
 return L-R*(.6+reach*pow(blade,1.5)+.05*sin(11.*a+seed*1.7)+.03*sin(3.*a-seed));
}
// Edges in true pixels, so fills are crisp and ink lines keep one width.
float fill(float f){return 1.-smoothstep(-.8,.8,PX(f));}
float ink(float f){float line=1.4*dpr;return 1.-smoothstep(line-.8,line+.8,abs(PX(f)));}
void main(){
 vec2 p=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y),d=p-center;
 float L=length(d);
 vec4 o=vec4(0.);
 if(hasPlate>.5&&twirl>0.&&L<twirlR){
  // The plate twists in towards the keyhole and is drawn into it.
  float k=1.-L/twirlR;
  vec2 uv=(center+rot(d,twirl*k)*(1.+.12*twirl*k)-plateRect.xy)/plateRect.zw;
  if(uv.x>0.&&uv.y>0.&&uv.x<1.&&uv.y<1.){float a=1.-smoothstep(.7,1.,L/twirlR);o=vec4(texture2D(plate,uv).rgb*a,a);}
 }
 if(R1>0.){float f=splash(d,R1,spin1,curl1,0.,6.);o=mix(o,vec4(YELLOW,1.),fill(f));o=mix(o,vec4(INK,1.),ink(f));}
 if(R2>0.){float f=splash(d,R2,spin2,curl2,2.1,5.);o=mix(o,vec4(VIOLET,1.),fill(f));o=mix(o,vec4(INK,1.),ink(f));}
 if(R3>0.){
  float f=splash(d,R3,spin3,curl3,4.4,7.);
  vec3 room=VIOLET;if(hasOffice>.5)room=texture2D(office,clamp((p-officeRect.xy)/officeRect.zw,0.,1.)).rgb;
  o=mix(o,vec4(room,1.),fill(f));o=mix(o,vec4(INK,1.),ink(f));
 }
 gl_FragColor=o;
}`;
  function makeSwirl(canvas){
    let gl=null;try{gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false})}catch(error){}
    if(!gl)return null;
    const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null};
    
    const exact=!!gl.getExtension('OES_standard_derivatives');
    const source=(exact?'#extension GL_OES_standard_derivatives : enable\n#define PX(x) ((x)/max(length(vec2(dFdx(x),dFdy(x))),.001))\n':'#define PX(x) (x)\n')+swirlShader;
    const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'),fragment=compile(gl.FRAGMENT_SHADER,source);
    if(!vertex||!fragment)return null;
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const at=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
    const u={};for(const name of ['res','center','dpr','twirl','twirlR','R1','R2','R3','spin1','spin2','spin3','curl1','curl2','curl3','hasPlate','hasOffice','plateRect','officeRect','plate','office'])u[name]=gl.getUniformLocation(program,name);
    const textures={},ready={};
    for(const [unit,name] of [[0,'plate'],[1,'office']]){
      const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
      for(const [key,value] of [[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR]])gl.texParameteri(gl.TEXTURE_2D,key,value);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([252,245,226,255]));
      textures[name]={texture,unit};ready[name]=0;
    }
    gl.uniform1i(u.plate,0);gl.uniform1i(u.office,1);
    return {
      load(name,src){
        const {texture,unit}=textures[name];
        const upload=picture=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,picture);ready[name]=1};
        const fallback=()=>{const image=new Image();image.onload=()=>upload(image);image.src=src};
        if(window.createImageBitmap)fetch(src).then(response=>response.blob()).then(blob=>createImageBitmap(blob)).then(upload,fallback);else fallback();
      },
      draw(state){
        
        const area=Math.max(1,canvas.clientWidth*canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1,Math.sqrt(6e6/area)),width=Math.round(canvas.clientWidth*dpr),height=Math.round(canvas.clientHeight*dpr);
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
        gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.res,width,height);gl.uniform2f(u.center,state.cx*dpr,state.cy*dpr);gl.uniform1f(u.dpr,dpr);
        gl.uniform1f(u.twirl,state.twirl);gl.uniform1f(u.twirlR,state.twirlR*dpr);
        for(const i of [1,2,3]){gl.uniform1f(u['R'+i],state.R[i-1]*dpr);gl.uniform1f(u['spin'+i],state.spin[i-1]);gl.uniform1f(u['curl'+i],state.curl[i-1])}
        gl.uniform1f(u.hasPlate,ready.plate&&state.plate?1:0);gl.uniform1f(u.hasOffice,ready.office&&state.office?1:0);
        if(state.plate)gl.uniform4f(u.plateRect,state.plate.x*dpr,state.plate.y*dpr,state.plate.w*dpr,state.plate.h*dpr);
        if(state.office)gl.uniform4f(u.officeRect,state.office.x*dpr,state.office.y*dpr,state.office.w*dpr,state.office.h*dpr);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      }
    };
  }
  
  
  function drawWhirl(scene,now){
    if(scene.drewAt===now)return;scene.drewAt=now;
    const state=scene.whirlState,idle=now/1000*.18;
    scene.whirl.draw({...state,spin:state.spin.map(spin=>spin+idle)});
  }
  function spinHero(scene){
    if(scene.spinning)return;scene.spinning=true;
    const loop=now=>{
      const state=scene.whirlState;
      if(!state||!state.live||!scene.media.isConnected){scene.spinning=false;return}
      drawWhirl(scene,now);requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  
  
  const splashes=[[.02,.4],[.1,.46],[.24,.56]];
  function renderHeroIris(scene,progress,motion,{close,VW,VH}){
    const {iris,irisHole,irisClip,irisDesk,swirl}=scene.parts,t=motion*clamp((progress-.7)/.28);
    if(t>0&&scene.zoomLoaded&&scene.whirl===undefined)prepareWhirl(scene);
    const whirl=scene.whirl,office=deskPlace();
    if(office)['x','y','width','height'].forEach((key,i)=>irisDesk.setAttribute(key,[office.x,office.y,office.w,office.h][i].toFixed(1)));
    const cx=close.X+heroIris.x*close.sx,cy=close.Y+heroIris.y*close.sy;
    if(!whirl){
      
      iris.style.visibility=t>0?'visible':'hidden';swirl.style.visibility='hidden';if(!t)return;
      const open=accelerate(clamp((t-.05)/.9)),reach=Math.hypot(Math.max(cx,VW-cx),Math.max(cy,VH-cy))/(heroIris.r*close.sx)*1.04,scale=1+(reach-1)*open;
      const shape=`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${(scale*close.sx).toFixed(5)} ${(scale*close.sy).toFixed(5)}) translate(${-heroIris.x} ${-heroIris.y})`;
      irisHole.setAttribute('transform',shape);irisClip.setAttribute('transform',shape);irisHole.style.opacity=open<1?'1':'0';
      return;
    }
    if(scene.whirlState)scene.whirlState.live=t>0&&t<1;
    swirl.style.visibility=t>0?'visible':'hidden';
    if(!t){scene.media.classList.remove('is-swirling','is-settling');iris.style.visibility='hidden';return}
    const far=Math.hypot(Math.max(cx,VW-cx),Math.max(cy,VH-cy)),fullSize=far/.55;
    const grown=splashes.map(([start,length])=>clamp((t-start)/length));
    
    scene.media.classList.toggle('is-swirling',grown[0]>=.985);
    
    const sharp=smooth(clamp((t-.86)/.08));
    swirl.style.opacity=(1-sharp).toFixed(3);iris.style.visibility=sharp>0?'visible':'hidden';scene.media.classList.toggle('is-settling',sharp>0);
    scene.whirlState={cx,cy,live:t<1,
      twirl:3.2*smooth(clamp(t/.34)),twirlR:Math.min(VW,VH)*.7,
      plate:{x:close.X,y:close.Y,w:2752*close.sx,h:1536*close.sy},office,
      R:grown.map(g=>g>0?fullSize*Math.pow(g,1.4):0),
      spin:grown.map((g,i)=>3.4*g+i*.9),
      curl:grown.map(g=>3.4-1.2*g)};
    drawWhirl(scene,document.timeline.currentTime??performance.now());
    if(scene.whirlState.live)spinHero(scene);
  }
  function renderHero(scene,progress){
    const {parts}=scene,motion=reduced.matches?0:1;
    const leave=motion*smooth(clamp(progress/.1)),duck=motion*smooth(clamp((progress-.03)/.2)),shut=motion*accelerate(clamp((progress-.24)/.1));
    if(progress>.01)loadHeroZoom(scene);
    parts.bubbleScroll.style.opacity=parts.hint.style.opacity=String(1-leave);
    parts.poke.hidden=progress>.05;
    parts.bubbleScroll.style.transform=`translateY(${-28*leave}px) scale(${1-.15*leave})`;
    parts.jackScroll.style.transform=`translateY(${390*duck}px)`;
    
    
    if(scene.lidOpen){
      const shutNow=shut>=.5;
      if(shutNow!==scene.shutNow){
        const first=scene.shutNow===undefined;scene.shutNow=shutNow;
        parts.closed.style.opacity=shutNow?'1':'0';parts.open.style.opacity=shutNow?'0':'1';
        if(motion&&!first)parts.rattle.animate(shutNow?[{transform:'scale(1,1)'},{transform:'scale(1.045,.93)',offset:.28},{transform:'scale(.985,1.025)',offset:.62},{transform:'scale(1,1)'}]:[{transform:'scale(1,1)'},{transform:'scale(.97,1.04)',offset:.4},{transform:'scale(1,1)'}],{duration:shutNow?340:260,easing:'ease-out'});
      }
    }
    renderHeroIris(scene,progress,motion,heroCamera(scene,progress,motion));
    scene.media.dataset.progress=progress.toFixed(3);
    
    const handed=!!motion&&progress>=.998,was=scene.element.classList.contains('has-completed-wipe');
    scene.element.classList.toggle('has-completed-wipe',handed);
    if(handed&&!was)dispatchEvent(new Event('hussam:handoff'));
  }
  
  
  
  const arcadeCliches=['megaphone','sale','phone','ringlight','gift','mic'];
  function installArcade(scene,root){
    const q=selector=>root.querySelector(selector),board=q('.arcade-board'),holes=[...root.querySelectorAll('.arcade-hole')];
    const items=holes.map(hole=>hole.querySelector('.arcade-item')),mallet=q('.arcade-mallet.is-main'),spentLabel=q('.arcade-spent'),hint=q('.arcade-hint');
    const arabic=document.documentElement.lang!=='en',number=new Intl.NumberFormat(arabic?'ar-SA':'en-US');
    const orders=n=>arabic?(n===0?'ولا طلب':n===1?'طلب واحد':n===2?'طلبين':n<=10?`${number.format(n)} طلبات`:`${number.format(n)} طلب`):`${n} order${n===1?'':'s'}`;
    const money=n=>arabic?`${number.format(n)} ريال`:`SAR ${number.format(n)}`;
    const game={spent:0,orders:0,up:new Map(),timers:[],stage:'',active:false,solved:false,played:false,geo:null,last:-1,sprite:''};
    scene.media=root;scene.game=game;
    const later=(fn,ms)=>game.timers.push(setTimeout(fn,ms));
    const clearTimers=()=>{game.timers.forEach(clearTimeout);game.timers=[]};
    
    
    function measure(){
      const W=board.clientWidth,H=board.clientHeight;if(!W)return;
      game.geo=holes.map((hole,i)=>{
        const style=getComputedStyle(hole),v=name=>parseFloat(style.getPropertyValue(name));
        const cx=v('--cx')/100*W,cy=v('--cy')/100*H,rx=v('--rx')/100*W,ry=v('--ry')/100*H;
        const size=rx*2.3,width=rx*3.8,height=ry*2+size*1.4,left=cx-width/2,top=cy+ry-height,yc=height-ry,xc=width/2;
        Object.assign(hole.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
        hole.querySelector('.arcade-pop').style.clipPath=`path("M0 -2000H${width.toFixed(1)}V${yc.toFixed(1)}H${(xc+rx).toFixed(1)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(xc-rx).toFixed(1)} ${yc.toFixed(1)}H0Z")`;
        const item=items[i];
        Object.assign(item.style,{height:size+'px',width:'auto',left:xc+'px',top:(yc+ry*.35-size)+'px',translate:'-50% 0'});
        item.style.setProperty('--hidden',(size+ry*1.3).toFixed(1)+'px');
        return {cx,size,ry,itemTop:top+yc+ry*.35-size};
      });
      hint.style.left=game.geo[4].cx+'px';hint.style.top=(game.geo[4].itemTop-46)+'px';
    }
    new ResizeObserver(measure).observe(board);
    const hidden=i=>(game.geo?game.geo[i].size+game.geo[i].ry*1.3:240);
    const quick=reduced.matches?1:0;
    function rise(i,sprite,stay){
      const item=items[i];item.getAnimations().forEach(animation=>animation.cancel());
      item.src=`/assets/arcade/${sprite}.webp`;item.classList.toggle('is-insight',sprite==='insight');
      game.up.set(i,sprite);
      item.animate([{transform:`translateY(${hidden(i)}px)`},{transform:'translateY(-7%)',offset:.72},{transform:'translateY(0)'}],{duration:quick||340,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
      if(stay)later(()=>sink(i),stay);
    }
    function sink(i){
      if(!game.up.has(i))return;game.up.delete(i);
      const item=items[i];item.getAnimations().forEach(animation=>animation.cancel());
      item.animate([{transform:'translateY(0)'},{transform:`translateY(${hidden(i)}px)`}],{duration:quick||240,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
    }
    function bonk(i){
      game.up.delete(i);const item=items[i];item.getAnimations().forEach(animation=>animation.cancel());
      item.animate([{transform:'translateY(0) scale(1,1)'},{transform:'translateY(9%) scale(1.26,.6)',offset:.18},{transform:'translateY(14%) scale(1.18,.7)',offset:.36},{transform:`translateY(${hidden(i)}px) scale(.96,1.04)`}],{duration:quick||360,easing:'cubic-bezier(.4,0,.8,.6)',fill:'forwards'});
    }
    function float(x,y,text,good){
      const tag=document.createElement('p');tag.className='arcade-float'+(good?' is-good':'');tag.textContent=text;tag.style.left=x+'px';tag.style.top=y+'px';tag.setAttribute('aria-hidden','true');board.append(tag);
      tag.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 -10px',offset:.25},{opacity:0,translate:'0 -48px'}],{duration:quick||950,easing:'ease-out'}).finished.then(()=>tag.remove());
    }
    
    
    
    
    const echoes=[...root.querySelectorAll('.arcade-mallet.is-echo')],swoosh=q('.arcade-swoosh'),burst=q('.arcade-burst'),shadow=q('.arcade-shadow');
    const pivot={x:.8,y:.9},face={x:.103,y:.343},ready=10,windup=40,impactAngle=-42,turn=deg=>`rotate(${deg}deg)`;
    function facePoint(w,h,angle){const px=w*pivot.x,py=h*pivot.y,fx=w*face.x-px,fy=h*face.y-py,a=angle*Math.PI/180;return {x:px+fx*Math.cos(a)-fy*Math.sin(a),y:py+fx*Math.sin(a)+fy*Math.cos(a)}}
    function aim(x,y){
      const w=mallet.offsetWidth,h=mallet.offsetHeight,f=facePoint(w,h,impactAngle);
      for(const m of [mallet,...echoes]){m.style.left=(x-f.x)+'px';m.style.top=(y-f.y)+'px'}
      shadow.style.left=x+'px';shadow.style.top=y+'px';
      game.aim={left:x-f.x,top:y-f.y,w,h};
    }
    function swing(x,y){
      board.classList.add('has-mallet');aim(x,y);
      mallet.getAnimations().forEach(animation=>animation.cancel());
      if(quick){strike(x,y);return}
      const blow=mallet.animate([
        {transform:turn(ready),easing:'cubic-bezier(.2,.7,.3,1)'},
        {transform:turn(windup),offset:.22,easing:'cubic-bezier(.65,0,.9,.45)'},
        {transform:turn(impactAngle),offset:.4,easing:'linear'},
        {transform:`${turn(impactAngle-3)} scale(1.05,.92)`,offset:.47,easing:'cubic-bezier(.2,.7,.3,1)'},
        {transform:turn(impactAngle+28),offset:.72,easing:'ease-in-out'},
        {transform:turn(ready)}
      ],{duration:400});
      echoes.forEach((echo,i)=>{echo.style.transform=turn(i?impactAngle+20:windup-22);echo.animate([{opacity:0},{opacity:.5-.18*i,offset:.45},{opacity:0}],{duration:120,delay:96+i*26})});
      shadow.animate([{transform:'translate(-50%,-50%) scale(.75)',opacity:.35},{transform:'translate(-50%,-50%) scale(.6)',opacity:.25,offset:.22},{transform:'translate(-50%,-50%) scale(1.1)',opacity:.6,offset:.4},{transform:'translate(-50%,-50%) scale(.75)',opacity:.35}],{duration:400});
      const {left,top,w,h}=game.aim,arc=[];
      for(let k=0;k<=14;k++){const p=facePoint(w,h,windup+(impactAngle-windup)*k/14);arc.push(`${(left+p.x).toFixed(1)} ${(top+p.y).toFixed(1)}`)}
      swoosh.setAttribute('d','M'+arc.join('L'));
      swoosh.animate([{strokeDashoffset:1,opacity:.85},{strokeDashoffset:0,opacity:.85,offset:.55},{strokeDashoffset:0,opacity:0}],{duration:200,delay:84,easing:'ease-out'});
      
      blow.ready.then(()=>later(()=>strike(x,y),160));
    }
    function impact(x,y,hit){
      if(quick)return;
      burst.animate([{transform:`translate(${x}px,${y}px) scale(.55)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(1.05)`,opacity:1,offset:.45},{transform:`translate(${x}px,${y}px) scale(1.3)`,opacity:0}],{duration:hit?340:260,easing:'cubic-bezier(.2,.8,.3,1)'});
      board.animate([{translate:'0 0'},{translate:`0 ${hit?5:3}px`},{translate:'0 -2px'},{translate:'0 1px'},{translate:'0 0'}],{duration:hit?180:130,easing:'linear'});
    }
    function strike(x,y){
      const r=board.getBoundingClientRect();let hit=-1;
      game.up.forEach((sprite,i)=>{if(hit>=0)return;const b=items[i].getBoundingClientRect();if(x+r.left>=b.left-12&&x+r.left<=b.right+12&&y+r.top>=b.top-12&&y+r.top<=b.bottom+12)hit=i});
      impact(x,y,hit>=0);
      if(game.stage==='new'){if(hit>=0&&game.up.get(hit)==='insight'&&!game.solved)solve(hit,x,y);return}
      if(game.stage!=='old')return;
      game.spent+=500;spentLabel.textContent=number.format(game.spent);
      float(x,y-24,arabic?`−${number.format(500)}`:'−500');
      if(hit>=0){bonk(hit);if(Math.random()<.2)game.orders+=1}
    }
    function solve(i,x,y){
      game.solved=true;root.classList.remove('is-hinting');
      const item=items[i];item.getAnimations().forEach(animation=>animation.cancel());
      item.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-10%) scale(1.12)',offset:.4},{transform:'translateY(0) scale(1)'}],{duration:quick||540,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
      float(x,y-30,arabic?`+${number.format(320)} طلب`:'+320 orders',true);
      const spent=Math.max(game.spent,6500);
      q('.receipt-old').textContent=`${money(spent)} · ${orders(game.orders)}`;
      q('.receipt-new').textContent=`${money(500)} · ${orders(320)}`;
      root.classList.add('is-solved');
    }
    
    function popLoop(){
      if(game.stage!=='old'||!game.active)return;
      if(game.up.size<3){
        const free=[0,1,2,3,4,5].filter(i=>!game.up.has(i)&&i!==game.last),i=free[Math.floor(Math.random()*free.length)];
        let sprite;do sprite=arcadeCliches[Math.floor(Math.random()*arcadeCliches.length)];while(sprite===game.sprite);
        game.last=i;game.sprite=sprite;rise(i,sprite,820+Math.random()*420);
      }
      later(popLoop,470+Math.random()*360);
    }
    function ghost(){
      if(!game.active||game.played&&game.stage==='old')return;
      const r=board.getBoundingClientRect(),at=i=>{const b=items[i].getBoundingClientRect();swing(b.left-r.left+b.width/2,b.top-r.top+b.height*.45)};
      if(game.stage==='old'){const up=[...game.up.keys()];if(up.length)at(up[Math.floor(Math.random()*up.length)]);later(ghost,760+Math.random()*320)}
      else if(game.stage==='new'&&!game.solved&&game.up.get(4)==='insight')at(4);
    }
    function start(){
      clearTimers();
      if(game.stage==='old'){popLoop();if(!game.played)later(ghost,2200)}
      if(game.stage==='new'&&!game.solved){later(()=>{rise(4,'insight');root.classList.add('is-hinting')},420);later(ghost,4600)}
      if(game.stage==='new'&&game.solved&&!game.up.has(4))rise(4,'insight');
    }
    game.enter=stage=>{
      if(game.stage===stage)return;
      game.stage=stage;root.dataset.stage=stage;clearTimers();
      [...game.up.keys()].forEach(sink);root.classList.remove('is-hinting');
      board.classList.toggle('is-playable',stage!=='verdict');if(stage==='verdict')board.classList.remove('has-mallet');
      if(stage==='old'){root.classList.remove('is-solved');game.solved=false}
      if(game.active)start();
    };
    board.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||game.stage==='verdict')return;const r=board.getBoundingClientRect();board.classList.add('has-mallet');aim(event.clientX-r.left,event.clientY-r.top)});
    board.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')board.classList.remove('has-mallet')});
    board.addEventListener('pointerdown',event=>{
      if(game.stage==='verdict')return;
      game.played=true;const r=board.getBoundingClientRect();swing(event.clientX-r.left,event.clientY-r.top);
      if(event.pointerType!=='mouse')later(()=>board.classList.remove('has-mallet'),650);
    });
    new IntersectionObserver(entries=>{
      game.active=entries.some(entry=>entry.isIntersecting);
      if(game.active)start();else{clearTimers();[...game.up.keys()].forEach(sink)}
    },{threshold:.35}).observe(board);
    
    new IntersectionObserver((entries,observer)=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();for(const name of [...arcadeCliches,'insight']){const image=new Image();image.src=`/assets/arcade/${name}.webp`;image.decode?.().catch(()=>{})}},{rootMargin:'150% 0px'}).observe(board);
    measure();
  }
  function renderArcade(scene,progress){
    scene.game.enter(progress<.45?'old':progress<.62?'verdict':'new');
    scene.media.dataset.progress=progress.toFixed(3);
  }
  
  
  function renderDallah(scene,progress){
    const {parts}=scene,height=scene.media.clientHeight,still=reduced.matches;
    const rise=still?(progress>.02?1:0):smooth(clamp(progress/.26)),bounce=still?0:Math.sin(clamp((progress-.18)/.12)*Math.PI);
    const tilt=still?1:smooth(clamp((progress-.3)/.12)),pour=still?1:clamp((progress-.38)/.1),fill=still?1:smooth(clamp((progress-.42)/.16));
    const steam=still?0:clamp((progress-.54)/.06)*(1-clamp((progress-.66)/.06));
    const gold=still?0:smooth(clamp((progress-.52)/.33)),cream=still?(progress>.7?1:0):smooth(clamp((progress-.64)/.36));
    const splash=still?0:clamp((progress-.44)/.05)*(1-clamp((progress-.55)/.06));
    parts.veil.style.opacity=String(.92*rise);
    parts.rise.style.transform=`translateY(${(1-rise)*640-14*bounce}px)`;
    parts.tilt.style.transform=`translateY(${-40*tilt}px) rotate(${-42*tilt}deg)`;
    parts.streams.forEach(stream=>stream.style.strokeDashoffset=String(1-pour));
    parts.splash.style.opacity=String(splash);
    parts.splash.style.transform=`translateY(${-10*splash}px)`;
    parts.coffee.style.transform=`translateY(${56-44*fill}px)`;
    parts.steam.style.opacity=String(steam);
    parts.gold.style.transform=`translateY(${(1-gold)*(height+140)-100*gold}px)`;
    parts.cream.style.transform=`translateY(${(1-cream)*(height+140)-100*cream}px)`;
    scene.media.dataset.progress=progress.toFixed(3);
  }
  
  
  
  
  const palaceStages=[.1,.3,.5,.7];
  function installPalace(scene,root){
    scene.media=root;scene.placed=0;scene.stage=-1;
    scene.parts={figure:root.querySelector('.palace-figure'),art:root.querySelector('.palace-art'),bands:[...root.querySelectorAll('.palace-band')],slices:[...root.querySelectorAll('.palace-slice')],captions:[...root.querySelectorAll('.palace-captions li')]};
    scene.queue=Promise.resolve();
    
    const hot=floor=>{
      scene.parts.bands.forEach((band,i)=>band.classList.toggle('is-hot',i===floor&&i<=scene.placed&&i>0));
      scene.parts.captions.forEach((caption,i)=>caption.classList.toggle('is-hot',i+1===floor));
    };
    
    scene.parts.bands.forEach((band,i)=>{if(!i)return;band.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hot(i)});band.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')hot(-1)});band.addEventListener('click',()=>hot(band.classList.contains('is-hot')?-1:i))});
    scene.parts.captions.forEach((caption,i)=>{const button=caption.querySelector('button');for(const type of ['pointerenter','focus'])button.addEventListener(type,()=>hot(i+1));for(const type of ['pointerleave','blur'])button.addEventListener(type,()=>hot(-1))});
    
    let tilt=[0,0],target=[0,0],tiltFrame=0;
    const lean=()=>{tiltFrame=0;tilt=tilt.map((v,i)=>v+(target[i]-v)*.12);scene.parts.art.style.transform=`rotateX(${(-tilt[1]*4).toFixed(2)}deg) rotateY(${(tilt[0]*6).toFixed(2)}deg)`;if(Math.abs(tilt[0]-target[0])+Math.abs(tilt[1]-target[1])>.002)tiltFrame=requestAnimationFrame(lean)};
    scene.element.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType!=='mouse')return;const box=scene.parts.figure.getBoundingClientRect();target=[clamp((event.clientX-box.left)/box.width)*2-1,clamp((event.clientY-box.top)/box.height)*2-1];if(!tiltFrame)tiltFrame=requestAnimationFrame(lean)});
    scene.element.addEventListener('pointerleave',()=>{target=[0,0];if(!tiltFrame)tiltFrame=requestAnimationFrame(lean)});
  }
  
  function dropFloor(scene,floor,instant){
    const {slices,bands,captions}=scene.parts,slice=slices[floor];
    bands[floor].classList.add('is-placed');captions[floor-1].classList.add('is-shown');
    if(instant)return Promise.resolve();
    const fall=scene.parts.figure.getBoundingClientRect().bottom;
    const landing=slice.animate([
      {transform:`translateY(${-fall}px)`,offset:0,easing:'cubic-bezier(.5,0,.9,.4)'},
      {transform:'translateY(0) scaleY(.965)',offset:.6,easing:'cubic-bezier(.2,.7,.3,1)'},
      {transform:'translateY(-1.6%) scaleY(1.01)',offset:.8,easing:'ease-in-out'},
      {transform:'translateY(0) scaleY(1)',offset:1}
    ],{duration:820});
    const impact=840*.6;
    for(let below=0;below<floor;below++)slices[below].animate([{transform:'none'},{transform:`translateY(${(floor-below)*.5+1}px) scaleY(.992)`},{transform:'none'}],{duration:260,delay:impact,easing:'ease-out'});
    return landing.finished.catch(()=>{});
  }
  function liftFloor(scene,floor,instant){
    const {slices,bands,captions}=scene.parts;
    captions[floor-1].classList.remove('is-shown','is-hot');
    if(instant){bands[floor].classList.remove('is-placed','is-hot');return Promise.resolve()}
    const lift=slices[floor].animate([{transform:'none'},{transform:`translateY(${-scene.parts.figure.getBoundingClientRect().bottom}px)`}],{duration:420,easing:'cubic-bezier(.6,0,.85,.3)'});
    return lift.finished.then(()=>bands[floor].classList.remove('is-placed','is-hot'),()=>{});
  }
  function renderPalace(scene,progress){
    const stage=palaceStages.filter(at=>progress>=at).length;
    scene.media.dataset.progress=progress.toFixed(3);
    if(scene.stage===stage)return;
    const first=scene.stage<0,instant=first||reduced.matches;
    scene.stage=stage;scene.media.dataset.stage=stage;
    scene.media.classList.toggle('is-complete',stage===palaceStages.length);
    scene.parts.captions.forEach((caption,i)=>caption.classList.toggle('is-current',i===stage-1));
    
    scene.queue=scene.queue.then(async()=>{
      while(scene.placed<scene.stage){scene.placed++;await dropFloor(scene,scene.placed,instant)}
      while(scene.placed>scene.stage){await liftFloor(scene,scene.placed,instant);scene.placed--}
    });
  }
  
  
  const majlisTiers=[['.framer-187nhgb',.31],['.framer-1cu2ofb',.64],['.framer-tkqv5y',1]];
  function installMajlis(){
    const pricing=document.getElementById('pricing');if(!pricing||pricing.dataset.majlis!==undefined)return;
    const cards=majlisTiers.map(([selector,reach])=>[pricing.querySelector(selector),reach]).filter(([card])=>card);
    if(cards.length<3)return;
    pricing.dataset.majlis='';
    cards.forEach(([card,reach])=>{
      const strip=document.createElement('div');strip.className='majlis-strip';strip.setAttribute('aria-hidden','true');
      strip.innerHTML='<div class="majlis-rug"></div><img class="majlis-roll" src="/assets/majlis/roll.webp" alt="" decoding="async">';
      card.prepend(strip);
      let frame=0,shown=0;
      const set=value=>{shown=value;strip.style.setProperty('--shown',value.toFixed(4));strip.style.setProperty('--roll',reach>=1?String(Math.min(1,(1-value)*6)):'1')};
      const tween=(to,duration,then)=>{cancelAnimationFrame(frame);const from=shown,start=performance.now();const step=now=>{const k=Math.min(1,(now-start)/duration),e=k<.5?4*k*k*k:1-(2-2*k)**3/2;set(from+(to-from)*e);if(k<1)frame=requestAnimationFrame(step);else then?.()};frame=requestAnimationFrame(step)};
      const unroll=()=>{if(reduced.matches){set(reach);return}tween(reach,900+reach*800)};
      set(reduced.matches?reach:0);
      new IntersectionObserver((entries,observer)=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();unroll()}},{threshold:.5}).observe(card);
      
      card.parentElement.addEventListener('pointerenter',event=>{if(event.pointerType!=='mouse'||reduced.matches||shown<reach*.98)return;tween(reach*.35,320,()=>tween(reach,700+reach*500))});
    });
  }
  
  
  
  
  
  const roshanPivot={x:876,y:1101},roshanBench=1987,roshanWidth=1856,roshanKnot=10/816,roshanMouth={x:.5,y:.36};
  function installRoshan(){
    const root=document.querySelector('#testimonial .hussam-prompts');if(!root||root.dataset.roshan!==undefined)return;
    const q=selector=>root.querySelector(selector),house=q('.roshan-frame');if(!house)return;
    root.dataset.roshan='';
    const basket=q('.roshan-basket'),basketArt=basket.querySelector('img'),cords=[...root.querySelectorAll('.roshan-rope path')],slip=q('.roshan-slip'),scroll=q('.roshan-scroll');
    const asks=[...root.querySelectorAll('.roshan-ask')],paper=q('.roshan-paper'),answers=[...q('.roshan-answers').content.children];
    const rope={length:0,angle:0,spin:0,move:null},job={busy:false,next:null,asked:false};
    let k=1,width=0,raf=0,last=0;
    const sprite=()=>width/k;                       
    const rest=()=>roshanBench-sprite()*816/840*(1-roshanKnot)-roshanPivot.y,top=()=>30;
    function draw(){
      const x=roshanPivot.x+Math.sin(rope.angle)*rope.length,y=roshanPivot.y+Math.cos(rope.angle)*rope.length;
      cords.forEach(cord=>cord.setAttribute('d',`M${roshanPivot.x} ${roshanPivot.y-4}L${x.toFixed(1)} ${y.toFixed(1)}`));
      basket.style.transform=`translate(${(x*k-width/2).toFixed(1)}px,${(y*k-width*816/840*roshanKnot).toFixed(1)}px) rotate(${(-rope.angle*57.2958).toFixed(2)}deg)`;
    }
    function measure(){
      const wasResting=!rope.move&&Math.abs(rope.length-rest())<2||!rope.length;
      k=house.clientWidth/roshanWidth;width=basket.offsetWidth;if(!k||!width)return;
      if(wasResting&&!job.busy)rope.length=rest();
      draw();
    }
    new ResizeObserver(measure).observe(house);measure();
    const dusk=q('.roshan-dusk'),ready=()=>house.classList.add('is-ready');
    if(dusk.complete&&dusk.naturalWidth)ready();else{dusk.addEventListener('load',ready,{once:true});dusk.addEventListener('error',ready,{once:true})}
    
    function tick(now){
      const dt=Math.min(.04,(now-last)/1000);last=now;
      if(rope.move){
        const m=rope.move,t=Math.min(1,(now-m.start)/m.duration);
        rope.length=m.from+(m.to-m.from)*m.ease(t);
        if(t>=1){rope.move=null;m.done()}
      }
      const hanging=rope.length<rest()-3;
      if(hanging){rope.spin+=(-7700/Math.max(40,rope.length)*Math.sin(rope.angle)-1.5*rope.spin)*dt;rope.angle+=rope.spin*dt}
      else{rope.spin=0;rope.angle*=.7}
      draw();
      raf=rope.move||Math.abs(rope.spin)>.003||Math.abs(rope.angle)>.0015?requestAnimationFrame(tick):0;
    }
    const wake=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}};
    const kick=amount=>{rope.spin+=amount*(Math.random()<.5?-1:1);wake()};
    const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const haul=(to,duration,ease)=>new Promise(resolve=>{rope.move={from:rope.length,to,start:performance.now(),duration,ease,done:resolve};wake()});
    const lift=t=>t<.5?4*t*t*t:1-(2-2*t)**3/2,lower=t=>t<.6?.55*(t/.6)**2:.55+.45*(1-(1-(t-.6)/.4)**2);
    const mouth=()=>{const box=basket.getBoundingClientRect();return {x:box.left+box.width*roshanMouth.x,y:box.top+box.height*roshanMouth.y}};
    function fly(kind,from,to,duration){
      const flier=document.createElement('div');flier.className=`roshan-flying is-${kind}`;document.body.append(flier);
      const size=flier.getBoundingClientRect(),start={x:from.x-size.width/2,y:from.y-size.height/2},end={x:to.x-size.width/2,y:to.y-size.height/2};
      const peak=Math.min(start.y,end.y)-Math.max(60,Math.abs(end.x-start.x)*.18);
      const at=(t,scale,turn)=>({transform:`translate(${start.x+(end.x-start.x)*t}px,${(1-t)*(1-t)*start.y+2*(1-t)*t*peak+t*t*end.y}px) scale(${scale}) rotate(${turn}deg)`});
      const shrink=kind==='slip'?[1,.7,.32]:[.32,.8,1];
      return flier.animate([at(0,shrink[0],-4),at(.5,shrink[1],8),at(1,shrink[2],-10)],{duration,easing:'cubic-bezier(.35,0,.25,1)'}).finished.then(()=>flier.remove(),()=>flier.remove());
    }
    function show(index,unroll){
      const answer=answers[index].cloneNode(true);
      paper.replaceChildren(...answer.childNodes);
      const done=document.createElement('b');done.className='roshan-done';done.setAttribute('aria-hidden','true');done.textContent=document.documentElement.lang==='en'?'Done':'تم';paper.append(done);
      paper.classList.remove('is-unrolling');if(unroll){void paper.offsetWidth;paper.classList.add('is-unrolling')}
    }
    const choose=index=>asks.forEach((ask,i)=>ask.setAttribute('aria-pressed',String(i===index)));
    const light=()=>house.classList.add('is-lit');
    async function send(index){
      choose(index);light();
      if(reduced.matches||!width){show(index,false);return}
      if(job.busy){job.next=index;return}
      job.busy=true;
      await fly('slip',(()=>{const box=asks[index].getBoundingClientRect();return {x:box.left+box.width/2,y:box.top+box.height/2}})(),mouth(),620);
      slip.style.opacity='1';
      basketArt.animate([{transform:'scale(1,1)'},{transform:'scale(1.04,.95)'},{transform:'scale(1,1)'}],{duration:260,easing:'ease-out'});
      await wait(160);kick(.12);
      await haul(top(),1250,lift);kick(.55);
      slip.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-260px)',opacity:0}],{duration:380,easing:'ease-in',fill:'forwards'}).finished.then(()=>{slip.style.opacity='0';slip.getAnimations().forEach(a=>a.cancel())});
      await wait(1050);
      scroll.style.opacity='1';scroll.animate([{transform:'translateY(-240px)'},{transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.5,0,.75,0)'});
      await wait(320);kick(.3);
      await haul(rest(),1450,lower);
      basketArt.animate([{transform:'scale(1,1)'},{transform:'scale(1.06,.9)',offset:.35},{transform:'scale(.98,1.03)',offset:.7},{transform:'scale(1,1)'}],{duration:420,easing:'ease-out'});
      await wait(200);
      const card=paper.getBoundingClientRect(),from=mouth();scroll.style.opacity='0';
      await fly('scroll',from,{x:card.left+card.width/2,y:card.top+28},560);
      show(index,true);
      job.busy=false;
      if(job.next!==null){const next=job.next;job.next=null;send(next)}
    }
    asks.forEach((ask,i)=>{ask.setAttribute('aria-pressed','false');ask.addEventListener('click',()=>{job.asked=true;send(i)})});
    
    
    new IntersectionObserver((entries,observer)=>{
      if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();
      setTimeout(light,250);
      setTimeout(()=>{if(!job.asked&&!job.busy)send(0)},reduced.matches?0:1500);
    },{threshold:.55}).observe(house);
  }
  
  
  
  function installBell(root){
    const bell=root.querySelector('.cta-bell'),body=root.querySelector('.cta-body'),knob=root.querySelector('.cta-knob'),done=root.querySelector('.cta-done'),waves=[...root.querySelectorAll('.cta-wave')];
    function ring(call){
      root.classList.add('is-rung');
      if(!reduced.matches){
        knob.animate([{transform:'translateY(0)'},{transform:'translateY(2.4%)',offset:.28},{transform:'translateY(-.5%)',offset:.7},{transform:'translateY(0)'}],{duration:320,easing:'ease-out'});
        body.animate([0,1.3,-1.1,.9,-.7,.5,-.3,.15,0].map(turn=>({transform:`rotate(${turn}deg)`})),{duration:720,delay:80,easing:'linear'});
        waves.forEach((wave,i)=>wave.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(.94)',offset:.22},{opacity:0,transform:'scale(1.24)'}],{duration:780,delay:90+i*110,easing:'cubic-bezier(.2,.7,.3,1)'}));
        done.getAnimations().forEach(animation=>animation.cancel());
        done.animate([{opacity:0,transform:'scale(1.6) rotate(-8deg)'},{opacity:1,transform:'scale(.95) rotate(2.5deg)',offset:.68},{opacity:1,transform:'scale(1) rotate(2deg)'}],{duration:440,delay:150,easing:'cubic-bezier(.3,1.25,.5,1)',fill:'backwards'});
      }
      if(call)setTimeout(()=>dispatchEvent(new Event('hussam:contact')),reduced.matches?0:760);
    }
    bell.addEventListener('click',()=>ring(true));
    new IntersectionObserver((entries,observer)=>{
      if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();
      setTimeout(()=>{if(!root.classList.contains('is-rung'))ring(false)},450);
    },{threshold:.6}).observe(bell);
  }
  
  
  
  
  
  function installRiyadh(){
    for(const footer of document.querySelectorAll('footer.framer-e2Sry')){
      if(footer.querySelector('.hussam-riyadh'))continue;
      const scene=document.createElement('div');scene.className='hussam-riyadh';scene.setAttribute('aria-hidden','true');
      scene.innerHTML='<div class="riyadh-frame"><img class="riyadh-scene" src="/assets/riyadh/riyadh.webp" alt="" width="2400" height="1018" loading="lazy" decoding="async">'+
        '<img class="riyadh-traffic is-white" src="/assets/riyadh/traffic-white.webp" alt="" width="2400" height="517" loading="lazy" decoding="async">'+
        '<img class="riyadh-traffic is-red" src="/assets/riyadh/traffic-red.webp" alt="" width="2400" height="517" loading="lazy" decoding="async"></div>';
      footer.append(scene);
      
      new IntersectionObserver(entries=>{for(const entry of entries){if(entry.intersectionRatio>=.4)scene.classList.add('is-on');else if(!entry.isIntersecting)scene.classList.remove('is-on')}},{threshold:[0,.4]}).observe(scene);
    }
  }
  
  
  const gaps={};
  const gap=(key,on,id,side)=>{if(gaps[key]?.[0]!==on)gaps[key]=[on,on?parseFloat(getComputedStyle(document.getElementById(id))[side])||0:0];return gaps[key][1]};
  function update(){
    frame=0;
    
    
    const live=[],top=id=>document.getElementById(id)?.getBoundingClientRect().top;
    for(const scene of scenes){
      if(!scene.media?.isConnected)continue;
      const box=scene.element.getBoundingClientRect();
      if(scene.name!=='intro'&&(box.bottom<0||box.top>innerHeight*2))continue;
      live.push({scene,box,end:scene.end?document.querySelector(scene.end).getBoundingClientRect().top:0,third:scene.name==='dallah'||scene.name==='arcade'?top('maze-3'):undefined,fourth:scene.name==='dallah'?top('maze-4'):undefined});
    }
    for(const {scene,box,end,third,fourth} of live){
      const endDistance=scene.end?end-box.top:0;
      const travel=scene.end?Math.max(1,endDistance-innerHeight):Math.max(1,box.height-innerHeight);
      const progress=clamp(-box.top/travel);
      if(scene.name==='dallah'){
        
        
        if(third!==undefined&&fourth!==undefined)renderDallah(scene,clamp((.58*innerHeight-third)/(fourth-third+.78*innerHeight)));
        continue;
      }
      if(scene.name==='arcade'){
        
        if(third===undefined)continue;
        
        const dive=gap('dive',document.documentElement.classList.contains('has-dive'),'maze-1','marginTop');
        renderArcade(scene,clamp((-box.top-dive)/Math.max(1,third-box.top-innerHeight-dive)));continue;
      }
      if(scene.name==='brain'){
        
        
        const tail=gap('stack',stacked(),'brain-5','marginBottom'),span=Math.max(1,box.height-innerHeight-tail);
        renderPalace(scene,clamp(-box.top/span));
        const k=tail?clamp((-box.top-span)/tail):0,card=scene.stickyEl;
        card.style.transform=k?`scale(${(1-.1*k).toFixed(4)})`:'';card.style.borderRadius=k?`${(40*k).toFixed(1)}px`:'';
        scene.shade.style.opacity=(.5*k).toFixed(3);
        continue;
      }
      
      
      if(box.bottom>=0&&box.top<=innerHeight*2)renderHero(scene,progress);
    }
  }
  
  const stacked=()=>document.documentElement.classList.contains('has-stack');
  function setStack(){const on=!reduced.matches&&!!document.getElementById('brain-5');document.documentElement.classList.toggle('has-stack',on)}
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  function install(){
    for(const scene of scenes){
      const element=document.querySelector(scene.section),sticky=element?.querySelector(scene.sticky);
      if(!sticky)continue;
      if(scene.media?.isConnected){
        if(scene.name==='intro')fitHeroLines(scene);
        continue;
      }
      scene.element=element;
      if(scene.name==='brain'){
        const template=document.getElementById('hussam-palace-template');if(!template)continue;
        sticky.append(template.content.cloneNode(true));installPalace(scene,sticky.lastElementChild);
        scene.stickyEl=sticky;scene.shade=document.createElement('i');scene.shade.className='stack-shade';scene.shade.setAttribute('aria-hidden','true');sticky.append(scene.shade);
      }else if(scene.name==='arcade'){
        const template=document.getElementById('hussam-arcade-template');if(!template)continue;
        sticky.append(template.content.cloneNode(true));installArcade(scene,sticky.lastElementChild);
      }else if(scene.name==='dallah'){
        const template=document.getElementById('hussam-dallah-template');if(!template)continue;
        sticky.append(template.content.cloneNode(true));
        const art=sticky.lastElementChild,q=selector=>art.querySelector(selector);
        scene.media=art;scene.parts={veil:q('.dallah-veil'),rise:q('.dallah-rise'),tilt:q('.dallah-tilt'),streams:[...art.querySelectorAll('.dallah-stream')],splash:q('.dallah-splash'),coffee:q('.dallah-coffee'),steam:q('.dallah-steam'),gold:q('.dallah-flood-gold'),cream:q('.dallah-flood-cream')};
      }else installHero(scene,sticky);
    }
    const cta=document.getElementById('cta'),ctaTemplate=document.getElementById('hussam-cta-template');
    if(cta&&ctaTemplate&&!cta.querySelector('.hussam-cta')){cta.append(ctaTemplate.content.cloneNode(true));installBell(cta.querySelector('.hussam-cta'))}
    else if(cta&&!cta.querySelector('.hussam-closing-action')){
      const action=document.createElement('button');action.className='hire hussam-closing-action';action.setAttribute('data-contact','');
      action.textContent=document.documentElement.lang==='ar'?'استعن بحسام ↖':'Meet Hussam ↗';cta.append(action);
    }
    installMajlis();
    installRoshan();
    installRiyadh();
    schedule();
  }
  function start(){
    setStack();install();
    new MutationObserver(()=>{
      if((scenes.every(scene=>scene.media?.isConnected)&&document.querySelector('#cta .hussam-closing-action')&&(!document.getElementById('hussam-cta-template')||document.querySelector('#cta .hussam-cta'))&&!document.querySelector('#testimonial .hussam-prompts:not([data-roshan])')&&![...document.querySelectorAll('footer.framer-e2Sry')].some(footer=>!footer.querySelector('.hussam-riyadh')))||installFrame)return;
      installFrame=requestAnimationFrame(()=>{installFrame=0;install()});
    }).observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>{setRaster();for(const key in gaps)delete gaps[key];install()},{passive:true});
  reduced.addEventListener('change',()=>{setStack();schedule()});
})();
