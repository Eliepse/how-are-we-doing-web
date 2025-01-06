import { Config } from "../config";
import { Element2D, Renderable } from "./Contract/renderable";
import { Vector } from "./Vector";

export class Disc implements Renderable, Element2D {
    private element: SVGCircleElement;
    
    private position: Vector = Vector.Zero;
    private rotation: number = 0;

    constructor(size: number) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.element.setAttribute("fill", "#FFFFFF");
        this.element.setAttribute("r", size.toFixed(Config.Render.precision));
    }

    setPosition(position: Vector): void {
        this.position = position;
    }

    getPosition(): Vector {
        return this.position.clone();
    }

    setRotation(radian: number): void {
        this.rotation = radian;
    }

    getRotation(): number {
        return this.rotation;
    }

    getDOM(): Array<Element> {
        return [this.element];
    }

    refresh(): void {
        this.element.setAttribute("cx", this.position.x.toFixed(Config.Render.precision));
        this.element.setAttribute("cy", this.position.y.toFixed(Config.Render.precision));
    }
}