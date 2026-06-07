(function () {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shootingStars = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function randomRange(a, b) { return a + Math.random() * (b - a); }

  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 2000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: randomRange(0, W), y: randomRange(0, H),
        r: randomRange(0.2, 1.8),
        alpha: randomRange(0.3, 1),
        twinkleSpeed: randomRange(0.003, 0.015),
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: pickStarColor()
      });
    }
  }

  function pickStarColor() {
    const colors = [
      'rgba(255,255,255,',
      'rgba(180,170,255,',
      'rgba(150,200,255,',
      'rgba(255,220,150,',
      'rgba(200,230,255,',
      'rgba(232,200,74,'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: randomRange(W * 0.1, W * 0.9),
      y: randomRange(0, H * 0.4),
      len: randomRange(80, 220),
      speed: randomRange(8, 18),
      angle: randomRange(20, 50) * Math.PI / 180,
      alpha: 1,
      fade: randomRange(0.010, 0.022),
      color: Math.random() > 0.6 ? 'rgba(201,168,76,' : 'rgba(255,255,255,'
    });
  }

  function drawNebula(cx, cy, radius, color) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStars() {
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H));
    bg.addColorStop(0,   'rgba(12,4,35,1)');
    bg.addColorStop(0.3, 'rgba(4,2,15,1)');
    bg.addColorStop(0.7, 'rgba(1,0,5,1)');
    bg.addColorStop(1,   'rgba(0,0,2,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawNebula(W * 0.12, H * 0.22, 320, 'rgba(100,50,210,0.09)');
    drawNebula(W * 0.78, H * 0.65, 260, 'rgba(25,90,210,0.08)');
    drawNebula(W * 0.50, H * 0.08, 200, 'rgba(180,45,100,0.06)');
    drawNebula(W * 0.88, H * 0.12, 170, 'rgba(201,168,74,0.05)');
    drawNebula(W * 0.35, H * 0.75, 240, 'rgba(60,20,160,0.07)');
    drawNebula(W * 0.65, H * 0.35, 190, 'rgba(192,57,43,0.05)');

    stars.forEach(s => {
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha >= 1)   { s.alpha = 1;   s.twinkleDir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.twinkleDir =  1; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + s.alpha + ')';
      ctx.fill();
      if (s.r > 1.2) {
        ctx.strokeStyle = s.color + (s.alpha * 0.35) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
        ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
        ctx.stroke();
      }
    });

    shootingStars = shootingStars.filter(ss => ss.alpha > 0);
    shootingStars.forEach(ss => {
      const dx = Math.cos(ss.angle) * ss.len;
      const dy = Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + dx, ss.y + dy);
      grad.addColorStop(0, ss.color + ss.alpha + ')');
      grad.addColorStop(1, ss.color + '0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x + dx, ss.y + dy);
      ctx.stroke();
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= ss.fade;
    });
  }

  let frame = 0;
  function loop() {
    drawStars();
    frame++;
    if (frame % 140 === 0) spawnShootingStar();
    requestAnimationFrame(loop);
  }

  resize();
  initStars();
  loop();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

document.addEventListener('mousemove', (e) => {
  const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;
  const hat     = document.querySelector('.op-hat');
  const compass = document.querySelector('.op-compass');
  const ship    = document.querySelector('.op-ship');
  if (hat)     hat.style.transform     = `translate(${mx * -10}px, ${my * -8}px)`;
  if (compass) compass.style.transform = `translate(${mx * 8}px, ${my * 6}px) rotate(${mx * 15}deg)`;
  if (ship)    ship.style.transform    = `translate(${mx * -6}px, ${my * -4}px)`;
});
