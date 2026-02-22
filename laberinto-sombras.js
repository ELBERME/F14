/* ============================================= */
/* LABERINTO DE LA SOMBRA — VERSIÓN MEJORADA       */
/* El Vacío y el Exceso                            */
/* ============================================= */
(function () {
    'use strict';

    /* ========================================= */
    /* CONSTANTES                                  */
    /* ========================================= */
    var CELL = 36;
    var P_SIZE = 16;
    var SPEED = 2.8;
    var PATH_LEN = 280;

    /* Aura y saturación */
    var AURA_BASE = 55;
    var SAT_DECAY = 0.25;
    var SAT_RECOV = 0.22;
    var SAT_MIN = 0.05;

    /* Fragmentos */
    var FRAG_NEED = 5;
    var FRAG_TIMER = 45;
    var FRAG_FANTASMA = true;

/* Entes — balanceados v2 */
var ENTE_COUNT = 2;
var ENTE_SPEED_PATROL = SPEED * 0.42;
var ENTE_SPEED_CHASE = SPEED * 0.58;
var ENTE_DETECT = 100;
var ENTE_WARNING = 220;
var ENTE_PULSE_INTERVAL = 2.0;
var ENTE_CHASE_DELAY = 1.0;
var ENTE_CHASE_DURATION = 5.0;

    /* Zonas de quemadura */
    var QUEMADURA_PCT = 0.08;
    var QUEMADURA_MULT = 5;
    var QUEMADURA_CAMBIO = 30;

/* Sistema de vidas */
var VIDAS_MAX = 3;
var MUERTES_MAX = 3;
    /* Rastro */
    var RASTRO_ALPHA = 0.12;
    var RASTRO_COLOR_R = 120;
    var RASTRO_COLOR_G = 60;
    var RASTRO_COLOR_B = 180;

    /* Invulnerabilidad */
    var INVULN_TIME = 2.0;

    /* ========================================= */
    /* ESTADO                                      */
    /* ========================================= */
    var fase, blancoDiv, canvas, ctx;
    var hudEl, fragInfo, barraFill, svgWrap, svgPath;
    var finDiv, finTexto;
    var colapsoPantalla, colapsoTexto, colapsoVidas;
    var warningOverlay;
    var activo = false;
    var px, py;
    var frags = [];
    var fragsHave = 0;
    var saturacion = 1;
    var enMovimiento = false;
    var grid = [];
    var gcols, grows;
    var metaX, metaY;
    var raf = null;
    var prevTime = 0;
    var keys = {};
    var ganado = false;
    var mods = {};
    var touchDirs = { up: false, down: false, left: false, right: false };
    var inicializado = false;

    /* Entes */
    var entes = [];

    /* Zonas de quemadura */
    var quemaduras = [];
    var quemaduraTimer = 0;

/* Vidas */
var vidas = 3;
var muertes = 0;
var enMuerte = false;
var quietoTimer = 0;

    /* Rastro */
    var rastro = null;
    var rastroCtx = null;

    /* Invulnerabilidad */
    var invulnTimer = 0;

    /* Warning */
    var warningIntensidad = 0;

    /* Sonido */
    var sndAmbiente, sndLatido, sndGolpe, sndColapso, sndAlerta;

    /* ========================================= */
    /* OBTENER DOM                                 */
    /* ========================================= */
    function obtenerDOM() {
        fase = document.getElementById('fase-lab-sombra');
        blancoDiv = document.getElementById('sombra-blanco');
        canvas = document.getElementById('canvas-sombra');
        ctx = canvas.getContext('2d');
        hudEl = document.getElementById('sombra-hud');
        fragInfo = document.getElementById('sombra-frag-info');
        barraFill = document.getElementById('sombra-barra');
        svgWrap = document.getElementById('sombra-corazon-svg-wrap');
        svgPath = document.getElementById('sombra-corazon-path');
        finDiv = document.getElementById('sombra-fin');
        finTexto = document.getElementById('sombra-fin-texto');
        colapsoPantalla = document.getElementById('sombra-colapso');
        colapsoTexto = document.getElementById('sombra-colapso-texto');
        colapsoVidas = document.getElementById('sombra-colapso-vidas');
        warningOverlay = document.getElementById('sombra-warning');

        /* Audio — estos pueden no existir aún */
        sndAmbiente = document.getElementById('audio-sombra-ambiente');
        sndLatido = document.getElementById('audio-sombra-latido');
        sndGolpe = document.getElementById('audio-sombra-golpe');
        sndColapso = document.getElementById('audio-sombra-colapso');
        sndAlerta = document.getElementById('audio-sombra-alerta');
    }

    /* ========================================= */
    /* RESETEAR ESTADO                             */
    /* ========================================= */
    function resetearEstado() {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
        activo = false;
        px = 0; py = 0;
        frags = [];
        fragsHave = 0;
        saturacion = 1;
        enMovimiento = false;
        grid = [];
        gcols = 0; grows = 0;
        metaX = 0; metaY = 0;
        prevTime = 0;
        ganado = false;
        entes = [];
        quemaduras = [];
        quemaduraTimer = 0;
        vidas = VIDAS_MAX;
        muertes = 0;
        enMuerte = false;
        invulnTimer = 0;
        warningIntensidad = 0;
        rastro = null;
        rastroCtx = null;
        touchDirs = { up: false, down: false, left: false, right: false };

        for (var k in keys) keys[k] = false;

        if (fase) {
            fase.style.display = 'none';
            fase.style.opacity = '0';
            fase.classList.remove('visible');
        }
        if (blancoDiv) {
            blancoDiv.style.transition = '';
            blancoDiv.style.opacity = '0';
            blancoDiv.classList.remove('visible');
        }
        if (hudEl) hudEl.classList.remove('visible');
        if (svgWrap) svgWrap.classList.remove('visible');
        if (finDiv) {
            finDiv.style.display = 'none';
            finDiv.style.opacity = '0';
            finDiv.classList.remove('visible');
        }
        if (finTexto) finTexto.innerHTML = '';
        if (svgPath) {
            svgPath.style.strokeDashoffset = PATH_LEN;
            svgPath.style.stroke = 'rgba(155, 89, 182, 0.3)';
        }


        if (colapsoPantalla) {
        colapsoPantalla.style.display = 'none';
        colapsoPantalla.style.opacity = '0';
}
        var muertePantalla = document.getElementById('sombra-muerte');
        if (muertePantalla) {
        muertePantalla.style.display = 'none';
        muertePantalla.style.opacity = '0';
}


        if (warningOverlay) warningOverlay.style.opacity = '0';

        detenerSonidos();
    }

    /* ========================================= */
    /* SONIDO HELPERS                              */
    /* ========================================= */
    function playLoop(el, vol) {
        if (!el) return;
        el.volume = vol;
        el.currentTime = 0;
        el.loop = true;
        el.play().catch(function () { });
    }

    function playOnce(el, vol) {
        if (!el) return;
        el.volume = vol;
        el.currentTime = 0;
        el.loop = false;
        el.play().catch(function () { });
    }

    function detenerSonidos() {
        var snds = [sndAmbiente, sndLatido, sndGolpe, sndColapso, sndAlerta];
        for (var i = 0; i < snds.length; i++) {
            if (snds[i]) {
                snds[i].pause();
                snds[i].currentTime = 0;
            }
        }
    }

    /* ========================================= */
    /* API PÚBLICA                                 */
    /* ========================================= */
    window.iniciarLaberintoSombra = function () {
        console.log('🌑 Iniciando laberinto sombra mejorado');

        obtenerDOM();
        resetearEstado();

        if (typeof CorazonDeNoris !== 'undefined') {
            mods = CorazonDeNoris.mod();
        } else {
            mods = { intensidadBlanco: 1.0, enteSpeedMult: 1.0, auraBonus: 0, colapsosBonus: 0, fragInicial: 0 };
        }

        if (!inicializado) {
            registrarInputs();
            inicializado = true;
        }

        fase.style.display = 'block';
        fase.style.transition = 'opacity 1.5s ease';

        setTimeout(function () {
            fase.classList.add('visible');
            fase.style.opacity = '1';
        }, 30);

        setTimeout(function () {
            blancoDiv.style.transition = 'opacity 0.5s ease';
            blancoDiv.style.opacity = '1';
            blancoDiv.classList.add('visible');
        }, 200);

        setTimeout(function () {
            prepararJuego();

            blancoDiv.style.transition = 'opacity 3s ease';
            blancoDiv.style.opacity = '0';
            blancoDiv.classList.remove('visible');

            hudEl.classList.add('visible');
            svgWrap.classList.add('visible');

            actualizarVidasHUD();

            /* Audio ambiente */
            playLoop(sndAmbiente, 0.3);
            playLoop(sndLatido, 0.05);

            setTimeout(function () {
                activo = true;
                prevTime = performance.now();
                loop(prevTime);
            }, 1500);
        }, 2500);
    };

    /* ========================================= */
    /* GENERACIÓN DEL LABERINTO                    */
    /* ========================================= */
    function prepararJuego() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gcols = Math.floor(canvas.width / CELL);
        grows = Math.floor(canvas.height / CELL);
        if (gcols < 7) gcols = 7;
        if (grows < 7) grows = 7;
        if (gcols % 2 === 0) gcols--;
        if (grows % 2 === 0) grows--;

        grid = [];
        for (var r = 0; r < grows; r++) {
            grid[r] = [];
            for (var c = 0; c < gcols; c++) {
                grid[r][c] = 1;
            }
        }

        /* DFS maze gen */
        var stack = [];
        grid[1][1] = 0;
        stack.push({ x: 1, y: 1 });

        while (stack.length > 0) {
            var cur = stack[stack.length - 1];
            var nb = vecinos(cur.x, cur.y);
            if (nb.length === 0) {
                stack.pop();
            } else {
                var n = nb[Math.floor(Math.random() * nb.length)];
                grid[n.y][n.x] = 0;
                grid[cur.y + (n.y - cur.y) / 2][cur.x + (n.x - cur.x) / 2] = 0;
                stack.push(n);
            }
        }

        /* SIN pasillos extras (más difícil) */

        /* Jugador */
        px = 1.5 * CELL;
        py = 1.5 * CELL;

        /* Meta */
        var mx = gcols - 2;
        var my = grows - 2;
        grid[my][mx] = 0;
        grid[my - 1][mx] = 0;
        grid[my][mx - 1] = 0;
        metaX = (mx + 0.5) * CELL;
        metaY = (my + 0.5) * CELL;

        /* Celdas libres */
        var libres = obtenerLibres(5);

        /* Fragmentos */
        generarFragmentos(libres);

        /* Zonas de quemadura */
        generarQuemaduras();

        /* Entes */
        function actualizarEntes(dt) {
    var distMasCercana = 9999;

    for (var i = 0; i < entes.length; i++) {
        var e = entes[i];

        /* Distancia al jugador */
        var dpx = px - e.x;
        var dpy = py - e.y;
        var dist = Math.sqrt(dpx * dpx + dpy * dpy);

        if (dist < distMasCercana) distMasCercana = dist;

        /* --- SISTEMA DE ESTADOS --- */

        /* Si está cansado, no persigue */
        if (e.cansado) {
            e.cansadoTimer -= dt;
            if (e.cansadoTimer <= 0) {
                e.cansado = false;
                e.modo = 'patrol';
                asignarDireccion(e);
            }
        }

        if (!e.cansado) {
            if (e.modo === 'patrol' && dist < ENTE_DETECT) {
                /* Te detectó → empieza alerta (no persigue aún) */
                e.modo = 'alert';
                e.alertTimer = ENTE_CHASE_DELAY;
            }
            else if (e.modo === 'alert') {
                e.alertTimer -= dt;
                if (e.alertTimer <= 0) {
                    /* Ahora sí persigue */
                    e.modo = 'chase';
                    e.chaseTimer = ENTE_CHASE_DURATION;
                } else if (dist > ENTE_DETECT * 1.8) {
                    /* Te alejaste a tiempo → vuelve a patrullar */
                    e.modo = 'patrol';
                    asignarDireccion(e);
                }
            }
            else if (e.modo === 'chase') {
                e.chaseTimer -= dt;
                if (e.chaseTimer <= 0 || dist > ENTE_DETECT * 3) {
                    /* Se cansó de perseguir → descansa */
                    e.cansado = true;
                    e.cansadoTimer = 4.0;
                    e.modo = 'patrol';
                    asignarDireccion(e);
                }
            }
        }

        /* --- MOVIMIENTO --- */
        var spd;
        if (e.modo === 'chase') {
            spd = e.chaseSpeed;
            var len = dist || 1;
            e.dx = dpx / len;
            e.dy = dpy / len;
        } else if (e.modo === 'alert') {
            /* En alerta: se DETIENE (te mira) */
            spd = 0;
        } else {
            spd = e.speed;
            e.dirTimer -= dt;
            if (e.dirTimer <= 0) {
                asignarDireccion(e);
            }
        }

        if (spd > 0) {
            var nx = e.x + e.dx * spd * dt * 60;
            var ny = e.y + e.dy * spd * dt * 60;

            if (!colisionaEnte(nx, e.y)) {
                e.x = nx;
            } else if (e.modo === 'patrol') {
                asignarDireccion(e);
            }

            if (!colisionaEnte(e.x, ny)) {
                e.y = ny;
            } else if (e.modo === 'patrol') {
                asignarDireccion(e);
            }
        }

        /* Pulso visual */
        e.pulseTimer -= dt;
        if (e.pulseTimer <= 0) {
            e.pulseTimer = ENTE_PULSE_INTERVAL;
            e.pulseAlpha = 1.0;
        }
        if (e.pulseAlpha > 0) {
            e.pulseAlpha = Math.max(0, e.pulseAlpha - dt * 1.5);
        }

        /* Colisión con jugador */
        if (dist < P_SIZE * 1.2 && invulnTimer <= 0 && !ganado && e.modo === 'chase') {
            golpeDeEnte();
        }

        /* Entes borran rastro al pasar */
        if (rastroCtx) {
            rastroCtx.clearRect(
                e.x - CELL * 0.6, e.y - CELL * 0.6,
                CELL * 1.2, CELL * 1.2
            );
        }
    }

    /* Warning overlay */
    if (distMasCercana < ENTE_WARNING) {
        warningIntensidad = Math.min(1, (1 - distMasCercana / ENTE_WARNING) * 0.6);
    } else {
        warningIntensidad = Math.max(0, warningIntensidad - dt * 2);
    }

    if (warningOverlay) {
        warningOverlay.style.opacity = warningIntensidad.toString();
    }

    /* Sonido latido */
    if (sndLatido) {
        var latidoVol = 0.05 + (1 - Math.min(1, distMasCercana / ENTE_WARNING)) * 0.4;
        sndLatido.volume = Math.min(0.5, latidoVol);
        sndLatido.playbackRate = 0.8 + (1 - Math.min(1, distMasCercana / ENTE_WARNING)) * 1.2;
    }
}
        /* Canvas de rastro */
        crearCanvasRastro();

        saturacion = 1;
        ganado = false;
        vidas = VIDAS_MAX;
        actualizarHUD();
        actualizarVidasHUD();
    }

    function vecinos(x, y) {
        var dirs = [
            { x: x + 2, y: y }, { x: x - 2, y: y },
            { x: x, y: y + 2 }, { x: x, y: y - 2 }
        ];
        var r = [];
        for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            if (d.x > 0 && d.x < gcols - 1 && d.y > 0 && d.y < grows - 1 && grid[d.y][d.x] === 1) {
                r.push(d);
            }
        }
        return r;
    }

    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
    }

    function obtenerLibres(distMin) {
        var libres = [];
        for (var ry = 2; ry < grows - 2; ry++) {
            for (var rx = 2; rx < gcols - 2; rx++) {
                if (grid[ry][rx] === 0) {
                    var d = Math.abs(rx - 1) + Math.abs(ry - 1);
                    if (d > distMin) libres.push({ x: rx, y: ry });
                }
            }
        }
        shuffle(libres);
        return libres;
    }

    /* ========================================= */
    /* FRAGMENTOS                                  */
    /* ========================================= */
    function generarFragmentos(libres) {
        fragsHave = 0;
        frags = [];
        var count = Math.min(FRAG_NEED, libres.length);

        /* Fragmentos reales */
        for (var f = 0; f < count; f++) {
            frags.push({
                x: (libres[f].x + 0.5) * CELL,
                y: (libres[f].y + 0.5) * CELL,
                vivo: true,
                fantasma: false,
                timer: FRAG_TIMER,
                t: Math.random() * 6.28
            });
        }

        /* Fragmento fantasma */
        if (FRAG_FANTASMA && libres.length > count) {
            frags.push({
                x: (libres[count].x + 0.5) * CELL,
                y: (libres[count].y + 0.5) * CELL,
                vivo: true,
                fantasma: true,
                timer: 9999,
                t: Math.random() * 6.28
            });
        }

        /* Bonus: si completó luz antes, empieza con 1 fragmento */
        var fragBonus = mods.fragInicial || 0;
        if (fragBonus > 0 && frags.length > 0) {
            frags[0].vivo = false;
            fragsHave = 1;
        }
    }

    function reubicarFragmento(indice) {
        var libres = obtenerLibres(3);
        if (libres.length === 0) return;

        /* Buscar celda no ocupada por otro fragmento */
        for (var i = 0; i < libres.length; i++) {
            var nx = (libres[i].x + 0.5) * CELL;
            var ny = (libres[i].y + 0.5) * CELL;
            var ocupada = false;

            for (var j = 0; j < frags.length; j++) {
                if (j === indice || !frags[j].vivo) continue;
                var dd = Math.sqrt(Math.pow(frags[j].x - nx, 2) + Math.pow(frags[j].y - ny, 2));
                if (dd < CELL * 2) { ocupada = true; break; }
            }

            if (!ocupada) {
                frags[indice].x = nx;
                frags[indice].y = ny;
                frags[indice].timer = FRAG_TIMER;
                frags[indice].vivo = true;
                return;
            }
        }

        /* Fallback */
        frags[indice].x = (libres[0].x + 0.5) * CELL;
        frags[indice].y = (libres[0].y + 0.5) * CELL;
        frags[indice].timer = FRAG_TIMER;
        frags[indice].vivo = true;
    }

    /* ========================================= */
    /* ZONAS DE QUEMADURA                          */
    /* ========================================= */
    function generarQuemaduras() {
        quemaduras = [];
        quemaduraTimer = QUEMADURA_CAMBIO;

        for (var r = 0; r < grows; r++) {
            for (var c = 0; c < gcols; c++) {
                if (grid[r][c] === 0 && Math.random() < QUEMADURA_PCT) {
                    /* No colocar en inicio ni meta */
                    if (r <= 2 && c <= 2) continue;
                    if (r >= grows - 3 && c >= gcols - 3) continue;
                    quemaduras.push({ col: c, row: r });
                }
            }
        }
    }

    function reorganizarQuemaduras() {
        var nuevas = [];
        /* Mantener 70%, reorganizar 30% */
        for (var i = 0; i < quemaduras.length; i++) {
            if (Math.random() < 0.7) {
                nuevas.push(quemaduras[i]);
            }
        }

        /* Agregar nuevas aleatorias */
        var total = Math.floor(gcols * grows * QUEMADURA_PCT);
        var faltan = total - nuevas.length;

        for (var r = 0; r < grows && faltan > 0; r++) {
            for (var c = 0; c < gcols && faltan > 0; c++) {
                if (grid[r][c] === 0 && Math.random() < 0.03) {
                    if (r <= 2 && c <= 2) continue;
                    if (r >= grows - 3 && c >= gcols - 3) continue;

                    var yaExiste = false;
                    for (var j = 0; j < nuevas.length; j++) {
                        if (nuevas[j].col === c && nuevas[j].row === r) {
                            yaExiste = true; break;
                        }
                    }
                    if (!yaExiste) {
                        nuevas.push({ col: c, row: r });
                        faltan--;
                    }
                }
            }
        }

        quemaduras = nuevas;
    }

    function enQuemadura(x, y) {
        var col = Math.floor(x / CELL);
        var row = Math.floor(y / CELL);
        for (var i = 0; i < quemaduras.length; i++) {
            if (quemaduras[i].col === col && quemaduras[i].row === row) return true;
        }
        return false;
    }

    /* ========================================= */
    /* ENTES DE VACÍO                              */
    /* ========================================= */
    function generarEntes(libres) {
    entes = [];
    var speedMult = mods.enteSpeedMult || 1.0;

    /* Spawns distribuidos por el mapa */
    var zonas = [];
    var tercioX = Math.floor(gcols / 3);
    var tercioY = Math.floor(grows / 3);

    for (var i = 0; i < libres.length; i++) {
        var lx = libres[i].x;
        var ly = libres[i].y;
        /* Evitar spawn cerca del jugador (inicio) */
        if (lx < 4 && ly < 4) continue;
        /* Evitar spawn en la meta */
        if (lx > gcols - 4 && ly > grows - 4) continue;
        zonas.push(libres[i]);
    }

    shuffle(zonas);

    /* Intentar distribuir entes en diferentes tercios del mapa */
    var spawnPoints = [];
    var usados = [false, false, false];
    
    for (var z = 0; z < zonas.length && spawnPoints.length < ENTE_COUNT; z++) {
        var tercio = Math.floor(zonas[z].x / tercioX);
        if (tercio > 2) tercio = 2;
        
        if (!usados[tercio] || spawnPoints.length >= 1) {
            spawnPoints.push(zonas[z]);
            usados[tercio] = true;
        }
    }

    /* Fallback si no encontró suficientes */
    while (spawnPoints.length < ENTE_COUNT && zonas.length > 0) {
        spawnPoints.push(zonas[spawnPoints.length % zonas.length]);
    }

    for (var e = 0; e < ENTE_COUNT; e++) {
        if (e >= spawnPoints.length) break;

        entes.push({
            x: (spawnPoints[e].x + 0.5) * CELL,
            y: (spawnPoints[e].y + 0.5) * CELL,
            dx: 0,
            dy: 0,
            modo: 'patrol',
            speed: ENTE_SPEED_PATROL * speedMult,
            chaseSpeed: ENTE_SPEED_CHASE * speedMult,
            pulseTimer: Math.random() * ENTE_PULSE_INTERVAL,
            pulseAlpha: 0,
            dirTimer: 0,
            alertTimer: 0,
            chaseTimer: 0,
            cansado: false,
            cansadoTimer: 0,
            cambiosDir: 0
        });

        asignarDireccion(entes[entes.length - 1]);
    }
}
    function asignarDireccion(ente) {
    var dirs = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    shuffle(dirs);

    /* Intentar no ir hacia donde vino */
    var mejorDir = null;
    var fallback = null;

    for (var i = 0; i < dirs.length; i++) {
        var nx = ente.x + dirs[i].dx * CELL * 0.5;
        var ny = ente.y + dirs[i].dy * CELL * 0.5;
        
        if (!colisionaEnte(nx, ny)) {
            /* Preferir dirección diferente a la actual */
            if (dirs[i].dx !== -ente.dx || dirs[i].dy !== -ente.dy) {
                if (!mejorDir) mejorDir = dirs[i];
            }
            if (!fallback) fallback = dirs[i];
        }
    }

    var elegida = mejorDir || fallback;
    if (elegida) {
        ente.dx = elegida.dx;
        ente.dy = elegida.dy;
    }

    ente.dirTimer = 0.8 + Math.random() * 1.5;
}

    function colisionaEnte(x, y) {
        var m = P_SIZE * 0.4;
        var pts = [
            { x: x - m, y: y - m }, { x: x + m, y: y - m },
            { x: x - m, y: y + m }, { x: x + m, y: y + m }
        ];
        for (var i = 0; i < pts.length; i++) {
            var cx = Math.floor(pts[i].x / CELL);
            var cy = Math.floor(pts[i].y / CELL);
            if (cx < 0 || cx >= gcols || cy < 0 || cy >= grows) return true;
            if (grid[cy][cx] === 1) return true;
        }
        return false;
    }

    function actualizarEntes(dt) {
        var distMasCercana = 9999;

        for (var i = 0; i < entes.length; i++) {
            var e = entes[i];

            /* Distancia al jugador */
            var dpx = px - e.x;
            var dpy = py - e.y;
            var dist = Math.sqrt(dpx * dpx + dpy * dpy);

            if (dist < distMasCercana) distMasCercana = dist;

            /* Modo */
            if (dist < ENTE_DETECT) {
                e.modo = 'chase';
            } else if (e.modo === 'chase' && dist > ENTE_DETECT * 1.5) {
                e.modo = 'patrol';
                asignarDireccion(e);
            }

            /* Movimiento */
            var spd;
            if (e.modo === 'chase') {
                spd = e.chaseSpeed;
                var len = dist || 1;
                e.dx = dpx / len;
                e.dy = dpy / len;
            } else {
                spd = e.speed;
                e.dirTimer -= dt;
                if (e.dirTimer <= 0) {
                    asignarDireccion(e);
                }
            }

            var nx = e.x + e.dx * spd * dt * 60;
            var ny = e.y + e.dy * spd * dt * 60;

            if (!colisionaEnte(nx, e.y)) {
                e.x = nx;
            } else if (e.modo === 'patrol') {
                asignarDireccion(e);
            }

            if (!colisionaEnte(e.x, ny)) {
                e.y = ny;
            } else if (e.modo === 'patrol') {
                asignarDireccion(e);
            }

            /* Pulso visual */
            e.pulseTimer -= dt;
            if (e.pulseTimer <= 0) {
                e.pulseTimer = ENTE_PULSE_INTERVAL;
                e.pulseAlpha = 1.0;
            }
            if (e.pulseAlpha > 0) {
                e.pulseAlpha = Math.max(0, e.pulseAlpha - dt * 1.5);
            }

            /* Colisión con jugador */
            if (dist < P_SIZE * 1.2 && invulnTimer <= 0 && !ganado) {
                golpeDeEnte();
            }

            /* Entes borran rastro al pasar */
            if (rastroCtx) {
                rastroCtx.clearRect(
                    e.x - CELL * 0.6, e.y - CELL * 0.6,
                    CELL * 1.2, CELL * 1.2
                );
            }
        }

        /* Warning overlay */
        if (distMasCercana < ENTE_WARNING) {
            warningIntensidad = Math.min(1, (1 - distMasCercana / ENTE_WARNING) * 0.6);
        } else {
            warningIntensidad = Math.max(0, warningIntensidad - dt * 2);
        }

        if (warningOverlay) {
            warningOverlay.style.opacity = warningIntensidad.toString();
        }

        /* Sonido latido — más rápido si ente cerca */
        if (sndLatido) {
            var latidoVol = 0.05 + (1 - Math.min(1, distMasCercana / ENTE_WARNING)) * 0.4;
            sndLatido.volume = Math.min(0.5, latidoVol);
            sndLatido.playbackRate = 0.8 + (1 - Math.min(1, distMasCercana / ENTE_WARNING)) * 1.2;
        }
    }

