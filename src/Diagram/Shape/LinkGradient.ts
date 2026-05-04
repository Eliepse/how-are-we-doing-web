import { Gradient } from "../../SVGRenderer/Referencable/Gradient";
import { Color } from "../../Engine2D/ValueObject/Color";
import { colors } from "../colors";

export const linkGradient = new Gradient(
	"gradient-link",
	"linear",
	{
		0: Color.White.alpha(.6),
		50: colors.primary.alpha(.8),
	},
);