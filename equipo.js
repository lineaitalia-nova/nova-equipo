/* ══════════════════════════════════════════════════════════════════════════
   equipo.js — padron unico de personas (sep 2026)

   Cada app nacio en un momento distinto y cada una invento su propio sistema
   de identificadores para la misma gente:

     Nova v4       id corto            'alexis'
     NPD Manager   uid + perfil        'aesparza' / 'AE'
     Bridge        el nombre completo  'Alexis Esparza'
     Folios        codigo corto        'ALEXIS'

   El resultado: la misma persona con nombres distintos segun la pantalla, un
   mapa NOMBRE_A_ID mantenido a mano en el Bridge para traducir entre apps, y
   cinco personas del equipo que no aparecian por ningun lado.

   Este archivo define a cada persona UNA vez y registra por que nombre la
   conoce cada app. Los datos historicos no se tocan: siguen guardando lo que
   siempre guardaron y aqui se resuelve a quien se refieren. Por eso no hizo
   falta migrar nada ni coordinar una ventana con el equipo.

   El id canonico es el de Nova v4, que ya era el mas limpio.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* alias.npd     — uid y perfil en NPD Manager (arreglo: una persona puede
                     tener mas de un perfil, ver Rene)
     alias.folios  — codigos en la lista de responsables de Folios
     alias.nombres — todas las formas en que su nombre aparece escrito en datos
                     ya guardados. Sirven para resolver, no para mostrar.       */
  const PERSONAS = [
    { id:'rene', nombre:'René', apellido:'Esparza', area:'Gerencia', rol:'lider', color:'#C9A84C',
      alias:{ npd:['admin','GI','resparza','RE'], folios:[],
              nombres:['René Esparza','Rene Esparza','René Esparza Martínez','Rene Esparza Martinez'] } },

    // ── Innovación / NPD ──
    { id:'ramon', nombre:'Ramón', apellido:'Barraza', area:'Innovación', rol:'coordinador', color:'#3B82F6',
      alias:{ npd:['rbarraza','RB'], folios:['RAMON'],
              nombres:['Ramón Barraza','Ramon Barraza','Ramón Barraza Venegas'] } },
    { id:'paco', nombre:'Francisco', apellido:'Javier', area:'Innovación', rol:'coordinador', color:'#60A5FA',
      alias:{ npd:['fdelarosa','FR'], folios:['FRANCISCO'],
              nombres:['Francisco Javier','Francisco de la Rosa','Paco'] } },
    { id:'paulina', nombre:'Paulina', apellido:'Román', area:'Innovación', rol:'ingeniero', color:'#93C5FD',
      alias:{ npd:['proman','PR'], folios:[],
              nombres:['Paulina Román','Paulina Roman','Paulina Román López'] } },
    { id:'frida', nombre:'Frida Paola', apellido:'Pérez', area:'Innovación', rol:'becario', color:'#BFDBFE',
      alias:{ npd:[], folios:[], nombres:['Frida Paola','Frida Paola Pérez','Frida'] } },
    { id:'luiscarlo', nombre:'Luis Carlo', apellido:'Prado', area:'Innovación', rol:'becario', color:'#93C5FD',
      alias:{ npd:[], folios:[], nombres:['Luis Carlo','Luis Carlo Prado'] } },

    // ── Ingeniería ──
    { id:'alexis', nombre:'Raúl Alexis', apellido:'Esparza', area:'Ingeniería', rol:'coordinador', color:'#A78BFA',
      alias:{ npd:['aesparza','AE'], folios:['ALEXIS'],
              nombres:['Raúl Alexis Esparza','Alexis Esparza','Raúl Alexis','Raul Alexis'] } },
    { id:'kevin', nombre:'Kevin', apellido:'Obed', area:'Ingeniería', rol:'ingeniero', color:'#C4B5FD',
      alias:{ npd:[], folios:['OBED'],
              nombres:['Kevin Obed','Obed Zavala','Kevin Obed Zavala'] } },
    { id:'everardo', nombre:'Everardo', apellido:'Aguayo', area:'Ingeniería', rol:'ingeniero', color:'#8B5CF6',
      alias:{ npd:[], folios:['EVERARDO'],
              nombres:['Everardo Aguayo','Everardo Aguayo Sandoval'] } },
    { id:'karina', nombre:'Karina Valeria', apellido:'Pérez', area:'Ingeniería', rol:'becario', color:'#DDD6FE',
      alias:{ npd:[], folios:[], nombres:['Karina Valeria','Karina Valeria Pérez','Karina'] } },

    // ── Costos y Folios ──
    { id:'brenda', nombre:'Brenda', apellido:'Yañez', area:'Costos', rol:'coordinador', color:'#2DD4BF',
      alias:{ npd:[], folios:[], nombres:['Brenda Yañez','Brenda Yañez López','Brenda Yanez'] } },
    // 'ENRIQUE' existia en Folios como "Enrique (otro)", una segunda entrada creada
    // para distinguir homonimos. Confirmado con Rene (sep 2026): es la misma persona.
    // Se conserva el alias para que los folios historicos sigan resolviendo.
    { id:'enrique', nombre:'Luis Enrique', apellido:'Romo', area:'Costos', rol:'ingeniero', color:'#7C3AED',
      alias:{ npd:[], folios:['ROMO','ENRIQUE'],
              nombres:['Luis Enrique Romo','Enrique Romo','Luis Enrique','Enrique (otro)'] } },
    { id:'danna', nombre:'Danna Paola', apellido:'Ponce', area:'Costos', rol:'auxiliar', color:'#5EEAD4',
      alias:{ npd:[], folios:[], nombres:['Danna Paola','Danna Paola Ponce','Danna'] } },
    { id:'natalia', nombre:'Natalia', apellido:'Estefanía', area:'Costos', rol:'auxiliar', color:'#99F6E4',
      alias:{ npd:[], folios:[], nombres:['Natalia Estefanía','Natalia Estefania','Natalia'] } },
    { id:'luisrub', nombre:'Luis Rubén', apellido:'López', area:'Costos', rol:'auxiliar', color:'#0F766E',
      alias:{ npd:[], folios:['LUIS'],
              nombres:['Luis Rubén López','Luis Ruben Lopez','Luis Rubén','Luis López'] } },

    // ── Taller de Innovación ──
    // Decision de Rene (sep 2026): se maneja como un bloque, no como tres personas.
    // Jorge Javier (madera), Omar Alejandro (habilitado) y Jorge Acero (soldadura)
    // no usan las apps de forma individual. Lo que se les delegue llega a Rene.
    { id:'taller', nombre:'Taller de Innovación', apellido:'', area:'Taller', rol:'bloque', color:'#F59E0B',
      delegarA:'rene',
      alias:{ npd:[], folios:[], nombres:['Taller de Innovación','Taller de Innovacion','Taller'] } },
  ];

  /* Cuentas de area del NPD Manager. No son personas: son buzones por area.
     Se listan para que nadie las confunda con gente al resolver un perfil.    */
  const AREAS = { CAL:'Área de Calidad', COS:'Área de Costos', PRO:'Área de Procesos' };

  // ── Normalizacion ────────────────────────────────────────────────────────
  // Sin acentos, sin mayusculas, sin espacios de mas. El NPD Manager guarda los
  // nombres sin acentos y las otras apps con ellos; asi 'Ramon' encuentra a 'Ramón'.
  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // Indices, armados una vez al cargar
  const porIdMap = new Map();
  const porNpdMap = new Map();
  const porFoliosMap = new Map();
  const porNombreMap = new Map();

  PERSONAS.forEach(p => {
    porIdMap.set(p.id, p);
    (p.alias.npd || []).forEach(c => porNpdMap.set(norm(c), p));
    (p.alias.folios || []).forEach(c => porFoliosMap.set(norm(c), p));
    (p.alias.nombres || []).forEach(n => porNombreMap.set(norm(n), p));
    porNombreMap.set(norm(p.nombre + ' ' + p.apellido), p);
    porNombreMap.set(norm(p.id), p);
  });

  // ── API ──────────────────────────────────────────────────────────────────
  const EQ = {
    PERSONAS: PERSONAS,
    AREAS: AREAS,

    todos()        { return PERSONAS.slice(); },
    porId(id)      { return porIdMap.get(String(id || '')) || null; },
    porNpd(c)      { return porNpdMap.get(norm(c)) || null; },
    porFolios(c)   { return porFoliosMap.get(norm(c)) || null; },
    porNombre(s)   { return porNombreMap.get(norm(s)) || null; },

    /* Resuelve contra cualquier sistema: id, perfil del NPD, codigo de Folios
       o nombre escrito de cualquier forma. Para datos de origen incierto.      */
    resolver(v) {
      return this.porId(v) || this.porNombre(v) || this.porNpd(v) || this.porFolios(v) || null;
    },

    nombre(p)      { p = this.resolver(p) || p; return p && p.nombre ? (p.nombre + (p.apellido ? ' ' + p.apellido : '')) : ''; },
    nombreCorto(p) { p = this.resolver(p) || p; return p && p.nombre ? p.nombre : ''; },
    color(p)       { p = this.resolver(p) || p; return (p && p.color) || '#64748B'; },

    /* Id al que debe llegar el trabajo asignado a alguien. Casi siempre el suyo;
       el Taller redirige a Rene porque no usan las apps individualmente.        */
    destinatario(v) {
      const p = this.resolver(v);
      return p ? (p.delegarA || p.id) : null;
    },

    /* Para poblar desplegables: nombre completo, agrupado por area.            */
    paraSelect(opts) {
      const o = opts || {};
      return PERSONAS
        .filter(p => (o.incluirTaller === false ? p.id !== 'taller' : true))
        .map(p => ({ id: p.id, nombre: EQ.nombre(p), area: p.area }));
    },

    porArea(area) { return PERSONAS.filter(p => p.area === area); },
  };

  global.EQ = EQ;
})(window);
