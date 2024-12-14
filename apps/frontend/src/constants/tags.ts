import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faSun} from "@fortawesome/free-solid-svg-icons/faSun";
import {faCloudSun} from "@fortawesome/free-solid-svg-icons/faCloudSun";
import {faCloud} from "@fortawesome/free-solid-svg-icons";
import {faSprayCanSparkles} from "@fortawesome/free-solid-svg-icons/faSprayCanSparkles";

export const TAGS: Record<string, { label: string; icon: IconDefinition }> = {
	light: {
		label: 'Lots of light',
		icon: faSun,
	},
	'half-shade': {
		label: 'Half shade',
		icon: faCloudSun,
	},
	'full-shade': {
		label: 'Full shade',
		icon: faCloud,
	},
	'spray-water': {
		label: 'Spray water',
		icon: faSprayCanSparkles,
	},
} as const;

export type PlantTag = keyof typeof TAGS;