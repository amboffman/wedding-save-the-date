(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- live countdown to midnight, May 15 2027 ---------- */
  var target = new Date(2027, 4, 15, 0, 0, 0).getTime();
  var el = { d:document.getElementById('d'), h:document.getElementById('h'),
             m:document.getElementById('m'), s:document.getElementById('s') };
  function pad(n){ return (n<10?'0':'') + n; }
  function tick(){
    var diff = Math.max(0, target - Date.now());
    var days = Math.floor(diff/86400000); diff -= days*86400000;
    var hrs  = Math.floor(diff/3600000);  diff -= hrs*3600000;
    var mins = Math.floor(diff/60000);    diff -= mins*60000;
    var secs = Math.floor(diff/1000);
    el.d.textContent = days;
    el.h.textContent = pad(hrs);
    el.m.textContent = pad(mins);
    el.s.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- hero entrance (staggered) ---------- */
  var heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach(function(n,i){ n.style.transitionDelay = (0.12 + i*0.16) + 's'; });
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      heroReveals.forEach(function(n){ n.classList.add('in'); });
    });
  });

  /* ---------- scroll reveals (countdown) ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:0.16 });
  document.querySelectorAll('.count .reveal').forEach(function(n){ io.observe(n); });

  /* ---------- safety: never leave content hidden ---------- */
  setTimeout(function(){
    document.querySelectorAll('.reveal').forEach(function(n){ n.classList.add('in'); });
  }, 2800);

  /* ---------- arch photo carousel ----------
     Add as many photos as you like below; the arch will softly
     cross-fade through them in order. Each `pos` sets how the
     photo is framed inside the arch (x% y%). */
  var PHOTOS = [
    { src:'assets/walk.jpg',          pos:'50% 50%' },
    { src:'assets/kalin-anthony.jpg', pos:'50% 30%' },
    { src:'assets/hug.jpg',           pos:'50% 30%' },
    { src:'assets/dip.jpg',           pos:'70% 50%' },
    { src:'assets/dog.jpg',           pos:'50% 42%' }
  ];
  var stage = document.getElementById('archSlides');
  var slides = PHOTOS.map(function(p, i){
    var im = document.createElement('img');
    im.src = p.src;
    im.alt = 'Kalin and Anthony';
    im.loading = 'eager';
    if(p.pos){ im.style.objectPosition = p.pos; }
    if(i === 0){ im.classList.add('active'); }
    stage.appendChild(im);
    return im;
  });
  if(slides.length > 1){
    var slideIdx = 0;
    setInterval(function(){
      slides[slideIdx].classList.remove('active');
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add('active');
    }, 15000);
  }

  if(reduce) return;

  /* ---------- gentle photo parallax ---------- */
  var photo = document.getElementById('archSlides');
  var ticking = false;
  function parallax(){
    var y = window.scrollY;
    if(y < window.innerHeight){
      photo.style.transform = 'translateY(' + (y * 0.06) + 'px)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(parallax); ticking = true; }
  }, { passive:true });

  /* ---------- drifting petals ---------- */
  var layer = document.getElementById('petals');
  var tones = ['rgba(110,119,51,0.30)','rgba(159,174,140,0.32)','rgba(140,115,48,0.24)','rgba(198,207,182,0.40)'];
  var N = 9;
  for(var i=0;i<N;i++){
    var p = document.createElement('span');
    p.className = 'petal';
    var size = 9 + Math.random()*13;
    p.style.width = size + 'px';
    p.style.height = (size*0.62) + 'px';
    p.style.left = (Math.random()*100) + '%';
    p.style.background = tones[i % tones.length];
    var dur = 15 + Math.random()*12;
    var delay = -Math.random()*dur;
    var sway = (10 + Math.random()*26) * (Math.random()<0.5?-1:1);
    p.style.setProperty('--sway', sway + 'px');
    p.style.animation = 'fall ' + dur + 's linear ' + delay + 's infinite';
    layer.appendChild(p);
  }
  var style = document.createElement('style');
  style.textContent =
    '@keyframes fall{' +
    '0%{ transform:translate(0,-10vh) rotate(0deg); opacity:0; }' +
    '12%{ opacity:0.55; }' +
    '88%{ opacity:0.5; }' +
    '100%{ transform:translate(var(--sway),112vh) rotate(220deg); opacity:0; } }';
  document.head.appendChild(style);
})();
