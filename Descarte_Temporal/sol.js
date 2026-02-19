/* ============================================= */
/* SOL Y NUBES - Sistema interactivo               */
/* ============================================= */

(function() {
    'use strict';

    /* ========================================= */
    /* REFERENCIAS AL DOM                         */
    /* ========================================= */
    var faseSol = document.getElementById('fase-sol');
    var solFondo = document.getElementById('sol-fondo');
    var solCentro = document.getElementById('sol-centro');
    var solRayos = document.getElementById('sol-rayos');
    var nubesCanvas = document.getElementById('nubes-canvas');
    var solInstruccion = document.getElementById('sol-instruccion');
    var solMensajeContainer = document.getElementById('sol-mensaje-container');
    var solMensajeTexto = document.getElementById('sol-mensaje-texto');
    var solFaseTiempo = document.getElementById('sol-fase-tiempo');
    var tiempoTexto = document.getElementById('tiempo-texto');
    var tiempoBotonContainer = document.getElementById('tiempo-boton-container');
    var tiempoBoton = document.getElementById('tiempo-boton');

    var ctx = nubesCanvas.getContext('2d');

    /* ========================================= */
    /* VARIABLES DE ESTADO                        */
    /* ========================================= */
    var nubes = [];
    var porcentajeDescubierto = 0;
    var solDescubierto = false;
    var solTocado = false;
    var pintando = false;
    var radioLimpieza = 35;
    var animacionActiva = false;

    /* ========================================= */
    /* FUNCIÓN PÚBLICA: iniciar fase sol           */
    /* Se llama desde index.js                     */
    /* ========================================= */
    window.iniciarFaseSol = function() {
        faseSol.style.display = 'block';

        requestAnimationFrame(function() {
            faseSol.classList.add('visible');
        });

        setTimeout(function() {
            inicializarNubes();
            animacionActiva = true;
            dibujarNubes();
        }, 500);
    };

    /* ========================================= */
    /* SISTEMA DE NUBES EN CANVAS                  */
    /* ========================================= */
    function inicializarNubes() {
        nubesCanvas.width = window.innerWidth;
        nubesCanvas.height = window.innerHeight;

        // Crear capa de nubes (pintar todo de gris/blanco nebuloso)
        dibujarCapaNubes();
    }

    function dibujarCapaNubes() {
        // Fondo de nubes denso
        ctx.fillStyle = 'rgba(180, 180, 200, 0.85)';
        ctx.fillRect(0, 0, nubesCanvas.width, nubesCanvas.height);

        // Textura de nubes con círculos superpuestos
        var numNubes = 60;
        for (var i = 0; i < numNubes; i++) {
            var x = Math.random() * nubesCanvas.width;
            var y = Math.random() * nubesCanvas.height;
            var radio = Math.random() * 120 + 60;
            var alpha = Math.random() * 0.4 + 0.3;

            var gradiente = ctx.createRadialGradient(x, y, 0, x, y, radio);
            gradiente.addColorStop(0, 'rgba(220, 220, 235, ' + alpha + ')');
            gradiente.addColorStop(0.5, 'rgba(200, 200, 218, ' + (alpha * 0.7) + ')');
            gradiente.addColorStop(1, 'rgba(180, 180, 200, 0)');

            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(x, y, radio, 0, Math.PI * 2);
            ctx.fill();
        }

        // Capa más densa en el centro (sobre el sol)
        var cx = nubesCanvas.width / 2;
        var cy = nubesCanvas.height / 2;

        for (var j = 0; j < 15; j++) {
            var nx = cx + (Math.random() - 0.5) * 200;
            var ny = cy + (Math.random() - 0.5) * 200;
            var nr = Math.random() * 80 + 40;

            var g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
            g.addColorStop(0, 'rgba(210, 210, 225, 0.7)');
            g.addColorStop(1, 'rgba(190, 190, 210, 0)');

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function limpiarNubes(x, y) {
        ctx.globalCompositeOperation = 'destination-out';

        var gradiente = ctx.createRadialGradient(x, y, 0, x, y, radioLimpieza);
        gradiente.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradiente.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
        gradiente.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(x, y, radioLimpieza, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';

        calcularDescubierto();
    }

    function calcularDescubierto() {
        var cx = nubesCanvas.width / 2;
        var cy = nubesCanvas.height / 2;
        var radioMuestra = 80;

        var imageData = ctx.getImageData(
            Math.max(0, cx - radioMuestra),
            Math.max(0, cy - radioMuestra),
            radioMuestra * 2,
            radioMuestra * 2
        );

        var pixeles = imageData.data;
        var transparentes = 0;
        var total = 0;

        for (var i = 3; i < pixeles.length; i += 4) {
            total++;
            if (pixeles[i] < 50) {
                transparentes++;
            }
        }

        porcentajeDescubierto = transparentes / total;

        // Si más del 60% del área central está limpio
        if (porcentajeDescubierto > 0.6 && !solDescubierto) {
            descubrirSol();
        }
    }

    function descubrirSol() {
        solDescubierto = true;

        // Ocultar instrucción
        solInstruccion.classList.add('oculto');

        // Activar atardecer
        solFondo.classList.add('atardecer');

        // Descubrir sol
        solCentro.classList.add('descubierto');

        // Mostrar rayos
        solRayos.classList.add('visible');

        // Limpiar nubes restantes gradualmente
        setTimeout(function() {
            limpiarTodasLasNubes();
        }, 1500);
    }

    function limpiarTodasLasNubes() {
        var opacidad = 1;
        var intervalo = setInterval(function() {
            opacidad -= 0.03;
            nubesCanvas.style.opacity = opacidad;
            if (opacidad <= 0) {
                clearInterval(intervalo);
                nubesCanvas.style.display = 'none';
            }
        }, 50);
    }

    /* ========================================= */
    /* EVENTOS DE ARRASTRE (mouse + touch)         */
    /* ========================================= */
    function obtenerPosicion(e) {
        var rect = nubesCanvas.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    nubesCanvas.addEventListener('mousedown', function(e) {
        pintando = true;
        var pos = obtenerPosicion(e);
        limpiarNubes(pos.x, pos.y);
    });

    nubesCanvas.addEventListener('mousemove', function(e) {
        if (!pintando) return;
        var pos = obtenerPosicion(e);
        limpiarNubes(pos.x, pos.y);
    });

    nubesCanvas.addEventListener('mouseup', function() {
        pintando = false;
    });

    nubesCanvas.addEventListener('mouseleave', function() {
        pintando = false;
    });

    nubesCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        pintando = true;
        var pos = obtenerPosicion(e);
        limpiarNubes(pos.x, pos.y);
    }, { passive: false });

    nubesCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!pintando) return;
        var pos = obtenerPosicion(e);
        limpiarNubes(pos.x, pos.y);
    }, { passive: false });

    nubesCanvas.addEventListener('touchend', function() {
        pintando = false;
    });

    /* ========================================= */
    /* TOCAR EL SOL                                */
    /* ========================================= */
    solCentro.addEventListener('click', function() {
        if (!solDescubierto || solTocado) return;
        solTocado = true;

        // Reproducir sonido
        if (typeof reproducirBurbujaCorta === 'function') {
            reproducirBurbujaCorta();
        }

        // Flash de luz al tocar
        solCentro.style.transition = 'all 1s ease';
        solCentro.style.boxShadow =
            '0 0 60px rgba(255, 255, 255, 1), ' +
            '0 0 120px rgba(255, 241, 118, 0.8), ' +
            '0 0 200px rgba(249, 168, 37, 0.6)';

        // Fade out del sol y rayos
        setTimeout(function() {
            solCentro.style.opacity = '0';
            solRayos.style.opacity = '0';

            // Mostrar primer mensaje
            setTimeout(function() {
                mostrarMensajeSol();
            }, 1200);
        }, 1500);
    });

    /* ========================================= */
    /* MENSAJES DESPUÉS DEL SOL                    */
    /* ========================================= */
    function mostrarMensajeSol() {
        solMensajeContainer.style.display = 'block';

        if (typeof iniciarAudioMaquina === 'function') {
            iniciarAudioMaquina();
        }

        var textoCompleto = "¿Puede algo finito crear cosas infinitas?";
        var letraActual = 0;

        solMensajeTexto.innerHTML = '<span class="cursor-easter">|</span>';

        requestAnimationFrame(function() {
            solMensajeContainer.classList.add('visible');
        });

        var intervaloMsg = setInterval(function() {
            if (letraActual < textoCompleto.length) {
                var cursorSol = solMensajeTexto.querySelector('.cursor-easter');
                if (cursorSol) {
                    var nodo = document.createTextNode(textoCompleto[letraActual]);
                    cursorSol.parentNode.insertBefore(nodo, cursorSol);
                }
                letraActual++;
            } else {
                clearInterval(intervaloMsg);

                if (typeof detenerAudioMaquina === 'function') {
                    detenerAudioMaquina();
                }

                var cursorSol = solMensajeTexto.querySelector('.cursor-easter');
                if (cursorSol) {
                    setTimeout(function() { cursorSol.style.display = 'none'; }, 800);
                }

                // Después de mostrar, transición a la fase del tiempo
                setTimeout(function() {
                    transicionAFaseTiempo();
                }, 3000);
            }
        }, 70);
    }

    function transicionAFaseTiempo() {
        // Fade out del mensaje del sol
        solMensajeContainer.classList.remove('visible');

        // Cambiar fondo a algo más oscuro/púrpura
        solFondo.style.transition = 'background 2s ease';
        solFondo.style.background = 'linear-gradient(180deg, #0a0a14 0%, #150d25 30%, #1a1030 60%, #0d0a18 100%)';

        setTimeout(function() {
            solMensajeContainer.style.display = 'none';

            // Mostrar fase tiempo
            solFaseTiempo.style.display = 'block';

            if (typeof reproducirBurbujaCorta === 'function') {
                reproducirBurbujaCorta();
            }

            if (typeof iniciarAudioMaquina === 'function') {
                iniciarAudioMaquina();
            }

            var textoTiempo = "El tiempo es una de las tantas cosas infinitas que conviven con lo efímero";
            var letraTiempo = 0;

            tiempoTexto.innerHTML = '<span class="cursor-easter">|</span>';

            requestAnimationFrame(function() {
                solFaseTiempo.classList.add('visible');
            });

            var intervaloTiempo = setInterval(function() {
                if (letraTiempo < textoTiempo.length) {
                    var cursorT = tiempoTexto.querySelector('.cursor-easter');
                    if (cursorT) {
                        var nodo = document.createTextNode(textoTiempo[letraTiempo]);
                        cursorT.parentNode.insertBefore(nodo, cursorT);
                    }
                    letraTiempo++;
                } else {
                    clearInterval(intervaloTiempo);

                    if (typeof detenerAudioMaquina === 'function') {
                        detenerAudioMaquina();
                    }

                    var cursorT = tiempoTexto.querySelector('.cursor-easter');
                    if (cursorT) {
                        setTimeout(function() { cursorT.style.display = 'none'; }, 800);
                    }

                    // Mostrar botón del reloj
                    setTimeout(function() {
                        tiempoBotonContainer.classList.add('visible');
                    }, 1200);
                }
            }, 60);
        }, 1500);
    }

    /* ========================================= */
    /* BOTÓN RELOJ → IR A RELOJ.HTML               */
    /* ========================================= */
    tiempoBoton.addEventListener('click', function() {
        if (typeof reproducirBurbujaCorta === 'function') {
            reproducirBurbujaCorta();
        }

        // Fade out
        faseSol.style.transition = 'opacity 1.5s ease';
        faseSol.style.opacity = '0';

        setTimeout(function() {
            // Navegar al reloj de arena
            window.location.href = '../Reloj_de_arena/reloj.html';
        }, 1600);
    });

    /* ========================================= */
    /* RESIZE                                      */
    /* ========================================= */
    window.addEventListener('resize', function() {
        if (faseSol.style.display !== 'none' && !solDescubierto) {
            nubesCanvas.width = window.innerWidth;
            nubesCanvas.height = window.innerHeight;
            dibujarCapaNubes();
        }
    });

    /* ========================================= */
    /* ANIMACIÓN LOOP (partículas de luz)           */
    /* ========================================= */
    function dibujarNubes() {
        if (!animacionActiva) return;
        requestAnimationFrame(dibujarNubes);
    }

})();