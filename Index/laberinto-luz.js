/* ============================================= */
/* LABERINTO DE LA LUZ                             */
/* El Sacrificio y la Memoria                      */
/* Soporta re-inicialización desde menú            */
/* ============================================= */
(function() {
    'use strict';

    /* ---- CONSTANTES ---- */
    var CELL        = 40;
    var P_SIZE      = 16;
    var LUZ_BASE    = 50;
    var SPEED       = 2.8;
    var FLASH_DUR   = 1.2;
    var MAX_LATIDOS = 5;
    var VIDA_MAX    = 1.0;
    var VIDA_COSTO  = 0.2;

    /* ---- ESTADO ---- */
    var fase, canvas, ctx;
    var hudEl, energiaBar, latidosInfo;
    var latidoWrap, btnLatido;
    var corazonFlot, finDiv, finTexto;
    var activo       = false;
    var px, py;
    var grid         = [];
    var gcols, grows;
    var metaX, metaY;
    var raf          = null;
    var prevTime     = 0;
    var keys         = {};
    var ganado       = false;
    var mods         = {};
    var touchDirs    = { up: false, down: false, left: false, right: false };
    var vida         = VIDA_MAX;
    var latidosLeft  = MAX_LATIDOS;
    var flashTimer   = 0;
    var flashActivo  = false;
    var oscuro       = false;
    var vistaPrevia  = true;
    var vistaTimer   = 3;
    var corazonFuerza = 0.3;
    var introHecha   = false;
    var inicializado = false;
    var latidoListenerRegistrado = false;

    /* ========================================= */
    /* OBTENER DOM                                 */
    /* ========================================= */
    function obtenerDOM() {
        fase        = document.getElementById('fase-lab-luz');
        canvas      = document.getElementById('canvas-luz');
        ctx         = canvas.getContext('2d');
        hudEl       = document.getElementById('luz-hud');
        energiaBar  = document.getElementById('luz-energia-bar');
        latidosInfo = document.getElementById('luz-latidos-info');
        latidoWrap  = document.getElementById('luz-latido-wrap');
        btnLatido   = document.getElementById('luz-btn-latido');
        corazonFlot = document.getElementById('luz-corazon-flotante');
        finDiv      = document.getElementById('luz-fin');
        finTexto    = document.getElementById('luz-fin-texto');
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

        px = 0;
        py = 0;
        grid = [];
        gcols = 0;
        grows = 0;
        metaX = 0;
        metaY = 0;
        prevTime = 0;
        ganado = false;
        vida = VIDA_MAX;
        latidosLeft = MAX_LATIDOS;
        flashTimer = 0;
        flashActivo = false;
        oscuro = false;
        vistaPrevia = true;
        vistaTimer = 3;
        introHecha = false;
        touchDirs = { up: false, down: false, left: false, right: false };

        for (var k in keys) {
            keys[k] = false;
        }

        /* Reset DOM */
        if (fase) {
            fase.style.display = 'none';
            fase.style.opacity = '0';
            fase.classList.remove('visible');
        }
        if (hudEl) hudEl.classList.remove('visible');
        if (latidoWrap) latidoWrap.classList.remove('visible');
        if (btnLatido) btnLatido.disabled = false;
        if (finDiv) {
            finDiv.style.display = 'none';
            finDiv.style.opacity = '0';
            finDiv.classList.remove('visible');
        }
        if (finTexto) finTexto.innerHTML = '';
        if (corazonFlot) {
            corazonFlot.style.opacity = '0';
            corazonFlot.style.transition = '';
            corazonFlot.classList.remove('animando');
        }
    }

    /* ========================================= */
    /* API PÚBLICA                                 */
    /* ========================================= */
    window.iniciarLaberintoLuz = function() {
        console.log('☀️ Iniciando laberinto luz');

        obtenerDOM();
        resetearEstado();

        if (typeof CorazonDeNoris !== 'undefined') {
            mods = CorazonDeNoris.mod();
            corazonFuerza = mods.fuerzaCorazon;
        } else {
            mods = { costoFlash: 1.0 };
            corazonFuerza = 0.3;
        }

        if (!inicializado) {
            registrarInputs();
            inicializado = true;
        }

        if (!latidoListenerRegistrado && btnLatido) {
            btnLatido.addEventListener('click', usarLatido);
            latidoListenerRegistrado = true;
        }

        /* Mostrar */
        fase.style.display = 'block';
        fase.style.transition = 'opacity 1.5s ease';

        setTimeout(function() {
            fase.classList.add('visible');
            fase.style.opacity = '1';
        }, 30);

        setTimeout(function() {
            prepararJuego();
            iniciarIntro();
        }, 800);
    };

    /* ========================================= */
    /* GENERACIÓN LABERINTO GEOMÉTRICO             */
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

        px = 1.5 * CELL;
        py = 1.5 * CELL;

        var mx = gcols - 2;
        var my = grows - 2;
        grid[my][mx] = 0;
        grid[my - 1][mx] = 0;
        grid[my][mx - 1] = 0;
        metaX = (mx + 0.5) * CELL;
        metaY = (my + 0.5) * CELL;

        vida = VIDA_MAX;
        latidosLeft = MAX_LATIDOS;
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

    /* ========================================= */
    /* INTRO                                       */
    /* ========================================= */
    function iniciarIntro() {
        hudEl.classList.add('visible');
        latidoWrap.classList.add('visible');

        vistaPrevia = true;
        vistaTimer = 3;
        prevTime = performance.now();
        activo = true;
        loop(prevTime);

        setTimeout(function() {
            animarExtraccion();
        }, 3500);
    }

    function animarExtraccion() {
        vistaPrevia = false;
        oscuro = true;

        if (corazonFlot) {
            corazonFlot.style.transition = 'none';
            corazonFlot.style.left = px + 'px';
            corazonFlot.style.top = py + 'px';
            corazonFlot.style.fontSize = (1.2 + corazonFuerza * 1) + 'rem';

            if (corazonFuerza >= 0.8) {
                corazonFlot.textContent = '\uD83D\uDC9C';
                corazonFlot.style.filter = 'drop-shadow(0 0 10px rgba(155,89,182,0.8))';
                corazonFlot.style.opacity = '1';
            } else {
                corazonFlot.textContent = '\uD83D\uDC9C';
                corazonFlot.style.filter = 'drop-shadow(0 0 3px rgba(155,89,182,0.3))';
                corazonFlot.style.opacity = '0.5';
            }

            corazonFlot.classList.add('animando');

            setTimeout(function() {
                corazonFlot.style.transition = 'all 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                corazonFlot.style.left = metaX + 'px';
                corazonFlot.style.top = metaY + 'px';
            }, 200);

            setTimeout(function() {
                corazonFlot.style.opacity = '0.6';
                introHecha = true;
            }, 3500);
        } else {
            introHecha = true;
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
        if (!introHecha && !vistaPrevia) return;

        if (vistaPrevia) {
            vistaTimer -= dt;
            if (vistaTimer <= 0) vistaPrevia = false;
            return;
        }

        if (flashActivo) {
            flashTimer -= dt;
            if (flashTimer <= 0) {
                flashActivo = false;
                flashTimer = 0;
            }
        }

        var dx = 0, dy = 0;
        if (keys['ArrowUp'] || keys['w'] || keys['W'] || touchDirs.up) dy = -1;
        if (keys['ArrowDown'] || keys['s'] || keys['S'] || touchDirs.down) dy = 1;
        if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchDirs.left) dx = -1;
        if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchDirs.right) dx = 1;

        if (dx !== 0 || dy !== 0) {
            var len = Math.sqrt(dx * dx + dy * dy);
            dx = dx / len * SPEED;
            dy = dy / len * SPEED;

            var nx = px + dx;
            var ny = py + dy;
            if (!colisiona(nx, py)) px = nx;
            if (!colisiona(px, ny)) py = ny;
        }

        if (!ganado) {
            var dmx = px - metaX;
            var dmy = py - metaY;
            if (Math.sqrt(dmx * dmx + dmy * dmy) < CELL) {
                ganar();
            }
        }

        if (vida <= 0 && !ganado) {
            px = 1.5 * CELL;
            py = 1.5 * CELL;
            vida = 0.4;
            latidosLeft = Math.min(latidosLeft + 1, 2);
            actualizarHUD();
        }

        if (energiaBar) {
            energiaBar.style.width = (vida * 100) + '%';
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

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        if (vistaPrevia) {
            var fadeAlpha = Math.min(1, vistaTimer / 2);
            dibujarLaberintoCompleto(fadeAlpha);
            dibujarJugador(time, true);
            return;
        }

        if (flashActivo) {
            var fAlpha = flashTimer / FLASH_DUR;
            dibujarLaberintoCompleto(fAlpha * 0.7);
        }

        var luzR = LUZ_BASE * vida;

        ctx.save();
        dibujarLaberintoGeo();
        dibujarCorazonMeta(time);

        if (!flashActivo) {
            ctx.globalCompositeOperation = 'destination-in';
            var grad = ctx.createRadialGradient(px, py, 0, px, py, luzR);
            grad.addColorStop(0, 'rgba(0,0,0,1)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();

        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

        dibujarJugador(time, false);
    }

    function dibujarLaberintoCompleto(alpha) {
        ctx.fillStyle = 'rgba(60, 40, 80, ' + alpha + ')';
        for (var r = 0; r < grows; r++) {
            for (var c = 0; c < gcols; c++) {
                if (grid[r][c] === 1) {
                    ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                }
            }
        }
        ctx.fillStyle = 'rgba(155, 89, 182, ' + (alpha * 0.08) + ')';
        for (var r2 = 0; r2 < grows; r2++) {
            for (var c2 = 0; c2 < gcols; c2++) {
                if (grid[r2][c2] === 0) {
                    ctx.fillRect(c2 * CELL, r2 * CELL, CELL, CELL);
                }
            }
        }
    }

    function dibujarLaberintoGeo() {
        ctx.fillStyle = 'rgba(50, 35, 70, 0.9)';
        for (var r = 0; r < grows; r++) {
            for (var c = 0; c < gcols; c++) {
                if (grid[r][c] === 1) {
                    ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                    ctx.strokeStyle = 'rgba(80, 50, 120, 0.3)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
                }
            }
        }
        ctx.fillStyle = 'rgba(20, 15, 30, 1)';
        for (var r2 = 0; r2 < grows; r2++) {
            for (var c2 = 0; c2 < gcols; c2++) {
                if (grid[r2][c2] === 0) {
                    ctx.fillRect(c2 * CELL, r2 * CELL, CELL, CELL);
                }
            }
        }
    }

    function dibujarCorazonMeta(time) {
        var pulso = 0.5 + Math.sin(time * 0.002) * 0.5;
        var grad = ctx.createRadialGradient(metaX, metaY, 0, metaX, metaY, 30 + pulso * 15);
        grad.addColorStop(0, 'rgba(155, 89, 182, ' + (0.15 + pulso * 0.15) + ')');
        grad.addColorStop(1, 'rgba(155, 89, 182, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(metaX, metaY, 30 + pulso * 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = (16 + pulso * 4) + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(155, 89, 182, ' + (0.5 + pulso * 0.5) + ')';
        ctx.fillText('\uD83D\uDC9C', metaX, metaY);
    }

    function dibujarJugador(time, preview) {
        ctx.save();
        ctx.translate(px, py);
        var alpha = preview ? 0.9 : (0.3 + vida * 0.7);

        if (!preview) {
            var lGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
            lGrad.addColorStop(0, 'rgba(200, 170, 255, ' + (vida * 0.3) + ')');
            lGrad.addColorStop(1, 'rgba(200, 170, 255, 0)');
            ctx.fillStyle = lGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(200, 180, 230, ' + alpha + ')';
        ctx.shadowColor = 'rgba(155, 89, 182, ' + (vida * 0.5) + ')';
        ctx.shadowBlur = 8 + vida * 8;
        ctx.fillRect(-P_SIZE / 2, -P_SIZE / 2, P_SIZE, P_SIZE);
        ctx.shadowBlur = 0;

        if (!preview && introHecha) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(0, 0, P_SIZE * 0.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.font = (P_SIZE * 0.5) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = corazonFuerza >= 0.8 ? 'rgba(155,89,182,0.9)' : 'rgba(155,89,182,0.3)';
            ctx.fillText('\uD83D\uDC9C', 0, 0);
        }

        ctx.restore();
    }

    /* ========================================= */
    /* LATIDO                                      */
    /* ========================================= */
    function usarLatido() {
        if (!activo || !introHecha || ganado) return;
        if (latidosLeft <= 0 || flashActivo) return;

        latidosLeft--;
        var costo = VIDA_COSTO * (mods.costoFlash || 1);
        vida = Math.max(0.05, vida - costo);

        flashActivo = true;
        flashTimer = FLASH_DUR;

        if (typeof reproducirBurbujaCorta === 'function') reproducirBurbujaCorta();
        actualizarHUD();
    }

    /* ========================================= */
    /* VICTORIA                                    */
    /* ========================================= */
    function ganar() {
        ganado = true;
        activo = false;
        if (raf) cancelAnimationFrame(raf);

        if (typeof CorazonDeNoris !== 'undefined') {
            CorazonDeNoris.completarLuz();
        }

        if (corazonFlot) corazonFlot.style.opacity = '0';

        setTimeout(function() {
            finDiv.style.display = 'flex';
            setTimeout(function() {
                finDiv.classList.add('visible');
                finDiv.style.opacity = '1';
            }, 30);

            var texto;
            if (typeof CorazonDeNoris !== 'undefined' && CorazonDeNoris.tiene()) {
                texto = "Diste todo para llegar.\nPero el corazon que forjaste\nen la oscuridad te sostuvo.\n\nEl amor no es ausencia de vacio.\nEs llenarlo cada dia.\n\n\uD83D\uDC9C";
            } else {
                texto = "Diste todo para llegar.\nCada latido fue un sacrificio.\n\nPero llegaste.\nY eso es lo que importa.\n\n\uD83D\uDC9C";
            }

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
        if (latidosInfo) {
            latidosInfo.innerHTML = '<span>' + latidosLeft + '</span> latidos \uD83D\uDC9C';
        }
        if (btnLatido) {
            btnLatido.disabled = (latidosLeft <= 0);
        }
    }

    /* ========================================= */
    /* INPUT                                       */
    /* ========================================= */
    function registrarInputs() {
        document.addEventListener('keydown', function(e) {
            keys[e.key] = true;
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                usarLatido();
            }
        });
        document.addEventListener('keyup', function(e) { keys[e.key] = false; });

        bindTouch('luz-up', 'up');
        bindTouch('luz-down', 'down');
        bindTouch('luz-left', 'left');
        bindTouch('luz-right', 'right');

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