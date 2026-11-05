
// ==========================================
// SIGN INTERACTIONS
// ==========================================

const signs = [...document.querySelectorAll(".sign-link")];
const signData = [];

signs.forEach(sign => {
    const img = sign.querySelector("img");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    function setup() {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.drawImage(img, 0, 0);

        const pixels = ctx.getImageData(
            0, 0, canvas.width, canvas.height
        ).data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha =
                    pixels[(y * canvas.width + x) * 4 + 3];

                if (alpha > 10) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (maxX >= minX && maxY >= minY) {
            img.style.transformOrigin =
                `${((minX + maxX) / 2) / canvas.width * 100}% ${((minY + maxY) / 2) / canvas.height * 100}%`;
        }

        signData.push({
            sign,
            img,
            canvas,
            ctx
        });
    }

    if (img.complete && img.naturalWidth > 0) {
        setup();
    } else {
        img.addEventListener("load", setup, { once: true });
    }
});


// ==========================================
// SIGN PIXEL DETECTION
// ==========================================

function hitTest(data, mouseX, mouseY) {
    const { sign, canvas, ctx } = data;
    const rect = sign.getBoundingClientRect();

    const x = Math.floor(
        (mouseX - rect.left) / rect.width * canvas.width
    );

    const y = Math.floor(
        (mouseY - rect.top) / rect.height * canvas.height
    );

    if (
        x < 0 || y < 0 ||
        x >= canvas.width || y >= canvas.height
    ) {
        return false;
    }

    return ctx.getImageData(x, y, 1, 1).data[3] > 10;
}


// ==========================================
// PIXEL-PERFECT IMAGE DETECTION
// ==========================================

const imageCache = new Map();

function imageHitTest(img, mouseX, mouseY) {
    if (!img || !img.complete || !img.naturalWidth) {
        return false;
    }

    const rect = img.getBoundingClientRect();

    if (!rect.width || !rect.height) {
        return false;
    }

    const x = Math.floor(
        (mouseX - rect.left) / rect.width * img.naturalWidth
    );

    const y = Math.floor(
        (mouseY - rect.top) / rect.height * img.naturalHeight
    );

    if (
        x < 0 || y < 0 ||
        x >= img.naturalWidth ||
        y >= img.naturalHeight
    ) {
        return false;
    }

    const key = img.currentSrc || img.src;

    if (!imageCache.has(key)) {
        const canvas = document.createElement("canvas");

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d", {
            willReadFrequently: true
        });

        ctx.drawImage(img, 0, 0);

        imageCache.set(key, { ctx });
    }

    const { ctx } = imageCache.get(key);

    return ctx.getImageData(x, y, 1, 1).data[3] > 10;
}


// ==========================================
// INTERACTIVE CASTLE DOOR
// ==========================================

const door = document.querySelector(".castle-door");


// ==========================================
// SIGN AND DOOR HOVER + CURSOR
// ==========================================

document.addEventListener("mousemove", event => {
    let overClickable = false;

    // Check signs
    signData.forEach(data => {
        const hovered = hitTest(
            data,
            event.clientX,
            event.clientY
        );

        data.sign.classList.toggle("hovered", hovered);

        if (hovered) {
            overClickable = true;
        }
    });

    // Check actual visible door pixels
    if (imageHitTest(door, event.clientX, event.clientY)) {
        overClickable = true;
    }

    // Switch custom cursor
    document.body.classList.toggle(
        "cool-cursor",
        overClickable
    );
});


// ==========================================
// SIGN CLICK
// ==========================================

document.addEventListener("click", event => {
    for (const data of [...signData].reverse()) {
        if (hitTest(data, event.clientX, event.clientY)) {
            window.location.href = data.sign.href;
            return;
        }
    }
});


// ==========================================
// INTERACTIVE CASTLE DOOR CLICK
// ==========================================

document.addEventListener("click", event => {
    if (!imageHitTest(door, event.clientX, event.clientY)) {
        return;
    }

    const isClosed = door.src.includes("door_closed.png");

    door.src = isClosed
        ? "assets/door_open.png"
        : "assets/door_closed.png";
});

// ==========================================
// DISCORD POPUP
// ==========================================

const discordButton = document.getElementById("discord-button");
const discordPopup = document.getElementById("discord-popup");
const closeDiscord = document.getElementById("close-discord");
const copyDiscord = document.getElementById("copy-discord");

discordButton.addEventListener("click", () => {
    discordPopup.classList.add("show");
});

closeDiscord.addEventListener("click", () => {
    discordPopup.classList.remove("show");
});

copyDiscord.addEventListener("click", async () => {
    await navigator.clipboard.writeText("cilees");

    copyDiscord.textContent = "Copied!";

    setTimeout(() => {
        copyDiscord.textContent = "Copy Username";
    }, 1500);
});
