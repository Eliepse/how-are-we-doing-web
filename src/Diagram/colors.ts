import { Color } from "../Engine2D/ValueObject/Color";
import { Opacity } from "../Engine2D/ValueObject/Opacity";
import { SVGStyle } from "../SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "../SVGRenderer/ValueObject/Stroke";

export const dimmedAlpha = new Opacity(0.46);

type Palette = {
	primary: Color;
	secondary: Color;
	background: Color;
	dimmedWhite: Color;
	upd: (key: "primary" | "secondary", color: Color) => void;
};

export const colors: Palette = {
	primary: new Color(228, 3, 47), // #e3032e
	secondary: new Color(222, 127, 125), // #de7f7d
	background: new Color(20, 19, 51), // #141333
	dimmedWhite: Color.White.alpha(dimmedAlpha),
	upd(key, color) {
		this[key] = color;
	},
};
