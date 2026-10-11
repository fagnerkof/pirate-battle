export interface EntityCircle {
  x: number;
  y: number;
  radius: number;
}

export interface EntityRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CollisionManager {
  // Colisão Círculo vs Círculo
  public static checkCircleCircle(a: EntityCircle, b: EntityCircle): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    return distance < a.radius + b.radius;
  }

  // Colisão Círculo vs Retângulo (para Ilhas)
  public static checkCircleRect(circle: EntityCircle, rect: EntityRect): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
  }
}