import { createGlobalStyle } from "styled-components";

import { consts } from "@app/styles/consts";

export const globalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: ${consts.colors.darkLead};
    font-family: Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    color: ${consts.colors.white};
  }
  a {
     text-decoration: none;
  }
  input {
    all: unset;
  }
  button {
    all: unset;
  }
`;
