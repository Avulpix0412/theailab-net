// Decorative full-page background flourish (homepage only). A sunburst of
// thin rays radiating from a point that eases toward the cursor and slowly
// rotates with scroll position; color cycles via a CSS hue-rotate animation
// on the canvas element itself (see .bg-flourish in css/style.css).
// Purely decorative — no functional purpose, disabled entirely when the
// visitor's OS has "reduce motion" turned on.
(function () {
  var canvas = document.getElementById("bg-flourish");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LIGHT_COLORS = ["#c2703f", "#c3a89f", "#a3ac93", "#c4ab77", "#a49cb0", "#9bb0b5"];
  var DARK_COLORS = ["#e2853f", "#e2a89a", "#a3c78c", "#dcb567", "#b6a3d9", "#7ec3c7"];

  var W, H, DPR;
  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  var RAY_COUNT = 140;
  var rays = [];
  for (var i = 0; i < RAY_COUNT; i++) {
    rays.push({
      angle: Math.random() * Math.PI * 2,
      length: 120 + Math.random() * 420,
      width: 0.5 + Math.random() * 1.1,
      dotR: 1 + Math.random() * 2.2
    });
  }

  function currentPalette() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? DARK_COLORS : LIGHT_COLORS;
  }

  var targetX = 0, targetY = 0, curX = 0, curY = 0, rotation = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2 + curX;
    var cy = H / 2 + curY;
    var palette = currentPalette();

    ctx.lineCap = "round";
    for (var i = 0; i < rays.length; i++) {
      var r = rays[i];
      var a = r.angle + rotation;
      var x2 = cx + Math.cos(a) * r.length;
      var y2 = cy + Math.sin(a) * r.length;
      var color = palette[i % palette.length];

      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = r.width;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.globalAlpha = 0.75;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x2, y2, r.dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
    glow.addColorStop(0, palette[0]);
    glow.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  resize();

  if (reduceMotion) {
    draw();
    window.addEventListener("resize", function () { resize(); draw(); });
    return;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", function (e) {
    targetX = (e.clientX - W / 2) * 0.15;
    targetY = (e.clientY - H / 2) * 0.15;
  });
  window.addEventListener("scroll", function () {
    rotation = (window.scrollY || 0) * 0.05 * Math.PI / 180;
  }, { passive: true });

  function loop() {
    curX += (targetX - curX) * 0.05;
    curY += (targetY - curY) * 0.05;
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
