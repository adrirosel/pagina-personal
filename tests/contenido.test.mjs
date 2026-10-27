import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { PERFIL } from "./perfil.mjs";
import {
  esEnlaceExternoOEspecial,
  existeDestinoRelativo,
  extraerAtributo,
  extraerAtributos,
  leerSite,
} from "./utilidades.mjs";

const PAGINAS = ["index.html", "proyectos.html"];

function contarEtiquetas(html, etiqueta) {
  const regex = new RegExp(`<${etiqueta}\\b`, "gi");
  return (html.match(regex) || []).length;
}

function textoEntreEtiquetas(html, etiqueta) {
  const regex = new RegExp(`<${etiqueta}\\b[^>]*>([\\s\\S]*?)</${etiqueta}>`, "i");
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

describe("contenido HTML", () => {
  for (const pagina of PAGINAS) {
    const html = leerSite(pagina);

    test(`${pagina}: lang="es"`, () => {
      const lang = extraerAtributo(html, "html", "lang");
      assert.equal(lang, "es", `${pagina} debe tener lang="es" en <html>`);
    });

    test(`${pagina}: meta viewport y description`, () => {
      assert.ok(
        /<meta\b[^>]*name=["']viewport["']/i.test(html),
        `${pagina} debe incluir un meta viewport`,
      );
      assert.ok(
        /<meta\b[^>]*name=["']description["']/i.test(html),
        `${pagina} debe incluir un meta description`,
      );
      const description = html.match(
        /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      ) || html.match(
        /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
      );
      assert.ok(description, `${pagina} debe tener content en meta description`);
      assert.ok(
        description[1].length > 20,
        `${pagina}: la meta description debe tener más de 20 caracteres`,
      );
    });

    test(`${pagina}: un único h1 con el nombre`, () => {
      assert.equal(
        contarEtiquetas(html, "h1"),
        1,
        `${pagina} debe tener exactamente un h1`,
      );
      const textoH1 = textoEntreEtiquetas(html, "h1");
      assert.ok(
        textoH1.includes(PERFIL.nombre),
        `${pagina}: el h1 debe contener el nombre "${PERFIL.nombre}"`,
      );
    });

    test(`${pagina}: header, nav, main y footer`, () => {
      assert.ok(/<header\b/i.test(html), `${pagina} debe contener <header>`);
      assert.ok(/<nav\b/i.test(html), `${pagina} debe contener <nav>`);
      assert.ok(/<main\b/i.test(html), `${pagina} debe contener <main>`);
      assert.ok(/<footer\b/i.test(html), `${pagina} debe contener <footer>`);
    });

    test(`${pagina}: toda img tiene alt de 3 o más caracteres`, () => {
      const alts = extraerAtributos(html, "img", "alt");
      assert.ok(alts.length > 0, `${pagina} debe incluir al menos una imagen`);
      for (const alt of alts) {
        assert.ok(
          alt.trim().length >= 3,
          `${pagina}: el atributo alt "${alt}" debe tener al menos 3 caracteres`,
        );
      }
    });

    test(`${pagina}: ningún href o src empieza por "/"`, () => {
      const hrefs = extraerAtributos(html, "a", "href");
      const srcs = [
        ...extraerAtributos(html, "img", "src"),
        ...extraerAtributos(html, "script", "src"),
        ...extraerAtributos(html, "link", "href"),
      ];
      for (const url of [...hrefs, ...srcs]) {
        assert.ok(
          !url.startsWith("/"),
          `${pagina}: la ruta "${url}" no debe empezar por "/"`,
        );
      }
    });

    test(`${pagina}: enlaces internos apuntan a ficheros existentes`, () => {
      const hrefs = extraerAtributos(html, "a", "href");
      const srcs = [
        ...extraerAtributos(html, "img", "src"),
        ...extraerAtributos(html, "script", "src"),
        ...extraerAtributos(html, "link", "href"),
      ];
      for (const url of [...hrefs, ...srcs]) {
        if (esEnlaceExternoOEspecial(url)) {
          continue;
        }
        assert.ok(
          existeDestinoRelativo(pagina, url),
          `${pagina}: el enlace relativo "${url}" no apunta a un fichero existente`,
        );
      }
    });
  }

  test("index.html: title coincide con PERFIL.titulo", () => {
    const html = leerSite("index.html");
    const title = textoEntreEtiquetas(html, "title");
    assert.equal(
      title,
      PERFIL.titulo,
      `El <title> de index.html debe ser "${PERFIL.titulo}"`,
    );
  });

  test("index.html: secciones de PERFIL.secciones con su h2", () => {
    const html = leerSite("index.html");
    for (const id of PERFIL.secciones) {
      const seccionRegex = new RegExp(
        `<section\\b[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</section>`,
        "i",
      );
      const match = html.match(seccionRegex);
      assert.ok(match, `Falta la sección #${id} en index.html`);
      assert.ok(
        /<h2\b/i.test(match[1]),
        `La sección #${id} debe contener un h2`,
      );
    }
  });

  test("index.html: #habilidades tiene suficientes li", () => {
    const html = leerSite("index.html");
    const match = html.match(
      /<section\b[^>]*id=["']habilidades["'][^>]*>([\s\S]*?)<\/section>/i,
    );
    assert.ok(match, "Falta la sección #habilidades");
    const items = match[1].match(/<li\b/gi) || [];
    assert.ok(
      items.length >= PERFIL.minimoHabilidades,
      `#habilidades debe tener al menos ${PERFIL.minimoHabilidades} elementos li`,
    );
  });

  test("index.html: #contacto con mailto y GitHub", () => {
    const html = leerSite("index.html");
    const match = html.match(
      /<section\b[^>]*id=["']contacto["'][^>]*>([\s\S]*?)<\/section>/i,
    );
    assert.ok(match, "Falta la sección #contacto");
    const contacto = match[1];
    assert.ok(
      contacto.includes(`mailto:${PERFIL.email}`),
      `#contacto debe incluir mailto:${PERFIL.email}`,
    );
    assert.ok(
      contacto.includes(`https://github.com/${PERFIL.usuarioGithub}`),
      `#contacto debe incluir el enlace a https://github.com/${PERFIL.usuarioGithub}`,
    );
  });

  test("proyectos.html: artículos de proyecto con estructura mínima", () => {
    const html = leerSite("proyectos.html");
    const articulos = html.match(/<article\b[^>]*class=["'][^"']*\bproyecto\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi) || [];
    assert.ok(
      articulos.length >= PERFIL.minimoProyectos,
      `proyectos.html debe tener al menos ${PERFIL.minimoProyectos} article.proyecto`,
    );

    for (const [indice, articulo] of articulos.entries()) {
      assert.ok(
        /<h2\b/i.test(articulo) || /<h3\b/i.test(articulo),
        `El proyecto ${indice + 1} debe tener un h2 o h3`,
      );
      assert.ok(/<p\b/i.test(articulo), `El proyecto ${indice + 1} debe tener un párrafo`);
      assert.ok(
        /<ul\b[^>]*class=["'][^"']*\btecnologias\b[^"']*["']/i.test(articulo),
        `El proyecto ${indice + 1} debe tener ul.tecnologias`,
      );
    }
  });

  test("proyectos.html: enlaces externos con target y rel noopener", () => {
    const html = leerSite("proyectos.html");
    const enlaces = html.match(/<a\b[^>]*>/gi) || [];
    const externos = enlaces.filter((etiqueta) =>
      /href=["']https?:/i.test(etiqueta),
    );
    assert.ok(externos.length > 0, "Debe haber al menos un enlace externo en proyectos.html");

    for (const etiqueta of externos) {
      assert.ok(
        /target=["']_blank["']/i.test(etiqueta),
        `El enlace externo ${etiqueta} debe tener target="_blank"`,
      );
      assert.ok(
        /rel=["'][^"']*\bnoopener\b[^"']*["']/i.test(etiqueta),
        `El enlace externo ${etiqueta} debe incluir rel con noopener`,
      );
    }
  });
});
