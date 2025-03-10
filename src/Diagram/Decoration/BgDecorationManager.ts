import { Node2D } from "../../Engine2D/Node/Node2D";
import type { WithLifecycle } from "../../Engine2D/Contract/WithLifecycle";
import type { Engine } from "../../Engine2D/Engine";
import { BgDecoration, genericAssets, mentalAssets, physiqueAssets, socialAssets } from "./BgDecoration";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { rand } from "../../Engine2D/math";
// @ts-ignore
import { Noise } from "noisejs";
import { Angle } from "../../Engine2D/ValueObject/Angle";

//
const typeNoiseTimeShift = { social: 0, mental: 371_233.1, physical: 644_903.3 } as const;
const PI2 = Angle.PI2.rad;

export class BgDecorationManager extends Node2D implements WithLifecycle {
	private radius = 300;
	private current?: "social" | "mental" | "physical";
	private nodes = {
		social: [
			new BgDecoration(genericAssets[0], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(genericAssets[1], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(socialAssets[0], new Vector(120), new Vector(rand(.4, .75))),
			new BgDecoration(socialAssets[1], new Vector(120), new Vector(rand(.4, .75))),
			new BgDecoration(socialAssets[2], new Vector(120), new Vector(rand(.4, .75))),
			new BgDecoration(socialAssets[3], new Vector(120), new Vector(rand(.4, .75))),
			new BgDecoration(socialAssets[4], new Vector(120), new Vector(rand(.4, .75))),
		],
		mental: [
			new BgDecoration(genericAssets[0], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(genericAssets[1], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(mentalAssets[0], new Vector(160), new Vector(rand(.3, .6))),
			new BgDecoration(mentalAssets[1], new Vector(160), new Vector(rand(.3, .6))),
			new BgDecoration(mentalAssets[2], new Vector(160), new Vector(rand(.3, .6))),
			new BgDecoration(mentalAssets[3], new Vector(160), new Vector(rand(.3, .6))),
			new BgDecoration(mentalAssets[4], new Vector(160), new Vector(rand(.3, .6))),
		],
		physical: [
			new BgDecoration(genericAssets[0], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(genericAssets[1], new Vector(180), new Vector(rand(.37, .5))),
			new BgDecoration(physiqueAssets[0], new Vector(90), new Vector(rand(.7, .9))),
			new BgDecoration(physiqueAssets[1], new Vector(90), new Vector(rand(.7, .9))),
			new BgDecoration(physiqueAssets[2], new Vector(90), new Vector(rand(.7, .9))),
			new BgDecoration(physiqueAssets[3], new Vector(90), new Vector(rand(.7, .9))),
			new BgDecoration(physiqueAssets[4], new Vector(90), new Vector(rand(.7, .9))),
			new BgDecoration(physiqueAssets[5], new Vector(90), new Vector(rand(.7, .9))),
		],
	} as const;
	private timer: number = 0;
	private noise: Noise = new Noise();

	onMount(_: Engine): void | (() => void) {
		this.timer += Math.random() * 1234;
	}

	override onProcess(deltaTime: number): void {
		super.onProcess(deltaTime);

		if (undefined === this.current) {
			return;
		}


		this.timer += deltaTime;
		const speed = .03;
		const baseTime = (this.timer + typeNoiseTimeShift[this.current]) * speed;
		const nodes = this.nodes[this.current];

		nodes.forEach((node, i) => {
			const tShift = (i * 3295.433);

			const angle = this.noise.perlin2(baseTime, tShift);
			const radius = this.noise.perlin2(baseTime, tShift + 1243.765) * this.radius;
			const rotation = this.noise.perlin2(baseTime * 3, tShift + 3743.6);

			node.setPosition(new Vector(Math.cos(PI2 * angle) * radius, Math.sin(PI2 * angle) * radius));
			node.setRotation(Angle.PI2.mul(rotation));
		});

		this.shouldRerender();
	}

	onUnmount(_: Engine): void {
	}

	select(type: "social" | "mental" | "physical" | undefined): void {
		if (this.current === type) {
			return;
		}

		this.current = type;
		this.children = [];

		if (undefined === type) {
			return;
		}

		this.nodes[type].forEach((node) => this.addChildren(node));
	}
}