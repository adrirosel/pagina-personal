import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { RAIZ, SITE } from "./utilidades.mjs";

describe("estructura del proyecto", () => {
  const ficherosSite = [
    "index.html",
    "proyectos.html",
    "css/estilos.css",
    "js/main.js",
    "img/avatar.svg",
  ];

  for (const fichero of ficherosSite) {
    test(`existe site/${fichero}`, () => {
      assert.ok(
        existsSync(join(SITE, fichero)),
        `Falta el fichero site/${fichero}`,
      );
    });
  }

  test("existe .github/workflows/pages.yml", () => {
    assert.ok(
      existsSync(join(RAIZ, ".github", "workflows", "pages.yml")),
      "Falta el fichero .github/workflows/pages.yml",
    );
  });

  test(".gitignore contiene node_modules", () => {
    const gitignore = readFileSync(join(RAIZ, ".gitignore"), "utf8");
    assert.ok(
      gitignore.includes("node_modules"),
      "El fichero .gitignore debe contener node_modules",
    );
  });
});
