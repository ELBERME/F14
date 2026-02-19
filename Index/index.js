/* ============================================= */
/* SISTEMA DE FRASE DIARIA                        */
/* ============================================= */
function obtenerFraseDelDia() {

    /* ---- Chequear si es la primera vez del usuario ---- */
    var primeraVez = localStorage.getItem('noris_primera_vez');

    if (!primeraVez) {
        /* PRIMERA VEZ: guardar que ya no es primera vez */
        localStorage.setItem('noris_primera_vez', 'no');

        /* Guardar esta frase como la del día actual */
        var hoy = new Date();
        var fechaHoy = hoy.getFullYear() + '-' +
            String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
            String(hoy.getDate()).padStart(2, '0');

        var datos = {
            fechaActual: fechaHoy,
            fraseActual: FRASE_PRIMERA_VEZ,
            indiceActual: -1,
            usadas: []
        };
        localStorage.setItem('noris_frases_datos', JSON.stringify(datos));

        return FRASE_PRIMERA_VEZ;
    }

    /* ---- Ya no es primera vez: lógica normal ---- */
    var hoy2 = new Date();
    var fechaHoy2 = hoy2.getFullYear() + '-' +
        String(hoy2.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoy2.getDate()).padStart(2, '0');

    var datosGuardados = localStorage.getItem('noris_frases_datos');
    var datos2;

    if (datosGuardados) {
        datos2 = JSON.parse(datosGuardados);
    } else {
        datos2 = {
            fechaActual: null,
            fraseActual: null,
            indiceActual: null,
            usadas: []
        };
    }

    /* Si hoy ya tiene frase, devolver esa */
    if (datos2.fechaActual === fechaHoy2 && datos2.fraseActual !== null) {
        return datos2.fraseActual;
    }

    /* Nuevo día: seleccionar frase no usada */
    var totalFrases = FRASES_DIARIAS.length;

    if (datos2.usadas.length >= totalFrases) {
        datos2.usadas = [];
    }

    var disponibles = [];
    for (var i = 0; i < totalFrases; i++) {
        if (datos2.usadas.indexOf(i) === -1) {
            disponibles.push(i);
        }
    }

    var indiceAleatorio = disponibles[Math.floor(Math.random() * disponibles.length)];
    var fraseSeleccionada = FRASES_DIARIAS[indiceAleatorio];

    datos2.fechaActual = fechaHoy2;
    datos2.fraseActual = fraseSeleccionada;
    datos2.indiceActual = indiceAleatorio;
    datos2.usadas.push(indiceAleatorio);

    localStorage.setItem('noris_frases_datos', JSON.stringify(datos2));

    return fraseSeleccionada;
}


/* ============================================= */
/* CONFIGURACIÓN                                  */
/* ============================================= */
var FRASE_DEL_DIA = obtenerFraseDelDia();
var MENSAJE = FRASE_DEL_DIA;

var DURACION_VIDEO = 13000;
var ESPERA_INICIO_TEXTO = 1500;
var TIEMPO_DISPONIBLE_TEXTO = DURACION_VIDEO - ESPERA_INICIO_TEXTO - 2000;
var VELOCIDAD_LETRA = Math.floor(TIEMPO_DISPONIBLE_TEXTO / MENSAJE.length);

if (VELOCIDAD_LETRA > 200) VELOCIDAD_LETRA = 200;
if (VELOCIDAD_LETRA < 40) VELOCIDAD_LETRA = 40;

var IMAGEN_GATO_1 = "imagen uno.jpeg";
var IMAGEN_GATO_2 = "iamgen 2.jpeg";
var VELOCIDAD_GIF = 600;
var VELOCIDAD_MENSAJE_TYPEWRITER = 55;
var VELOCIDAD_EASTER_TYPEWRITER = 50;

var MENSAJES_SECRETOS = [
    { texto: "Ya veo... \uD83D\uDC40", tipo: "normal" },
    { texto: "Andas de curiosa  \uD83D\uDE0F\uD83D\uDC9C", tipo: "normal" },
    { texto: "Toma esto... \uD83C\uDF81", tipo: "normal" },
    {
        texto: "En algun lugar de estas finitas palabras organizadas, esta este texto. Texto que se creo pensando en ti, por un impulso que nacio del azar, espontaneo e imparcial, incluso inalterable. Texto el cual se escribio con el unico fin de recordarte que...",
        tipo: "typewriter"
    },
    { texto: "TE AMO", tipo: "teamo" }
];

