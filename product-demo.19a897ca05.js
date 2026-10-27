(()=>{
 
 
 
 
 
 
 const SURFACE=[2752,1330],LINE=1479;
 const REEF=[2400,906],DIVER=[640,1437],DIVER_ROPE=.495,BED=[900,1343],FISH=[700,338],FAN=[560,545],WEED_L=[440,1154],WEED_R=[480,837];
 const DECK=[2752,1536],PEARL=[1355,894],HUSSAM=[1129,445,816,1090],FACES=[795,376,1131,389];
 
 const B={drop:[.02,.11],dive:[.1,.49],land:[.47,.53],tug:[.585,.62],rise:[.6,.71],wipe:[.655,.735],tilt:[.73,.86],pop:[.8,.85]};
 function installDiveScene(root,lang){
  const section=root.querySelector('.dive'),stage=section.querySelector('.dive-stage'),q=s=>section.querySelector(s);
  const sea=q('.sea'),bands=q('.sea-bands'),ropes=q('.sea-ropes'),surface=q('.sea-surface'),fish=q('.sea-fish'),fan=q('.sea-fan'),reef=q('.sea-reef');
  const down=q('.sea-diver.is-down'),bed=q('.sea-diver.is-bed'),weedL=q('.sea-weed.is-left'),weedR=q('.sea-weed.is-right'),tagList=q('.sea-tags'),tags=[...tagList.children];
  const deckWindow=q('.deck-window'),deck=q('.deck'),base=q('.deck-base'),faces=q('.deck-faces'),hussam=q('.deck-hussam'),pearl=q('.deck-pearl'),water=q('.waterline');
  const lines=[...section.querySelectorAll('.dive-line')],sub=q('.dive-sub');
  const next=root.querySelector('.deliverables'),tailEl=q('.dive-tail');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const t=(ar,en)=>lang==='en'?en:ar,clamp=n=>Math.max(0,Math.min(1,n)),smooth=k=>k*k*(3-2*k),inOut=k=>k<.5?4*k*k*k:1-(2-2*k)**3/2;
  const span=(p,[a,b])=>clamp((p-a)/(b-a)),fade=(p,a,b)=>smooth(clamp((p-a)/(b-a)));
  
  const spring=k=>k>=1?1:1-Math.exp(-5.5*k)*Math.cos(9*k);
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
   const dh=(tall?.5:.56)*VH,dw=dh*DIVER[0]/DIVER[1],bh=(tall?.38:.44)*VH,bw=bh*BED[0]/BED[1];
   const fw=(tall?.62:.34)*VW,fh=fw*FISH[1]/FISH[0],nh=(tall?.28:.34)*VH,nw=nh*FAN[0]/FAN[1];
   const lh=(tall?.6:.72)*VH,lw=lh*WEED_L[0]/WEED_L[1],gh=(tall?.48:.58)*VH,gw=gh*WEED_R[0]/WEED_R[1];
   size(surface,sw,sh);size(bands,VW,D+VH-sh);size(reef,rw,rh);size(down,dw,dh);size(bed,bw,bh);size(fish,fw,fh);size(fan,nw,nh);size(weedL,lw,lh);size(weedR,gw,gh);
   size(ropes,sw,D-sh-rh*.4);
   
   const string=Math.max(18,VW*.025);
   const tagAt=tags.map((tag,i)=>{tag.style.setProperty('--string',string+'px');return {x:ropeX+string,y:sh+VH*.5+(D-sh-VH*1.25)*[.06,.34,.62,.88][i]}});
   const ds=Math.max(VW/DECK[0],VH/DECK[1]),deckW=DECK[0]*ds,deckH=DECK[1]*ds;
   const dx=Math.min(0,Math.max(VW-deckW,VW/2-PEARL[0]*ds)),dy=Math.min(0,Math.max(VH-deckH,VH*.62-PEARL[1]*ds));
   
   
   const raster=Math.min(3,Math.max(1,devicePixelRatio||1)),k=ds*raster;
   size(base,DECK[0]/raster,DECK[1]/raster);size(faces,FACES[2]/raster,FACES[3]/raster);size(hussam,HUSSAM[2]/raster,HUSSAM[3]/raster);
   
   const bedY=D-rh*.5-bh*.9;
   layout={VW,VH,tall,top,sh,sx,ropeX,D,rw,rh,dw,dh,bw,bh,fw,fh,nw,nh,lw,lh,gw,gh,tagAt,ds,k,deckW,deckH,dx,dy,bedY,bottom:D-VH};
  }
  
  const camera=(p,L)=>p<B.rise[0]?L.bottom*inOut(span(p,B.dive)):L.bottom*(1-inOut(span(p,B.rise)));
  
  
  const depth=(y,cam,k,ref)=>y-cam-(k-1)*(cam-ref);
  
  function slap(el,v,tilt){el.style.opacity=Math.max(.001,Math.min(1,v*3)).toFixed(3);el.style.transform=v<1?`rotate(calc(var(--r) + ${(tilt*(1-v)).toFixed(2)}deg)) scale(${(1.24-.24*v).toFixed(3)})`:''}
  function render(p){
   if(!layout)measure();
   const L=layout,{VW,VH}=L;
   if(reduced.matches){p=.9;for(const el of [...lines,sub,faces,hussam]){el.style.opacity='';el.style.transform=''}}
   const cam=camera(p,L)-L.top;
   
   
   const underwater=p<B.wipe[1];sea.style.opacity=underwater?'':'0';tagList.style.opacity=underwater?'':'0';
   if(underwater){
    
    
    at(surface,L.sx,-cam);at(bands,0,L.sh-cam);at(ropes,L.sx,L.sh-1-cam);at(reef,(VW-L.rw)/2,Math.min(L.D-L.rh-cam,VH-2));
    tags.forEach((tag,i)=>at(tag,L.tagAt[i].x,L.tagAt[i].y-cam));
    
    const fishY=L.sh+VH*.55;at(fish,(L.tall?VW*.5:VW*.62)-span(p,[.06,.42])*VW*.55,depth(fishY,cam,.82,fishY-VH*.4));
    at(fan,VW*(L.tall?.58:.66),depth(L.D-L.rh-L.nh*.45,cam,1.12,L.bottom));
    at(weedL,-L.lw*.28,depth(L.D-L.lh*.92,cam,1.35,L.bottom));at(weedR,VW-L.gw*.72,depth(L.D-L.gh*.92,cam,1.35,L.bottom));
    
    
    const drop=smooth(span(p,B.drop)),sway=Math.sin(p*46)*VH*.006;
    let downY=-L.dh+(VH*.22+L.dh)*drop+sway;
    const land=span(p,B.land),bedScreen=L.bedY-cam;
    downY+=(bedScreen-L.bh*.15-VH*.22)*smooth(land);
    at(down,L.ropeX-DIVER_ROPE*L.dw,downY);
    const swap=fade(p,B.land[1]-.012,B.land[1]);down.style.opacity=(1-swap).toFixed(3);
    bed.style.visibility=swap>0?'visible':'hidden';bed.style.opacity=swap.toFixed(3);
    const tug=span(p,B.tug);at(bed,L.ropeX-L.bw*.5,bedScreen-(bedScreen+L.bh)*tug*tug);
   }
   
   const wipe=inOut(span(p,B.wipe)),onDeck=wipe>0;
   deckWindow.style.opacity=onDeck||reduced.matches?'1':'0';
   const hidden=reduced.matches?0:(1-wipe)*VH;at(deckWindow,0,-hidden);at(deck,0,hidden);
   water.style.opacity=wipe>0&&wipe<1&&!reduced.matches?'1':'0';at(water,0,wipe*VH-13);
   if(onDeck||reduced.matches){
    
    
    const tilt=1-inOut(span(p,B.tilt)),lift=VH*.09*tilt,pop=span(p,B.pop),sp=spring(pop);
    const scale=` scale(${L.k.toFixed(5)})`;
    at(base,L.dx,L.dy+lift,scale);
    at(faces,L.dx+FACES[0]*L.ds,L.dy+FACES[1]*L.ds+lift,scale);
    const hx=L.dx+HUSSAM[0]*L.ds,hy=L.dy+HUSSAM[1]*L.ds;
    at(hussam,hx,hy+lift*1.8+(1-sp)*VH*.06,` scale(${(L.k*(.92+.08*sp)).toFixed(5)})`);
    at(pearl,L.dx+PEARL[0]*L.ds,L.dy+PEARL[1]*L.ds+lift*1.8);
    
    if(!reduced.matches){hussam.style.opacity=Math.max(.001,Math.min(1,pop*3)).toFixed(3);faces.style.opacity=Math.max(.001,fade(p,B.pop[0]+.01,B.pop[1])).toFixed(3)}
   }
   if(reduced.matches)return;
   
   const [shoot,pearlLine,breath,empty,week,knows]=lines;
   const out1=1-fade(p,.095,.11);
   slap(shoot,fade(p,.004,.025)*out1,-7);slap(pearlLine,fade(p,.03,.052)*out1,6);
   slap(breath,fade(p,.49,.51)*(1-fade(p,.575,.59)),-6);
   const out2=1-fade(p,.80,.812);
   slap(empty,fade(p,.742,.758)*out2,-7);slap(week,fade(p,.762,.778)*out2,6);
   slap(knows,fade(p,.838,.852),-6);slap(sub,fade(p,.858,.872),5);
  }
  
  
  const diving=()=>section.classList.contains('has-dive');
  
  
  let clipNow=null,tailH=null;
  const setClip=value=>{if(value!==clipNow){clipNow=value;next.style.clipPath=value}};
  const tailHeight=()=>tailH??(tailH=tailEl.offsetHeight);
  function setDive(){const on=!reduced.matches&&!!next;section.classList.toggle('has-dive',on);tailH=null;if(!on&&next){setClip('');next.classList.add('is-open')}layout=null}
  function renderDive(){
   if(!diving())return;
   const rect=section.getBoundingClientRect(),tail=tailHeight(),t=clamp((-rect.top-(rect.height-innerHeight-tail))/Math.max(1,tail));
   if(t>=.5&&!next.classList.contains('is-open')){next.classList.add('is-open');dispatchEvent(new Event('hussam:desk'))}
   if(t>=1){setClip('');return}
   if(t<=0){setClip('circle(0px at 50% 0px)');return}
   const m=next.getBoundingClientRect(),d=pearl.getBoundingClientRect(),cx=d.left+d.width/2,cy=d.top+d.height/2,r0=Math.max(4,(layout?.ds||.5)*34);
   const far=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy))*1.02,r=r0+(far-r0)*inOut(t);
   setClip(`circle(${r.toFixed(1)}px at ${(cx-m.left).toFixed(1)}px ${(cy-m.top).toFixed(1)}px)`);
  }
  const progress=()=>{const rect=section.getBoundingClientRect();return clamp(-rect.top/Math.max(1,rect.height-innerHeight-(diving()?tailHeight():0)))};
  function tick(){raf=0;if(inView)render(progress())}
  
  
  let diveFrame=0;const scheduleDive=()=>{if(!diveFrame)diveFrame=requestAnimationFrame(()=>{diveFrame=0;renderDive()})};
  const schedule=()=>{if(!raf&&inView)raf=requestAnimationFrame(tick)};
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)schedule()},{rootMargin:'0px'}).observe(section);
  addEventListener('scroll',()=>{schedule();scheduleDive()},{passive:true});
  addEventListener('resize',()=>{layout=null;tailH=null;schedule();scheduleDive()},{passive:true});
  reduced.addEventListener('change',()=>{setDive();schedule();scheduleDive()});
  
  new IntersectionObserver((entries,observer)=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();for(const image of section.querySelectorAll('img')){image.loading='eager';image.decode?.().catch(()=>{})}},{rootMargin:'150% 0px'}).observe(section);
  
  document.fonts?.ready.then(()=>{layout=null;schedule()});
  setDive();measure();render(0);renderDive();
 }

 
 
 
 
 const BRIEFS={
  roastery:{
   ar:{name:'محمصة قهوة مختصة في جدة',goal:'الهدف: طلبات أونلاين أكثر قبل رمضان.',strategy:['الطازج هو القصة.','محبين القهوة المختصة اللي يطلبون من البيت، ٢٥ إلى ٤٠.','تُحمّص كل أسبوع، وتوصلك وهي طازجة.','تاريخ التحميص مطبوع على كل كيس.'],ideas:['«كم يوم من التحميص؟»','الفرق بين قهوة طازجة وقهوة الرف.','كيس يتفتح، وصوت الحبوب قبل أي كلمة.','عدّاد أيام من التحميص لين أول فنجال.'],production:['١٥ ثانية، بدون ممثلين.','صوت، كيس، فنجال، ثم عرض الاشتراك.','ماكرو للحبوب، بخار الفنجال، تاريخ التحميص.','افتتاحية بالصوت، مقابل افتتاحية بالنص.']},
   en:{name:'A specialty coffee roastery in Jeddah',goal:'Goal: more online orders before Ramadan.',strategy:['Freshness is the story.','Specialty coffee fans, 25 to 40, who order from home.','Roasted weekly, at your door while it’s fresh.','A roast date stamped on every bag.'],ideas:['“When was your coffee roasted?”','Fresh beans against supermarket beans.','A bag tears open and the beans do the talking.','A counter from roast day to first cup.'],production:['15 seconds. No actors.','Sound, bag, cup, then the subscription offer.','Macro beans, steam off the cup, the roast date.','A sound-led opening against a text-led one.']}
  },
  abaya:{
   ar:{name:'متجر عبايات أونلاين',goal:'الهدف: إطلاق مجموعة الشتاء.',strategy:['عباية لكل اليوم.','موظفات من ٢٢ إلى ٣٥، يبغون أناقة عملية.','قصّة تمشي معك من الدوام للعشاء.','قياس على موديلات بمقاسات مختلفة.'],ideas:['«يوم كامل، عباية وحدة»','نفس العباية، بثلاث إطلالات.','باب المصعد يتفتح، والإضاءة صارت ليل.','مونتاج يوم كامل في عشرين ثانية.'],production:['يوم تصوير واحد.','بدون حوار: موسيقى وإيقاع خطوات.','دوام، كوفي، عشاء: نفس العباية بثلاث إضاءات.','٩:١٦ للريلز، و٤:٥ للفيد.']},
   en:{name:'An online abaya label',goal:'Goal: launch the winter collection.',strategy:['One abaya, all day.','Working women, 22 to 35, who want polish without the fuss.','A cut that goes from the office to dinner.','Fittings on models of different sizes.'],ideas:['“Desk to dinner. Same abaya.”','One abaya, three looks.','The lift doors open and it’s already night.','A whole day in twenty seconds.'],production:['One day of shooting.','No dialogue. Music and footsteps.','Office, café, dinner: one abaya in three lights.','9:16 for Reels, 4:5 for the feed.']}
  },
  delivery:{
   ar:{name:'تطبيق توصيل طلبات في الرياض',goal:'الهدف: تحميلات أكثر وقت الذروة.',strategy:['وقتك يرجع لك.','عوائل وموظفين وقت الزحمة.','توصيل في وقت تعرفه، بدون مفاجآت.','عدّاد وصول دقيق داخل التطبيق.'],ideas:['«الدقايق اللي ربحتها»','وش تسوي بالوقت اللي وفّرته؟','الجرس يرن، والأب لسا يلعب مع عياله.','لقطات يومية لوقت رجع لأصحابه.'],production:['١٥ ثانية، ثلاث لقطات.','طلب، عدّاد، جرس الباب.','واجهة التطبيق، العدّاد، باب ينفتح.','نسخة بالعائلة، ونسخة بالموظف.']},
   en:{name:'A delivery app in Riyadh',goal:'Goal: more installs at rush hour.',strategy:['Your time, back.','Families and commuters at rush hour.','Arrival times you can actually trust.','A live arrival timer in the app.'],ideas:['“The minutes you got back.”','What would you do with twenty spare minutes?','The doorbell rings while dad’s still playing with the kids.','Small moments, bought back with time.'],production:['15 seconds, three shots.','Order, timer, doorbell.','The app screen, the timer, a door opening.','One cut for families, one for commuters.']}
  }
 };
 function installDesk(root,lang){
  const table=root.querySelector('.delivery-table');
  const stage=table.querySelector('.desk-stage'),props=table.querySelector('.desk-props');
  const pen=props.querySelector('.desk-pen'),stamp=props.querySelector('.desk-stamp');
  const card=root.querySelector('.brief-card'),papers=[...root.querySelectorAll('.delivery-paper')],sheets=root.querySelector('.desk-sheets');
  const tabs=[...root.querySelectorAll('[data-delivery]')],chips=[...root.querySelectorAll('[data-brief]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),rtl=lang!=='en',ratio=1800/1004;
  const t=(ar,en)=>lang==='en'?en:ar;
  root.querySelector('.brief-picker').setAttribute('aria-label',t('اختر النشاط','Pick a business'));
  root.querySelector('.delivery-menu').setAttribute('aria-label',t('أوراق حسام','Hussam’s papers'));
  const fit=()=>{const width=Math.max(table.clientWidth,table.clientHeight*ratio);for(const layer of [stage,props]){layer.style.width=width+'px';layer.style.height=width/ratio+'px'}};
  new ResizeObserver(fit).observe(table);fit();
  let running=[],current=null,order=papers.slice(),seen=false;
  const play=(element,frames,options)=>{const animation=element.animate(frames,options);running.push(animation);return animation};
  const stop=()=>{running.forEach(animation=>animation.cancel());running=[];table.querySelectorAll('.paper-ghost,.brief-ghost').forEach(ghost=>ghost.remove())};
  const lifted='drop-shadow(12px 16px 7px rgba(10,20,24,.3))',resting='drop-shadow(2px 3px 0 rgba(10,20,24,.28))';
  function fill(id){
   const copy=BRIEFS[id][lang];
   card.querySelector('[data-slot="name"]').textContent=copy.name;card.querySelector('[data-slot="goal"]').textContent=copy.goal;
   papers.forEach(paper=>{const [title,...rows]=copy[paper.id.slice(6)];paper.querySelector('[data-slot="title"]').textContent=title;rows.forEach((row,i)=>paper.querySelector(`[data-slot="${i}"]`).textContent=row);paper.classList.remove('is-signed','is-sealed')});
  }
  
  function markTabs(){tabs.forEach(tab=>{const selected=tab.getAttribute('aria-controls')===order[0].id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1})}
  function arrange(){
   order.forEach((paper,depth)=>{paper.dataset.depth=depth;paper.inert=depth>0;paper.setAttribute('aria-hidden',String(depth>0))});
   markTabs();
  }
  
  function sign(paper,delay){
   const name=paper.querySelector('.paper-signature').getBoundingClientRect(),p=pen.getBoundingClientRect();
   const nib=[p.left+p.width*.98,p.top+p.height*.99],line=name.top+name.height*.64;
   const from=[name.right-4-nib[0],line-nib[1]],to=[name.left+4-nib[0],line-nib[1]];
   const at=(x,y,scale=1,filter=resting,offset)=>({transform:`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${scale})`,filter,offset});
   const wobble=[0,-5,2,-4,3,0];
   const writing=wobble.map((dy,i)=>{const k=i/(wobble.length-1);return at(from[0]+(to[0]-from[0])*k,from[1]+(to[1]-from[1])*k+dy,1,resting,(560+480*k)/1640)});
   play(pen,[at(0,0,1,resting,0),at(0,-8,1.07,lifted,130/1640),at(from[0],from[1]-14,1.07,lifted,480/1640),...writing,at(to[0],to[1]-14,1.07,lifted,1130/1640),at(0,-8,1.07,lifted,1530/1640),at(0,0,1,resting,1)],{duration:1640,delay,easing:'ease-in-out'});
   play(paper.querySelector('.paper-signature'),[{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0)'}],{duration:480,delay:delay+560,easing:'linear',fill:'backwards'}).finished.then(()=>paper.classList.add('is-signed'),()=>{});
   return delay+1130;
  }
  
  function seal(paper,delay){
   const s=stamp.getBoundingClientRect(),target=paper.querySelector('.paper-seal').getBoundingClientRect();
   const dx=target.left+target.width/2-(s.left+s.width/2),dy=target.top+target.height/2-(s.top+s.height/2);
   const at=(x,y,turn,scale,filter,offset)=>({transform:`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${turn}deg) scale(${scale})`,filter,offset});
   play(stamp,[at(0,0,0,1,resting,0),at(0,-6,-8,1.1,lifted,150/1400),at(dx,dy-16,-24,1.16,lifted,560/1400),at(dx,dy,-24,.95,resting,680/1400),at(dx,dy-4,-24,1,resting,760/1400),at(dx,dy-20,-18,1.14,lifted,900/1400),at(0,-6,-6,1.08,lifted,1300/1400),at(0,0,0,1,resting,1)],{duration:1400,delay,easing:'ease-in-out'});
   play(paper.querySelector('.paper-seal'),[{opacity:0,transform:'rotate(-14deg) scale(1.12)'},{opacity:.9,transform:'rotate(-14deg) scale(1)'}],{duration:180,delay:delay+690,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}).finished.then(()=>paper.classList.add('is-sealed'),()=>{});
   play(paper,[{translate:'0 0'},{translate:'0 3px'},{translate:'0 0'}],{duration:200,delay:delay+670,easing:'ease-out'});
   return delay+1400;
  }
  
  
  function deliver(id){
   stop();seen=true;table.classList.add('is-lit');
   const previous=current;current=id;
   chips.forEach(chip=>{const on=chip.dataset.brief===id;chip.setAttribute('aria-checked',String(on));chip.tabIndex=on?0:-1});
   if(previous&&!reduced.matches){
    const box=table.getBoundingClientRect(),outbox=[box.left+box.width*.86,box.top+box.height*.82];
    [card,...order].forEach(sheet=>{
     const rect=sheet.getBoundingClientRect(),ghost=sheet.cloneNode(true);
     ghost.removeAttribute('id');ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.classList.add(sheet===card?'brief-ghost':'paper-ghost');
     
     Object.assign(ghost.style,{position:'absolute',margin:'0',left:sheet.offsetLeft+'px',top:sheet.offsetTop+'px',width:sheet.offsetWidth+'px',height:sheet.offsetHeight+'px'});
     sheets.append(ghost);
     const dx=outbox[0]-(rect.left+rect.width/2),dy=outbox[1]-(rect.top+rect.height/2);
     play(ghost,[{translate:'0 0',scale:'1',opacity:1},{translate:`${dx.toFixed(0)}px ${dy.toFixed(0)}px`,scale:'.32',rotate:'9deg',opacity:0}],{duration:520,delay:sheet===card?0:90,easing:'cubic-bezier(.55,0,.75,.3)'}).finished.then(()=>ghost.remove(),()=>ghost.remove());
    });
   }
   fill(id);order=papers.slice();arrange();
   if(reduced.matches){papers.forEach(paper=>paper.classList.add('is-signed','is-sealed'));return}
   const start=previous?260:0;
   play(card,[{translate:'0 -46px',rotate:'-7deg',opacity:0},{translate:'0 0',rotate:'0deg',opacity:1}],{duration:560,delay:start,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   order.slice().reverse().forEach((paper,i)=>play(paper,[{translate:`${rtl?-18:18}px 70px`,opacity:0},{translate:'0 0',opacity:1}],{duration:520,delay:start+380+i*170,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
   seal(order[0],sign(order[0],start+1100)+40);
  }
  
  function select(key){
   const paper=papers.find(candidate=>candidate.id==='paper-'+key);
   if(!paper||order[0]===paper)return;
   order=[paper,...order.filter(candidate=>candidate!==paper)];
   if(reduced.matches){arrange();paper.classList.add('is-signed','is-sealed');return}
   
   markTabs();paper.inert=false;paper.setAttribute('aria-hidden','false');
   play(paper,[{translate:'0 0'},{translate:`${rtl?-38:38}% 6%`,offset:.45},{translate:'0 0'}],{duration:620,easing:'cubic-bezier(.45,0,.2,1)'});
   setTimeout(arrange,280);
   if(!paper.classList.contains('is-sealed'))seal(paper,sign(paper,560)+40);
  }
  tabs.forEach((tab,index)=>{
   tab.addEventListener('click',()=>select(tab.dataset.delivery));
   tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();select(tabs[next].dataset.delivery);tabs[next].focus()}});
  });
  chips.forEach((chip,index)=>{
   chip.addEventListener('click',()=>{if(chip.dataset.brief!==current||!seen)deliver(chip.dataset.brief)});
   chip.addEventListener('keydown',event=>{const step=event.key==='ArrowLeft'?(rtl?1:-1):event.key==='ArrowRight'?(rtl?-1:1):event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0;if(!step)return;event.preventDefault();const next=chips[(index+step+chips.length)%chips.length];next.focus();deliver(next.dataset.brief)});
  });
  fill('roastery');current='roastery';arrange();
  
  const begin=()=>{if(!seen){current=null;deliver('roastery')}};
  
  
  const desk=root.querySelector('.deliverables'),diveHolds=()=>!!root.querySelector('.dive.has-dive')&&!desk.classList.contains('is-open');
  new IntersectionObserver((entries,observer)=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();if(diveHolds())addEventListener('hussam:desk',begin,{once:true});else begin()},{threshold:.4}).observe(table);
 }

 let installed;
 function mount(){
  const section=document.getElementById('how-it-works'),template=document.getElementById('hussam-demo-template');if(!section||!template)return;
  section.querySelectorAll('video:not([data-retired])').forEach(v=>{v.dataset.retired='true';v.pause();v.removeAttribute('src');v.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));v.load()});
  if(installed?.isConnected)return;
  const host=document.createElement('div');host.className='hussam-product-demo';const root=host.attachShadow({mode:'open'});root.append(template.content.cloneNode(true));
  const lang=document.documentElement.lang==='en'?'en':'ar';root.querySelector('.demo-wrap').classList.toggle('en',lang==='en');root.querySelectorAll('[data-ar]').forEach(e=>e.textContent=e.dataset[lang]);
  installDesk(root,lang);
  section.append(host);installed=host;installDiveScene(root,lang);document.dispatchEvent(new Event('hussam:demo-mounted'));
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})});function start(){mount();observer.observe(document.getElementById('main')||document.body,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
