import type { Symbolic } from "../../../Engine2D/Contract/renderable";
import { ClipPath } from "../../../Engine2D/Parameters/Clip";
import { VirtualShape } from "../../../Engine2D/VirtualShape";

const stepClips = [
  ClipPath.rect("0", "100%", "25%", "0"),
  ClipPath.rect("25%", "100%", "50%", "0"),
  ClipPath.rect("50%", "100%", "75%", "0"),
  ClipPath.rect("75%", "100%", "100%", "0"),
];

const stepClipsOptimized = [
  ClipPath.rect("0", "100%", "25%", "0"),
  ClipPath.rect("0", "100%", "50%", "0"),
  ClipPath.rect("0", "100%", "75%", "0"),
  ClipPath.rect("0", "100%", "100%", "0"),
];

export class Determinant extends VirtualShape {
  private elements: Array<VirtualShape> = [];
  private step: number = 2;

  constructor(asset: Symbolic, private optimized: boolean = true) {
    super(asset);

    // if (this.optimized) {
    //   const size = new Vector(159, 256).div(2);
    //   const shape = new VirtualShape(size, asset, stepClipsOptimized[this.step - 1]);
    //   this.elements.push(shape);
    //   return;
    // }

    // for (var i = 0; i < 4; i++) {
    //   const size = new Vector(159, 256).div(2);
    //   const shape = new VirtualShape(size, asset, stepClips[i]);
    //   this.elements.push(shape);
    // }
  }

  getStep(): number {
    return this.step;
  }

  setStep(step: number): void {
    this.step = Math.min(4, Math.max(1, step));
  }
}
