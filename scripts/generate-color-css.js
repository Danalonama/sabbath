const fs = require("fs");
const colors = require("../styles/colors.ts");

const cssContent = `
:root {
  ${Object.keys(colors)
    .map((colorName) => `--color-${colorName}: ${colors[colorName]};`)
    .join("\n")}
}
`;

fs.writeFileSync("styles/colors.css", cssContent, "utf-8");
console.log("Generated colors.css");
