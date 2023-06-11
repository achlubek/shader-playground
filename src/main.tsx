import * as React from "react";
import * as ReactDOM from "react-dom/client";

import App from "@app/components/App";
import { globalStyle as GStyle } from "@app/styles/globalStyle";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GStyle />
    <App />
  </React.StrictMode>
);
