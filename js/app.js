(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  addEventListener('load', () => setTimeout(() => $('#loader')?.classList.add('done'), 500));
  $('#year') && ($('#year').textContent = new Date().getFullYear());

  // The mobile drawer is owned by the inline navigation controller in
  // index.html. Two controllers on one button fought each other and left the
  // drawer stuck open, so there is deliberately no drawer code here.

  // Anchor navigation
  // Drawer links are excluded: the drawer must release its scroll lock
  // before anything can scroll, so its own controller does that one.
  $$('a[href^="#"]').filter(a => !a.closest('.drawer')).forEach(a => a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));

  // Reveals
  const reveals = $$('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 6, 5) * 55}ms`; io.observe(el); });
  } else reveals.forEach(el => el.classList.add('in'));

  // Active nav + header state
  const header = $('#header');
  const navLinks = $$('.nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const nio = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-48% 0px -45% 0px', threshold: 0 });
    sections.forEach(s => nio.observe(s));
  }
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), { passive: true });

  // Cursor
  if (finePointer && !reduced) {
    const cursor = $('.cursor'); let x = innerWidth/2, y = innerHeight/2, tx=x, ty=y;
    addEventListener('pointermove', e => { tx=e.clientX; ty=e.clientY; }, { passive:true });
    const frame=()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;cursor.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;requestAnimationFrame(frame)}; frame();
    $$('a,button,.lens-slide,.speaker-slide,.team-slide,.member-card,.core-card,.journey-card,.partner-slide').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('active'));el.addEventListener('pointerleave',()=>cursor.classList.remove('active'));});
  }

  // Magnetic buttons
  if (finePointer && !reduced) $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); const x=(e.clientX-r.left-r.width/2)*.08,y=(e.clientY-r.top-r.height/2)*.08; el.style.transform=`translate(${x}px,${y}px)`; });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });

  // Reusable slider: one slide per view, with peek controlled by CSS.
  const sliders = [];
  $$('.slider[data-slider]:not(.team-slider)').forEach(root => {
    const viewport=$('[data-viewport]',root), track=$('[data-track]',root), slides=$$('.slider-track > *',root), prev=$('[data-prev]',root), next=$('[data-next]',root), current=$('[data-current]',root), total=$('[data-total]',root), progress=$('[data-progress]',root);
    if(!viewport||!track||slides.length<2)return;
    let index=0, start=0, delta=0, dragging=false, pid=null;
    const step=()=>slides[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0);
    const render=(i,animate=true)=>{ index=Math.max(0,Math.min(slides.length-1,i)); track.style.transition=animate&&!reduced?'transform .75s cubic-bezier(.2,.75,.2,1)':'none'; track.style.transform=`translate3d(${-index*step()}px,0,0)`; slides.forEach((s,n)=>s.classList.toggle('active',n===index)); if(current)current.textContent=String(index+1).padStart(2,'0'); if(total)total.textContent=String(slides.length).padStart(2,'0'); if(progress)progress.style.width=`${((index+1)/slides.length)*100}%`; if(prev)prev.disabled=index===0;if(next)next.disabled=index===slides.length-1;};
    prev?.addEventListener('click',()=>render(index-1)); next?.addEventListener('click',()=>render(index+1));
    viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();render(index-1)}if(e.key==='ArrowRight'){e.preventDefault();render(index+1)}});
    viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button,a,input,select,textarea,label'))return;dragging=true;pid=e.pointerId;start=e.clientX;delta=0;viewport.setPointerCapture(pid);viewport.classList.add('dragging');track.style.transition='none';});
    viewport.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid)return;delta=e.clientX-start;track.style.transform=`translate3d(${(-index*step())+delta}px,0,0)`;});
    const end=()=>{if(!dragging)return;dragging=false;viewport.classList.remove('dragging');Math.abs(delta)>Math.min(100,step()*.16)?render(index+(delta<0?1:-1)):render(index);};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);addEventListener('resize',()=>render(index,false),{passive:true});render(0,false);sliders.push({root,render});
  });

  // Team chapter tabs control the parent slider.
  // Team chapters. Tabs, arrows, drag and keyboard all drive one index.
  const team=$('.team-slider');
  if(team){
    const viewport=$('[data-viewport]',team),track=$('[data-track]',team),slides=$$('.team-slide',team),tabs=$$('[data-team-tab]',team);
    const prev=$('[data-prev]',team),next=$('[data-next]',team),current=$('[data-current]',team),total=$('[data-total]',team),progress=$('[data-progress]',team);
    let idx=0,start=0,delta=0,dragging=false,pid=null;
    const step=()=>slides[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0);
    const render=(i,animate=true)=>{
      idx=Math.max(0,Math.min(slides.length-1,i));
      track.style.transition=animate&&!reduced?'transform .75s cubic-bezier(.2,.75,.2,1)':'none';
      track.style.transform=`translate3d(${-idx*step()}px,0,0)`;
      slides.forEach((s,n)=>s.classList.toggle('active',n===idx));
      tabs.forEach((t,n)=>{t.classList.toggle('active',n===idx);t.setAttribute('aria-selected',String(n===idx))});
      if(current)current.textContent=String(idx+1).padStart(2,'0');
      if(total)total.textContent=String(slides.length).padStart(2,'0');
      if(progress)progress.style.width=`${((idx+1)/slides.length)*100}%`;
      if(prev)prev.disabled=idx===0;if(next)next.disabled=idx===slides.length-1;
    };
    tabs.forEach((t,n)=>t.addEventListener('click',()=>render(n)));
    prev?.addEventListener('click',()=>render(idx-1));next?.addEventListener('click',()=>render(idx+1));
    viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();render(idx-1)}if(e.key==='ArrowRight'){e.preventDefault();render(idx+1)}});
    viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button,a,input,select,textarea,label'))return;dragging=true;pid=e.pointerId;start=e.clientX;delta=0;viewport.setPointerCapture(pid);viewport.classList.add('dragging');track.style.transition='none'});
    viewport.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid)return;delta=e.clientX-start;track.style.transform=`translate3d(${(-idx*step())+delta}px,0,0)`});
    const end=()=>{if(!dragging)return;dragging=false;viewport.classList.remove('dragging');Math.abs(delta)>Math.min(100,step()*.16)?render(idx+(delta<0?1:-1)):render(idx)};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);
    addEventListener('resize',()=>render(idx,false),{passive:true});render(0,false);
  }

  // Nested member rails. Each chapter has independent horizontal state.
  $$('[data-member-viewport]').forEach(view=>{
    const track=$('[data-member-track]',view), cards=$$('.member-card',view), root=view.closest('.members'), prev=$('[data-member-prev]',root), next=$('[data-member-next]',root), count=$('[data-member-count]',root); let idx=0;
    const gap=()=>parseFloat(getComputedStyle(track).gap)||0;
    const step=()=>{const w=cards[0].getBoundingClientRect().width;return w?w+gap():0};
    const perView=()=>{const s=step();return s?Math.max(1,Math.floor((view.clientWidth+gap())/s)):cards.length};
    const max=()=>Math.max(0,cards.length-perView());
    const render=(i,animate=true)=>{const limit=max();idx=Math.max(0,Math.min(limit,i));track.style.transition=animate&&!reduced?'transform .55s cubic-bezier(.2,.75,.2,1)':'none';track.style.transform=`translate3d(${-idx*step()}px,0,0)`;if(count)count.textContent=`${String(idx+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;if(prev)prev.disabled=idx===0;if(next)next.disabled=idx===limit;root.classList.toggle('rail-static',limit===0);};
    prev?.addEventListener('click',()=>render(idx-1));next?.addEventListener('click',()=>render(idx+1));
    let down=false,start=0,dx=0,pid=null;view.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.stopPropagation();down=true;pid=e.pointerId;start=e.clientX;dx=0;view.setPointerCapture(pid);view.classList.add('dragging');track.style.transition='none'});view.addEventListener('pointermove',e=>{if(!down||e.pointerId!==pid)return;dx=e.clientX-start;track.style.transform=`translate3d(${(-idx*step())+dx}px,0,0)`});const end=()=>{if(!down)return;down=false;view.classList.remove('dragging');Math.abs(dx)>45?render(idx+(dx<0?1:-1)):render(idx)};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);addEventListener('resize',()=>render(idx,false),{passive:true});render(0,false);
  });

  // Form helper
  async function submitForm(form, endpoint, status){
    const button=form.querySelector('button'); button.disabled=true; status.textContent='TRANSMITTING...';
    try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:controller.signal});clearTimeout(timer);const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||'Something went wrong.');status.textContent=data.message||'Received.';form.reset();}catch(err){status.textContent=err.name==='AbortError'?'Request timed out. Please try again.':err.message||'Unable to send.'}finally{button.disabled=false}
  }
  $('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();submitForm(e.currentTarget,'/api/contact',$('#formStatus'))});
  $('#interestForm')?.addEventListener('submit',e=>{e.preventDefault();submitForm(e.currentTarget,'/api/interests',$('#interestStatus'))});
})();
