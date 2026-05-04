import { Gradient } from "../../SVGRenderer/Referencable/Gradient";
import { Color } from "../../Engine2D/ValueObject/Color";
import { colors } from "../colors";

export const linkGradient = new Gradient(
	"gradient-link",
	{
		60: colors.primary,
		70: colors.secondary,
	},
	{ type: "radial", gradientUnits: "userSpaceOnUse" },
);