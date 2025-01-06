import { Vector } from "./Vector";

export class BoundingBox {
    public start: Vector = Vector.Zero;
    public end: Vector = Vector.Zero;

    constructor() {}

    size(): Vector {
        return this.end.sub(this.start);
    }

    isInside(point: Vector): boolean {
        if(this.start.x > point.x || this.start.y < point.y) {
            return false;
        }

        if(this.end.x < point.x || this.end.y > point.y) {
            return false;
        }

        return true;
    }
}