var EASTER_MENSAJES = [
    "\u00BFMas?",
    "\u00BFAun quieres mas?",
    "\u00BFAlgo mas?"
];

var SOMBRAS_PARTES = [
    "Hace un tiempo llegue a la conclusion de que el ser humano es insaciable; nunca esta completamente satisfecho.",
    "Por eso, a veces fuerza las cosas con la esperanza de llenar ese vacio.",
    "Sin embargo, ese impulso termina llevando al limite a quienes estan involucrados.",
    "Y lo que ya era hermoso comienza a marchitarse bajo el peso de la sobre exigencia y las expectativas.",
    "Es ironico: se puede perder todo por el simple deseo de tener un poco mas."
];

/* ============================================= */
/* REFERENCIAS AL DOM                             */
/* ============================================= */
var botonInicio = document.getElementById('boton-inicio');
var faseVideo = document.getElementById('fase-video');
var faseGif = document.getElementById('fase-gif');
var faseMensajes = document.getElementById('fase-mensajes');
var faseEaster = document.getElementById('fase-easter');
var faseFinal = document.getElementById('fase-final');
var videoFondo = document.getElementById('video-fondo');
var videoBorroso = document.getElementById('video-borroso');
var textoAnimado = document.getElementById('texto-animado');
var cursorElemento = document.getElementById('cursor');
var contenedorGif = document.getElementById('contenedor-gif');
var marcoGif = document.getElementById('marco-gif');
var gifGato = document.getElementById('gif-gato');
var textoFinal = document.getElementById('texto-final');
var audioPrincipal = document.getElementById('audio-principal');
var audioTypewriter = document.getElementById('audio-typewriter');
var audioBurbuja = document.getElementById('audio-burbuja');
var audioBurbujaCorto = document.getElementById('audio-burbuja-corto');
var audioEasterFondo = document.getElementById('audio-easter-fondo');
var mensajeSecretoTexto = document.getElementById('mensaje-secreto-texto');
var indicadorToca = document.getElementById('indicador-toca');
var easterTexto = document.getElementById('easter-texto');
var easterOpciones = document.getElementById('easter-opciones');
var easterIndicador = document.getElementById('easter-indicador');
var opcionLuz = document.getElementById('opcion-luz');
var opcionSombras = document.getElementById('opcion-sombras');
var separadorOpciones = document.getElementById('separador-opciones');
var finalContenido = document.getElementById('final-contenido');

/* ============================================= */
/* VARIABLES DE ESTADO                            */
/* ============================================= */
var indiceLetra = 0;
var intervaloTexto = null;
var intervaloGif = null;
var imagenActual = 1;
var transicionEjecutada = false;
var indiceMensaje = 0;
var mensajesActivados = false;
var puedeAvanzar = false;
var typewriterMensajeIntervalo = null;
var typewriterMensajeTerminado = false;
var easterActivado = false;
var easterIndice = 0;
var easterPuedeAvanzar = false;
var easterTypewriterIntervalo = null;
var easterTypewriterTerminado = false;
var easterFaseActual = "mensajes";
var fase1TextoCompleto = false;
var fase1Saltada = false;

/* ============================================= */
/* FUNCIONES DE AUDIO                             */
/* ============================================= */
function reproducirBurbujaCorta() {
    audioBurbujaCorto.currentTime = 0;
    audioBurbujaCorto.volume = 0.7;
    audioBurbujaCorto.play().catch(function(e) {});
}

function iniciarAudioMaquina() {
    audioTypewriter.currentTime = 0;
    audioTypewriter.volume = 0.4;
    audioTypewriter.play().catch(function(e) {});
}

function detenerAudioMaquina() {
    audioTypewriter.pause();
    audioTypewriter.currentTime = 0;
}

/* ============================================= */
/* BOTÓN DE INICIO                                */
/* ============================================= */
botonInicio.addEventListener('click', function() {
    var btn = this;
    btn.style.transition = 'opacity 0.5s ease';
    btn.style.opacity = '0';
    setTimeout(function() {
        btn.style.display = 'none';
        iniciarExperiencia();
    }, 500);
});

