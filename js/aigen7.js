/* aigen7.js - extracted interactive script for aigen7.html
   Requires: html2canvas and jspdf (loaded in the HTML via CDN)
*/
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // Small engine: gooey blobs + particles + cursors + confetti
    const canvas = document.getElementById('bg');
    let ctx = null;
    let w=0,h=0, DPR = Math.max(1, window.devicePixelRatio || 1);

    // helper random
    function rand(min,max){return Math.random()*(max-min)+min}

    // prepare defaults for pages without canvas
    let blobs = [];
    let particles = [];
    let mouse = {x:window.innerWidth/2,y:window.innerHeight/2, down:false};
    let reduceMotion = false;

    if(canvas && canvas.getContext){
      ctx = canvas.getContext('2d');
      function resize(){
        w = canvas.width = Math.floor(window.innerWidth * DPR);
        h = canvas.height = Math.floor(window.innerHeight * DPR);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(DPR,0,0,DPR,0,0);
      }
      window.addEventListener('resize', resize, {passive:true});
      resize();

      // blobs - moving circles that blend with 'lighter' composite operation
      blobs = [];
      const BCOUNT = Math.max(6, Math.floor(Math.min(window.innerWidth, 800)/130));
      for(let i=0;i<BCOUNT;i++){
        blobs.push({x:rand(0,w/DPR), y:rand(0,h/DPR), r:rand(60,180), vx:rand(-0.4,0.4), vy:rand(-0.3,0.3), hue:rand(200,320)});
      }

      // small sparkle particles emitted on spark/ click
      particles = [];

      mouse = {x:w/2,y:h/2, down:false};
      window.addEventListener('pointermove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY });
      window.addEventListener('pointerdown', e=>{ mouse.down=true; spawnConfetti(e.clientX,e.clientY) });
      window.addEventListener('pointerup', ()=>mouse.down=false);

      function spawnSpark(x,y){
        for(let i=0;i<28;i++){
          particles.push({x,y, vx:rand(-4,4), vy:rand(-6,1), life:rand(50,140), r:rand(2,6), hue:rand(180,320) });
        }
      }

      function spawnConfetti(x,y){
        // small DOM confetti for variety
        for(let i=0;i<18;i++){
          const el = document.createElement('div');
          el.className='confetti';
          el.style.left = x+'px'; el.style.top = y+'px';
          el.style.width = el.style.height = Math.floor(rand(6,12))+'px';
          el.style.background = ['#ff6bcb','#7afcff','#fff56b','#8bff7a'][Math.floor(Math.random()*4)];
          el.style.transform = 'translate(-50%,-50%) rotate('+rand(0,360)+'deg)';
          el.style.position='fixed'; el.style.zIndex=999; el.style.borderRadius='2px';
          el.style.opacity='1'; document.body.appendChild(el);
          const dx = rand(-200,200), dy = rand(-200,200), rot = rand(-600,600);
          const dur = rand(700,1600);
          const start = performance.now();
          (function animateConf(t0, el, dx,dy,rot,dur){
            function step(now){
              const p = Math.min(1,(now-t0)/dur);
              el.style.left = (x + dx*p)+'px'; el.style.top = (y + dy*p + 0.5*800*p*p)+'px';
              el.style.transform = 'translate(-50%,-50%) rotate('+ (rot*p) +'deg)';
              el.style.opacity = String(1-p);
              if(p<1) requestAnimationFrame(step); else el.remove();
            }
            requestAnimationFrame(step);
          })(start,el,dx,dy,rot,dur);
        }
      }

      // animate loop
      function tick(){
        ctx.clearRect(0,0,w,h);
        // subtle vignette background fill
        const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0b0720'); g.addColorStop(1,'#160032');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

        // move blobs gently towards mouse and wander
        blobs.forEach(b=>{
          const dx = (mouse.x - b.x);
          const dy = (mouse.y - b.y);
          const dist = Math.sqrt(dx*dx+dy*dy)+1;
          // attraction/repel subtlety when mouse pressed
          const f = mouse.down? -0.002 : 0.0006;
          if(!reduceMotion){
            b.vx += (dx/dist)*f + rand(-0.01,0.01);
            b.vy += (dy/dist)*f + rand(-0.01,0.01);
            b.x += b.vx; b.y += b.vy;
            b.vx *= 0.995; b.vy *= 0.995;
          }
          // bounds wrap
          if(b.x<-200) b.x = w/DPR+200; if(b.x>w/DPR+200) b.x = -200;
          if(b.y<-200) b.y = h/DPR+200; if(b.y>h/DPR+200) b.y = -200;
          // draw blob as soft radial gradient circle
          const grd = ctx.createRadialGradient(b.x,b.y,b.r*0.1,b.x,b.y,b.r);
          grd.addColorStop(0, `hsla(${b.hue},95%,65%,0.95)`);
          grd.addColorStop(0.45, `hsla(${(b.hue+40)%360},95%,55%,0.32)`);
          grd.addColorStop(1, `hsla(${(b.hue+80)%360},85%,20%,0.05)`);
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
          // occasional internal ripple
          ctx.globalCompositeOperation = 'source-over';
        });

        // particles
        for(let i=particles.length-1;i>=0;i--){
          const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `hsla(${p.hue},90%,60%,${Math.max(0.02,p.life/140)})`;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
          if(p.life<=0) particles.splice(i,1);
        }

        if(!reduceMotion) requestAnimationFrame(tick); else setTimeout(tick, 200); // throttle when reduced
      }
      tick();

      // small public API for UI buttons
      const sparkBtn = document.getElementById('sparkBtn');
      const resetBtn = document.getElementById('resetBtn');
      if(sparkBtn) sparkBtn.addEventListener('click', ()=>{ spawnSpark(mouse.x, mouse.y) });
      if(resetBtn) resetBtn.addEventListener('click', ()=>{ particles.length=0; blobs.forEach(b=>{b.x=rand(0,w/DPR);b.y=rand(0,h/DPR);b.vx=rand(-0.3,0.3);b.vy=rand(-0.2,0.2)}) });

      // Real spawnSpark implementation
      function _spawnSpark(x,y){
        for(let i=0;i<16;i++) particles.push({x,y, vx:rand(-3,3), vy:rand(-6,0), life:rand(40,120), r:rand(1.2,4.5), hue:rand(180,320)});
      }
      window.spawnSpark = _spawnSpark;
      window.spawnConfetti = spawnConfetti;
    } else {
      // No canvas on this page — provide no-op implementations so controls still work
      particles = [];
      blobs = [];
      mouse = {x:0,y:0,down:false};
      reduceMotion = false;
      window.spawnConfetti = function(x,y){ /* no-op */ };
      window.spawnSpark = function(x,y){ /* no-op */ };
    }

    // Custom cursor behaviour
    (function(){
      const cursor = document.getElementById('cursor');
      const buttons = Array.from(document.querySelectorAll('button'));
      let mx=0,my=0, cx=window.innerWidth/2, cy=window.innerHeight/2;
      window.addEventListener('pointermove', e=>{ mx=e.clientX; my=e.clientY; cursor.style.opacity='1'; });
      function loop(){ cx += (mx-cx)*0.18; cy += (my-cy)*0.18; cursor.style.left = cx+'px'; cursor.style.top = cy+'px'; requestAnimationFrame(loop); }
      loop();
      // enlarge near interactive elements
      function grow(){ cursor.style.width='42px'; cursor.style.height='42px' }
      function shrink(){ cursor.style.width='18px'; cursor.style.height='18px' }
      buttons.forEach(b=>{ b.addEventListener('pointerenter',grow); b.addEventListener('pointerleave',shrink); });

      // also when hovering cards
      document.querySelectorAll('.card').forEach(c=>{ c.addEventListener('pointerenter', ()=>{ cursor.style.width='56px'; cursor.style.height='56px' }); c.addEventListener('pointerleave', shrink); });
    })();

    // simple tilt effect for cards
    (function(){
      const cards = document.querySelectorAll('.card');
      cards.forEach(card=>{
        card.addEventListener('pointermove', e=>{
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left)/r.width; const py = (e.clientY - r.top)/r.height;
          const rx = (py - 0.5) * 12; const ry = (px - 0.5) * -12;
          card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
        });
        card.addEventListener('pointerleave', ()=>{ card.style.transform='translateY(0)'; });
      });
    })();

    // click-to-confetti (fireworks) binding to whole document
    (function(){
      let ready=true;
      document.addEventListener('pointerdown', e=>{
        if(!ready) return; ready=false; spawnClickBurst(e.clientX,e.clientY); setTimeout(()=>ready=true,420);
      });
      function spawnClickBurst(x,y){
        // pick random colors and spawn a few bursts
        const bursts = 3; for(let b=0;b<bursts;b++){ setTimeout(()=>{ window.dispatchEvent(new CustomEvent('confetti:launch',{detail:{x,y}})) }, b*80) }
      }
      window.addEventListener('confetti:launch', ev=>{ const d=ev.detail; // use DOM confetti from the canvas module code earlier
        try{ if(window.spawnConfetti) window.spawnConfetti(d.x,d.y); }catch(err){}
      });
    })();

    // ensure spawnConfetti exists (no-op fallback)
    (function(){ if(!window.spawnConfetti) window.spawnConfetti = function(x,y){ console.log('confetti at',x,y) } })();

    // controls: reduce motion, toggle UI, print, download, read aloud, pdf
    (function(){
      const reduceEl = document.getElementById('reduceMotion');
      const toggleUI = document.getElementById('toggleUI');
      const printBtn = document.getElementById('printBtn');
      const downloadBtn = document.getElementById('downloadBtn');
      const controls = document.querySelector('.controls');
      const analysis = document.getElementById('analysis');
      const readBtn = document.getElementById('readBtn');
      const stopReadBtn = document.getElementById('stopReadBtn');
      const pdfBtn = document.getElementById('pdfBtn');
        const shareCopy = document.getElementById('shareCopy');
        const shareTwitter = document.getElementById('shareTwitter');

        // Add a collapse control if controls overlap content
        if(controls && !controls.querySelector('.collapse-toggle')){
          const t = document.createElement('button');
          t.className = 'collapse-toggle'; t.innerText = '▾'; t.title = 'Collapse controls';
          t.addEventListener('click', ()=>{ controls.classList.toggle('collapsed'); t.innerText = controls.classList.contains('collapsed')? '▴' : '▾' });
          controls.insertBefore(t, controls.firstChild);
        }

      function setReduce(val){
        reduceMotion = !!val;
        reduceEl.checked = !!val;
        document.body.style.transition = val? 'none' : '';
        // when reducing motion, pause particle burst by clearing array
        if(val) particles.length = 0;
      }
        if(reduceEl) reduceEl.addEventListener('change', e=> setReduce(e.target.checked));

      reduceEl.addEventListener('change', e=> setReduce(e.target.checked));
      toggleUI.addEventListener('click', ()=>{
        const hidden = controls.dataset.hidden === '1';
        if(hidden){ controls.dataset.hidden='0'; controls.style.opacity='1'; toggleUI.textContent='Hide UI'; controls.classList.remove('collapsed'); }
        else{ controls.dataset.hidden='1'; controls.style.opacity='0.22'; toggleUI.textContent='Show UI'; controls.classList.add('collapsed'); }
        adjustContentForControls();
      });

      // Ensure controls never overlap main reading content: compute width and apply safe right padding to content containers
      function adjustContentForControls(){
        try{
          const safePadding = 24; // additional breathing room
          if(!controls) return;
          const rect = controls.getBoundingClientRect();
          const visible = !controls.classList.contains('collapsed') && (controls.dataset.hidden !== '1');
          if(visible){
            const needed = Math.ceil(rect.width + rect.right > window.innerWidth ? rect.width + safePadding : rect.width + safePadding);
            document.documentElement.style.setProperty('--controls-safe-right', needed + 'px');
            document.body.style.paddingRight = needed + 'px';
          } else {
            document.documentElement.style.removeProperty('--controls-safe-right');
            document.body.style.paddingRight = '';
          }
        }catch(e){console.warn(e)}
      }
      window.addEventListener('resize', adjustContentForControls, {passive:true});
      // initial adjustment
      setTimeout(adjustContentForControls, 200);

      printBtn.addEventListener('click', ()=> window.print());
      downloadBtn.addEventListener('click', ()=>{
        const text = analysis.innerText || analysis.textContent;
        const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'aigen7-analysis.txt'; a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
      });

      // text to speech (read aloud) with focus-trap while speaking
      function isSpeechSupported(){ return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function' }
      function speak(text){
        if(!isSpeechSupported()) return alert('Text-to-speech not available in this browser.');
        // trap focus to the analysis region while speaking
        const previouslyFocused = document.activeElement;
        const focusable = analysis.querySelectorAll('a, button, input, [tabindex]');
        function trap(e){
          if(!analysis.contains(e.target)){
            e.preventDefault();
            (focusable[0] || analysis).focus();
          }
        }
        document.addEventListener('focusin', trap, true);
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.rate = 1.0; ut.pitch = 1.0; ut.lang = 'en-US';
        ut.onend = ()=>{ document.removeEventListener('focusin', trap, true); try{ previouslyFocused && previouslyFocused.focus(); }catch(e){} };
        window.speechSynthesis.speak(ut);
      }
      if(readBtn) readBtn.addEventListener('click', ()=> speak(analysis ? (analysis.innerText || analysis.textContent) : document.body.innerText));
      if(stopReadBtn) stopReadBtn.addEventListener('click', ()=>{ if(isSpeechSupported()) window.speechSynthesis.cancel(); });

      // export as PDF using html2canvas + jsPDF with multi-page support
      if(pdfBtn) pdfBtn.addEventListener('click', async ()=>{
        try{
          const el = analysis || document.body;
          // temporarily force light background for better PDF readability
          const prevBg = el.style.background;
          el.style.background = '#ffffff'; el.style.color = '#000000';
          const canvasImg = await html2canvas(el, {scale:2, useCORS:true, backgroundColor: '#ffffff'});
          // restore styles
          el.style.background = prevBg; el.style.color = '';

          const imgData = canvasImg.toDataURL('image/png');
          const { jsPDF } = window.jspdf || jspdf || {};
          const pdf = new (jsPDF || jspdf.jsPDF)('p','pt','a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 30;
          const imgWidth = pageWidth - margin*2;
          const imgHeight = (canvasImg.height * imgWidth) / canvasImg.width;

          if(imgHeight <= pageHeight - margin*2){
            // fits on one page
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          } else {
            // multi-page: slice the canvas vertically into pages
            const canvas = document.createElement('canvas');
            const ctx2 = canvas.getContext('2d');
            const sliceHeight = Math.floor((canvasImg.width * (pageHeight - margin*2)) / imgWidth);
            canvas.width = canvasImg.width;
            canvas.height = sliceHeight;
            let y = 0;
            while(y < canvasImg.height){
              ctx2.clearRect(0,0,canvas.width,canvas.height);
              ctx2.drawImage(canvasImg, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
              const pageData = canvas.toDataURL('image/png');
              if(y>0) pdf.addPage();
              pdf.addImage(pageData, 'PNG', margin, margin, imgWidth, (sliceHeight * imgWidth) / canvas.width);
              y += sliceHeight;
            }
          }
          pdf.save('aigen7-analysis.pdf');
        }catch(err){
          console.error(err); alert('PDF export failed — try printing to PDF as fallback.');
        }
      });
    // share copy link and twitter
    if(shareCopy){ shareCopy.addEventListener('click', ()=>{ navigator.clipboard?.writeText(location.href).then(()=>{ shareCopy.textContent='Copied' ; setTimeout(()=>shareCopy.textContent='Copy link',1500) }) }) }
    if(shareTwitter){ shareTwitter.addEventListener('click', (e)=>{ e.preventDefault(); const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(location.href)}`; window.open(url,'_blank') }) }

      // keyboard shortcuts: R toggles reduce motion, H toggles UI, P prints
      window.addEventListener('keydown', e=>{
        if(e.key.toLowerCase()==='r'){ setReduce(!reduceMotion); }
        if(e.key.toLowerCase()==='h'){ toggleUI.click(); }
        if(e.key.toLowerCase()==='p'){ window.print(); }
      });

    })();

  });
})();
