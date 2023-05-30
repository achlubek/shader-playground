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

import React, { useEffect, useState } from "react";

import styled from "styled-components";
import * as THREE from "three";

import { Renderer } from "@app/Renderer";
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

export default function App({
  renderer,
}: {
  renderer: Renderer;
}): React.ReactElement {
  const vertexShader = `
    varying vec2 iuv;

    void main() {
        iuv = uv;
        gl_Position = vec4(position, 1.0);
    }
  `;

  const initFragmentShader = `varying vec2 iuv;
uniform float time;
uniform vec2 resolution;

void main() {
    vec4 C = vec4(iuv.x, iuv.y, sin(time), 1.0);
    if(iuv.x < 0.1){
      C = vec4(0.0, 0.0, 1.0, 1.0);
    }
    if(iuv.y < 0.1){
      C = vec4(0.0, 0.0, 1.0, 1.0);
    }
    if(iuv.x > 0.9){
      C = vec4(0.0, 0.0, 1.0, 1.0);
    }
    if(iuv.y > 0.9){
      C = vec4(0.0, 0.0, 1.0, 1.0);
    }
    gl_FragColor = C;
}
  `;

  const [fragmentShader, setFragmentShader] = useState(initFragmentShader);
  const [fragmentShaderTemp, setFragmentShaderTemp] =
    useState(initFragmentShader);
  const [errors, setErrors] = useState("");
  const [showEditors, setShowEditors] = useState(true);

  useEffect(() => {
    renderer.switchScene("quad");
    const resolution = renderer.getResolution();

    try {
      renderer.verifyShaderProgram(vertexShader, fragmentShader);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: renderer.getElapsedTime() },
          resolution: {
            value: new THREE.Vector2(resolution[0], resolution[1]),
          },
          mouse: { value: new THREE.Vector2(0, 0) },
          drag: { value: new THREE.Vector2(0, 0) },
          zoom: { value: 1.0 },
        },
        vertexShader,
        fragmentShader: fragmentShader,
        depthWrite: false,
        depthTest: false,
      });

      const oldQuad = renderer.scene.getObjectByName("quad");
      if (oldQuad) {
        renderer.scene.remove(oldQuad);
      }

      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      renderer.scene.add(quad);
      renderer.compile();

      let mousePos = { x: 0.0, y: 0.0 };
      const mouseDrag = { x: 0.0, y: 0.0 };
      let zoom = 1;
      window.addEventListener("wheel", (event) => {
        zoom -= event.deltaY * 0.001;
      });

      window.addEventListener("mousemove", (event) => {
        const newPos = { x: event.clientX, y: event.clientY };
        const deltaPos = { x: newPos.x - mousePos.x, y: newPos.y - mousePos.y };
        if (event.buttons === 1) {
          mouseDrag.x += deltaPos.x;
          mouseDrag.y += deltaPos.y;
        }
        mousePos = newPos;
      });
      renderer.scene.onDraw = () => {
        mat.uniforms.time.value = renderer.getElapsedTime();
        mat.uniforms.zoom.value = zoom;
        mat.uniforms.resolution.value = new THREE.Vector2(
          resolution[0],
          resolution[1]
        );
        mat.uniforms.mouse.value = new THREE.Vector2(
          mousePos.x / resolution[0],
          mousePos.y / resolution[1]
        );
        mat.uniforms.drag.value = new THREE.Vector2(
          mouseDrag.x / resolution[0],
          mouseDrag.y / resolution[1]
        );
      };
      setErrors("");
    } catch (e) {
      setErrors((e as Error).message);
    }
    return () => {
      renderer.scene.onDraw = undefined;
    };
  }, [fragmentShader]);

  return (
    <>
      <div
        style={{ display: "flex", gap: baseGrid(2), marginBottom: baseGrid(2) }}
      >
        <Button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            setShowEditors((prev) => !prev);
          }}
        >
          Toggle Editors
        </Button>

        {showEditors && (
          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setFragmentShader(fragmentShaderTemp);
            }}
          >
            Compile
          </Button>
        )}
      </div>
      {showEditors && (
        <div style={{ display: "flex", gap: baseGrid(2) }}>
          <CodeMirror
            value={fragmentShaderTemp}
            height="90vh"
            width="30vw"
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
              width="30vw"
              style={{ opacity: 0.9 }}
              theme={githubDark}
              extensions={[cpp()]}
            />
          )}
        </div>
      )}
    </>
  );
}

const Button = styled.button`
  border-radius: ${standardBorderRadiusSmall};
  border: 2px solid ${consts.colors.mainLead};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background-color: transparent;

  height: ${baseGrid(11)};

  padding: 0 ${baseGrid(5)};

  cursor: pointer;

  &:hover {
    border-color: ${consts.colors.lightLead};
  }
`;
