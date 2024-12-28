import {useState} from "react";

export function PaperDistort(props: {
	filterId: string;
}) {
	const [seed] = useState(Math.ceil(Math.random() * 1000))
	return (
		<svg className={'w-0 h-0 fixed'} width="200" height="200" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id={props.filterId} x="0" y="0" width="200%" height="200%">
					<feTurbulence seed={seed} type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="turbulence"/>

					<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilated"/>
					<feMorphology in="SourceAlpha" operator="erode" radius="5" result="eroded"/>
					<feComposite in="dilated" in2="eroded" operator="xor" result="edge-mask"/>

					<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="20" xChannelSelector="R" yChannelSelector="G"
														 result="displaced"/>

					<feComposite in="displaced" in2="edge-mask" operator="in" result="edges-only"/>
					<feComposite in="SourceGraphic" in2="edges-only" operator="over"/>
				</filter>
			</defs>
		</svg>
	)
}