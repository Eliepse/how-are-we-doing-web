import { Vector } from "../ValueObject/Vector";

type MouseButton = {
	down: boolean;
	up: boolean;
	pressed: boolean;
	drag: { from: Vector, to: Vector, isDragging: boolean; };
}

type Pointer = {
	screenPosition: Vector;
	primary: MouseButton;
	secondary: MouseButton;
}

const DEFAULT_BTN = {
	down: false,
	up: false,
	pressed: false,
	drag: { from: Vector.Zero, to: Vector.Zero, isDragging: false },
} satisfies MouseButton;

export class Input {
	private static _instance?: Input;

	private pointer: Pointer = {
		screenPosition: Vector.Zero,
		primary: { ...DEFAULT_BTN },
		secondary: { ...DEFAULT_BTN },
	};

	private constructor() {
		document.addEventListener("mousemove", (e) => {
			const position = new Vector(e.clientX, e.clientY);
			this.pointer.screenPosition = position;

			if (this.pointer.primary.pressed) {
				this.pointer.primary.drag.to = position;
				this.pointer.primary.drag.isDragging = true;
			}

			if (this.pointer.secondary.pressed) {
				this.pointer.secondary.drag.to = position;
				this.pointer.secondary.drag.isDragging = true;
			}
		});

		document.addEventListener("mousedown", (e) => {
			const position = new Vector(e.clientX, e.clientY);
			this.pointer.screenPosition = position;
			const patch = {
				down: true,
				up: false,
				pressed: true,
				drag: { from: position, to: position, isDragging: false },
			};

			if (0 === e.button) {
				this.pointer.primary = { ...this.pointer.primary, ...patch };
			}

			if (2 === e.button) {
				this.pointer.secondary = { ...this.pointer.secondary, ...patch };
			}
		});

		document.addEventListener("mouseup", (e) => {
			const position = new Vector(e.clientX, e.clientY);
			this.pointer.screenPosition = position;
			const patch = { down: false, up: true, pressed: false };

			if (0 === e.button) {
				this.pointer.primary = {
					...this.pointer.primary,
					...patch,
					drag: { ...this.pointer.primary.drag, to: position, isDragging: false },
				};
			}

			if (2 === e.button) {
				this.pointer.secondary = {
					...this.pointer.secondary,
					...patch,
					drag: { ...this.pointer.secondary.drag, to: position, isDragging: false },
				};
			}
		});
	}

	private processTicked() {
		this.pointer.primary.down = false;
		this.pointer.primary.up = false;
		this.pointer.secondary.down = false;
		this.pointer.secondary.up = false;
	}

	private static get instance() {
		return Input._instance ??= new Input();
	}

	static ticked() {
		Input.instance.processTicked();
	}

	static get pointer() {
		return Input.instance.pointer;
	}
}