function golpeDeEnte() {
    invulnTimer = INVULN_TIME;
    playOnce(sndGolpe, 0.5);

    /* Perder 1 vida */
    vidas--;
    actualizarVidasHUD();

    /* Saturación baja de golpe */
    saturacion = Math.max(SAT_MIN, 0.3);

    if (vidas <= 0) {
        /* SIN VIDAS: pierdes TODOS los fragmentos */
        ejecutarMuerte();
    } else {
        /* Teletransportar a posición segura */
        var libres = obtenerLibres(3);
        if (libres.length > 0) {
            var idx = Math.floor(Math.random() * Math.min(10, libres.length));
            px = (libres[idx].x + 0.5) * CELL;
            py = (libres[idx].y + 0.5) * CELL;
        }
    }
}
    /* ========================================= */
    /* CANVAS DE RASTRO                            */
    /* ========================================= */
    function crearCanvasRastro() {
        rastro = document.createElement('canvas');
        rastro.width = canvas.width;
        rastro.height = canvas.height;
        rastroCtx = rastro.getContext('2d');
    }

    function pintarRastro() {
        if (!rastroCtx) return;
        rastroCtx.fillStyle = 'rgba(' + RASTRO_COLOR_R + ',' + RASTRO_COLOR_G + ',' + RASTRO_COLOR_B + ',' + RASTRO_ALPHA + ')';
        rastroCtx.beginPath();
        rastroCtx.arc(px, py, P_SIZE * 0.4, 0, Math.PI * 2);
        rastroCtx.fill();
    }

    /* ========================================= */
    /* COLAPSO DEL VACÍO                           */
    /* ========================================= */
    function verificarColapso(dt) {
        if (enColapso || ganado) return;

        if (!enMovimiento && saturacion <= SAT_MIN + 0.02) {
            quietoTimer += dt;

            if (quietoTimer >= COLAPSO_QUIETO) {
                ejecutarColapso();
            }
        } else {
            quietoTimer = 0;
        }
    }

