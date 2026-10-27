(()=>{
 function project(from,to){
  const rows=[];
  for(let i=0;i<4;i++){
   const [x,y]=from[i],[u,v]=to[i];
   rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);
  }
  for(let col=0;col<8;col++){
   let pivot=col;for(let row=col+1;row<8;row++)if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
   [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
   const divisor=rows[col][col];for(let j=col;j<9;j++)rows[col][j]/=divisor;
   for(let row=0;row<8;row++)if(row!==col){const factor=rows[row][col];for(let j=col;j<9;j++)rows[row][j]-=factor*rows[col][j]}
  }
  const [a,b,c,d,e,f,g,h]=rows.map(row=>row[8]);
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
 }
 
 
 
 
 
 const OFFICE=[2200,1228];
 const SCREEN=[[14.558,46.355],[37.448,43.516],[40.22,72.221],[17.429,78.112]];
 
 
 const MID={rect:[100.7,460.3,1198.8,669.3],size:[2400,1340],sharp:[172.7,493.8,1227.6,1096.1]},AIM=[603.1,737.4],REST=[690,790];
 const ANSWERS={
  openings:{ar:'ثلاث افتتاحيات، كل وحدة أقل من ثانيتين:\n١. «كم يوم من التحميص؟»\n٢. «اسمع الحبوب قبل ما تشربها.»\n٣. «فنجالك تحمّص الخميس.»',en:'Three opening lines, under two seconds each:\n1. “When was your coffee roasted?”\n2. “Listen to the beans before you taste them.”\n3. “This cup was roasted on Thursday.”'},
  script:{ar:'٠٠–٠٣  صوت كيس يتفتح، بدون كلام.\n٠٣–١٠  عدّاد الأيام من التحميص لين الفنجال.\n١٠–١٥  «اشترك، وتوصلك طازجة كل أسبوع.»',en:'00–03  A bag tears open. No voiceover.\n03–10  A counter ticks from roast day to cup.\n10–15  “Subscribe. Fresh beans every week.”'},
  test:{ar:'نبدأ بافتتاحيتين: بالصوت مقابل بالنص، وكل شي غيرها ثابت. نحكم بعد ثلاث أيام على تكلفة الطلب، مو على المشاهدات.',en:'Test two openings, one led by sound and one by text, and keep everything else the same. After three days, judge them on cost per order, not views.'}
 };
 function installWorkScene(root,lang){
  const section=root.querySelector('.integrations'),sticky=section.querySelector('.integration-sticky');
  const base=section.querySelector('.office-frame'),mid=section.querySelector('.office-mid'),dim=section.querySelector('.office-dim'),veil=section.querySelector('.office-veil'),copy=section.querySelector('.integration-copy');
  const screen=section.querySelector('.screen'),chat=screen.querySelector('.chat'),reply=screen.querySelector('.reply'),artifact=screen.querySelector('.artifact'),suggestions=screen.querySelector('.suggestions');
  const next=root.querySelector('.deliverables'),dot=screen.querySelector('.composer-field i'),tailEl=section.querySelector('.integration-tail');
  const problem=section.querySelector('.problem'),pairs=[...problem.querySelectorAll('.pb-pair')],caption=problem.querySelector('.pb-caption'),notes=[...problem.querySelectorAll('.pb-notes li')];
  const tools=[...screen.querySelectorAll('[data-tool]')].filter(el=>el.matches('button')),asks=[...screen.querySelectorAll('[data-ask]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const t=(ar,en)=>lang==='en'?en:ar,clamp=n=>Math.max(0,Math.min(1,n)),smooth=k=>k*k*(3-2*k),inOut=k=>k<.5?4*k*k*k:1-(2-2*k)**3/2;
  const lerp=(a,b,k)=>a+(b-a)*k;
  screen.querySelector('.tool-switch').setAttribute('aria-label',t('الأداة','Tool'));
  const fullReply=reply.textContent;reply.textContent='';
  const caret=document.createElement('span');caret.className='caret';caret.setAttribute('aria-hidden','true');
  let inView=false,raf=0,layout=null,opened=false;
  function measure(){
   const VW=sticky.clientWidth,VH=sticky.clientHeight,tall=VH>VW*.9;
   const s=Math.max(VW/OFFICE[0],VH/OFFICE[1]);
   
   const ox=tall?Math.min(0,Math.max(VW-OFFICE[0]*s,VW/2-.275*OFFICE[0]*s)):(VW-OFFICE[0]*s)/2,oy=(VH-OFFICE[1]*s)/2;
   
   
   const [sx0,sy0,sx1,sy1]=MID.sharp,z1=tall?s:Math.max(s,Math.min(.63*VW/562,.8*VH/424),VW/(sx1-sx0),VH/(sy1-sy0));
   const hw=VW/2/z1,hh=VH/2/z1,rest=[Math.min(Math.max(REST[0],sx0+hw),sx1-hw),Math.min(Math.max(REST[1],sy0+hh),sy1-hh)];
   const W0=tall?VW-24:Math.min(1120,VW-96),H0=tall?VH-104:Math.min(700,VH-150);
   const left=(VW-W0)/2,top=tall?88:Math.max(96,(VH-H0)/2+22);
   screen.style.width=W0+'px';screen.style.height=H0+'px';
   const at=(point,center,zoom)=>[VW/2+(point[0]-center[0])*zoom,VH/2+(point[1]-center[1])*zoom];
   const c0=[(VW/2-ox)/s,(VH/2-oy)/s];
   const raster=Math.min(3,Math.max(1,devicePixelRatio||1));document.documentElement.style.setProperty('--raster',String(raster));
   layout={VW,VH,tall,s,z1,c0,p0:at(AIM,c0,s),p1:at(AIM,rest,z1),W0,H0,raster,open:[[left,top],[left+W0,top],[left+W0,top+H0],[left,top+H0]]};
  }
  
  
  function beats(tall){return tall?{push:[0,0],open:[.42,.58],type:[.6,.78],chips:.84}:{push:[.38,.64],open:[.66,.76],type:[.78,.9],chips:.93}}
  
  
  const fade=(p,a,b)=>smooth(clamp((p-a)/(b-a)));
  function renderProblem(p,tall){
   const lines=[...pairs.flatMap(pair=>[...pair.children]),caption];
   if(reduced.matches){[...lines,...notes].forEach(el=>{el.style.opacity='';el.style.transform=''});return 0}
   
   
   const slap=(el,v,tilt)=>{el.style.opacity=Math.min(1,v*3).toFixed(3);el.style.transform=v<1?`rotate(calc(var(--r) + ${(tilt*(1-v)).toFixed(2)}deg)) scale(${(1.24-.24*v).toFixed(3)})`:''};
   const [first,last]=pairs,out1=1-fade(p,.10,.12),out2=1-fade(p,.32,.35);
   slap(first.children[0],fade(p,.008,.03)*out1,-7);slap(first.children[1],fade(p,.04,.065)*out1,6);
   slap(caption,fade(p,.12,.14)*(1-fade(p,.24,.26)),-5);
   
   const notesOut=tall?fade(p,.232,.255):fade(p,.30,.34);
   notes.forEach((note,i)=>{const at=.14+i*.025;slap(note,fade(p,at,at+.016)*(1-notesOut),i%2?9:-9)});
   slap(last.children[0],fade(p,.25,.27)*out2,-7);slap(last.children[1],fade(p,.27,.29)*out2,6);
   
   return .78*fade(p,0,.03);
  }
  function render(p){
   if(!layout)measure();
   const {tall,VW,VH,s,z1,p0,p1}=layout,b=beats(tall);
   
   const u=tall||reduced.matches?0:inOut(clamp((p-b.push[0])/(b.push[1]-b.push[0])));
   const zoom=s*Math.pow(z1/s,u),aim=[p0[0]+(p1[0]-p0[0])*u,p0[1]+(p1[1]-p0[1])*u];
   const center=[AIM[0]-(aim[0]-VW/2)/zoom,AIM[1]-(aim[1]-VH/2)/zoom];
   const toScreen=([x,y])=>[VW/2+(x-center[0])*zoom,VH/2+(y-center[1])*zoom];
   
   const origin=toScreen([0,0]),corner=toScreen(MID.rect),density=layout.raster;
   base.style.transform=`translate(${origin[0].toFixed(2)}px,${origin[1].toFixed(2)}px) scale(${(zoom*density).toFixed(5)})`;
   mid.style.transform=`translate(${corner[0].toFixed(2)}px,${corner[1].toFixed(2)}px) scale(${(MID.rect[2]*zoom/MID.size[0]*density).toFixed(5)},${(MID.rect[3]*zoom/MID.size[1]*density).toFixed(5)})`;
   const quad=SCREEN.map(([x,y])=>toScreen([x/100*OFFICE[0],y/100*OFFICE[1]]));
   
   const k=reduced.matches?1:inOut(clamp((p-b.open[0])/(b.open[1]-b.open[0])));
   const target=quad.map((pt,i)=>[lerp(pt[0],layout.open[i][0],k),lerp(pt[1],layout.open[i][1],k)]);
   screen.style.transform=k>=1?`translate(${layout.open[0][0]}px,${layout.open[0][1]}px)`:project([[0,0],[layout.W0,0],[layout.W0,layout.H0],[0,layout.H0]],target);
   const problemDim=renderProblem(p,tall);
   
   screen.style.setProperty('--content',tall&&!reduced.matches?smooth(clamp((k-.35)/.4)).toFixed(3):'1');
   
   const turnIn=reduced.matches?0:fade(p,.34,.37),turnOut=reduced.matches?1:tall?fade(p,b.open[0],b.open[0]+.06):fade(p,b.push[0]+.05,b.push[0]+.12),turn=turnIn*(1-turnOut);
   copy.style.opacity=turn.toFixed(3);copy.style.transform=`translateY(${((1-turnIn)*16-24*turnOut).toFixed(1)}px)`;
   dim.style.opacity=(.55*k).toFixed(3);
   
   veil.style.opacity=(problemDim*(1-turnOut)).toFixed(3);
   
   screen.style.opacity=(reduced.matches?1:fade(p,.35,.4)).toFixed(3);
   const isOpen=k>=.98;if(isOpen!==opened){opened=isOpen;screen.classList.toggle('is-open',isOpen);screen.inert=!isOpen}
   
   const typed=reduced.matches?1:clamp((p-b.type[0])/(b.type[1]-b.type[0]));
   const n=Math.round(fullReply.length*typed);
   if(reply.dataset.n!==String(n)){reply.dataset.n=n;reply.textContent=fullReply.slice(0,n);if(n<fullReply.length&&n>0)reply.append(caret)}
   artifact.style.setProperty('--shown',(reduced.matches?1:smooth(clamp((p-b.type[1]+.02)/.06))).toFixed(3));
   suggestions.style.setProperty('--chips',(reduced.matches?1:smooth(clamp((p-b.chips)/.05))).toFixed(3));
  }
  
  
  
  const diving=()=>section.classList.contains('has-dive');
  
  
  let clipNow=null,tailH=null;
  const setClip=value=>{if(value!==clipNow){clipNow=value;next.style.clipPath=value}};
  const tailHeight=()=>tailH??(tailH=tailEl.offsetHeight);
  function setDive(){const on=!reduced.matches&&!!next&&!!dot;section.classList.toggle('has-dive',on);tailH=null;if(!on&&next){setClip('');next.classList.add('is-open')}layout=null}
  function renderDive(){
   if(!diving())return;
   const rect=section.getBoundingClientRect(),tail=tailHeight(),t=clamp((-rect.top-(rect.height-innerHeight-tail))/Math.max(1,tail));
   if(t>=.5&&!next.classList.contains('is-open')){next.classList.add('is-open');dispatchEvent(new Event('hussam:desk'))}
   if(t>=1){setClip('');return}
   if(t<=0){setClip('circle(0px at 50% 0px)');return}
   const m=next.getBoundingClientRect(),d=dot.getBoundingClientRect(),cx=d.left+d.width/2,cy=d.top+d.height/2,r0=d.width/2;
   const far=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy))*1.02,r=r0+(far-r0)*inOut(t);
   setClip(`circle(${r.toFixed(1)}px at ${(cx-m.left).toFixed(1)}px ${(cy-m.top).toFixed(1)}px)`);
  }
  const progress=()=>{const rect=section.getBoundingClientRect();return clamp(-rect.top/Math.max(1,rect.height-innerHeight-(diving()?tailHeight():0)))};
  function tick(){raf=0;if(inView)render(reduced.matches?1:progress())}
  
  
  let diveFrame=0;const scheduleDive=()=>{if(!diveFrame)diveFrame=requestAnimationFrame(()=>{diveFrame=0;renderDive()})};
  const schedule=()=>{if(!raf&&inView)raf=requestAnimationFrame(tick)};
  
  asks.forEach(button=>button.addEventListener('click',()=>{
   button.disabled=true;
   const you=document.createElement('div');you.className='msg from-you';const q=document.createElement('p');q.textContent=button.textContent;you.append(q);
   const him=document.createElement('div');him.className='msg from-hussam';him.innerHTML=screen.querySelector('.from-hussam .who').outerHTML;
   const text=document.createElement('p');him.append(text);chat.append(you,him);
   const answer=ANSWERS[button.dataset.ask][lang];
   if(reduced.matches){text.textContent=answer;chat.scrollTop=chat.scrollHeight;return}
   let i=0;const started=performance.now()+350;
   const type=now=>{i=Math.max(0,Math.min(answer.length,Math.round((now-started)/22)));text.textContent=answer.slice(0,i);if(i<answer.length)text.append(caret);chat.scrollTop=chat.scrollHeight;if(i<answer.length)requestAnimationFrame(type)};
   requestAnimationFrame(type);
  }));
  
  const pick=tool=>{screen.dataset.tool=tool.dataset.tool;tools.forEach(button=>{const on=button===tool;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1})};
  tools.forEach((tool,index)=>{tool.addEventListener('click',()=>pick(tool));tool.addEventListener('keydown',event=>{const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(!step)return;event.preventDefault();const next=tools[(index+step+tools.length)%tools.length];pick(next);next.focus()})});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)schedule()},{rootMargin:'0px'}).observe(section);
  addEventListener('scroll',()=>{schedule();scheduleDive()},{passive:true});
  addEventListener('resize',()=>{layout=null;tailH=null;schedule();scheduleDive()},{passive:true});
  reduced.addEventListener('change',()=>{setDive();schedule();scheduleDive()});
  screen.inert=true;setDive();measure();render(reduced.matches?1:0);renderDive();
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
  
  
  const desk=root.querySelector('.deliverables'),diveHolds=()=>!!root.querySelector('.integrations.has-dive')&&!desk.classList.contains('is-open');
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
  section.append(host);installed=host;installWorkScene(root,lang);document.dispatchEvent(new Event('hussam:demo-mounted'));
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})});function start(){mount();observer.observe(document.getElementById('main')||document.body,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
