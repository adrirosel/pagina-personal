import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const RAIZ = join(__dirname, "..");
export const SITE = join(RAIZ, "site");

/** Lee un fichero relativo a la raíz del proyecto. */
export function leerFichero(rutaRelativa) {
  return readFileSync(join(RAIZ, rutaRelativa), "utf8");
}

/** Lee un fichero dentro de site/. */
export function leerSite(rutaRelativa) {
  return readFileSync(join(SITE, rutaRelativa), "utf8");
}

/** Extrae el valor de un atributo en la primera etiqueta que coincida. */
export function extraerAtributo(html, etiqueta, atributo) {
  const regex = new RegExp(
    `<${etiqueta}\\b[^>]*\\s${atributo}\\s*=\\s*["']([^"']*)["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

/** Extrae todos los valores de un atributo en etiquetas concretas. */
export function extraerAtributos(html, etiqueta, atributo) {
  const regex = new RegExp(
    `<${etiqueta}\\b[^>]*\\s${atributo}\\s*=\\s*["']([^"']*)["'][^>]*>`,
    "gi",
  );
  const valores = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    valores.push(match[1]);
  }
  return valores;
}

/** Indica si un href/src es un enlace externo o especial. */
export function esEnlaceExternoOEspecial(url) {
  return /^(https?:|mailto:|tel:|data:|#)/i.test(url);
}

/**
 * Comprueba si el destino de un enlace relativo existe bajo site/,
 * resolviendo desde la página actual e ignorando anclas.
 */
export function existeDestinoRelativo(paginaRelativa, href) {
  if (esEnlaceExternoOEspecial(href) || href.startsWith("/")) {
    return true;
  }

  const sinAncla = href.split("#")[0];
  if (!sinAncla) {
    return true;
  }

  const baseDir = dirname(join(SITE, paginaRelativa));
  const destino = normalize(join(baseDir, sinAncla));
  return existsSync(destino);
}
