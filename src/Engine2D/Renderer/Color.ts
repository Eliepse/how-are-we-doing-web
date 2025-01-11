export class Color {
	static Black = new Color(0, 0, 0);
	static White = new Color(255, 255, 255);
	static Red = new Color(255, 0, 0);
	static Green = new Color(0, 255, 0);
	static Blue = new Color(0, 0, 255);

	private _red: number;
	private _green: number;
	private _blue: number;
	private _alpha: number;

	constructor(red: number, green: number, blue: number, alpha: number = 1) {
		this._red = Math.min(255, Math.max(0, red));
		this._green = Math.min(255, Math.max(0, green));
		this._blue = Math.min(255, Math.max(0, blue));
		this._alpha = Math.min(1, Math.max(0, alpha));
	}

	r(): number {
		return this._red;
	}

	g(): number {
		return this._green;
	}

	b(): number {
		return this._blue;
	}

	alpha(): number {
		return this._alpha;
	}

	toCSS(): string {
		if (this._alpha < 1) {
			return `rgba(${this.r()}, ${this.g()}, ${this.b()}, ${this.alpha()})`;
		}

		return `rgba(${this.r()}, ${this.g()}, ${this.b()}, ${this.alpha()})`;
	}

	toHex(): string {
		const r = this.r().toString(16).padStart(2, "0");
		const g = this.g().toString(16).padStart(2, "0");
		const b = this.b().toString(16).padStart(2, "0");
		return "#" + [r, g, b].join("");
	}

	toHexAlpha(): string {
		const r = this.r().toString(16).padStart(2, "0");
		const g = this.g().toString(16).padStart(2, "0");
		const b = this.b().toString(16).padStart(2, "0");
		const a = (this.alpha() * 255).toString(16).padStart(2, "0");
		return "#" + [r, g, b, a].join("");
	}
}
