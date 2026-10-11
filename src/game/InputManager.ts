export class InputManager {
  public keys: { [key: string]: boolean } = {};

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public isForward(): boolean {
    return !!(this.keys['KeyW'] || this.keys['ArrowUp']);
  }

  public isRotateLeft(): boolean {
    return !!(this.keys['KeyA'] || this.keys['ArrowLeft']);
  }

  public isRotateRight(): boolean {
    return !!(this.keys['KeyD'] || this.keys['ArrowRight']);
  }

  public isShootFront(): boolean {
    return !!(this.keys['Space'] || this.keys['KeyJ']);
  }

  public isShootSides(): boolean {
    return !!(this.keys['KeyK'] || this.keys['ShiftLeft']);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}