/* ============================================= */
/* FASE 1                                         */
/* ============================================= */
function iniciarExperiencia() {
    Progreso.desbloquear('frase');
    videoFondo.play().catch(function(e) {});
    audioPrincipal.play().catch(function(e) {});

    setTimeout(function() {
        iniciarTextoTypewriterFase1();
    }, ESPERA_INICIO_TEXTO);

    videoFondo.addEventListener('ended', transicionAFase2);

    setTimeout(function() {
        transicionAFase2();
    }, DURACION_VIDEO + 500);

    iniciarCorazones();
}

function iniciarTextoTypewriterFase1() {
    audioTypewriter.volume = 0.5;
    audioTypewriter.play().catch(function(e) {});

    intervaloTexto = setInterval(function() {
        if (indiceLetra < MENSAJE.length) {
            var letra = MENSAJE[indiceLetra];
            if (letra === '\n') {
                textoAnimado.innerHTML += '<br>';
            } else {
                textoAnimado.innerHTML += letra;
            }
            indiceLetra++;
        } else {
            clearInterval(intervaloTexto);
            intervaloTexto = null;
            detenerAudioMaquina();
            fase1TextoCompleto = true;
            setTimeout(function() {
                cursorElemento.style.display = 'none';
            }, 1000);
        }
    }, VELOCIDAD_LETRA);
}

/* ============================================= */
/* SALTAR ANIMACIÓN FASE 1                        */
/* ============================================= */
faseVideo.addEventListener('click', function() {
    if (intervaloTexto && !fase1TextoCompleto && !fase1Saltada) {
        fase1Saltada = true;
        clearInterval(intervaloTexto);
        intervaloTexto = null;
        detenerAudioMaquina();

        var textoHTML = MENSAJE.replace(/\n/g, '<br>');
        textoAnimado.innerHTML = textoHTML;
        fase1TextoCompleto = true;

        setTimeout(function() {
            cursorElemento.style.display = 'none';
        }, 500);
    }
    else if (fase1TextoCompleto) {
        transicionAFase2();
    }
});

/* ============================================= */
/* TRANSICIÓN A FASE 2                            */
/* ============================================= */
function transicionAFase2() {
    if (transicionEjecutada) return;
    transicionEjecutada = true;
    Progreso.desbloquear('gatito');
    if (intervaloTexto) {
        clearInterval(intervaloTexto);
        intervaloTexto = null;
        detenerAudioMaquina();
    }

    faseVideo.style.opacity = '0';

    setTimeout(function() {
        faseVideo.style.display = 'none';
        faseGif.style.display = 'block';
        videoBorroso.play().catch(function(e) {});

        requestAnimationFrame(function() {
            faseGif.style.opacity = '1';
        });

        setTimeout(function() {
            contenedorGif.classList.add('visible');
            iniciarGifManual();
            audioBurbuja.volume = 0.5;
            audioBurbuja.play().catch(function(e) {});

            setTimeout(function() {
                textoFinal.classList.add('visible');
            }, 800);
        }, 500);
    }, 1500);
}

function iniciarGifManual() {
    intervaloGif = setInterval(function() {
        if (imagenActual === 1) {
            gifGato.src = IMAGEN_GATO_2;
            imagenActual = 2;
        } else {
            gifGato.src = IMAGEN_GATO_1;
            imagenActual = 1;
        }
    }, VELOCIDAD_GIF);
}

/* ============================================= */
/* TRANSICIÓN A FASE 3                            */
/* ============================================= */
marcoGif.addEventListener('click', function() {
    if (mensajesActivados) return;
    mensajesActivados = true;
    Progreso.desbloquear('mensajes');
    if (intervaloGif) clearInterval(intervaloGif);
    audioBurbuja.pause();
    audioBurbuja.currentTime = 0;

    faseGif.style.opacity = '0';

    setTimeout(function() {
        faseGif.style.display = 'none';
        faseMensajes.style.display = 'block';

        requestAnimationFrame(function() {
            faseMensajes.classList.add('visible');
        });

        setTimeout(function() {
            mostrarMensajeSecreto(0);
        }, 800);
    }, 1000);
});

