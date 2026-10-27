document.addEventListener("DOMContentLoaded", () => {
  const anio = document.getElementById("anio");
  if (anio) {
    anio.textContent = String(new Date().getFullYear());
  }

  const volverArriba = document.getElementById("volver-arriba");
  if (volverArriba) {
    volverArriba.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
