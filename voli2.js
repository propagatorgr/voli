// =====================================
// ΟΡΙΖΟΝΤΙΑ ΒΟΛΗ – ΤΕΛΙΚΗ ΚΑΘΑΡΗ ΕΚΔΟΣΗ
// =====================================

// -------- ΦΥΣΙΚΗ
let g = 10;

// -------- ΧΡΟΝΟΣ
let t = 0;
let dt = 0.02;
let tMax;
let tTarget = null;
let playing = false;

// -------- ΠΑΡΑΜΕΤΡΟΙ
let H = 40;
let u0 = 15;

// -------- ΚΑΜΒΑΣ
let canvasW, canvasH, x0, y0, scaleM;

// -------- ΔΕΔΟΜΕΝΑ
let trajectory = [];
let selectedPoint = null;

// -------- UI
let Hslider, Hvalue;
let Uslider, Uvalue;
let playBtn, pauseBtn, resetBtn;
let timeInput, goBtn, msgText;


// =====================================
// SETUP
// =====================================
function setup() {
  setupCanvas();

  // Slider ύψους (0–60 m)
  Hslider = createSlider(0, 60, H, 1);
  Hslider.position(10, canvasH + 25);
  Hvalue = createSpan();
  Hvalue.position(Hslider.x + Hslider.width + 10, canvasH + 25);

  // Slider u0
  Uslider = createSlider(5, 20, u0, 1);
  Uslider.position(10, canvasH + 55);
  Uvalue = createSpan();
  Uvalue.position(Uslider.x + Uslider.width + 10, canvasH + 55);

  // Κουμπιά
  playBtn = createButton("Play");
  playBtn.position(320, canvasH + 25);
  playBtn.mousePressed(() => playing = true);

  pauseBtn = createButton("Pause");
  pauseBtn.position(370, canvasH + 25);
  pauseBtn.mousePressed(() => playing = false);

  resetBtn = createButton("Reset");
  resetBtn.position(440, canvasH + 25);
  resetBtn.mousePressed(fullReset);

  // Είσοδος χρόνου
  timeInput = createInput('');
  timeInput.position(10, canvasH + 85);
  timeInput.size(70);
  timeInput.attribute('placeholder', 't (s)');

  goBtn = createButton("Go");
  goBtn.position(90, canvasH + 85);
  goBtn.mousePressed(handleTimeInput);

  msgText = createSpan('');
  msgText.position(140, canvasH + 88);
  msgText.style('color', 'red');

  resetSimulation();
}


// =====================================
// RESPONSIVE CANVAS
// =====================================
function setupCanvas() {
  canvasW = min(900, windowWidth - 20);
  canvasH = canvasW * 0.6;

  if (!window.canvasRef) window.canvasRef = createCanvas(canvasW, canvasH);
  else resizeCanvas(canvasW, canvasH);

  x0 = canvasW * 0.08;
  y0 = canvasH * 0.85;
  scaleM = canvasW / 160;
}

function windowResized() {
  setupCanvas();
}


// =====================================
// RESET
// =====================================
function resetSimulation() {
  playing = false;
  t = 0;
  trajectory = [];
  selectedPoint = null;
}

function fullReset() {
  tTarget = null;
  resetSimulation();
  timeInput.value('');
  msgText.html('');
}


// =====================================
// GO (έλεγχος χρόνου)
// =====================================
function handleTimeInput() {
  const value = parseFloat(timeInput.value());
  const tMaxLocal = sqrt((2 * H) / g);

  msgText.html('');

  if (isNaN(value)) {
    msgText.html('✖ Μη αριθμητική τιμή');
    return;
  }
  if (value < 0 || value > tMaxLocal) {
    msgText.html(`✖ 0 – ${tMaxLocal.toFixed(2)} s`);
    return;
  }

  resetSimulation();
  tTarget = value;
  playing = true;
}


// =====================================
// DRAW
// =====================================
function draw() {
  background(245);

  H = Hslider.value();
  u0 = Uslider.value();
  Hvalue.html(` H = ${H} m`);
  Uvalue.html(` u₀ = ${u0} m/s`);

  tMax = sqrt((2 * H) / g);

  // --- ΕΞΕΛΙΞΗ ΧΡΟΝΟΥ (ΚΡΙΣΙΜΟ)
  if (playing) {
    if (t + dt >= tMax) {
      t = tMax;
      playing = false;
    }
    else if (tTarget !== null && t + dt >= tTarget) {
      t = tTarget;
      playing = false;
    }
    else {
      t += dt;
    }
  }

  // Θέση
  let x = u0 * t;
  let h = H - 0.5 * g * t * t;

  let px = x0 + x * scaleM;
  let py = y0 - h * scaleM;

  // Αποθήκευση τροχιάς
  if (trajectory.length === 0 || trajectory[trajectory.length - 1].t < t) {
    trajectory.push({ t, x, h, px, py });
  }

  // Άξονες
  stroke(0);
  line(x0, y0, canvasW * 0.95, y0);
  line(x0, y0, x0, canvasH * 0.1);

  // Τροχιά
  noFill();
  beginShape();
  for (let p of trajectory) vertex(p.px, p.py);
  endShape();

  // Σώμα
  fill(200, 0, 0);
  noStroke();
  let R = canvasW * 0.015;
  circle(px, py, R);

  // Κλικ στο σώμα
  if (mouseIsPressed && dist(mouseX, mouseY, px, py) < R) {
    selectedPoint = { t, x, h, px, py };
    playing = false;
  }

  if (selectedPoint) {
    drawVectors(selectedPoint);
    drawInfo(selectedPoint);
  }
}


// =====================================
// ΔΙΑΝΥΣΜΑΤΑ ΤΑΧΥΤΗΤΑΣ
// =====================================
function drawVectors(p) {
  let ux = u0;
  let uy = g * p.t;
  let s = scaleM * 0.4;

  drawArrow(p.px, p.py, ux * s, uy * s, color(255,0,0));
  drawArrow(p.px, p.py, ux * s, 0, color(0,0,255));
  drawArrow(p.px, p.py, 0, uy * s, color(0,150,0));
}

function drawArrow(x, y, vx, vy, col) {
  push();
  stroke(col);
  fill(col);
  translate(x, y);
  line(0, 0, vx, vy);
  let a = atan2(vy, vx);
  translate(vx, vy);
  rotate(a);
  triangle(0, 0, -7, 3, -7, -3);
  pop();
}


// =====================================
// ΠΙΝΑΚΑΣ ΤΙΜΩΝ
// =====================================
function drawInfo(p) {
  let ux = u0;
  let uy = g * p.t;
  let v = sqrt(ux*ux + uy*uy);

  let bx = canvasW * 0.62;
  let by = canvasH * 0.08;

  fill(255);
  stroke(0);
  rect(bx, by, canvasW * 0.35, canvasH * 0.55);

  noStroke();
  fill(0);

  let d = 18;
  text(`t = ${p.t.toFixed(2)} s`, bx+10, by+1*d);
  text(`x = ${p.x.toFixed(2)} m`, bx+10, by+2*d);
  text(`h = ${p.h.toFixed(2)} m`, bx+10, by+3*d);
  text(`uₓ = ${ux.toFixed(1)} m/s`, bx+10, by+5*d);
  text(`uᵧ = ${uy.toFixed(1)} m/s`, bx+10, by+6*d);
  text(`|u| = ${v.toFixed(2)} m/s`, bx+10, by+7*d);

  text("x = u₀·t", bx+10, by+9*d);
  text("h = H − ½·g·t²", bx+10, by+10*d);
}