/* ============================================= */
/* MENSAJES SECRETOS                              */
/* ============================================= */
function mostrarMensajeSecreto(indice) {
    if (indice >= MENSAJES_SECRETOS.length) return;

    indiceMensaje = indice;
    var mensaje = MENSAJES_SECRETOS[indice];

    if (typewriterMensajeIntervalo) {
        clearInterval(typewriterMensajeIntervalo);
        typewriterMensajeIntervalo = null;
    }
    typewriterMensajeTerminado = false;
    mensajeSecretoTexto.classList.remove('visible');

    setTimeout(function() {
        mensajeSecretoTexto.className = '';
        mensajeSecretoTexto.innerHTML = '';

        if (mensaje.tipo === "normal") {
            reproducirBurbujaCorta();
            mensajeSecretoTexto.innerHTML = mensaje.texto;
            requestAnimationFrame(function() {
                mensajeSecretoTexto.classList.add('visible');
            });
            puedeAvanzar = false;
            setTimeout(function() { puedeAvanzar = true; }, 1500);
        }
        else if (mensaje.tipo === "typewriter") {
            reproducirBurbujaCorta();
            mensajeSecretoTexto.classList.add('texto-largo');
            requestAnimationFrame(function() {
                mensajeSecretoTexto.classList.add('visible');
            });
            indicadorToca.style.opacity = '0';
            puedeAvanzar = false;
            iniciarAudioMaquina();

            var textoCompleto = mensaje.texto;
            var letraActual = 0;
            mensajeSecretoTexto.innerHTML = '<span id="cursor-mensaje">|</span>';

            typewriterMensajeIntervalo = setInterval(function() {
                if (letraActual < textoCompleto.length) {
                    var cursorMsg = document.getElementById('cursor-mensaje');
                    if (cursorMsg) {
                        var textoNodo = document.createTextNode(textoCompleto[letraActual]);
                        cursorMsg.parentNode.insertBefore(textoNodo, cursorMsg);
                    }
                    letraActual++;
                } else {
                    clearInterval(typewriterMensajeIntervalo);
                    typewriterMensajeIntervalo = null;
                    typewriterMensajeTerminado = true;
                    detenerAudioMaquina();

                    setTimeout(function() {
                        var cursorMsg = document.getElementById('cursor-mensaje');
                        if (cursorMsg) cursorMsg.style.display = 'none';
                    }, 1000);

                    indicadorToca.style.opacity = '1';
                    setTimeout(function() { puedeAvanzar = true; }, 1500);
                }
            }, VELOCIDAD_MENSAJE_TYPEWRITER);
        }
        else if (mensaje.tipo === "teamo") {
            Progreso.desbloquear('teamo');
            reproducirBurbujaCorta();
            mensajeSecretoTexto.innerHTML = 'TE AMO? <span id="corazon-teamo">\uD83D\uDC9C</span>';
            mensajeSecretoTexto.classList.add('texto-teamo');

            requestAnimationFrame(function() {
                mensajeSecretoTexto.classList.add('visible');
            });

            indicadorToca.style.display = 'none';
            puedeAvanzar = false;

            setTimeout(function() {
                var corazonTeamo = document.getElementById('corazon-teamo');
                if (corazonTeamo) {
                    corazonTeamo.addEventListener('click', function(e) {
                        e.stopPropagation();
                        activarEasterEgg();
                    });
                }
            }, 500);
        }
    }, 400);
}

/* ============================================= */
/* CLICK EN FASE MENSAJES                         */
/* ============================================= */
faseMensajes.addEventListener('click', function() {
    if (typewriterMensajeIntervalo && !typewriterMensajeTerminado) {
        clearInterval(typewriterMensajeIntervalo);
        typewriterMensajeIntervalo = null;
        typewriterMensajeTerminado = true;
        detenerAudioMaquina();

        var mensaje = MENSAJES_SECRETOS[indiceMensaje];
        mensajeSecretoTexto.innerHTML = mensaje.texto;
        mensajeSecretoTexto.classList.add('texto-largo');
        mensajeSecretoTexto.classList.add('visible');
        indicadorToca.style.opacity = '1';

        setTimeout(function() { puedeAvanzar = true; }, 800);
        return;
    }

    if (!puedeAvanzar) return;

    var siguiente = indiceMensaje + 1;
    if (siguiente < MENSAJES_SECRETOS.length) {
        mostrarMensajeSecreto(siguiente);
    }
});

