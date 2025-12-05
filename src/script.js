const windowEl = document.getElementById("systemWindow");
const titleBar = document.querySelector(".title-bar");
const closeBtn = document.getElementById("closeBtn");

let isDragging = false;
let offsetX, offsetY;

// Drag logic
titleBar.addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", e => {
  if (isDragging) {
    windowEl.style.left = (e.clientX - offsetX) + "px";
    windowEl.style.top = (e.clientY - offsetY) + "px";
  }
});

// Close window
closeBtn.addEventListener("click", () => {
  windowEl.style.display = "none";
});
