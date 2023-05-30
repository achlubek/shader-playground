import * as THREE from "three";
import { Material, Mesh } from "three";

export class SceneWithCallback extends THREE.Scene {
  public onDraw?: ((time: number) => void) | undefined;
}

export class Renderer {
  private readonly threeRenderer: THREE.WebGLRenderer;
  private setInnerWidth: number;
  private setInnerHeight: number;

  public scene!: SceneWithCallback;
  public camera!: THREE.Camera;
  private enabled: boolean;
  private clock = new THREE.Clock();

  public constructor() {
    this.enabled = false;
    this.switchScene("empty");

    const canvas = document.getElementById("mainCanvas")!;
    this.threeRenderer = new THREE.WebGLRenderer({
      canvas,
      depth: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: false,
      stencil: false,
    });
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    this.threeRenderer.toneMapping = THREE.NoToneMapping;
    this.threeRenderer.outputColorSpace = "srgb";

    this.recreateCamera();

    this.setInnerWidth = window.innerWidth;
    this.setInnerHeight = window.innerHeight;
  }

  public getElapsedTime(): number {
    return this.clock.getElapsedTime();
  }

  public switchScene(name: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.scene || this.scene.name !== name) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.scene) {
        this.scene.children.forEach((c) => {
          if (c instanceof Mesh) {
            (c as Mesh).geometry.dispose();
            if (Array.isArray((c as Mesh).material)) {
              const m = (c as Mesh).material;
              const tm = m as Material[];
              tm.forEach((m) => m.dispose());
            } else {
              ((c as Mesh).material as Material).dispose();
            }
          }
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.threeRenderer) {
        this.threeRenderer.renderLists.dispose();
      }
      this.scene = new SceneWithCallback();
      this.scene.name = name;
      this.recreateCamera();
    }
  }

  public getResolution(): [number, number] {
    return [window.innerWidth, window.innerHeight];
  }

  public compile(): void {
    this.threeRenderer.compile(this.scene, this.camera);
  }

  private createShader(src: string, type: number): WebGLShader {
    const gl = this.threeRenderer.getContext();

    const shader = gl.createShader(type)!;

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "Cannot compile");
    }
    return shader;
  }

  public verifyShaderProgram(vertex: string, fragment: string): void {
    const gl = this.threeRenderer.getContext();

    const program = gl.createProgram()!;

    vertex =
      `#version 300 es
    precision mediump sampler2DArray;
    #define attribute in
    #define varying out
    #define texture2D texture
    precision highp float;
    precision highp int;
    #define HIGH_PRECISION
    #define SHADER_NAME ShaderMaterial
    #define USE_LOGDEPTHBUF
    #define USE_LOGDEPTHBUF_EXT
    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat3 normalMatrix;
    uniform vec3 cameraPosition;
    uniform bool isOrthographic;
    #ifdef USE_INSTANCING
        attribute mat4 instanceMatrix;
    #endif
    #ifdef USE_INSTANCING_COLOR
        attribute vec3 instanceColor;
    #endif
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    #ifdef USE_UV1
        attribute vec2 uv1;
    #endif
    #ifdef USE_UV2
        attribute vec2 uv2;
    #endif
    #ifdef USE_UV3
        attribute vec2 uv3;
    #endif
    #ifdef USE_TANGENT
        attribute vec4 tangent;
    #endif
    #if defined( USE_COLOR_ALPHA )
        attribute vec4 color;
    #elif defined( USE_COLOR )
        attribute vec3 color;
    #endif
    #if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )
        attribute vec3 morphTarget0;
        attribute vec3 morphTarget1;
        attribute vec3 morphTarget2;
        attribute vec3 morphTarget3;
        #ifdef USE_MORPHNORMALS
            attribute vec3 morphNormal0;
            attribute vec3 morphNormal1;
            attribute vec3 morphNormal2;
            attribute vec3 morphNormal3;
        #else
            attribute vec3 morphTarget4;
            attribute vec3 morphTarget5;
            attribute vec3 morphTarget6;
            attribute vec3 morphTarget7;
        #endif
    #endif
    #ifdef USE_SKINNING
        attribute vec4 skinIndex;
        attribute vec4 skinWeight;
    #endif
    #line 1
    ` + vertex;

    fragment =
      `#version 300 es
    #define varying in
    layout(location = 0) out highp vec4 pc_fragColor;
    #define gl_FragColor pc_fragColor
    #define gl_FragDepthEXT gl_FragDepth
    #define texture2D texture
    #define textureCube texture
    #define texture2DProj textureProj
    #define texture2DLodEXT textureLod
    #define texture2DProjLodEXT textureProjLod
    #define textureCubeLodEXT textureLod
    #define texture2DGradEXT textureGrad
    #define texture2DProjGradEXT textureProjGrad
    #define textureCubeGradEXT textureGrad
    precision highp float;
    precision highp int;
    #define HIGH_PRECISION
    #define SHADER_NAME ShaderMaterial
    #define LEGACY_LIGHTS
    #define USE_LOGDEPTHBUF
    #define USE_LOGDEPTHBUF_EXT
    uniform mat4 viewMatrix;
    uniform vec3 cameraPosition;
    uniform bool isOrthographic;
    #define OPAQUE
    vec4 LinearToLinear( in vec4 value ) {
        return value;
    }
    vec4 LinearTosRGB( in vec4 value ) {
         return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
    }
    vec4 linearToOutputTexel( vec4 value ) { return LinearTosRGB( value ); }
    #line 1
    ` + fragment;

    const vs = this.createShader(vertex, gl.VERTEX_SHADER);
    const fs = this.createShader(fragment, gl.FRAGMENT_SHADER);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Cannot link");
    }

    gl.deleteProgram(program);
  }

  private renderLoop(time: number): void {
    if (
      this.setInnerWidth !== window.innerWidth ||
      this.setInnerHeight !== window.innerHeight
    ) {
      this.onResize();
    }
    this.threeRenderer.render(this.scene, this.camera);
    if (this.scene.onDraw) {
      this.scene.onDraw(time);
    }
    if (this.enabled) {
      requestAnimationFrame((newTime) => this.renderLoop(newTime));
    }
  }

  private recreateCamera(): void {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10.0);
  }

  private onResize(): void {
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    this.setInnerWidth = window.innerWidth;
    this.setInnerHeight = window.innerHeight;
    this.recreateCamera();
  }

  public enable(): void {
    this.enabled = true;
    requestAnimationFrame((time) => this.renderLoop(time));
  }

  public disable(): void {
    this.enabled = false;
  }
}
