/* ============================================= */
/* LABERINTO DE LA SOMBRA                          */
/* El Vacío y el Exceso                            */
/* Soporta re-inicialización desde menú            */
/* ============================================= */
(function() {
    'use strict';

    /* ---- CONSTANTES ---- */
    var CELL       = 36;
    var P_SIZE     = 16;
    var AURA_BASE  = 85;
    var FRAG_NEED  = 5;
    var SAT_DECAY  = 0.12;
    var SAT_RECOV  = 0.35;
    var SPEED      = 2.8;
    var PATH_LEN   = 280;

    /* ---- ESTADO (se resetea en cada inicio) ---- */
    var fase, blancoDiv, canvas, ctx;
    var hudEl, fragInfo, barraFill, svgWrap, svgPath;
    var finDiv, finTexto;
    var activo     = false;
    var px, py;
    var frags      = [];
    var fragsHave  = 0;
    var saturacion = 1;
    var enMovimiento = false;
    var grid       = [];
    var gcols, grows;
    var metaX, metaY;
    var raf        = null;
    var prevTime   = 0;
    var keys       = {};
    var ganado     = false;
    var mods       = {};
    var touchDirs  = { up: false, down: false, left: false, right: false };
    var inicializado = false;

    /* ========================================= */
    /* OBTENER REFERENCIAS DOM                     */
    /* Se llama cada vez para asegurar frescura    */
    /* ========================================= */
    function obtenerDOM() {
        fase      = document.getElementById('fase-lab-sombra');
        blancoDiv = document.getElementById('sombra-blanco');
        canvas    = document.getElementById('canvas-sombra');
        ctx       = canvas.getContext('2d');
        hudEl     = document.getElementById('sombra-hud');
        fragInfo  = document.getElementById('sombra-frag-info');
        barraFill = document.getElementById('sombra-barra');
        svgWrap   = document.getElementById('sombra-corazon-svg-wrap');
        svgPath   = document.getElementById('sombra-corazon-path');
        finDiv    = document.getElementById('sombra-fin');
        finTexto  = document.getElementById('sombra-fin-texto');
    }

    /* ========================================= */
    /* RESETEAR ESTADO COMPLETO                    */
    /* ========================================= */
    function resetearEstado() {
        /* Detener loop anterior */
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
        activo = false;

        /* Reset variables */
        px = 0;
        py = 0;
        frags = [];
        fragsHave = 0;
        saturacion = 1;
        enMovimiento = false;
        grid = [];
        gcols = 0;
        grows = 0;
        metaX = 0;
        metaY = 0;
        prevTime = 0;
        ganado = false;
        touchDirs = { up: false, down: false, left: false, right: false };

        /* Reset keys */
        for (var k in keys) {
            keys[k] = false;
        }

        /* Reset DOM visual */
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
        if (hudEl) {
            hudEl.classList.remove('visible');
        }
        if (svgWrap) {
            svgWrap.classList.remove('visible');
        }
        if (finDiv) {
            finDiv.style.display = 'none';
            finDiv.style.opacity = '0';
            finDiv.classList.remove('visible');
        }
        if (finTexto) {
            finTexto.innerHTML = '';
        }
        if (svgPath) {
            svgPath.style.strokeDashoffset = PATH_LEN;
            svgPath.style.stroke = 'rgba(155, 89, 182, 0.3)';
        }
    }

    /* ========================================= */
    /* API PÚBLICA                                 */
    /* ========================================= */
    window.iniciarLaberintoSombra = function() {
        console.log('🌑 Iniciando laberinto sombra');

        /* Obtener DOM fresco */
        obtenerDOM();

        /* Resetear todo */
        resetearEstado();

        /* Obtener modificadores */
        if (typeof CorazonDeNoris !== 'undefined') {
            mods = CorazonDeNoris.mod();
        } else {
            mods = { intensidadBlanco: 1.0 };
        }

        /* Registrar inputs solo una vez */
        if (!inicializado) {
            registrarInputs();
            inicializado = true;
        }

        /* Mostrar fase */
        fase.style.display = 'block';
        fase.style.transition = 'opacity 1.5s ease';

        setTimeout(function() {
            fase.classList.add('visible');
            fase.style.opacity = '1';
        }, 30);

        /* Blanco cegador */
        setTimeout(function() {
            blancoDiv.style.transition = 'opacity 0.5s ease';
            blancoDiv.style.opacity = '1';
            blancoDiv.classList.add('visible');
        }, 200);

        /* Preparar y empezar */
        setTimeout(function() {
            prepararJuego();

            blancoDiv.style.transition = 'opacity 3s ease';
            blancoDiv.style.opacity = '0';
            blancoDiv.classList.remove('visible');

            hudEl.classList.add('visible');
            svgWrap.classList.add('visible');

            setTimeout(function() {
                activo = true;
                prevTime = performance.now();
                loop(prevTime);
            }, 1500);
        }, 2500);
    };

    /* ========================================= */
    /* GENERACIÓN DE LABERINTO                     */
    /* ========================================= */
    function prepararJuego() {
        canvas.width  = window.innerWidth;
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

        /* DFS */
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

        /* Pasillos extras para orgánico */
        var extras = Math.floor(gcols * grows * 0.05);
        for (var i = 0; i < extras; i++) {
            var ex = Math.floor(Math.random() * (gcols - 2)) + 1;
            var ey = Math.floor(Math.random() * (grows - 2)) + 1;
            grid[ey][ex] = 0;
        }

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

        /* Fragmentos */
        fragsHave = 0;
        frags = [];
        var libres = [];
        for (var ry = 2; ry < grows - 2; ry++) {
            for (var rx = 2; rx < gcols - 2; rx++) {
                if (grid[ry][rx] === 0) {
                    var d = Math.abs(rx - 1) + Math.abs(ry - 1);
                    if (d > 5) libres.push({ x: rx, y: ry });
                }
            }
        }
        shuffle(libres);
        for (var f = 0; f < Math.min(FRAG_NEED, libres.length); f++) {
            frags.push({
                x: (libres[f].x + 0.5) * CELL,
                y: (libres[f].y + 0.5) * CELL,
                vivo: true,
                t: Math.random() * 6.28
            });
        }

        saturacion = 1;
        ganado = false;
        actualizarHUD();
    }

    function vecinos(x, y) {
        var dirs = [{ x: x + 2, y: y }, { x: x - 2, y: y }, { x: x, y: y + 2 }, { x: x, y: y - 2 }];
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
        }

        /* Saturación */
        if (enMovimiento) {
            saturacion = Math.min(1, saturacion + SAT_RECOV * dt);
        } else {
            saturacion = Math.max(0.08, saturacion - SAT_DECAY * dt);
        }

        /* Recoger fragmentos */
        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].vivo) continue;
            var fdx = px - frags[i].x;
            var fdy = py - frags[i].y;
            if (Math.sqrt(fdx * fdx + fdy * fdy) < CELL * 0.7) {
                frags[i].vivo = false;
                fragsHave++;
                actualizarHUD();
                if (typeof reproducirBurbujaCorta === 'function') reproducirBurbujaCorta();
            }
        }

        /* Victoria */
        if (fragsHave >= frags.length && frags.length > 0 && !ganado) {
            var dmx = px - metaX;
            var dmy = py - metaY;
            if (Math.sqrt(dmx * dmx + dmy * dmy) < CELL) {
                ganar();
            }
        }

        /* Actualizar barra */
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

        /* Paredes orgánicas */
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

        /* Fragmentos */
        for (var i = 0; i < frags.length; i++) {
            if (!frags[i].vivo) continue;
            frags[i].t += 0.03;
            var pulso = 0.6 + Math.sin(frags[i].t) * 0.4;
            var fSize = 6 + pulso * 3;

            ctx.fillStyle = 'rgba(120, 60, 180, ' + (0.5 + pulso * 0.5) + ')';
            ctx.beginPath();
            ctx.arc(frags[i].x, frags[i].y, fSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(155, 89, 182, ' + (pulso * 0.15) + ')';
            ctx.beginPath();
            ctx.arc(frags[i].x, frags[i].y, fSize + 10, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Meta */
        if (fragsHave >= frags.length && frags.length > 0) {
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
        var auraR = AURA_BASE * saturacion;
        ctx.globalCompositeOperation = 'destination-in';
        var grad = ctx.createRadialGradient(px, py, 0, px, py, auraR);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.7)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.restore();

        /* Fondo blanco detrás */
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

    function dibujarJugador(time) {
        var alpha = 0.35 + saturacion * 0.65;
        ctx.save();
        ctx.translate(px, py);

        ctx.shadowColor = 'rgba(0,0,0,' + (saturacion * 0.6) + ')';
        ctx.shadowBlur = 12 + saturacion * 12;
        ctx.fillStyle = 'rgba(15, 15, 25, ' + alpha + ')';
        ctx.fillRect(-P_SIZE / 2, -P_SIZE / 2, P_SIZE, P_SIZE);
        ctx.shadowBlur = 0;

        var holeR = P_SIZE * 0.28;

        if (fragsHave >= frags.length && frags.length > 0) {
            ctx.font = (P_SIZE * 0.7) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(155, 89, 182, 0.95)';
            ctx.fillText('\uD83D\uDC9C', 0, 0);
        } else if (fragsHave > 0) {
            var prog = fragsHave / frags.length;
            ctx.fillStyle = 'rgba(155, 89, 182, ' + (prog * 0.7) + ')';
            ctx.font = (P_SIZE * 0.4 + prog * P_SIZE * 0.3) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\uD83D\uDC9C', 0, 1);
        } else {
            ctx.globalCompositeOperation = 'destination-out';
            var hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, holeR);
            hGrad.addColorStop(0, 'rgba(0,0,0,1)');
            hGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.arc(0, 0, holeR, 0, Math.PI * 2);
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

        if (typeof CorazonDeNoris !== 'undefined') {
            CorazonDeNoris.forjar();
        }

        setTimeout(function() {
            finDiv.style.display = 'flex';
            setTimeout(function() {
                finDiv.classList.add('visible');
                finDiv.style.opacity = '1';
            }, 30);

            var texto = "El vacio ya no esta.\nAhora llevas algo dentro.\n\n\uD83D\uDC9C";
            var idx = 0;
            finTexto.innerHTML = '';

            if (typeof iniciarAudioMaquina === 'function') iniciarAudioMaquina();

            var intervalo = setInterval(function() {
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
        if (fragInfo) {
            fragInfo.textContent = fragsHave + '/' + frags.length + ' \uD83D\uDDA4';
        }
        if (svgPath) {
            var prog = fragsHave / Math.max(1, frags.length);
            svgPath.style.strokeDashoffset = PATH_LEN * (1 - prog);
            if (prog > 0) {
                svgPath.style.stroke = 'rgba(155, 89, 182, ' + (0.3 + prog * 0.7) + ')';
            }
        }
    }

    /* ========================================= */
    /* INPUT (se registra una sola vez)            */
    /* ========================================= */
    function registrarInputs() {
        document.addEventListener('keydown', function(e) { keys[e.key] = true; });
        document.addEventListener('keyup', function(e) { keys[e.key] = false; });

        bindTouch('sombra-up', 'up');
        bindTouch('sombra-down', 'down');
        bindTouch('sombra-left', 'left');
        bindTouch('sombra-right', 'right');

        window.addEventListener('resize', function() {
            if (activo && canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });
    }

    function bindTouch(id, dir) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', function(e) { e.preventDefault(); touchDirs[dir] = true; }, { passive: false });
        el.addEventListener('touchend', function(e) { e.preventDefault(); touchDirs[dir] = false; }, { passive: false });
        el.addEventListener('mousedown', function() { touchDirs[dir] = true; });
        el.addEventListener('mouseup', function() { touchDirs[dir] = false; });
        el.addEventListener('mouseleave', function() { touchDirs[dir] = false; });
    }

})();