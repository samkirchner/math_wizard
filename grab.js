const container = document.querySelector(".container");
const dragHandle = document.querySelector(".drag-header");

let isDragging = false;
let offsetX = 0, offsetY = 0;

dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;

    const computedLeft = parseFloat(container.style.left || container.offsetLeft);
    const computedTop = parseFloat(container.style.top || container.offsetTop);

    offsetX = e.clientX - computedLeft;
    offsetY = e.clientY - computedTop;

    dragHandle.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const sidebar = document.getElementById("sidebar");
    const isSidebarOpen = sidebar.classList.contains("open");
    const sidebarWidth = isSidebarOpen ? sidebar.offsetWidth : 0;

    const rect = container.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // Clamp horizontally (respect sidebar)
    newLeft = Math.max(sidebarWidth, Math.min(newLeft, winWidth - rect.width));

    // Clamp vertically
    newTop = Math.max(0, Math.min(newTop, winHeight - rect.height));

    container.style.left = `${newLeft}px`;
    container.style.top = `${newTop}px`;
});

document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    dragHandle.style.cursor = "grab";
});
