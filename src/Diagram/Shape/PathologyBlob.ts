import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import { Camera, Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, SphereGeometry, WebGLRenderer } from "three";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import type { Opacity } from "../../Engine2D/ValueObject/Opacity";

// Slightly darker and saturated than the original color
const blobColor = new Color().setHSL(357, 0.78, 0.75);

export class PathologyBlob extends SVGShape {
	private readonly canvas: HTMLCanvasElement;
	private readonly dom: SVGForeignObjectElement;

	private readonly canvasRenderer: WebGLRenderer;
	private readonly scene: Scene;
	private readonly camera: Camera;
	private readonly material: ShaderMaterial;

	constructor(private readonly radius: number) {
		super(0);

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
		this.dom.setAttribute("width", (this.radius * 2).toFixed());
		this.dom.setAttribute("height", (this.radius * 2).toFixed());

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(75, 1);
		this.camera.position.z = this.radius * 2;

		this.canvasRenderer = new WebGLRenderer({ antialias: false });
		// this.canvasRenderer.setPixelRatio( window.devicePixelRatio * 1.5 );
		this.canvasRenderer.setSize(Math.ceil(this.radius * 2), Math.ceil(this.radius * 2));
		this.canvasRenderer.setClearAlpha(0);
		this.canvas = this.canvasRenderer.domElement;

		this.material = new ShaderMaterial({
			transparent: true,
			uniforms: {
				color: { value: blobColor },
				rimAlpha: { value: 0.9 },
				rimOuterFactor: { value: 5.0 },
				rimBaseFactor: { value: 2.0 },
				noiseFactor: { value: 1.8 },
				noiseAlpha: { value: 0.5 },
				time: { value: Math.random() * 5000 },
				noiseStrength: { value: 20 },
				noiseSpeed: { value: 0.24 },
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

		this.scene.add(this.makeShape());

		this.dom.append(this.canvas);

	}

	private makeShape(): Mesh {
		const mesh = new Mesh(new SphereGeometry(this.radius, 40, 16), this.material);
		mesh.rotation.x = Math.PI;
		return mesh;
	}

	updateMesh(_time: number, position: Vector): void {
		if (undefined !== this.material.uniforms.time) {
			this.material.uniforms.time.value += 0.05;
		}

		this.material.needsUpdate = true;

		this.canvasRenderer.render(this.scene, this.camera);
		const aPos = position.sub(new Vector(this.radius, this.radius)).toAttributes();

		this.dom.style.transform = `translate(${aPos.x}px, ${aPos.y}px)`;
	}

	updateOpacity(value: Opacity) {
		this.dom.style.opacity = value.ratio.toFixed(2);
	}

	override mount(container: Element): void {
		container.prepend(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}