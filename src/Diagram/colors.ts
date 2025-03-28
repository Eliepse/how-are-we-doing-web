import { Color } from "../Engine2D/ValueObject/Color";

export const colors = {
	defaultWhite: Color.White,
	dimmedWhite: Color.White.alpha(0.46),
	selected: new Color(251, 35, 35),
} as const;
