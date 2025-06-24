if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  // === Canvas Noise ===
  const canvas = document.getElementById("noiseCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function generateNoise() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 100;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function loop() {
    generateNoise();
    requestAnimationFrame(loop);
  }
  loop();

  // === Clone inverted image overlays ===
  document.querySelectorAll(".img-wrapper").forEach((wrapper) => {
    const originalImg = wrapper.querySelector("img");
    const clone = originalImg.cloneNode();
    clone.classList.add("invert-img");
    wrapper.appendChild(clone);
  });

  const invertedImages = document.querySelectorAll(".invert-img");
  const seenImages = new Set();

  // === Typing animation for timestamp ===
  function typeTimestamp(el, text) {
    if (!el || el.classList.contains("animated")) return;
    el.classList.add("animated");

    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150); // Adjust typing speed here
  }

  function updateTimestamps() {
    const viewportHeight = window.innerHeight;

    document.querySelectorAll(".timestamp").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        rect.top >= 0 &&
        rect.bottom <= viewportHeight &&
        !el.classList.contains("animated")
      ) {
        const time = el.getAttribute("data-time") || "";
        typeTimestamp(el, time);
      }
    });
  }

  // === Inversion logic ===
  function updateInversion() {
    const viewportHeight = window.innerHeight;

    invertedImages.forEach((invImg, index) => {
      const wrapper = invImg.parentElement;
      const rect = wrapper.getBoundingClientRect();

      if (seenImages.has(index)) {
        invImg.style.opacity = "0";
        return;
      }

      if (rect.bottom < 0) {
        invImg.style.opacity = "0";
        seenImages.add(index);
        return;
      }

      if (rect.top > viewportHeight) {
        invImg.style.opacity = "1";
        return;
      }

      const visibleHeight =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visibleRatio = visibleHeight / rect.height;

      if (visibleRatio >= 0.5) {
        invImg.style.opacity = "0";
        seenImages.add(index);
      } else if (visibleRatio > 0) {
        const opacity = 1 - visibleRatio / 0.5;
        invImg.style.opacity = opacity.toFixed(3);
      } else {
        invImg.style.opacity = "1";
      }
    });
  }

  // === Blur logic for previous images ===
  function updateBlur() {
    const viewportHeight = window.innerHeight;

    document.querySelectorAll(".img-wrapper").forEach((wrapper) => {
      const rect = wrapper.getBoundingClientRect();

      if (rect.bottom <= 0) {
        wrapper.style.filter = "blur(3px)";
        return;
      }

      if (rect.top < 0 && rect.bottom > 0) {
        const distanceAbove = Math.min(rect.bottom, viewportHeight);
        const maxDistance = viewportHeight;

        let progress = 1 - distanceAbove / maxDistance;
        let ease = progress * progress;

        const maxBlur = 4;
        const blur = ease * maxBlur;

        wrapper.style.filter = `blur(${blur.toFixed(2)}px)`;
        return;
      }

      wrapper.style.filter = "blur(0px)";
    });
  }

  // === Listeners ===
  window.addEventListener("scroll", () => {
    updateInversion();
    updateBlur();
    updateTimestamps();
  });

  window.addEventListener("resize", () => {
    updateInversion();
    updateBlur();
    updateTimestamps();
  });

  // Initial run
  updateInversion();
  updateBlur();
  updateTimestamps();
});
