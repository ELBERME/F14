/* ============================================= */
/* SISTEMA DE PROGRESO Y NAVEGACIÓN                */
/* - Solo muestra secciones desbloqueadas          */
/* - Secciones bloqueadas ocultan su contenido     */
/* - Navegación resetea estado correctamente        */
/* ============================================= */
(function() {
    'use strict';

    /* ========================================= */
    /* DEFINICIÓN DE SECCIONES                     */
    /* nombre_oculto: lo que ve si NO lo desbloqueó */
    /* ========================================= */
    var SECCIONES = [
        {
            id: 'frase',
            nombre: 'Frase del día',
            nombre_oculto: '· · ·',
            emoji: '📝',
            emoji_oculto: '·',
            grupo: 'inicio'
        },
        {
            id: 'gatito',
            nombre: 'Gatito',
            nombre_oculto: '· · ·',
            emoji: '🐱',
            emoji_oculto: '·',
            grupo: 'inicio'
        },
        {
            id: 'mensajes',
            nombre: 'Mensajes secretos',
            nombre_oculto: '· · ·',
            emoji: '💬',
            emoji_oculto: '·',
            grupo: 'secreto'
        },
        {
            id: 'teamo',
            nombre: '???',
            nombre_oculto: '· · ·',
            emoji: '💜',
            emoji_oculto: '·',
            grupo: 'secreto'
        },
        {
            id: 'easter',
            nombre: '???',
            nombre_oculto: '· · ·',
            emoji: '🥚',
            emoji_oculto: '·',
            grupo: 'secreto'
        },
        {
            id: 'eleccion',
            nombre: 'Elegir',
            nombre_oculto: '· · ·',
            emoji: '⚖️',
            emoji_oculto: '·',
            grupo: 'final'
        },
        {
            id: 'lab-luz',
            nombre: 'Laberinto Luz',
            nombre_oculto: '· · ·',
            emoji: '☀️',
            emoji_oculto: '·',
            grupo: 'final'
        },
        {
            id: 'lab-sombra',
            nombre: 'Laberinto Sombra',
            nombre_oculto: '· · ·',
            emoji: '🌑',
            emoji_oculto: '·',
            grupo: 'final'
        }
    ];

    var TOTAL_SECCIONES = SECCIONES.length;

    /* ========================================= */
    /* PROGRESO EN LOCALSTORAGE                    */
    /* ========================================= */
    var datosProgreso = localStorage.getItem('noris_progreso');
    var progreso;

    if (datosProgreso) {
        progreso = JSON.parse(datosProgreso);
    } else {
        progreso = {
            desbloqueadas: ['frase'],
            seccionActual: 'frase'
        };
    }

    function guardarProgreso() {
        localStorage.setItem('noris_progreso', JSON.stringify(progreso));
    }

    /* ========================================= */
    /* API PÚBLICA: window.Progreso                */
    /* ========================================= */
    window.Progreso = {
        desbloquear: function(seccionId) {
            if (progreso.desbloqueadas.indexOf(seccionId) === -1) {
                progreso.desbloqueadas.push(seccionId);
                console.log('🔓 Desbloqueado: ' + seccionId);
            }
            progreso.seccionActual = seccionId;
            guardarProgreso();
            actualizarMenu();
        },
        esta: function(seccionId) {
            return progreso.desbloqueadas.indexOf(seccionId) !== -1;
        },
        reset: function() {
            progreso = { desbloqueadas: ['frase'], seccionActual: 'frase' };
            guardarProgreso();
            actualizarMenu();
            console.log('🔄 Progreso reseteado');
        }
    };

    /* ========================================= */
    /* LIMPIAR TODO EL ESTADO                      */
    /* Detiene audios, intervalos, animaciones      */
    /* ========================================= */
    function limpiarTodo() {
        /* Detener todos los audios */
        var audios = document.querySelectorAll('audio');
        for (var a = 0; a < audios.length; a++) {
            audios[a].pause();
            audios[a].currentTime = 0;
        }

        /* Detener intervalos globales conocidos */
        if (typeof intervaloTexto !== 'undefined' && intervaloTexto) {
            clearInterval(intervaloTexto);
            intervaloTexto = null;
        }
        if (typeof intervaloGif !== 'undefined' && intervaloGif) {
            clearInterval(intervaloGif);
            intervaloGif = null;
        }
        if (typeof typewriterMensajeIntervalo !== 'undefined' && typewriterMensajeIntervalo) {
            clearInterval(typewriterMensajeIntervalo);
            typewriterMensajeIntervalo = null;
        }
        if (typeof easterTypewriterIntervalo !== 'undefined' && easterTypewriterIntervalo) {
            clearInterval(easterTypewriterIntervalo);
            easterTypewriterIntervalo = null;
        }

        /* Ocultar TODAS las fases */
        var fases = [
            'fase-video', 'fase-gif', 'fase-mensajes',
            'fase-easter', 'fase-final',
            'fase-lab-sombra', 'fase-lab-luz'
        ];

        for (var i = 0; i < fases.length; i++) {
            var el = document.getElementById(fases[i]);
            if (el) {
                el.style.display = 'none';
                el.style.opacity = '0';
                el.style.transition = 'none';
                el.classList.remove('visible');
            }
        }

        /* Ocultar botón inicio */
        var btnInicio = document.getElementById('boton-inicio');
        if (btnInicio) btnInicio.style.display = 'none';

        /* Resetear video */
        var videoFondo = document.getElementById('video-fondo');
        if (videoFondo) {
            videoFondo.pause();
            videoFondo.currentTime = 0;
        }
        var videoBorroso = document.getElementById('video-borroso');
        if (videoBorroso) {
            videoBorroso.pause();
            videoBorroso.currentTime = 0;
        }

        /* Pequeña pausa para que se apliquen los display:none */
        return new Promise(function(resolve) {
            setTimeout(resolve, 50);
        });
    }

    /* ========================================= */
    /* CREAR MENÚ                                  */
    /* ========================================= */
    function crearMenu() {
        var boton = document.createElement('button');
        boton.id = 'nav-boton';
        boton.innerHTML = '💜';
        document.body.appendChild(boton);

        var overlay = document.createElement('div');
        overlay.id = 'nav-overlay';
        document.body.appendChild(overlay);

        var panel = document.createElement('div');
        panel.id = 'nav-panel';

        var titulo = document.createElement('div');
        titulo.id = 'nav-titulo';
        titulo.textContent = '💜 Noris 💜';
        panel.appendChild(titulo);

        var grupoAnterior = '';

        for (var i = 0; i < SECCIONES.length; i++) {
            var sec = SECCIONES[i];

            if (sec.grupo !== grupoAnterior && grupoAnterior !== '') {
                var sep = document.createElement('div');
                sep.className = 'nav-separador';
                panel.appendChild(sep);
            }
            grupoAnterior = sec.grupo;

            var item = document.createElement('div');
            item.className = 'nav-item';
            item.setAttribute('data-seccion', sec.id);

            var emoji = document.createElement('span');
            emoji.className = 'nav-item-emoji';

            var nombre = document.createElement('span');
            nombre.className = 'nav-item-nombre';

            item.appendChild(emoji);
            item.appendChild(nombre);
            panel.appendChild(item);

            (function(secId) {
                item.addEventListener('click', function() {
                    if (this.classList.contains('bloqueado')) return;
                    cerrarMenu();
                    navegarA(secId);
                });
            })(sec.id);
        }

        var pie = document.createElement('div');
        pie.id = 'nav-pie';
        pie.innerHTML =
            '<div id="nav-progreso-texto"></div>' +
            '<div id="nav-progreso-barra-wrap">' +
            '<div id="nav-progreso-barra"></div>' +
            '</div>';
        panel.appendChild(pie);

        document.body.appendChild(panel);

        boton.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', cerrarMenu);

        setTimeout(function() {
            boton.classList.add('visible');
        }, 3000);

        actualizarMenu();
    }

    /* ========================================= */
    /* ABRIR / CERRAR                              */
    /* ========================================= */
    var menuAbierto = false;

    function toggleMenu() {
        if (menuAbierto) cerrarMenu();
        else abrirMenu();
    }

    function abrirMenu() {
        menuAbierto = true;
        document.getElementById('nav-boton').classList.add('abierto');
        document.getElementById('nav-panel').classList.add('abierto');
        document.getElementById('nav-overlay').classList.add('visible');
    }

    function cerrarMenu() {
        menuAbierto = false;
        document.getElementById('nav-boton').classList.remove('abierto');
        document.getElementById('nav-panel').classList.remove('abierto');
        document.getElementById('nav-overlay').classList.remove('visible');
    }

    /* ========================================= */
    /* ACTUALIZAR MENÚ                             */
    /* Bloqueados: no muestran nombre ni emoji      */
    /* ========================================= */
    function actualizarMenu() {
        var items = document.querySelectorAll('.nav-item');

        for (var i = 0; i < items.length; i++) {
            var secId = items[i].getAttribute('data-seccion');
            var secData = null;

            for (var j = 0; j < SECCIONES.length; j++) {
                if (SECCIONES[j].id === secId) {
                    secData = SECCIONES[j];
                    break;
                }
            }

            if (!secData) continue;

            var desbloqueada = progreso.desbloqueadas.indexOf(secId) !== -1;
            var emojiEl = items[i].querySelector('.nav-item-emoji');
            var nombreEl = items[i].querySelector('.nav-item-nombre');

            items[i].classList.remove('bloqueado', 'activo');

            if (desbloqueada) {
                /* DESBLOQUEADO: mostrar nombre y emoji real */
                emojiEl.textContent = secData.emoji;
                nombreEl.textContent = secData.nombre;
            } else {
                /* BLOQUEADO: ocultar todo */
                emojiEl.textContent = secData.emoji_oculto;
                nombreEl.textContent = secData.nombre_oculto;
                items[i].classList.add('bloqueado');
            }

            if (secId === progreso.seccionActual && desbloqueada) {
                items[i].classList.add('activo');
            }
        }

        /* Barra de progreso */
        var barra = document.getElementById('nav-progreso-barra');
        var texto = document.getElementById('nav-progreso-texto');
        if (barra) {
            barra.style.width = (progreso.desbloqueadas.length / TOTAL_SECCIONES * 100) + '%';
        }
        if (texto) {
            texto.textContent = progreso.desbloqueadas.length + '/' + TOTAL_SECCIONES;
        }
    }

    /* ========================================= */
    /* NAVEGACIÓN A SECCIONES                      */
    /* ========================================= */
    function navegarA(seccionId) {
        console.log('🧭 Navegando a: ' + seccionId);

        limpiarTodo().then(function() {
            progreso.seccionActual = seccionId;
            guardarProgreso();
            actualizarMenu();

            switch (seccionId) {
                case 'frase':      irAFrase(); break;
                case 'gatito':     irAGatito(); break;
                case 'mensajes':   irAMensajes(); break;
                case 'teamo':      irATeAmo(); break;
                case 'easter':     irAEaster(); break;
                case 'eleccion':   irAEleccion(); break;
                case 'lab-luz':    irALabLuz(); break;
                case 'lab-sombra': irALabSombra(); break;
            }
        });
    }

    /* ========================================= */
    /* IR A: FRASE DEL DÍA                         */
    /* ========================================= */
    function irAFrase() {
        var faseVideo = document.getElementById('fase-video');
        var videoFondo = document.getElementById('video-fondo');
        var textoAnimado = document.getElementById('texto-animado');
        var cursorEl = document.getElementById('cursor');
        var overlayOscuro = document.getElementById('overlay-oscuro');

        /* Resetear estado */
        if (typeof transicionEjecutada !== 'undefined') transicionEjecutada = false;
        if (typeof fase1TextoCompleto !== 'undefined') fase1TextoCompleto = true;
        if (typeof fase1Saltada !== 'undefined') fase1Saltada = true;
        if (typeof indiceLetra !== 'undefined') indiceLetra = 9999;

        /* Mostrar frase completa */
        var fraseTexto = '';
        if (typeof MENSAJE !== 'undefined') {
            fraseTexto = MENSAJE;
        } else if (typeof FRASE_DEL_DIA !== 'undefined') {
            fraseTexto = FRASE_DEL_DIA;
        }
        textoAnimado.innerHTML = fraseTexto.replace(/\n/g, '<br>');
        if (cursorEl) cursorEl.style.display = 'none';

        /* Mostrar */
        faseVideo.style.transition = 'opacity 0.8s ease';
        faseVideo.style.display = 'block';

        setTimeout(function() {
            faseVideo.style.opacity = '1';
        }, 30);

        /* Video de fondo */
        videoFondo.currentTime = 0;
        videoFondo.playbackRate = 1;
        videoFondo.play().catch(function(e) {});

        /* Audio */
        var audioPrincipal = document.getElementById('audio-principal');
        if (audioPrincipal) {
            audioPrincipal.currentTime = 0;
            audioPrincipal.play().catch(function(e) {});
        }

        /* Click para avanzar a gatito */
        function clickFrase(e) {
            faseVideo.removeEventListener('click', clickFrase);
            if (typeof transicionEjecutada !== 'undefined') transicionEjecutada = false;
            if (typeof transicionAFase2 === 'function') {
                transicionAFase2();
            }
        }
        /* Pequeño delay para no capturar el click del menú */
        setTimeout(function() {
            faseVideo.addEventListener('click', clickFrase);
        }, 500);
    }

    /* ========================================= */
    /* IR A: GATITO                                */
    /* ========================================= */
    function irAGatito() {
        var faseGif = document.getElementById('fase-gif');
        var contenedorGif = document.getElementById('contenedor-gif');
        var textoFinalEl = document.getElementById('texto-final');
        var videoBorroso = document.getElementById('video-borroso');
        var marcoGif = document.getElementById('marco-gif');
        var gifGato = document.getElementById('gif-gato');

        /* Reset estado */
        if (typeof mensajesActivados !== 'undefined') mensajesActivados = false;

        /* Mostrar */
        faseGif.style.transition = 'opacity 0.8s ease';
        faseGif.style.display = 'block';

        setTimeout(function() {
            faseGif.style.opacity = '1';
            contenedorGif.classList.add('visible');
            textoFinalEl.classList.add('visible');
        }, 30);

        /* Video borroso */
        videoBorroso.currentTime = 0;
        videoBorroso.play().catch(function(e) {});

        /* Audio */
        var audioBurbuja = document.getElementById('audio-burbuja');
        if (audioBurbuja) {
            audioBurbuja.volume = 0.5;
            audioBurbuja.currentTime = 0;
            audioBurbuja.play().catch(function(e) {});
        }

        /* Animación gif */
        if (typeof intervaloGif !== 'undefined' && intervaloGif) {
            clearInterval(intervaloGif);
        }
        var imgActual = 1;
        var img1 = typeof IMAGEN_GATO_1 !== 'undefined' ? IMAGEN_GATO_1 : 'imagen uno.jpeg';
        var img2 = typeof IMAGEN_GATO_2 !== 'undefined' ? IMAGEN_GATO_2 : 'iamgen 2.jpeg';

        intervaloGif = setInterval(function() {
            if (imgActual === 1) {
                gifGato.src = img2;
                imgActual = 2;
            } else {
                gifGato.src = img1;
                imgActual = 1;
            }
        }, 600);

        /* Click en gatito → mensajes */
        function clickGatito() {
            marcoGif.removeEventListener('click', clickGatito);
            clearInterval(intervaloGif);

            if (audioBurbuja) {
                audioBurbuja.pause();
                audioBurbuja.currentTime = 0;
            }

            Progreso.desbloquear('mensajes');

            faseGif.style.opacity = '0';
            setTimeout(function() {
                faseGif.style.display = 'none';
                irAMensajes();
            }, 1000);
        }

        setTimeout(function() {
            marcoGif.addEventListener('click', clickGatito);
        }, 300);
    }

    /* ========================================= */
    /* IR A: MENSAJES SECRETOS                     */
    /* ========================================= */
    function irAMensajes() {
        var faseMensajes = document.getElementById('fase-mensajes');
        var mensajeTexto = document.getElementById('mensaje-secreto-texto');
        var indicador = document.getElementById('indicador-toca');

        /* Reset estado */
        if (typeof indiceMensaje !== 'undefined') indiceMensaje = 0;
        if (typeof puedeAvanzar !== 'undefined') puedeAvanzar = false;
        if (typeof mensajesActivados !== 'undefined') mensajesActivados = true;
        if (typeof typewriterMensajeTerminado !== 'undefined') typewriterMensajeTerminado = false;

        faseMensajes.style.transition = 'opacity 0.8s ease';
        faseMensajes.style.display = 'block';
        indicador.style.opacity = '1';
        indicador.style.display = 'block';

        setTimeout(function() {
            faseMensajes.style.opacity = '1';
            faseMensajes.classList.add('visible');
        }, 30);

        /* Empezar desde el primer mensaje */
        setTimeout(function() {
            if (typeof mostrarMensajeSecreto === 'function') {
                mostrarMensajeSecreto(0);
            }
        }, 500);
    }

    /* ========================================= */
    /* IR A: TE AMO                                */
    /* ========================================= */
    function irATeAmo() {
        var faseMensajes = document.getElementById('fase-mensajes');
        var mensajeTexto = document.getElementById('mensaje-secreto-texto');
        var indicador = document.getElementById('indicador-toca');

        /* Reset */
        if (typeof easterActivado !== 'undefined') easterActivado = false;

        faseMensajes.style.transition = 'opacity 0.8s ease';
        faseMensajes.style.display = 'block';

        setTimeout(function() {
            faseMensajes.style.opacity = '1';
            faseMensajes.classList.add('visible');
        }, 30);

        mensajeTexto.className = 'texto-teamo';
        mensajeTexto.innerHTML = 'TE AMO <span id="corazon-teamo">\uD83D\uDC9C</span>';
        mensajeTexto.classList.add('visible');
        indicador.style.display = 'none';

        setTimeout(function() {
            var corazon = document.getElementById('corazon-teamo');
            if (corazon) {
                corazon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    Progreso.desbloquear('easter');
                    if (typeof activarEasterEgg === 'function') {
                        easterActivado = false;
                        activarEasterEgg();
                    }
                });
            }
        }, 300);
    }

    /* ========================================= */
    /* IR A: EASTER EGG                            */
    /* ========================================= */
    function irAEaster() {
        var faseEaster = document.getElementById('fase-easter');
        var easterTextoEl = document.getElementById('easter-texto');
        var easterOpcionesEl = document.getElementById('easter-opciones');
        var easterIndicadorEl = document.getElementById('easter-indicador');

        /* Reset */
        if (typeof easterFaseActual !== 'undefined') easterFaseActual = 'mensajes';
        if (typeof easterPuedeAvanzar !== 'undefined') easterPuedeAvanzar = false;
        if (typeof easterIndice !== 'undefined') easterIndice = 0;
        if (typeof easterActivado !== 'undefined') easterActivado = true;

        faseEaster.style.transition = 'opacity 0.8s ease';
        faseEaster.style.display = 'block';

        /* Reset visual */
        easterTextoEl.style.display = 'block';
        easterTextoEl.innerHTML = '';
        easterTextoEl.className = '';
        easterOpcionesEl.style.display = 'none';
        easterOpcionesEl.classList.remove('visible');
        easterIndicadorEl.style.display = 'block';

        setTimeout(function() {
            faseEaster.style.opacity = '1';
            faseEaster.classList.add('visible');
        }, 30);

        var audioEaster = document.getElementById('audio-easter-fondo');
        if (audioEaster) {
            audioEaster.volume = 0.3;
            audioEaster.currentTime = 0;
            audioEaster.play().catch(function(e) {});
        }

        setTimeout(function() {
            if (typeof mostrarEasterMensaje === 'function') {
                mostrarEasterMensaje(0);
            }
        }, 500);
    }

    /* ========================================= */
    /* IR A: ELECCIÓN LUZ/SOMBRA                   */
    /* ========================================= */
    function irAEleccion() {
        var faseEaster = document.getElementById('fase-easter');
        var easterTextoEl = document.getElementById('easter-texto');
        var easterOpcionesEl = document.getElementById('easter-opciones');
        var easterIndicadorEl = document.getElementById('easter-indicador');
        var opLuz = document.getElementById('opcion-luz');
        var opSombras = document.getElementById('opcion-sombras');
        var sepOp = document.getElementById('separador-opciones');

        /* Reset estado */
        if (typeof easterFaseActual !== 'undefined') easterFaseActual = 'opciones';
        if (typeof easterActivado !== 'undefined') easterActivado = true;

        /* Reset visual de opciones */
        opLuz.style.opacity = '1';
        opLuz.style.transition = '';
        opLuz.classList.remove('efecto-luz', 'efecto-sombras');
        opSombras.style.opacity = '1';
        opSombras.style.transition = '';
        opSombras.classList.remove('efecto-luz', 'efecto-sombras');
        sepOp.style.opacity = '1';

        faseEaster.style.transition = 'opacity 0.8s ease';
        faseEaster.style.display = 'block';

        easterTextoEl.style.display = 'none';
        easterIndicadorEl.style.display = 'none';
        easterOpcionesEl.style.display = 'block';
        easterOpcionesEl.classList.add('visible');

        setTimeout(function() {
            faseEaster.style.opacity = '1';
            faseEaster.classList.add('visible');
        }, 30);

        var audioEaster = document.getElementById('audio-easter-fondo');
        if (audioEaster) {
            audioEaster.volume = 0.3;
            audioEaster.currentTime = 0;
            audioEaster.play().catch(function(e) {});
        }
    }

    /* ========================================= */
    /* IR A: LABERINTO LUZ                         */
    /* ========================================= */
    function irALabLuz() {
        /* Resetear la fase si existe */
        var fase = document.getElementById('fase-lab-luz');
        if (fase) {
            fase.style.display = 'none';
            fase.style.opacity = '0';
            fase.classList.remove('visible');

            /* Resetear elementos internos */
            var fin = document.getElementById('luz-fin');
            if (fin) {
                fin.style.display = 'none';
                fin.style.opacity = '0';
                fin.classList.remove('visible');
            }
            var finTexto = document.getElementById('luz-fin-texto');
            if (finTexto) finTexto.innerHTML = '';
        }

        setTimeout(function() {
            if (typeof window.iniciarLaberintoLuz === 'function') {
                window.iniciarLaberintoLuz();
            } else {
                console.error('iniciarLaberintoLuz no existe');
            }
        }, 100);
    }

    /* ========================================= */
    /* IR A: LABERINTO SOMBRA                      */
    /* ========================================= */
    function irALabSombra() {
        var fase = document.getElementById('fase-lab-sombra');
        if (fase) {
            fase.style.display = 'none';
            fase.style.opacity = '0';
            fase.classList.remove('visible');

            var fin = document.getElementById('sombra-fin');
            if (fin) {
                fin.style.display = 'none';
                fin.style.opacity = '0';
                fin.classList.remove('visible');
            }
            var finTexto = document.getElementById('sombra-fin-texto');
            if (finTexto) finTexto.innerHTML = '';

            var blanco = document.getElementById('sombra-blanco');
            if (blanco) {
                blanco.style.opacity = '0';
                blanco.classList.remove('visible');
            }
        }

        setTimeout(function() {
            if (typeof window.iniciarLaberintoSombra === 'function') {
                window.iniciarLaberintoSombra();
            } else {
                console.error('iniciarLaberintoSombra no existe');
            }
        }, 100);
    }

    /* ========================================= */
    /* ESCAPE PARA CERRAR                          */
    /* ========================================= */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuAbierto) cerrarMenu();
    });

    /* ========================================= */
    /* INICIALIZAR                                 */
    /* ========================================= */
    crearMenu();

})();