import { Renderable } from "./Contract/renderable";
import { Vector } from "./Vector";

export class SVGCanvas implements Renderable {
    private domRoot: SVGSVGElement;

    constructor(viewBox: Vector, size: Vector) {
        this.domRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.domRoot.setAttribute("viewBox", `0 0 ${viewBox.x.toFixed()} ${viewBox.x.toFixed()}`);
        
        // Support svg
        this.domRoot.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        
        // Support symbols
        this.domRoot.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        this.domRoot.setAttribute("width", size.x.toFixed());
        this.domRoot.setAttribute("height", size.y.toFixed());
    }

    refresh(): void {}

    addElement(element: Renderable): void {
        element.getDOM().forEach((el) => this.domRoot.append(el));
    }

    getDOM(): Array<SVGSVGElement> {
        return [this.domRoot];
    }
}