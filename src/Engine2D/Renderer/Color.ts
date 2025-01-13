export class Color {
	static Black = new Color(0, 0, 0);
	static White = new Color(255, 255, 255);
	static Red = new Color(255, 0, 0);
	static Green = new Color(0, 255, 0);
	static Blue = new Color(0, 0, 255);

	public readonly r: number;
	public readonly g: number;
	public readonly b: number;
	public readonly a: number;

	constructor(red: number, green: number, blue: number, alpha: number = 1) {
		this.r = Math.min(255, Math.max(0, red));
		this.g = Math.min(255, Math.max(0, green));
		this.b = Math.min(255, Math.max(0, blue));
		this.a = Math.min(1, Math.max(0, alpha));
	}

	alpha(value: number): Color {
		return new Color(this.r, this.g, this.b, value);
	}

	toCSS(): string {
		if (this.a < 1) {
			return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
		}

		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	toHex(): string {
		const r = this.r.toString(16).padStart(2, "0");
		const g = this.g.toString(16).padStart(2, "0");
		const b = this.b.toString(16).padStart(2, "0");
		return "#" + [r, g, b].join("");
	}

	toHexAlpha(): string {
		const r = this.r.toString(16).padStart(2, "0");
		const g = this.g.toString(16).padStart(2, "0");
		const b = this.b.toString(16).padStart(2, "0");
		const a = Math.round(this.a * 255)
			.toString(16)
			.padStart(2, "0");
		return "#" + [r, g, b, a].join("");
	}
}
