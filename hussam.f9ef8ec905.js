(() => {
 const nav=document.querySelector('.hussam-nav');
 const menu=nav.querySelector('.menu');
 const updateNav=()=>nav.classList.toggle('is-scrolled',scrollY>700);
 window.addEventListener('scroll',updateNav,{passive:true});updateNav();
 const dialog=document.querySelector('.contact-dialog');
 const openContact=()=>{closeMenu();if(!dialog.open)dialog.showModal();};
 const closeMenu=()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');};
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open));});
 dialog.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 window.addEventListener('hussam:contact',openContact);
 document.addEventListener('click',e=>{
  const el=e.target.closest('a,button');if(!el)return;
  const href=el.getAttribute('href')||'';
  if(el.hasAttribute('data-contact')||href.endsWith('#contact')||/calendly|\/hire$|support\//.test(href)){e.preventDefault();e.stopImmediatePropagation();openContact();return;}
  if(el.classList.contains('language')){el.href=(document.documentElement.lang==='ar'?'/en.html':'/')+location.hash;return;}
  if((href==='./'||href==='/')&&el.closest('footer')){e.preventDefault();e.stopImmediatePropagation();scrollTo({top:0,behavior:'smooth'});return;}
  if(href.includes('#')&&!/^https?:/.test(href)){
   const hash=href.slice(href.indexOf('#')),target=document.getElementById(hash.slice(1));
   if(target){
    e.preventDefault();e.stopImmediatePropagation();closeMenu();history.replaceState(null,'',hash);
    const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
    if(target.id==='how-it-works'){
     
     scrollTo({top:scrollY+target.getBoundingClientRect().top+1,behavior});
    }else if(['maze','why-hussam','pricing','testimonial','cta'].includes(target.id)){
     scrollTo({top:scrollY+target.getBoundingClientRect().top,behavior});
    }else target.scrollIntoView({behavior,block:'start'});
   }
  }
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();openContact();},true);
 
 
 function correctDeepLink(){
  const id=location.hash.slice(1);
  if(id==='contact'){openContact();}
  else if(id==='how-it-works'){
   const top=document.getElementById('how-it-works').getBoundingClientRect().top;
   if(Math.abs(top+1)>2)scrollTo({top:scrollY+top+1,behavior:'instant'});
  }else if(['maze','why-hussam','pricing','testimonial','cta'].includes(id)){
   const target=document.getElementById(id);
   if(target&&Math.abs(target.getBoundingClientRect().top)>2)scrollTo({top:scrollY+target.getBoundingClientRect().top,behavior:'instant'});
  }
 }
 window.addEventListener('load',()=>requestAnimationFrame(correctDeepLink),{once:true});
 window.addEventListener('hashchange',()=>requestAnimationFrame(correctDeepLink));
 document.addEventListener('hussam:demo-mounted',()=>requestAnimationFrame(correctDeepLink));
 function mountPrompts(){
  const section=document.getElementById('testimonial'),template=document.getElementById('hussam-prompts-template');
  if(section&&template&&!section.querySelector('.hussam-prompts'))section.append(template.content.cloneNode(true));
 }
 function mountOffice(){
  const template=document.getElementById('hussam-office-template');if(!template)return;
  for(const footer of document.querySelectorAll('footer'))if(!footer.querySelector('.hussam-office'))(footer.querySelector('[data-framer-name="links wrapper"]')||footer).append(template.content.cloneNode(true));
 }
 mountPrompts();mountOffice();
 let promptsFrame=0;
 new MutationObserver(()=>{if(promptsFrame)return;promptsFrame=requestAnimationFrame(()=>{promptsFrame=0;mountPrompts();mountOffice()})}).observe(document.getElementById('main')||document.body,{childList:true,subtree:true});
 
 if(new URLSearchParams(location.search).get('lang')==='en'&&document.documentElement.lang!=='en')location.replace('/en.html'+location.hash);
})();
