/* ══════════════════════════════════════════════════════════════════════════
   fb-auth.js — autenticacion compartida contra Firebase (sep 2026)

   Las cuatro apps (NPD Manager, Folios, Nova v4, Bridge) hablan con Realtime
   Database por REST. Sin autenticacion, la base tiene que quedar abierta a
   cualquiera que conozca la URL. Este archivo consigue un token anonimo y lo
   pega a cada peticion, para que las reglas puedan exigir "auth != null".

   Se usa cambiando   fetch(url, opts)   por   FB.fetch(url, opts)
   No hace falta reordenar el arranque de las apps: FB.fetch espera solo el
   token antes de salir, asi que una llamada disparada al cargar la pagina
   funciona igual.

   Primer archivo compartido entre las apps. Antes cada una repetia todo.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── Configuracion ────────────────────────────────────────────────────────
  // Web API Key del proyecto nova-lineaitalia-2.
  // Firebase Console -> Configuracion del proyecto -> General -> Apps web.
  // No es un secreto: las API keys web de Firebase son identificadores
  // publicos y viajan en el cliente por diseno. Quien protege los datos son
  // las reglas de la base, no esta clave.
  const API_KEY = 'AIzaSyB2MaI1sp4Q79zzUKld7XuQ3BLbqghoYE8';

  const URL_ALTA     = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp';
  const URL_REFRESCO = 'https://securetoken.googleapis.com/v1/token';

  // El token dura 3600 s. Lo renovamos antes de tiempo para que nadie se quede
  // a medias: tu equipo deja las apps abiertas toda la jornada, y un token
  // vencido a media manana fallaria en silencio, que es justo lo que evitamos.
  const MARGEN_MS = 5 * 60 * 1000;

  let token = null;
  let refreshToken = null;
  let venceEn = 0;
  let enCurso = null;     // promesa en vuelo, para no pedir dos tokens a la vez

  // ── Obtener y renovar ────────────────────────────────────────────────────
  async function pedirTokenNuevo() {
    const r = await fetch(URL_ALTA + '?key=' + API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    });
    if (!r.ok) throw new Error('alta anonima fallo: HTTP ' + r.status);
    const d = await r.json();
    token = d.idToken;
    refreshToken = d.refreshToken;
    venceEn = Date.now() + Number(d.expiresIn || 3600) * 1000;
    return token;
  }

  async function renovar() {
    if (!refreshToken) return pedirTokenNuevo();
    const r = await fetch(URL_REFRESCO + '?key=' + API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken),
    });
    if (!r.ok) return pedirTokenNuevo();   // si el refresco falla, empezamos de cero
    const d = await r.json();
    token = d.id_token;
    refreshToken = d.refresh_token;
    venceEn = Date.now() + Number(d.expires_in || 3600) * 1000;
    return token;
  }

  function vigente() {
    return token && Date.now() < venceEn - MARGEN_MS;
  }

  function asegurarToken() {
    if (vigente()) return Promise.resolve(token);
    if (enCurso) return enCurso;                  // ya hay una peticion en vuelo
    enCurso = (token ? renovar() : pedirTokenNuevo())
      .catch(e => { token = null; throw e; })
      .finally(() => { enCurso = null; });
    return enCurso;
  }

  // ── Armado de URL ────────────────────────────────────────────────────────
  // Respeta los parametros que ya traiga la URL (?shallow=true, por ejemplo).
  function conAuth(url, t) {
    const sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep + 'auth=' + encodeURIComponent(t);
  }

  // ── Aviso en pantalla ────────────────────────────────────────────────────
  // Si la autenticacion falla, la app se queda sin datos. Antes eso pasaba en
  // silencio; aqui se avisa, porque un error visible se arregla y uno mudo no.
  let avisoPuesto = false;
  function avisar(msg) {
    if (avisoPuesto) return;
    avisoPuesto = true;
    try {
      const d = document.createElement('div');
      d.setAttribute('role', 'alert');
      d.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:99999;background:#B91C1C;color:#fff;' +
        'font:13px/1.4 system-ui,sans-serif;padding:10px 16px;text-align:center;' +
        'box-shadow:0 2px 10px rgba(0,0,0,.3)';
      d.textContent = '⚠ Sin conexion autenticada con Firebase: ' + msg +
        '. Los cambios podrian no guardarse. Recarga la pagina.';
      (document.body || document.documentElement).appendChild(d);
    } catch (e) { /* si ni el aviso se puede pintar, no hay mas que hacer */ }
  }

  // ── API publica ──────────────────────────────────────────────────────────
  const FB = {
    /* Sustituto directo de fetch() para cualquier URL de Realtime Database.
       Consigue el token si hace falta, lo agrega, y reintenta una vez si la
       respuesta es 401 (token vencido antes de lo previsto, reloj desfasado,
       equipo que estuvo suspendido). */
    async fetch(url, opts) {
      let t;
      try {
        t = await asegurarToken();
      } catch (e) {
        avisar(e.message || 'no se pudo autenticar');
        throw e;
      }

      let r = await fetch(conAuth(url, t), opts);

      if (r.status === 401) {
        token = null;
        try {
          t = await asegurarToken();
        } catch (e) {
          avisar('el token expiro y no se pudo renovar');
          throw e;
        }
        r = await fetch(conAuth(url, t), opts);
      }
      return r;
    },

    /* Para casos donde se necesite la URL ya firmada en vez de la peticion. */
    async url(u) {
      return conAuth(u, await asegurarToken());
    },

    /* Permite esperar a que haya sesion antes de arrancar algo. */
    ready() { return asegurarToken(); },

    get configurado() { return API_KEY.indexOf('__PEGAR') === -1; },
  };

  global.FB = FB;

  // Arrancamos el token de inmediato para que la primera lectura no espere.
  if (FB.configurado) {
    asegurarToken().catch(e => avisar(e.message || 'no se pudo autenticar'));
  } else {
    console.warn('[fb-auth] Falta la Web API Key: las peticiones saldran sin autenticar.');
  }
})(window);