function ejecutarMuerte() {
    enMuerte = true;
    muertes++;
    activo = false;

    playOnce(sndColapso, 0.6);

    if (colapsoPantalla) {
        colapsoPantalla.style.display = 'flex';
        setTimeout(function () {
            colapsoPantalla.style.opacity = '1';
        }, 30);

        var texto;
        if (muertes >= MUERTES_MAX) {
            texto = "El vacío te consumió por completo...";
        } else {
            texto = "Tu luz se apaga... " + (MUERTES_MAX - muertes) + " oportunidades quedan.";
        }

        var idx = 0;
        if (colapsoTexto) colapsoTexto.innerHTML = '';

        if (typeof iniciarAudioMaquina === 'function') iniciarAudioMaquina();

        var intervalo = setInterval(function () {
            if (idx < texto.length) {
                colapsoTexto.innerHTML += texto[idx];
                idx++;
            } else {
                clearInterval(intervalo);
                if (typeof detenerAudioMaquina === 'function') detenerAudioMaquina();

                setTimeout(function () {
                    recuperarDeMuerte();
                }, 2000);
            }
        }, 80);
    } else {
        setTimeout(function () {
            recuperarDeMuerte();
        }, 3000);
    }
}

function recuperarDeMuerte() {
    if (muertes >= MUERTES_MAX) {
        /* GAME OVER TOTAL: regenerar laberinto completo */
        muertes = 0;

        if (colapsoPantalla) {
            colapsoPantalla.style.opacity = '0';
            setTimeout(function () {
                colapsoPantalla.style.display = 'none';
            }, 500);
        }

        setTimeout(function () {
            prepararJuego();
            enMuerte = false;
            activo = true;
            prevTime = performance.now();
            loop(prevTime);
        }, 600);
    } else {
        /* Pierdes fragmentos pero mantienes el mapa */
        px = 1.5 * CELL;
        py = 1.5 * CELL;

        /* PERDER TODOS los fragmentos */
        fragsHave = 0;
        var libres = obtenerLibres(4);
        var libreIdx = 0;

        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].fantasma) {
                if (libreIdx < libres.length) {
                    frags[i].x = (libres[libreIdx].x + 0.5) * CELL;
                    frags[i].y = (libres[libreIdx].y + 0.5) * CELL;
                    libreIdx++;
                }
                frags[i].vivo = true;
                frags[i].timer = FRAG_TIMER;
            }
        }

        /* Restaurar vidas */
        vidas = VIDAS_MAX;
        saturacion = 1;

        /* Limpiar rastro */
        if (rastroCtx) {
            rastroCtx.clearRect(0, 0, rastro.width, rastro.height);
        }

        actualizarHUD();
        actualizarVidasHUD();

        if (colapsoPantalla) {
            colapsoPantalla.style.opacity = '0';
            setTimeout(function () {
                colapsoPantalla.style.display = 'none';
            }, 500);
        }

        setTimeout(function () {
            enMuerte = false;
            activo = true;
            prevTime = performance.now();
            loop(prevTime);
        }, 800);
    }
}
    /* ========================================= */
    /* GAME LOOP                                   */
    /* ========================================= */
    function loop(time) {
        if (!activo) return;
        var dt = (time - prevTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        prevTime = time;

        actualizar(dt);
        renderizar(time);
        raf = requestAnimationFrame(loop);
    }

    function actualizar(dt) {
        /* Invulnerabilidad */
        if (invulnTimer > 0) invulnTimer -= dt;

        /* Input */
        var dx = 0, dy = 0;
        if (keys['ArrowUp'] || keys['w'] || keys['W'] || touchDirs.up) dy = -1;
        if (keys['ArrowDown'] || keys['s'] || keys['S'] || touchDirs.down) dy = 1;
        if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchDirs.left) dx = -1;
        if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchDirs.right) dx = 1;

        enMovimiento = (dx !== 0 || dy !== 0);

        if (enMovimiento) {
            var len = Math.sqrt(dx * dx + dy * dy);
            dx = dx / len * SPEED;
            dy = dy / len * SPEED;

            var nx = px + dx;
            var ny = py + dy;
            if (!colisiona(nx, py)) px = nx;
            if (!colisiona(px, ny)) py = ny;

            /* Pintar rastro */
            pintarRastro();
        }

        /* Saturación */
        var decayMult = 1;
        if (enQuemadura(px, py)) decayMult = QUEMADURA_MULT;

        if (enMovimiento) {
            saturacion = Math.min(1, saturacion + SAT_RECOV * dt);
        } else {
            saturacion = Math.max(SAT_MIN, saturacion - SAT_DECAY * decayMult * dt);
        }

        /* Quemaduras: timer de reorganización */
        quemaduraTimer -= dt;
        if (quemaduraTimer <= 0) {
            reorganizarQuemaduras();
            quemaduraTimer = QUEMADURA_CAMBIO;
        }

        /* Fragmentos: timers */
        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].vivo || frags[i].fantasma) continue;

            frags[i].timer -= dt;
            if (frags[i].timer <= 0) {
                reubicarFragmento(i);
            }
        }

        /* Recoger fragmentos */
        for (var f = 0; f < frags.length; f++) {
            if (!frags[f].vivo) continue;
            var fdx = px - frags[f].x;
            var fdy = py - frags[f].y;
            if (Math.sqrt(fdx * fdx + fdy * fdy) < CELL * 0.7) {

                if (frags[f].fantasma) {
                    /* Fragmento fantasma: penalización */
                    frags[f].vivo = false;
                    saturacion = Math.max(SAT_MIN, saturacion - 0.15);
                    playOnce(sndGolpe, 0.3);

                    /* Reubicar fantasma después de 10s */
                    (function (idx) {
                        setTimeout(function () {
                            reubicarFragmento(idx);
                        }, 10000);
                    })(f);
                } else {
                    frags[f].vivo = false;
                    fragsHave++;
                    actualizarHUD();
                    if (typeof reproducirBurbujaCorta === 'function') reproducirBurbujaCorta();
                }
            }
        }

        /* Entes */
        actualizarEntes(dt);

        /* Victoria */
        var totalReales = 0;
        for (var tr = 0; tr < frags.length; tr++) {
            if (!frags[tr].fantasma) totalReales++;
        }

        if (fragsHave >= totalReales && totalReales > 0 && !ganado) {
            var dmx = px - metaX;
            var dmy = py - metaY;
            if (Math.sqrt(dmx * dmx + dmy * dmy) < CELL) {
                ganar();
            }
        }

        /* Verificar saturación crítica */
