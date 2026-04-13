import { Color } from "../Engine2D/ValueObject/Color";
import { Opacity } from "../Engine2D/ValueObject/Opacity";

export const dimmedAlpha = new Opacity(.46);

export const colors = {
	defaultWhite: Color.White,
	dimmedWhite: Color.White.alpha(dimmedAlpha),
	selected: Color.Red,
	// secondary: new Color(237, 164, 198),
	secondary: Color.White,
} as const;
