import { WebGLRenderer } from "three";

const createShader = (
  three: WebGLRenderer,
  src: string,
  type: number
): WebGLShader => {
  const gl = three.getContext();

  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Cannot compile");
  }
  return shader;
};

export const verifyShader = (
  three: WebGLRenderer,
  vertexShader: string,
  fragmentShader: string
): void => {
  const gl = three.getContext();

  const program = gl.createProgram()!;

  const vertex =
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
    ` + vertexShader;

  const fragment =
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
    ` + fragmentShader;

  const vs = createShader(three, vertex, gl.VERTEX_SHADER);
  const fs = createShader(three, fragment, gl.FRAGMENT_SHADER);

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Cannot link");
  }

  gl.deleteProgram(program);
};