if (!enMovimiento && saturacion <= SAT_MIN + 0.01 && !ganado && !enMuerte) {
    /* Drenar vida si está quieto con saturación mínima */
    quietoTimer += dt;
    if (quietoTimer >= 5) {
        quietoTimer = 0;
        vidas--;
        actualizarVidasHUD();
        if (vidas <= 0) {
            ejecutarMuerte();
        }
    }
} else {
    quietoTimer = 0;
}

        /* Barra */
        if (barraFill) {
            barraFill.style.width = (saturacion * 100) + '%';
        }
    }

    function colisiona(x, y) {
        var m = P_SIZE * 0.45;
        var pts = [
            { x: x - m, y: y - m }, { x: x + m, y: y - m },
            { x: x - m, y: y + m }, { x: x + m, y: y + m }
        ];
        for (var i = 0; i < pts.length; i++) {
            var cx = Math.floor(pts[i].x / CELL);
            var cy = Math.floor(pts[i].y / CELL);
            if (cx < 0 || cx >= gcols || cy < 0 || cy >= grows) return true;
            if (grid[cy][cx] === 1) return true;
        }
        return false;
    }

    /* ========================================= */
    /* RENDERIZADO                                 */
    /* ========================================= */
    function renderizar(time) {
        var W = canvas.width;
        var H = canvas.height;

        var bInt = mods.intensidadBlanco || 1;
        var bVal = Math.floor(255 * bInt);
        ctx.fillStyle = 'rgb(' + bVal + ',' + bVal + ',' + bVal + ')';
        ctx.fillRect(0, 0, W, H);

        ctx.save();

        /* Paredes */
        ctx.fillStyle = 'rgba(25, 25, 35, 0.85)';
        for (var r = 0; r < grows; r++) {
            for (var c = 0; c < gcols; c++) {
                if (grid[r][c] === 1) {
                    dibujarParedOrganica(c * CELL, r * CELL, CELL, time);
                }
            }
        }

        /* Caminos */
        ctx.fillStyle = 'rgba(180, 180, 195, 0.15)';
        for (var r2 = 0; r2 < grows; r2++) {
            for (var c2 = 0; c2 < gcols; c2++) {
                if (grid[r2][c2] === 0) {
                    ctx.fillRect(c2 * CELL + 1, r2 * CELL + 1, CELL - 2, CELL - 2);
                }
            }
        }

        /* Zonas de quemadura */
        for (var q = 0; q < quemaduras.length; q++) {
            var qc = quemaduras[q].col;
            var qr = quemaduras[q].row;
            var qPulse = 0.3 + Math.sin(time * 0.003 + q) * 0.15;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + qPulse + ')';
            ctx.fillRect(qc * CELL + 2, qr * CELL + 2, CELL - 4, CELL - 4);
        }

        /* Rastro */
        if (rastro) {
            ctx.drawImage(rastro, 0, 0);
        }

        /* Fragmentos */
        for (var fi = 0; fi < frags.length; fi++) {
            if (!frags[fi].vivo) continue;
            frags[fi].t += 0.03;

            var timerRatio = frags[fi].timer / FRAG_TIMER;
            var parpadeoSpeed = timerRatio < 0.22 ? 8 : (timerRatio < 0.5 ? 3 : 1);
            var pulso = 0.6 + Math.sin(frags[fi].t * parpadeoSpeed) * 0.4;
            var fSize = 6 + pulso * 3;

            if (frags[fi].fantasma) {
                /* Ligeramente diferente pero difícil de notar */
                ctx.fillStyle = 'rgba(130, 65, 175, ' + (0.5 + pulso * 0.5) + ')';
            } else {
                ctx.fillStyle = 'rgba(120, 60, 180, ' + (0.5 + pulso * 0.5) + ')';
            }

            ctx.beginPath();
            ctx.arc(frags[fi].x, frags[fi].y, fSize, 0, Math.PI * 2);
            ctx.fill();

            /* Glow */
            ctx.fillStyle = 'rgba(155, 89, 182, ' + (pulso * 0.15) + ')';
            ctx.beginPath();
            ctx.arc(frags[fi].x, frags[fi].y, fSize + 10, 0, Math.PI * 2);
            ctx.fill();

            /* Indicador de timer (barra debajo del fragmento) */
            if (!frags[fi].fantasma && timerRatio < 1) {
                ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
                ctx.fillRect(
                    frags[fi].x - 10,
                    frags[fi].y + fSize + 5,
                    20 * timerRatio,
                    2
                );
            }
        }

        /* Entes */
        for (var ei = 0; ei < entes.length; ei++) {
           function dibujarEnte(e, time) {
    var alpha = 0.6 + Math.sin(time * 0.005 + e.x) * 0.2;

    /* Si está cansado, se ve débil */
    if (e.cansado) alpha *= 0.3;

    /* Pulso de detección */
    if (e.pulseAlpha > 0) {
        var pr = 15 + (1 - e.pulseAlpha) * 40;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (e.pulseAlpha * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(e.x, e.y, pr, 0, Math.PI * 2);
        ctx.fill();
    }

    /* Cuerpo */
    ctx.fillStyle = 'rgba(240, 240, 255, ' + alpha + ')';
    ctx.beginPath();
    ctx.arc(e.x, e.y, P_SIZE * 0.7, 0, Math.PI * 2);
    ctx.fill();

    /* Ojo — color según estado */
    var eyeColor;
    if (e.modo === 'chase') {
        eyeColor = 'rgba(220, 50, 50, 0.9)';
    } else if (e.modo === 'alert') {
        /* Parpadea en amarillo cuando te detecta */
        var blink = Math.sin(time * 0.015) > 0 ? 0.9 : 0.3;
        eyeColor = 'rgba(255, 200, 50, ' + blink + ')';
    } else if (e.cansado) {
        eyeColor = 'rgba(80, 80, 100, 0.4)';
    } else {
        eyeColor = 'rgba(100, 100, 140, 0.7)';
    }

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(e.x, e.y, P_SIZE * 0.2, 0, Math.PI * 2);
    ctx.fill();

    /* Glow */
    var glowR = e.modo === 'chase' ? 25 : (e.modo === 'alert' ? 20 : 15);
    var gGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glowR);
    gGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gGrad;
    ctx.beginPath();
    ctx.arc(e.x, e.y, glowR, 0, Math.PI * 2);
    ctx.fill();
}
        }

        /* Meta */
        var totalR = 0;
        for (var mt = 0; mt < frags.length; mt++) {
            if (!frags[mt].fantasma) totalR++;
        }

        if (fragsHave >= totalR && totalR > 0) {
            var mPulse = 0.5 + Math.sin(time * 0.003) * 0.5;
            ctx.fillStyle = 'rgba(155, 89, 182, ' + (0.3 + mPulse * 0.4) + ')';
            ctx.beginPath();
            ctx.arc(metaX, metaY, CELL * 0.6 + mPulse * 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '20px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(155, 89, 182, ' + (0.6 + mPulse * 0.4) + ')';
            ctx.fillText('\uD83D\uDC9C', metaX, metaY);
        }

        /* Máscara de aura */
        var auraBonus = mods.auraBonus || 0;
        var auraR = (AURA_BASE + auraBonus) * saturacion;

        ctx.globalCompositeOperation = 'destination-in';
        var grad = ctx.createRadialGradient(px, py, 0, px, py, auraR);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.7)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.restore();

        /* Fondo blanco */
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'rgb(' + bVal + ',' + bVal + ',' + bVal + ')';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

        /* Jugador */
        dibujarJugador(time);
    }

    function dibujarParedOrganica(x, y, size, time) {
        var wave = Math.sin(time * 0.001 + x * 0.1 + y * 0.1) * 1.5;
        var off = 3;
        ctx.beginPath();
        ctx.moveTo(x + off + wave, y);
        ctx.quadraticCurveTo(x + size / 2, y - wave, x + size - off + wave, y);
        ctx.quadraticCurveTo(x + size + wave, y + size / 2, x + size - off - wave, y + size);
        ctx.quadraticCurveTo(x + size / 2, y + size + wave, x + off - wave, y + size);
        ctx.quadraticCurveTo(x - wave, y + size / 2, x + off + wave, y);
        ctx.fill();
    }

    function dibujarEnte(e, time) {
        var alpha = 0.6 + Math.sin(time * 0.005 + e.x) * 0.2;

        /* Pulso de detección */
        if (e.pulseAlpha > 0) {
            var pr = 15 + (1 - e.pulseAlpha) * 40;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (e.pulseAlpha * 0.3) + ')';
            ctx.beginPath();
            ctx.arc(e.x, e.y, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Cuerpo */
        ctx.fillStyle = 'rgba(240, 240, 255, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(e.x, e.y, P_SIZE * 0.7, 0, Math.PI * 2);
        ctx.fill();

        /* Ojo */
        ctx.fillStyle = e.modo === 'chase' ?
            'rgba(220, 50, 50, 0.9)' :
            'rgba(100, 100, 140, 0.7)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, P_SIZE * 0.2, 0, Math.PI * 2);
        ctx.fill();

        /* Glow */
        var glowR = e.modo === 'chase' ? 25 : 15;
        var gGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glowR);
        gGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, glowR, 0, Math.PI * 2);
        ctx.fill();
    }

    function dibujarJugador(time) {
        var alpha = 0.35 + saturacion * 0.65;

        /* Parpadeo de invulnerabilidad */
        if (invulnTimer > 0 && Math.sin(time * 0.02) > 0) {
            alpha *= 0.3;
        }

        ctx.save();
        ctx.translate(px, py);

        ctx.shadowColor = 'rgba(0,0,0,' + (saturacion * 0.6) + ')';
        ctx.shadowBlur = 12 + saturacion * 12;
        ctx.fillStyle = 'rgba(15, 15, 25, ' + alpha + ')';
        ctx.fillRect(-P_SIZE / 2, -P_SIZE / 2, P_SIZE, P_SIZE);
        ctx.shadowBlur = 0;

        var totalR = 0;
        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].fantasma) totalR++;
        }

        if (fragsHave >= totalR && totalR > 0) {
            ctx.font = (P_SIZE * 0.7) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(155, 89, 182, 0.95)';
            ctx.fillText('\uD83D\uDC9C', 0, 0);
        } else if (fragsHave > 0) {
            var prog = fragsHave / totalR;
            ctx.fillStyle = 'rgba(155, 89, 182, ' + (prog * 0.7) + ')';
            ctx.font = (P_SIZE * 0.4 + prog * P_SIZE * 0.3) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\uD83D\uDC9C', 0, 1);
        } else {
            ctx.globalCompositeOperation = 'destination-out';
            var hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, P_SIZE * 0.28);
            hGrad.addColorStop(0, 'rgba(0,0,0,1)');
            hGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.arc(0, 0, P_SIZE * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
    }

    /* ========================================= */
    /* VICTORIA                                    */
    /* ========================================= */
    function ganar() {
        ganado = true;
        activo = false;
        if (raf) cancelAnimationFrame(raf);

        detenerSonidos();

        if (typeof CorazonDeNoris !== 'undefined') {
            CorazonDeNoris.forjar();
        }

        setTimeout(function () {
            finDiv.style.display = 'flex';
            setTimeout(function () {
                finDiv.classList.add('visible');
                finDiv.style.opacity = '1';
            }, 30);

            var texto = "El vacío ya no está.\nAhora llevas algo dentro.\n\n\uD83D\uDC9C";
            var idx = 0;
            finTexto.innerHTML = '';

            if (typeof iniciarAudioMaquina === 'function') iniciarAudioMaquina();

            var intervalo = setInterval(function () {
                if (idx < texto.length) {
                    if (texto[idx] === '\n') {
                        finTexto.innerHTML += '<br>';
                    } else {
                        finTexto.innerHTML += texto[idx];
                    }
                    idx++;
                } else {
                    clearInterval(intervalo);
                    if (typeof detenerAudioMaquina === 'function') detenerAudioMaquina();
                }
            }, 65);
        }, 1500);
    }

    /* ========================================= */
    /* HUD                                         */
    /* ========================================= */
    function actualizarHUD() {
        var totalR = 0;
        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].fantasma) totalR++;
        }

        if (fragInfo) {
            fragInfo.textContent = fragsHave + '/' + totalR + ' \uD83D\uDDA4';
        }
        if (svgPath) {
            var prog = fragsHave / Math.max(1, totalR);
            svgPath.style.strokeDashoffset = PATH_LEN * (1 - prog);
            if (prog > 0) {
                svgPath.style.stroke = 'rgba(155, 89, 182, ' + (0.3 + prog * 0.7) + ')';
            } else {
                svgPath.style.stroke = 'rgba(155, 89, 182, 0.3)';
            }
        }
    }

