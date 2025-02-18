import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import {
	Camera,
	Color,
	DataTexture,
	Mesh,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	Shape,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { Vector } from "../../Engine2D/ValueObject/Vector";
// @ts-ignore
import { Noise } from "noisejs";

export class PathologyBlob extends SVGShape {
	private readonly canvas: HTMLCanvasElement;
	private readonly dom: SVGForeignObjectElement;

	private readonly canvasRenderer: WebGLRenderer;
	private readonly scene: Scene;
	private readonly camera: Camera;
	private readonly mesh: Mesh;
	private readonly noise: Noise;
	private readonly material: ShaderMaterial;

	constructor(private readonly radius: number) {
		super();

		this.noise = new Noise(Math.random() * 6688);

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
		this.dom.setAttribute("width", (this.radius * 2).toFixed());
		this.dom.setAttribute("height", (this.radius * 2).toFixed());

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(75, 1);
		this.camera.position.z = 200;

		this.canvasRenderer = new WebGLRenderer();
		this.canvasRenderer.setSize(this.radius * 2, this.radius * 2);
		this.canvasRenderer.setClearAlpha(0);
		this.canvas = this.canvasRenderer.domElement;

		this.material = new ShaderMaterial({
			transparent: true,
			uniforms: {
				color: { value: new Color(0.95, 0.59, 0.61) }, // Couleur du bord (rouge ici)
				rimAlpha: { value: 0.8 },
				rimOuterFactor: { value: 5.0 },
				rimBaseFactor: { value: 2.0 },
				noiseFactor: { value: 1.8 },
				noiseAlpha: { value: 0.7 },

				lightIntensity: { value: 1.0 }, // Intensity de l'effet
				time: { value: Math.random() * 10 },
				noiseStrength: { value: 10 },
				noiseSpeed: { value: 0.12 },
			},
			// language=Glsl
			vertexShader: `
                uniform float time; // Pour animer la déformation
                uniform float noiseStrength;
                uniform float noiseSpeed;

                varying vec3 vNormal;
                varying vec3 vViewPosition;

                // Fonction de bruit de Perlin simplifié pour le shader
                float random(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                float perlin(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vViewPosition = (cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);

                    float noise = perlin(position.xy * 0.02 + (time * noiseSpeed)); // Moduler avec le temps pour animer
                    vec3 newPosition = position + normal * noise * noiseStrength;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
			`,
			// language=Glsl
			fragmentShader: `
                uniform float time; // Pour animer la déformation
                uniform vec3 color;
                uniform float noiseSpeed;
                uniform float rimAlpha;
                uniform float rimOuterFactor;
                uniform float rimBaseFactor;
                uniform float noiseFactor;
                uniform float noiseAlpha;

                varying vec3 vNormal;
                varying vec3 vViewPosition;

                // Fonction de bruit de Perlin simplifié pour le shader
                float random(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                float perlin(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }

                void main() {
                    // Appliquer le bruit de Perlin pour déformer la couleur
                    float noise = perlin(vViewPosition.xy * 0.02 + (time * noiseSpeed));

                    float rim = 1.0 - dot(normalize(vNormal), normalize(vViewPosition));

                    float alpha = pow(rim, rimBaseFactor) * rimAlpha; // Base rim
                    alpha = (pow(rim, rimOuterFactor) * rimAlpha); // Outer rim (increase edge contrast)
                    alpha += pow(noise, noiseFactor) * noiseAlpha;
                    alpha = clamp(alpha, 0.0, 1.0) * .7; // Global alpha factor

                    gl_FragColor = vec4(color, max(0.01, alpha));
                }
			`,
		});

		this.scene.add(this.mesh = this.makeShape());

		this.dom.append(this.canvas);

	}

	private updateTexture(): DataTexture {
		const size = this.radius * 2;
		const area = Math.pow(size, 2);
		const data = new Uint8Array(area);

		const texture = new DataTexture(data, size, size);
		texture.needsUpdate = true;
		return texture;
	}

	private makeShape(): Mesh {
		const radius = this.radius / 2;
		const center = new Vector(this.radius, this.radius);
		const steps = 24;
		const step = (Math.PI * 2) / steps;

		const shape = new Shape();
		shape.moveTo(radius, 0);

		for (let i = 1; i < steps; i++) {
			const a = i * step;
			const p = new Vector(Math.cos(a) * radius, Math.sin(a) * radius);
			shape.lineTo(p.x, p.y);
		}

		const mesh = new Mesh(new SphereGeometry(this.radius / 2), this.material);
		mesh.rotation.x = Math.PI;
		return mesh;
	}

	updateMesh(time: number, position: Vector): void {
		if (undefined !== this.material.uniforms.time) {
			this.material.uniforms.time.value += 0.05;
		}

		this.material.needsUpdate = true;

		this.canvasRenderer.render(this.scene, this.camera);
		const aPos = position.sub(new Vector(this.radius, this.radius)).toAttributes();

		this.dom.style.transform = `translate(${aPos.x}px, ${aPos.y}px)`;
	}

	override mount(container: Element): void {
		container.prepend(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}