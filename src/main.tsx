import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { Renderer } from "@app/Renderer";
import App from "@app/components/App";
import { globalStyle as GStyle } from "@app/styles/globalStyle";

const renderer = new Renderer();
renderer.enable();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GStyle />
    <App renderer={renderer} />
  </React.StrictMode>
);
