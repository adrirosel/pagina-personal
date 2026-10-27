import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { PERFIL } from "./perfil.mjs";
import { leerSite } from "./utilidades.mjs";

function bloquesRoot(css) {
  const bloques = [];
  const regex = /:root\s*\{([^{}]*)\}/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    bloques.push(match[1]);
  }
  return bloques;
}

function cssSinRoot(css) {
  return css.replace(/:root\s*\{[^{}]*\}/g, "");
}

describe("estilos CSS", () => {
  const css = leerSite("css/estilos.css");
  const roots = bloquesRoot(css);
  const fueraDeRoot = cssSinRoot(css);

  test(":root define cada variable de la paleta con su valor exacto", () => {
    assert.ok(roots.length > 0, "El CSS debe definir al menos un bloque :root");
    const rootPrincipal = roots[0];

    for (const [variable, valor] of Object.entries(PERFIL.paleta)) {
      const regex = new RegExp(
        `${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*${valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*;`,
        "i",
      );
      assert.ok(
        regex.test(rootPrincipal),
        `:root debe definir ${variable}: ${valor}`,
      );
    }
  });

  test("los valores de la paleta no aparecen fuera de :root", () => {
    for (const [variable, valor] of Object.entries(PERFIL.paleta)) {
      assert.ok(
        !fueraDeRoot.toLowerCase().includes(valor.toLowerCase()),
        `El valor ${valor} de ${variable} no debe aparecer fuera de :root`,
      );
    }
  });

  test("se usa var(--color-primario)", () => {
    assert.ok(
      /var\(\s*--color-primario\s*\)/.test(css),
      "El CSS debe usar var(--color-primario)",
    );
  });

  test("aparecen fuenteTitulos y fuenteTexto", () => {
    assert.ok(
      css.includes(PERFIL.fuenteTitulos),
      `El CSS debe incluir la tipografía de títulos "${PERFIL.fuenteTitulos}"`,
    );
    assert.ok(
      css.includes(PERFIL.fuenteTexto),
      `El CSS debe incluir la tipografía de texto "${PERFIL.fuenteTexto}"`,
    );
  });

  test("existe un @media con el punto de ruptura", () => {
    const punto = PERFIL.puntoRuptura;
    const regex = new RegExp(
      `@media\\s*\\([^)]*${punto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^)]*\\)`,
      "i",
    );
    assert.ok(
      regex.test(css),
      `El CSS debe incluir un @media con el punto de ruptura ${punto}`,
    );
  });

  test("modo oscuro con prefers-color-scheme: dark", () => {
    if (PERFIL.modoOscuro) {
      assert.ok(
        /prefers-color-scheme\s*:\s*dark/i.test(css),
        "El CSS debe incluir prefers-color-scheme: dark porque modoOscuro es true",
      );
    } else {
      assert.ok(
        !/prefers-color-scheme\s*:\s*dark/i.test(css),
        "El CSS no debe incluir prefers-color-scheme: dark porque modoOscuro es false",
      );
    }
  });
});