/* ============================================= */
/* EASTER EGG                                     */
/* ============================================= */
function activarEasterEgg() {
    if (easterActivado) return;
    easterActivado = true; 
    Progreso.desbloquear('easter'); 

    faseMensajes.style.opacity = '0';

    setTimeout(function() {
        faseMensajes.style.display = 'none';
        faseEaster.style.display = 'block';

        requestAnimationFrame(function() {
            faseEaster.classList.add('visible');
        });

        audioEasterFondo.volume = 0.3;
        audioEasterFondo.play().catch(function(e) {});

        setTimeout(function() {
            mostrarEasterMensaje(0);
        }, 800);
    }, 1000);
}

function mostrarEasterMensaje(indice) {
    if (indice >= EASTER_MENSAJES.length) {
        mostrarOpciones();
        return;
    }

    easterIndice = indice;
    easterTexto.classList.remove('visible');

    setTimeout(function() {
        easterTexto.className = '';
        easterTexto.innerHTML = '';
        reproducirBurbujaCorta();
        iniciarAudioMaquina();

        var textoCompleto = EASTER_MENSAJES[indice];
        var letraActual = 0;
        easterTexto.innerHTML = '<span class="cursor-easter">|</span>';

        requestAnimationFrame(function() {
            easterTexto.classList.add('visible');
        });

        easterPuedeAvanzar = false;
        easterTypewriterTerminado = false;

        easterTypewriterIntervalo = setInterval(function() {
            if (letraActual < textoCompleto.length) {
                var cursorE = easterTexto.querySelector('.cursor-easter');
                if (cursorE) {
                    var nodo = document.createTextNode(textoCompleto[letraActual]);
                    cursorE.parentNode.insertBefore(nodo, cursorE);
                }
                letraActual++;
            } else {
                clearInterval(easterTypewriterIntervalo);
                easterTypewriterIntervalo = null;
                easterTypewriterTerminado = true;
                detenerAudioMaquina();

                setTimeout(function() {
                    var cursorE = easterTexto.querySelector('.cursor-easter');
                    if (cursorE) cursorE.style.display = 'none';
                }, 800);

                setTimeout(function() {
                    easterPuedeAvanzar = true;
                }, 1000);
            }
        }, VELOCIDAD_EASTER_TYPEWRITER);
    }, 400);
}

function mostrarOpciones() {
    easterFaseActual = "opciones";
    Progreso.desbloquear('eleccion'); 
    easterTexto.classList.remove('visible');
    easterIndicador.style.display = 'none';

    setTimeout(function() {
        easterTexto.innerHTML = '';
        easterTexto.style.display = 'none';
        reproducirBurbujaCorta();
        easterOpciones.style.display = 'block';

        requestAnimationFrame(function() {
            easterOpciones.classList.add('visible');
        });
    }, 600);
}

/* ============================================= */
/* CLICK EN FASE EASTER                           */
/* ============================================= */
faseEaster.addEventListener('click', function(e) {
    if (e.target.classList.contains('opcion-flotante')) return;
    if (easterFaseActual === "opciones" || easterFaseActual === "finalizado") return;

    if (easterTypewriterIntervalo && !easterTypewriterTerminado) {
        clearInterval(easterTypewriterIntervalo);
        easterTypewriterIntervalo = null;
        easterTypewriterTerminado = true;
        detenerAudioMaquina();

        easterTexto.innerHTML = EASTER_MENSAJES[easterIndice];
        easterTexto.classList.add('visible');

        setTimeout(function() { easterPuedeAvanzar = true; }, 500);
        return;
    }

    if (!easterPuedeAvanzar) return;

    var siguiente = easterIndice + 1;
    if (siguiente < EASTER_MENSAJES.length) {
        mostrarEasterMensaje(siguiente);
    } else {
        mostrarOpciones();
    }
});

