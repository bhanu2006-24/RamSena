/**
 * RAM SENA - Input Controller (scripts/input.js)
 * Modular keyboard handling for Pokemon RPG style grid navigation and UI interaction.
 */

class InputHandler {
  constructor() {
    this.keys = {};
    this.justPressed = {};

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent default page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.justPressed[e.code] = false;
    });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  wasJustPressed(code) {
    const val = !!this.justPressed[code];
    this.justPressed[code] = false;
    return val;
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.isDown('KeyW') || this.isDown('ArrowUp')) dy -= 1;
    else if (this.isDown('KeyS') || this.isDown('ArrowDown')) dy += 1;
    else if (this.isDown('KeyA') || this.isDown('ArrowLeft')) dx -= 1;
    else if (this.isDown('KeyD') || this.isDown('ArrowRight')) dx += 1;

    return { dx, dy };
  }
}

window.inputHandler = new InputHandler();
