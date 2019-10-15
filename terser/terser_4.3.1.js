const path = require("path");
const fs = require("fs");
const Terser = require("terser");

const srcDir = "./public/asset/js";
const distDir = "./public/asset/js";
const srcJsPath = path.resolve(srcDir, "src.js");
const distJsPath = path.resolve(distDir, "dist.js");

fs.writeFileSync(distJsPath, Terser.minify({
    srcJsPath: fs.readFileSync(srcJsPath, "utf8")
}).code, "utf8");