/* ============================================= */
/* OPCIÓN LUZ → FRASE → LABERINTO LUZ             */
/* ============================================= */
opcionLuz.addEventListener('click', function(e) {
    e.stopPropagation();
    easterFaseActual = "finalizado";
    Progreso.desbloquear('lab-luz');
    reproducirBurbujaCorta();

    console.log("LUZ: iniciando transición");

    opcionLuz.classList.add('efecto-luz');
    opcionSombras.style.opacity = '0';
    opcionSombras.style.transition = 'opacity 0.8s ease';
    separadorOpciones.style.opacity = '0';

    setTimeout(function() {
        console.log("LUZ: ocultando easter");
        faseEaster.style.opacity = '0';

        setTimeout(function() {
            faseEaster.style.display = 'none';

            console.log("LUZ: mostrando fase final con frase");
            faseFinal.classList.add('fondo-luz');
            faseFinal.style.display = 'block';
            faseFinal.style.opacity = '0';
            finalContenido.innerHTML = '';

            var textoLuz = document.createElement('div');
            textoLuz.className = 'final-texto texto-luz-principal';
            finalContenido.appendChild(textoLuz);

            var lineaPequena = document.createElement('div');
            lineaPequena.className = 'final-linea-pequena';
            lineaPequena.textContent = 'Elegir tambien es una forma de revelar quien eres.';
            finalContenido.appendChild(lineaPequena);

            setTimeout(function() {
                faseFinal.style.opacity = '1';
            }, 50);

            var textoCompletoLuz = "Eres un regalo en la logica de mi existencia.";
            var letraLuz = 0;

            setTimeout(function() {
                console.log("LUZ: escribiendo frase");
                reproducirBurbujaCorta();
                iniciarAudioMaquina();
                textoLuz.innerHTML = '<span class="cursor-easter">|</span>';
                textoLuz.classList.add('visible');

                var intervaloLuz = setInterval(function() {
                    if (letraLuz < textoCompletoLuz.length) {
                        var cursorL = textoLuz.querySelector('.cursor-easter');
                        if (cursorL) {
                            var nodo = document.createTextNode(textoCompletoLuz[letraLuz]);
                            cursorL.parentNode.insertBefore(nodo, cursorL);
                        }
                        letraLuz++;
                    } else {
                        clearInterval(intervaloLuz);
                        detenerAudioMaquina();
                        console.log("LUZ: frase completa");

                        var cursorL = textoLuz.querySelector('.cursor-easter');
                        if (cursorL) {
                            setTimeout(function() { cursorL.style.display = 'none'; }, 800);
                        }

                        setTimeout(function() {
                            lineaPequena.classList.add('visible');
                        }, 1500);

                        /* ================================ */
                        /* TRANSICIÓN AL LABERINTO DE LUZ    */
                        /* ================================ */
                        setTimeout(function() {
                            console.log("LUZ: transición al laberinto");

                            faseFinal.style.transition = 'opacity 1.5s ease';
                            faseFinal.style.opacity = '0';

                            setTimeout(function() {
                                faseFinal.style.display = 'none';

                                if (typeof window.iniciarLaberintoLuz === 'function') {
                                    console.log("LUZ: iniciando laberinto");
                                    window.iniciarLaberintoLuz();
                                } else {
                                    console.error("ERROR: iniciarLaberintoLuz no existe");
                                }
                            }, 1600);
                        }, 4000);
                    }
                }, 60);
            }, 1000);
        }, 1200);
    }, 1500);
});

/* ============================================= */
/* OPCIÓN SOMBRAS → FRASES → LABERINTO SOMBRA     */
/* ============================================= */
opcionSombras.addEventListener('click', function(e) {
    e.stopPropagation();
    easterFaseActual = "finalizado";
    Progreso.desbloquear('lab-sombra');
    reproducirBurbujaCorta();

    console.log("SOMBRAS: iniciando transición");

    opcionSombras.classList.add('efecto-sombras');
    opcionLuz.style.opacity = '0';
    opcionLuz.style.transition = 'opacity 0.8s ease';
    separadorOpciones.style.opacity = '0';

    setTimeout(function() {
        faseEaster.style.opacity = '0';

        setTimeout(function() {
            faseEaster.style.display = 'none';

            console.log("SOMBRAS: mostrando textos");
            faseFinal.classList.add('fondo-sombras');
            faseFinal.style.display = 'block';
            faseFinal.style.opacity = '0';
            finalContenido.innerHTML = '';

            var elementos = [];
            for (var i = 0; i < SOMBRAS_PARTES.length; i++) {
                var parrafo = document.createElement('div');
                parrafo.className = 'final-texto';
                finalContenido.appendChild(parrafo);
                elementos.push(parrafo);
            }

            var lineaPequena = document.createElement('div');
            lineaPequena.className = 'final-linea-pequena';
            lineaPequena.textContent = 'Elegir tambien es una forma de revelar quien eres.';
            finalContenido.appendChild(lineaPequena);

            setTimeout(function() {
                faseFinal.style.opacity = '1';
            }, 50);

            setTimeout(function() {
                escribirParrafoSombrasConTransicion(0, elementos, lineaPequena);
            }, 1000);
        }, 1200);
    }, 2800);
});

