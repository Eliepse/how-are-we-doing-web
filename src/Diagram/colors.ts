import { Color } from "../Engine2D/ValueObject/Color";
import { Opacity } from "../Engine2D/ValueObject/Opacity";

export const dimmedAlpha = new Opacity(.46);

export const colors = {
	primary: new Color(228, 3, 47), // #e3032e
	secondary: new Color(222, 127, 125), // #de7f7d
	background: new Color(20, 19, 51), // #141333
	dimmedWhite: Color.White.alpha(dimmedAlpha),
} as const;
