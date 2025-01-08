import type { Collider } from "./Collider";

export interface WithPointerEvents {
	getPointerCollider(): Collider;
}
