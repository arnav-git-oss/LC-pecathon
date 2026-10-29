
const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let width = window.innerWidth;
let height = window.innerHeight;
let snowflakes = [];
let animationId = null;

const snowCount = () => {
    if (reducedMotion.matches) return 0;

    // Adjust the density for different screen sizes.
    return Math.min(
        180,
        Math.max(45, Math.floor((width * height) / 8500))
    );
};

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createSnowflakes();
}

function createSnowflakes() {
    const count = snowCount();

    snowflakes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,

        // Different sizes create depth.
        radius: Math.random() * 2.5 + 0.6,

        // Smaller flakes tend to fall more slowly.
        speed: Math.random() * 0.8 + 0.3,

        drift: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.65 + 0.2,

        // Individual movement for a natural effect.
        phase: Math.random() * Math.PI * 2,
        sway: Math.random() * 0.4 + 0.1
    }));
}

let frame = 0;

function drawSnow() {
    ctx.clearRect(0, 0, width, height);

    frame++;

    for (const flake of snowflakes) {
        // Soft horizontal drifting.
        flake.phase += 0.008;

        flake.x += flake.drift + Math.sin(
            flake.phase + frame * 0.003
        ) * flake.sway;

        // Downward movement.
        flake.y += flake.speed;

        // Wrap around the screen edges.
        if (flake.x > width + 5) flake.x = -5;
        if (flake.x < -5) flake.x = width + 5;

        // Start again at the top after falling off-screen.
        if (flake.y > height + 5) {
            flake.y = -5;
            flake.x = Math.random() * width;
        }

        // Draw a softly glowing white snowball.
        ctx.beginPath();

        ctx.arc(
            flake.x,
            flake.y,
            flake.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = `rgba(240, 248, 255, ${flake.opacity})`;

        // A subtle glow on larger flakes.
        if (flake.radius > 1.8) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(191, 219, 254, 0.8)";
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    }

    ctx.shadowBlur = 0;

    if (!reducedMotion.matches) {
        animationId = requestAnimationFrame(drawSnow);
    } else {
        animationId = null;
    }
}

// Handle the mobile navigation.
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the mobile menu after selecting a section.
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.textContent = "☰";
    });
});

// Recalculate snowfall when the screen size changes.
window.addEventListener("resize", resizeCanvas);

// Stop or restart the animation if motion preferences change.
reducedMotion.addEventListener("change", () => {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    resizeCanvas();
    drawSnow();
});

// Start everything.
resizeCanvas();
drawSnow();
