import type { Collider } from "../Physic/Collider";

export interface WithPointerEvents {
	getPointerCollider(): Collider;
}
