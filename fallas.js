/* ══════════════════════════════════════════════════════════════════════════
   fallas.js — que los errores se vean (sep 2026)

   Las apps traian 45 bloques catch vacios. 26 de ellos protegian escrituras:
   si guardar fallaba, la excepcion se descartaba, la pantalla seguia normal y
   la persona continuaba trabajando creyendo que su trabajo estaba a salvo.

   La falla mas probable no es exotica: localStorage tiene un limite de unos
   5 MB por sitio y estas apps guardan casi todo ahi. Cuando se llena, setItem
   lanza QuotaExceededError. Con el catch vacio, nadie se entera nunca.

   Dos niveles, a proposito:
     Falla.critica()    escrituras — franja visible, porque callarlo cuesta trabajo
     Falla.registrar()  lecturas y parseos — solo consola, no amerita susto

   Este archivo nunca debe lanzar: se invoca desde dentro de un catch, y un
   error aqui dejaria la excepcion original sin manejar.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const registro = [];   // historial de la sesion, para diagnostico
  let criticas = 0;
  let barra = null;

  function esCuota(e) {
    if (!e) return false;
    const n = e.name || '';
    const c = e.code;
    // Los navegadores no coinciden en el nombre; se cubren las variantes.
    return n === 'QuotaExceededError' || n === 'NS_ERROR_DOM_QUOTA_REACHED' ||
           c === 22 || c === 1014;
  }

  function texto(e) {
    if (!e) return 'error desconocido';
    return e.message || e.name || String(e);
  }

  function pintarBarra(msg) {
    try {
      if (!barra) {
        barra = document.createElement('div');
        barra.setAttribute('role', 'alert');
        barra.style.cssText =
          'position:fixed;top:0;left:0;right:0;z-index:99998;background:#B45309;color:#fff;' +
          'font:13px/1.45 system-ui,-apple-system,sans-serif;padding:10px 44px 10px 16px;' +
          'text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.28)';
        const x = document.createElement('button');
        x.textContent = '×';
        x.setAttribute('aria-label', 'Cerrar aviso');
        x.style.cssText =
          'position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;' +
          'border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0 6px';
        x.onclick = function () { try { barra.remove(); barra = null; } catch (e) {} };
        barra.appendChild(x);
        const t = document.createElement('span');
        t.id = '_falla_txt';
        barra.insertBefore(t, x);
        (document.body || document.documentElement).appendChild(barra);
      }
      const t = barra.querySelector('#_falla_txt');
      if (t) t.textContent = msg + (criticas > 1 ? '  (' + criticas + ' fallas en esta sesión)' : '');
    } catch (e) { /* si ni la barra se puede pintar, queda el registro en consola */ }
  }

  const Falla = {
    /* Para escrituras: guardar, sincronizar, respaldar. Lo que si debe verse. */
    critica(que, e) {
      try {
        criticas++;
        registro.push({ nivel: 'critica', que: que, error: texto(e), ts: Date.now() });
        console.error('[falla] ' + que + ':', e);
        const msg = esCuota(e)
          ? 'No se pudo guardar "' + que + '": el almacenamiento del navegador está lleno. ' +
            'Haz un respaldo y recarga la página.'
          : 'No se pudo guardar "' + que + '". Tus cambios podrían no estar a salvo.';
        pintarBarra('⚠ ' + msg);
      } catch (x) { /* nunca lanzar desde aqui */ }
    },

    /* Para lecturas y parseos: deja rastro, no interrumpe. */
    registrar(que, e) {
      try {
        registro.push({ nivel: 'aviso', que: que, error: texto(e), ts: Date.now() });
        console.warn('[aviso] ' + que + ':', e);
      } catch (x) { /* nunca lanzar desde aqui */ }
    },

    /* Para revisar desde la consola que ha fallado en la sesion. */
    historial() { return registro.slice(); },
    resumen()   { return { total: registro.length, criticas: criticas }; },
  };

  global.Falla = Falla;
})(window);