/* ============================================= */
/* ESCRIBIR PÁRRAFOS SOMBRAS + TRANSICIÓN          */
/* Al terminar todos → laberinto sombra            */
/* ============================================= */
function escribirParrafoSombrasConTransicion(indice, elementos, lineaPequena) {
    if (indice >= SOMBRAS_PARTES.length) {
        setTimeout(function() {
            lineaPequena.classList.add('visible');
        }, 1500);

        /* ================================ */
        /* TRANSICIÓN AL LABERINTO SOMBRA    */
        /* ================================ */
        setTimeout(function() {
            console.log("SOMBRAS: transición al laberinto");

            faseFinal.style.transition = 'opacity 1.5s ease';
            faseFinal.style.opacity = '0';

            setTimeout(function() {
                faseFinal.style.display = 'none';

                if (typeof window.iniciarLaberintoSombra === 'function') {
                    console.log("SOMBRAS: iniciando laberinto");
                    window.iniciarLaberintoSombra();
                } else {
                    console.error("ERROR: iniciarLaberintoSombra no existe");
                }
            }, 1600);
        }, 5000);

        return;
    }

    var elemento = elementos[indice];
    var textoCompleto = SOMBRAS_PARTES[indice];
    var letraActual = 0;

    reproducirBurbujaCorta();
    iniciarAudioMaquina();
    elemento.innerHTML = '<span class="cursor-easter">|</span>';
    elemento.classList.add('visible');

    var intervaloSombra = setInterval(function() {
        if (letraActual < textoCompleto.length) {
            var cursorS = elemento.querySelector('.cursor-easter');
            if (cursorS) {
                var nodo = document.createTextNode(textoCompleto[letraActual]);
                cursorS.parentNode.insertBefore(nodo, cursorS);
            }
            letraActual++;
        } else {
            clearInterval(intervaloSombra);
            detenerAudioMaquina();

            var cursorS = elemento.querySelector('.cursor-easter');
            if (cursorS) {
                setTimeout(function() { cursorS.style.display = 'none'; }, 500);
            }

            setTimeout(function() {
                escribirParrafoSombrasConTransicion(indice + 1, elementos, lineaPequena);
            }, 1200);
        }
    }, VELOCIDAD_EASTER_TYPEWRITER);
}


/* ============================================= */
/* CORAZONES Y PARTÍCULAS                         */
/* ============================================= */
function iniciarCorazones() {
    setInterval(function() {
        crearCorazon();
    }, 800);
}

function crearCorazon() {
    var corazon = document.createElement('div');
    corazon.classList.add('corazon');

    var emojis = ['\uD83D\uDC9C', '\uD83D\uDC9C', '\uD83D\uDC9C', '\uD83D\uDFE3', '\uD83D\uDC9C', '\uD83D\uDC9C'];
    corazon.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    corazon.style.left = Math.random() * 100 + 'vw';
    corazon.style.top = '100vh';
    corazon.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';

    document.body.appendChild(corazon);

    setTimeout(function() {
        corazon.remove();
    }, 4000);
}

function crearParticulas() {
    setInterval(function() {
        var p = document.createElement('div');
        p.classList.add('particula');
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.animation = 'brillar ' + (Math.random() * 2 + 1) + 's ease-in-out';
        document.body.appendChild(p);

        setTimeout(function() {
            p.remove();
        }, 3000);
    }, 300);
}

crearParticulas();

/* ============================================= */
/* PRECARGA                                       */
/* ============================================= */
function precargarImagenes() {
    var img1 = new Image();
    img1.src = IMAGEN_GATO_1;
    var img2 = new Image();
    img2.src = IMAGEN_GATO_2;
}

precargarImagenes();