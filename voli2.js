// =====================================
// ΟΡΙΖΟΝΤΙΑ ΒΟΛΗ – RESPONSIVE + MOBILE FIX
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
let infoMsg;

// =====================================
// SETUP
// =====================================
function setup() {

  setupCanvas();
  let controls = select("#controls");

  // -------- Row 1 (H)
  let row1 = createDiv().addClass("control-row").parent(controls);
  Hslider = createSlider(0, 60, H, 1).parent(row1);
  Hvalue = createSpan().parent(row1);

  // -------- Row 2 (u0)
  let row2 = createDiv().addClass("control-row").parent(controls);
  Uslider = createSlider(5, 20, u0, 1).parent(row2);
  Uvalue = createSpan().parent(row2);

  // -------- Row 3 (buttons)
  let row3 = createDiv().addClass("control-row").parent(controls);
  playBtn = createButton("Play").parent(row3);
  playBtn.mousePressed(() => playing = true);

  pauseBtn = createButton("Pause").parent(row3);
  pauseBtn.mousePressed(() => playing = false);

  resetBtn = createButton("Reset").parent(row3);
  resetBtn.mousePressed(fullReset);

  // -------- Row 4 (time)
  let row4 = createDiv().addClass("control-row").parent(controls);
  timeInput = createInput('').parent(row4);
  timeInput.attribute('placeholder', 't (s)');
  timeInput.size(70);

  goBtn = createButton("Go").parent(row4);
  goBtn.mousePressed(handleTimeInput);

  msgText = createSpan('').parent(row4);
  msgText.style('color', 'red');

  // -------- Μήνυμα καθοδήγησης
  infoMsg = createDiv('').parent(controls);
  infoMsg.style('color', 'blue');

  resetSimulation();
}

// =====================================
// CANVAS
// =====================================
function setupCanvas() {

  canvasW = min(900, windowWidth - 20);
  canvasH = canvasW * 0.75; // καλύτερο για κινητό

  createCanvas(canvasW, canvasH).parent("sketch-holder");

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
// GO BUTTON
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

  // εξέλιξη χρόνου
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

  // θέση
  let x = u0 * t;
  let h = H - 0.5 * g * t * t;

  let px = x0 + x * scaleM;
  let py = y0 - h * scaleM;

  // τροχιά
  if (trajectory.length === 0 || trajectory[trajectory.length - 1].t < t) {
    trajectory.push({ t, x, h, px, py });
  }

  // άξονες
  stroke(0);
  line(x0, y0, canvasW * 0.95, y0);
  line(x0, y0, x0, canvasH * 0.1);

  // τροχιά
  noFill();
  beginShape();
  for (let p of trajectory) vertex(p.px, p.py);
  endShape();

  // σώμα
  fill(200, 0, 0);
  noStroke();
  let R = canvasW * 0.02;
  circle(px, py, R);

  // click στο σώμα
  if (mouseIsPressed && dist(mouseX, mouseY, px, py) < R) {
    selectedPoint = { t, x, h, px, py };
    playing = false;
  }

  if (selectedPoint) {
    drawVectors(selectedPoint);
    drawInfo(selectedPoint);
  }

  // ✅ ΜΗΝΥΜΑ
  if (!playing && t > 0 && !selectedPoint) {
    infoMsg.html("👉 Κάντε κλικ στο σώμα για να δείτε τις τιμές");
  } else {
    infoMsg.html("");
  }
}

// =====================================
// ΔΙΑΝΥΣΜΑΤΑ
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
// INFO BOX
// =====================================
function drawInfo(p) {

  let ux = u0;
  let uy = g * p.t;
  let v = sqrt(ux*ux + uy*uy);

  let bx = canvasW * 0.6;
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
  text(`u = ${v.toFixed(2)} m/s`, bx+10, by+7*d);

  text("x = u₀·t", bx+10, by+9*d);
  text("h = H − ½·g·t²", bx+10, by+10*d);
}