function actualizarVidasHUD() {
    if (!colapsoVidas) return;
    var html = '';
    for (var i = 0; i < VIDAS_MAX; i++) {
        if (i < vidas) {
            html += '<span class="sombra-vida-icon activa">\uD83D\uDC9C</span>';
        } else {
            html += '<span class="sombra-vida-icon perdida">\uD83D\uDC94</span>';
        }
    }
    colapsoVidas.innerHTML = html;
}

    /* ========================================= */
    /* INPUT                                       */
    /* ========================================= */
    function registrarInputs() {
        document.addEventListener('keydown', function (e) { keys[e.key] = true; });
        document.addEventListener('keyup', function (e) { keys[e.key] = false; });

        bindTouch('sombra-up', 'up');
        bindTouch('sombra-down', 'down');
        bindTouch('sombra-left', 'left');
        bindTouch('sombra-right', 'right');

        window.addEventListener('resize', function () {
            if (activo && canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                crearCanvasRastro();
            }
        });
    }

    function bindTouch(id, dir) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', function (e) { e.preventDefault(); touchDirs[dir] = true; }, { passive: false });
        el.addEventListener('touchend', function (e) { e.preventDefault(); touchDirs[dir] = false; }, { passive: false });
        el.addEventListener('mousedown', function () { touchDirs[dir] = true; });
        el.addEventListener('mouseup', function () { touchDirs[dir] = false; });
        el.addEventListener('mouseleave', function () { touchDirs[dir] = false; });
    }

})();