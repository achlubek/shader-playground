import {
  LRLanguage,
  LanguageSupport,
  continuedIndent,
  delimitedIndent,
  flatIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
} from "@codemirror/language";
import { parser } from "@lezer/cpp";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";

import React, { useEffect, useMemo, useState } from "react";
import {
  useBackBufferHelper,
  useCanvas,
  useFullScreenShaderPassHelper,
  useRender,
  useRenderLoop,
  useTextureOutputHelper,
  useThreeRenderer,
  verifyShader,
} from "react-three-hook";

import styled from "styled-components";
import * as THREE from "three";
import { Clock, Vector2 } from "three";

import {
  baseGrid,
  consts,
  standardBorderRadiusSmall,
} from "@app/styles/consts";

export const cppLanguage = LRLanguage.define({
  name: "cpp",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
        TryStatement: continuedIndent({ except: /^\s*({|catch)\b/ }),
        LabeledStatement: flatIndent,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CaseStatement: (context) => context.baseIndent + context.unit,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        BlockComment: () => null,
        CompoundStatement: delimitedIndent({ closing: "}" }),
        Statement: continuedIndent({ except: /^{/ }),
      }),
      foldNodeProp.add({
        "DeclarationList CompoundStatement EnumeratorList FieldDeclarationList InitializerList":
          foldInside,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        },
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\})$/,
    closeBrackets: {
      stringPrefixes: ["L", "u", "U", "u8", "LR", "UR", "uR", "u8R", "R"],
    },
  },
});

/// Language support for C++.
export function cpp(): LanguageSupport {
  return new LanguageSupport(cppLanguage);
}

export default function App(): React.ReactElement {
  const vertexShader = `
    varying vec2 UV;

    void main() {
        UV = uv;
        gl_Position = vec4(position, 1.0);
    }
  `;

  const initFragmentShader = `varying vec2 UV;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform sampler2D bb;

void main() {
  vec4 C = vec4(UV.x, sin(UV.y * 100.0 + time * 10.0), sin(time), 1.0);
  C.rgb += 1.0 - step(0.02, distance(UV, mouse));
  gl_FragColor = vec4(mix(C.rgb, texture(bb, UV).rgb, 0.8), 1.0);
}
  `;

  const clock = useMemo(() => new Clock(), []);

  const renderer = useThreeRenderer();

  const render = useRender({
    renderer,
  });

  const tmpRendererSize = renderer.getSize(new Vector2());

  const backRenderer = useBackBufferHelper({
    renderer,
    width: tmpRendererSize.x,
    height: tmpRendererSize.y,
  });

  const uniforms = useMemo(
    () => ({
      time: { value: clock.getElapsedTime() },
      resolution: {
        value: tmpRendererSize,
      },
      mouse: { value: new THREE.Vector2(0, 0) },
      drag: { value: new THREE.Vector2(0, 0) },
      zoom: { value: 1.0 },
      ratio: { value: 1.0 },
      bb: { value: backRenderer.getBackBuffer().texture },
    }),
    []
  );

  const [fragmentShader, setFragmentShader] = useState(initFragmentShader);
  const [fragmentShaderTemp, setFragmentShaderTemp] =
    useState(initFragmentShader);

  const stage = useFullScreenShaderPassHelper({
    uniforms,
    fragmentShader,
  });

  const output = useTextureOutputHelper({
    render,
    texture: backRenderer.getBackBuffer().texture,
  });

  const canvas = useCanvas({
    renderer,
    elementProps: {
      onWheel: (e) => {
        uniforms.zoom.value -= e.deltaY * 0.001;
      },
      style: {
        position: "absolute",
        inset: 0,
        zIndex: -2,
      },
    },
  });

  useRenderLoop(() => {
    canvas.update();
    uniforms.time.value = clock.getElapsedTime();
    const canvasSize = renderer.getSize(new Vector2());
    uniforms.resolution.value = new Vector2(canvasSize.x, canvasSize.y);
    uniforms.ratio.value = canvasSize.x / canvasSize.y;
    uniforms.bb.value = backRenderer.getBackBuffer().texture;
    stage.setUniforms(uniforms);

    render({
      target: backRenderer.getTarget(),
      scene: stage.scene,
      camera: stage.camera,
    });
    backRenderer.toggleState();

    render({
      target: null,
      scene: output.scene,
      camera: output.camera,
    });
  });

  const [errors, setErrors] = useState("");
  const [showEditors, setShowEditors] = useState(true);

  useEffect(() => {
    try {
      verifyShader(renderer, vertexShader, fragmentShader);
      setErrors("");
    } catch (e) {
      setErrors((e as Error).message);
    }
  }, [fragmentShader]);

  const saveAs = (): void => {
    const element = document.createElement("a");
    const file = new Blob([fragmentShader], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `fragment-${new Date().toISOString()}.glsl`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div
      style={{ position: "relative", height: "100vh" }}
      onMouseMove={(e) => {
        const rdrSize = renderer.getSize(new Vector2());
        const newPos = new Vector2(e.clientX, e.clientY).divide(rdrSize);
        newPos.y = 1.0 - newPos.y;
        const deltaPos = {
          x: newPos.x - uniforms.mouse.value.x,
          y: newPos.y - uniforms.mouse.value.y,
        };
        if (e.buttons === 1) {
          uniforms.drag.value.x += deltaPos.x;
          uniforms.drag.value.y += deltaPos.y;
        }
        uniforms.mouse.value = newPos;
        console.log(uniforms.mouse.value);
      }}
    >
      {canvas.element}
      <div style={{ display: "flex", gap: baseGrid(2), margin: baseGrid(2) }}>
        <Button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            setShowEditors((prev) => !prev);
          }}
        >
          Toggle Editors
        </Button>

        {showEditors && (
          <>
            <Button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setFragmentShader(fragmentShaderTemp);
              }}
            >
              Compile
            </Button>
            <Button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                saveAs();
              }}
            >
              Save As
            </Button>
          </>
        )}
      </div>
      {showEditors && (
        <div style={{ display: "flex", gap: baseGrid(2) }}>
          <CodeMirror
            value={fragmentShaderTemp}
            height="90vh"
            width="30vw"
            indentWithTab={false}
            style={{ opacity: 0.9 }}
            theme={githubDark}
            extensions={[cpp()]}
            onChange={(v) => {
              setFragmentShaderTemp(v);
            }}
          />
          {errors.length > 0 && (
            <CodeMirror
              value={errors}
              height="90vh"
              readOnly={true}
              indentWithTab={false}
              width="30vw"
              style={{ opacity: 0.9 }}
              theme={githubDark}
              extensions={[cpp()]}
            />
          )}
        </div>
      )}
    </div>
  );
}

const Button = styled.button`
  border-radius: ${standardBorderRadiusSmall};
  border: 1px solid ${consts.colors.mainLead};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.3);

  height: ${baseGrid(11)};

  padding: 0 ${baseGrid(5)};

  cursor: pointer;

  &:hover {
    border-color: ${consts.colors.lightLead};
  }
`;
