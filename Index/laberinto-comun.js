/* ============================================= */
/* CORAZÓN DE NORIS — Variable Global              */
/* Conecta los dos laberintos                      */
/* ============================================= */
(function() {
    'use strict';

    var datos = localStorage.getItem('corazon_de_noris');
    var estado;

    if (datos) {
        estado = JSON.parse(datos);
    } else {
        estado = {
            corazon: false,
            sombra_ganada: false,
            luz_ganada: false
        };
    }

    window.CorazonDeNoris = {
        tiene: function() {
            return estado.corazon;
        },
        forjar: function() {
            estado.corazon = true;
            estado.sombra_ganada = true;
            this._guardar();
        },
        completarLuz: function() {
            estado.luz_ganada = true;
            this._guardar();
        },
        sombraGanada: function() {
            return estado.sombra_ganada;
        },
        luzGanada: function() {
            return estado.luz_ganada;
        },
        /* Modificadores de dificultad cruzada */
        mod: function() {
            return {
                costoFlash: estado.sombra_ganada ? 0.5 : 1.0,
                fuerzaCorazon: estado.corazon ? 1.0 : 0.3,
                intensidadBlanco: estado.luz_ganada ? 0.7 : 1.0
            };
        },
        _guardar: function() {
            localStorage.setItem('corazon_de_noris', JSON.stringify(estado));
        },
        reset: function() {
            estado = { corazon: false, sombra_ganada: false, luz_ganada: false };
            this._guardar();
        }
    };
})();