(()=>{
 
 
 
 
 
 
 
 
 const SURFACE=[2752,1330],LINE=1479,KEEL=704,HULL=[900,1160];
 const REEF=[2400,906],DIVER=[640,1437],DIVER_ROPE=.495,BED=[900,1343],FISH=[700,338],FAN=[560,545],WEED_L=[440,1154],WEED_R=[480,837],SILT=[1200,561];
 const DECK=[2752,1536],HUSSAM=[1129,445,816,1090],FACES=[795,376,1131,389];
 
 const B={emerge:[.02,.13],dive:[.1,.49],land:[.47,.53],kneel:.519,tug:[.585,.594],stand:.594,rise:[.6,.715],exit:[.685,.725],wipe:[.715,.775],tilt:[.77,.9],arrive:[.835,.895]};
 
 const HULL_PAD=240;
 function installDiveScene(root,lang){
  const section=root.querySelector('.dive'),stage=section.querySelector('.dive-stage'),q=s=>section.querySelector(s);
  const sea=q('.sea'),bands=q('.sea-bands'),ropes=q('.sea-ropes'),surface=q('.sea-surface'),hull=q('.sea-hull'),fish=q('.sea-fish'),fan=q('.sea-fan'),reef=q('.sea-reef');
  const down=q('.sea-diver.is-down'),bed=q('.sea-diver.is-bed'),silt=q('.sea-silt'),weedL=q('.sea-weed.is-left'),weedR=q('.sea-weed.is-right'),tagList=q('.sea-tags'),tags=[...tagList.children];
  const deckWindow=q('.deck-window'),deck=q('.deck'),base=q('.deck-base'),faces=q('.deck-faces'),hussam=q('.deck-hussam'),water=q('.waterline');
  const lines=[...section.querySelectorAll('.dive-line')],sub=q('.dive-sub');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const t=(ar,en)=>lang==='en'?en:ar,clamp=n=>Math.max(0,Math.min(1,n)),smooth=k=>k*k*(3-2*k),inOut=k=>k<.5?4*k*k*k:1-(2-2*k)**3/2;
  const span=(p,[a,b])=>clamp((p-a)/(b-a)),fade=(p,a,b)=>smooth(clamp((p-a)/(b-a)));
  section.setAttribute('aria-label',t('البحث غوص','Research is a dive'));
  let layout=null,inView=false,raf=0;
  const size=(el,w,h)=>{el.style.width=w.toFixed(1)+'px';el.style.height=h.toFixed(1)+'px'};
  const at=(el,x,y,extra='')=>{el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${extra}`};
  function measure(){
   const VW=stage.clientWidth,VH=stage.clientHeight,tall=VH>VW*.9;
   
   const s0=tall?Math.max(VW/SURFACE[0],VW*1.15/2180):Math.max(VW/SURFACE[0],.62*VH/SURFACE[1]),sw=SURFACE[0]*s0,sh=SURFACE[1]*s0;
   const sx=Math.min(0,Math.max(VW-sw,VW/2-LINE*s0)),ropeX=sx+LINE*s0;
   
   const top=tall?Math.max(0,128-330*s0):0;
   
   const D=sh+(tall?3.3:2.9)*VH;
   const rs=Math.max(VW/REEF[0],(tall?.36:.46)*VH/REEF[1]),rw=REEF[0]*rs,rh=REEF[1]*rs;
   
   
   const dh=(tall?.5:.56)*VH,dw=dh*DIVER[0]/DIVER[1],bh=dh*.48,bw=bh*BED[0]/BED[1],lean=dh*107/DIVER[1];
   const fw=(tall?.62:.34)*VW,fh=fw*FISH[1]/FISH[0],nh=(tall?.28:.34)*VH,nw=nh*FAN[0]/FAN[1];
   const lh=(tall?.6:.72)*VH,lw=lh*WEED_L[0]/WEED_L[1],gh=(tall?.48:.58)*VH,gw=gh*WEED_R[0]/WEED_R[1];
   const tw=Math.max(bw*2.5,(tall?.62:.3)*VW),th=tw*SILT[1]/SILT[0];
   size(surface,sw,sh);size(bands,VW,D+VH-sh);size(reef,rw,rh);size(down,dw,dh);size(bed,bw,bh);size(fish,fw,fh);size(fan,nw,nh);size(weedL,lw,lh);size(weedR,gw,gh);size(silt,tw,th);
   size(hull,HULL[1]*s0,KEEL*s0+HULL_PAD);
   size(ropes,sw,D-sh-rh*.4);
   
   const string=Math.max(18,VW*.025);
   const tagAt=tags.map((tag,i)=>{tag.style.setProperty('--string',string+'px');return {x:ropeX+string,y:sh+VH*.5+(D-sh-VH*1.25)*[.06,.34,.62,.88][i]}});
   const ds=Math.max(VW/DECK[0],VH/DECK[1]),deckW=DECK[0]*ds,deckH=DECK[1]*ds;
   const dx=Math.min(0,Math.max(VW-deckW,VW/2-1355*ds)),dy=Math.min(0,Math.max(VH-deckH,VH*.62-894*ds));
   
   
   const raster=Math.min(3,Math.max(1,devicePixelRatio||1)),k=ds*raster;
   size(base,DECK[0]/raster,DECK[1]/raster);size(faces,FACES[2]/raster,FACES[3]/raster);size(hussam,HUSSAM[2]/raster,HUSSAM[3]/raster);
   
   const sand=D-rh*.5;
   layout={VW,VH,tall,top,s0,sh,sx,ropeX,keel:KEEL*s0,D,rw,rh,dw,dh,bw,bh,fw,fh,nw,nh,lw,lh,gw,gh,tw,th,tagAt,ds,k,dx,dy,sand,lean,bottom:D-VH};
  }
  
  const camera=(p,L)=>p<B.rise[0]?L.bottom*inOut(span(p,B.dive)):L.bottom*(1-inOut(span(p,B.rise)));
  
  
  const depth=(y,cam,k,ref)=>y-cam-(k-1)*(cam-ref);
  
  
  
  function place(el,v,tilt){el.style.opacity=Math.max(.001,Math.min(1,v*1.5)).toFixed(3);el.style.transform=v<1?`translateY(${(-16*(1-v)).toFixed(1)}px) rotate(calc(var(--r) + ${(tilt*(1-v)).toFixed(2)}deg))`:''}
  
  
  function puff(life,grow,L,feet){
   if(life<=0||life>=1){silt.style.opacity='.001';return}
   const g=(1-(1-Math.min(1,life*4))**3)*grow,k=.4+.6*g,w=L.tw*k,h=L.th*k;
   at(silt,L.ropeX-w/2,feet-h*.6-L.VH*.05*life,` scale(${k.toFixed(4)})`);
   silt.style.opacity=Math.max(.001,Math.min(1,life*9)*(1-smooth(clamp((life-.32)/.68)))).toFixed(3);
  }
  function render(p){
   if(!layout)measure();
   const L=layout,{VW,VH}=L;
   if(reduced.matches){p=.96;for(const el of [...lines,sub,faces]){el.style.opacity='';el.style.transform=''}}
   const cam=camera(p,L)-L.top;
   
   const underwater=p<B.wipe[1];sea.style.opacity=underwater?'':'0';
   tagList.style.opacity=underwater?(1-fade(p,B.tug[0],B.rise[0])).toFixed(3):'0';
   if(underwater){
    
    
    at(surface,L.sx,-cam);at(hull,L.sx+HULL[0]*L.s0,-cam-HULL_PAD);at(bands,0,L.sh-cam);at(ropes,L.sx,L.sh-1-cam);at(reef,(VW-L.rw)/2,Math.min(L.D-L.rh-cam,VH-2));
    tags.forEach((tag,i)=>at(tag,L.tagAt[i].x,L.tagAt[i].y-cam));
    
    const fishY=L.sh+VH*.55;at(fish,(L.tall?VW*.5:VW*.62)-span(p,[.06,.42])*VW*.55,depth(fishY,cam,.82,fishY-VH*.4));
    at(fan,VW*(L.tall?.58:.66),depth(L.D-L.rh-L.nh*.45,cam,1.12,L.bottom));
    at(weedL,-L.lw*.28,depth(L.D-L.lh*.92,cam,1.35,L.bottom));at(weedR,VW-L.gw*.72,depth(L.D-L.gh*.92,cam,1.35,L.bottom));
    
    
    const keel=L.keel-cam,keel0=L.keel+L.top,sway=Math.sin(p*46)*VH*.006;
    const tucked=keel0-L.dh-VH*.02,hanging=keel0+VH*.03;
    let downY=tucked+(hanging-tucked)*smooth(span(p,B.emerge));
    downY+=(VH*.22-downY)*smooth(span(p,[.12,.3]));
    const sand=L.sand-cam,standY=sand-L.dh*.96;
    downY+=(standY-VH*.22)*smooth(span(p,B.land));
    
    if(p>=B.stand){downY=standY+(VH*.28-standY)*smooth(span(p,[B.stand,.64]));downY+=(keel-L.dh-VH*.02-downY)*smooth(span(p,B.exit))}
    const kneeling=p>=B.kneel&&p<B.stand;
    at(down,L.ropeX-DIVER_ROPE*L.dw,downY+sway);
    
    down.style.opacity=kneeling?'.001':'1';bed.style.opacity=kneeling?'1':'.001';
    
    const settle=kneeling?1-span(p,[B.kneel,B.kneel+.016]):0,lifted=VH*.02*span(p,B.tug);
    at(bed,L.ropeX-L.lean-L.bw*.5,sand-L.bh*.97+L.bh*.05*settle-lifted,settle?` scale(1,${(1-.05*settle).toFixed(4)})`:'');
    
    const first=span(p,[.506,.57]);
    puff(first>0&&first<1?first:span(p,[.588,.635]),first>0&&first<1?1:.8,L,sand);
   }
   
   const wipe=inOut(span(p,B.wipe)),onDeck=wipe>0;
   deckWindow.style.opacity=onDeck||reduced.matches?'1':'0';
   const hidden=reduced.matches?0:(1-wipe)*VH;at(deckWindow,0,-hidden);at(deck,0,hidden);
   water.style.opacity=wipe>0&&wipe<1&&!reduced.matches?'1':'0';at(water,0,wipe*VH-13);
   if(onDeck||reduced.matches){
    
    
    const surfacing=reduced.matches?0:(1-wipe)*VH*.08,tilt=1-inOut(span(p,B.tilt)),lift=VH*.09*tilt-surfacing;
    const arrive=reduced.matches?1:span(p,B.arrive),risen=1-(1-arrive)**3;
    const scale=` scale(${L.k.toFixed(5)})`;
    at(base,L.dx,L.dy+lift,scale);
    at(faces,L.dx+FACES[0]*L.ds,L.dy+FACES[1]*L.ds+lift,scale);
    at(hussam,L.dx+HUSSAM[0]*L.ds,L.dy+HUSSAM[1]*L.ds+lift*1.8+(1-risen)*VH,scale);
    
    if(!reduced.matches)faces.style.opacity=Math.max(.001,fade(p,B.arrive[1]-.03,B.arrive[1]+.005)).toFixed(3);
   }
   if(reduced.matches)return;
   
   const [shoot,pearlLine,breath,empty,week,knows]=lines;
   const out1=1-fade(p,.1,.118);
   place(shoot,fade(p,.006,.036)*out1,-5);place(pearlLine,fade(p,.042,.074)*out1,4);
   place(breath,fade(p,.532,.556)*(1-fade(p,.584,.6)),-4);
   const out2=1-fade(p,.85,.866);
   place(empty,fade(p,.784,.808)*out2,-5);place(week,fade(p,.81,.834)*out2,4);
   place(knows,fade(p,.893,.914),-4);place(sub,fade(p,.914,.936),3);
  }
  const progress=()=>{const rect=section.getBoundingClientRect();return clamp(-rect.top/Math.max(1,rect.height-innerHeight))};
  function tick(){raf=0;if(inView)render(progress())}
  const schedule=()=>{if(!raf&&inView)raf=requestAnimationFrame(tick)};
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)schedule()},{rootMargin:'0px'}).observe(section);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{layout=null;schedule()},{passive:true});
  reduced.addEventListener('change',schedule);
  
  new IntersectionObserver((entries,observer)=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();for(const image of section.querySelectorAll('img')){image.loading='eager';image.decode?.().catch(()=>{})}},{rootMargin:'150% 0px'}).observe(section);
  
  document.fonts?.ready.then(()=>{layout=null;schedule()});
  measure();render(0);
 }

 let installed;
 function mount(){
  const section=document.getElementById('how-it-works'),template=document.getElementById('hussam-demo-template');if(!section||!template)return;
  section.querySelectorAll('video:not([data-retired])').forEach(v=>{v.dataset.retired='true';v.pause();v.removeAttribute('src');v.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));v.load()});
  if(installed?.isConnected)return;
  const host=document.createElement('div');host.className='hussam-product-demo';const root=host.attachShadow({mode:'open'});root.append(template.content.cloneNode(true));
  const lang=document.documentElement.lang==='en'?'en':'ar';root.querySelector('.demo-wrap').classList.toggle('en',lang==='en');root.querySelectorAll('[data-ar]').forEach(e=>e.textContent=e.dataset[lang]);
  section.append(host);installed=host;installDiveScene(root,lang);document.dispatchEvent(new Event('hussam:demo-mounted'));
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})});function start(){mount();observer.observe(document.getElementById('main')||document.body,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
