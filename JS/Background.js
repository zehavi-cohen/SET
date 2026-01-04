const bg = document.getElementById('background-animation');
const shapes = ['ellipse', 'diamond', 'wave'];
const colors = ['red', 'green', 'purple'];
const fills = ['full', 'empty', 'striped'];



let intervalId

function createFallingShape() {
  const shape = document.createElement('div');
  shape.classList.add(
    'bg-shape',
    shapes[Math.floor(Math.random() * shapes.length)],
    colors[Math.floor(Math.random() * colors.length)],
    fills[Math.floor(Math.random() * fills.length)]
  );

  const side = Math.random() < 0.5
    ? Math.random() * 20
    : 80 + Math.random() * 20;

  shape.style.left = side + 'vw';
  shape.style.top = -Math.random() * 100 + 'px';
  shape.style.animationDuration = (2.5 + Math.random() * 2) + 's';

  document.getElementById('background-animation').appendChild(shape);

  shape.addEventListener('animationend', () => shape.remove());
}

function startAnimation() {
  document.querySelectorAll('.bg-shape').forEach(shape => shape.remove());
  if (!intervalId) {
    intervalId = setInterval(createFallingShape, 350);
  }
}

function stopAnimation() {
  clearInterval(intervalId);
  intervalId = null;
}

window.addEventListener('focus', startAnimation);
window.addEventListener('blur', stopAnimation);

// הפעלה ראשונית
startAnimation();



// פונקציה להבהרת צבע HEX
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent);
  let b = (num & 0x0000FF) + Math.round(255 * percent);

  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);

  return `rgb(${r}, ${g}, ${b})`;
}
