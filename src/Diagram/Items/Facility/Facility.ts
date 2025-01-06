import { VirtualShape } from "../../../Engine2D/VirtualShape";
import { facilityShape } from "./shapes";

export class Facility extends VirtualShape {
  constructor() {
    super(facilityShape);
  }
}
