/* ============================================
   1. CONFIGURACIÓN DE MENSAJES POR PERÍODO
   ============================================ */
const CARD_CONFIG = [
    {
        // MADRUGADA: 12:00 AM - 5:59 AM
        period: "Madrugada",
        startHour: 0,
        endHour: 6,
        emoji: "🌙",
        color: "var(--purple-lightest)",
        message: "Las mejores ideas nacen en el silencio de la noche. Descansa bien, mañana será un gran día. 💜",
        greeting: "Buenas madrugadas"
    },
    {
        // MAÑANA: 6:00 AM - 11:59 AM
        period: "Mañana",
        startHour: 6,
        endHour: 12,
        emoji: "🌅",
        color: "var(--purple-light)",
        message: "¡Un nuevo día comienza! Tienes el poder de hacer cosas increíbles hoy. ¡Ánimo! ✨",
        greeting: "Buenos días"
    },
    {
        // TARDE: 12:00 PM - 5:59 PM
        period: "Tarde",
        startHour: 12,
        endHour: 18,
        emoji: "☀️",
        color: "var(--purple-medium)",
        message: "Vas a la mitad del día. Recuerda tomar agua, respirar profundo y sonreír. Lo estás haciendo bien. 🌟",
        greeting: "Buenas tardes"
    },
    {
        // NOCHE: 6:00 PM - 11:59 PM
        period: "Noche",
        startHour: 18,
        endHour: 24,
        emoji: "🌙",
        color: "var(--purple-darkest)",
        message: "La noche es para reflexionar sobre lo bueno del día. Mereces descansar y estar en paz. 🌌",
        greeting: "Buenas noches"
    }
];

/* ============================================
   2. VARIABLES GLOBALES
   ============================================ */
let currentPeriodIndex = -1;
let cardOpened = false;
let collectedCards = {};

/* ============================================
   3. CARGAR ANIMACIÓN LOTTIE
   ============================================ */
const anim = lottie.loadAnimation({
    container: document.getElementById('arena'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: 'clock_time.json'
});

/* ============================================
   4. RELOJ DIGITAL
   ============================================ */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');

    document.getElementById('clock').textContent =
        `${hours}:${minutes}:${seconds} ${period}`;

    // Verificar período actual
    checkPeriod();
}

setInterval(updateClock, 1000);
updateClock();

/* ============================================
   5. SINCRONIZAR ARENA CON TIEMPO REAL
   ============================================ */
anim.addEventListener("DOMLoaded", () => {
    const totalFrames = anim.getDuration(true);

    function sync() {
        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const progress = seconds / 60;
        const frame = totalFrames * progress;
        anim.goToAndStop(frame, true);
        requestAnimationFrame(sync);
    }

    sync();
});

/* ============================================
   6. SISTEMA DE CARTAS
   ============================================ */

// Obtener índice del período actual
function getCurrentPeriodIndex() {
    const hour = new Date().getHours();
    return CARD_CONFIG.findIndex(c => hour >= c.startHour && hour < c.endHour);
}

// Cargar cartas guardadas del localStorage
function loadCollectedCards() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('collectedCards');

    if (saved) {
        const data = JSON.parse(saved);
        // Si es un nuevo día, resetear
        if (data.date !== today) {
            collectedCards = {};
            localStorage.setItem('collectedCards', JSON.stringify({
                date: today,
                cards: {}
            }));
        } else {
            collectedCards = data.cards || {};
        }
    } else {
        collectedCards = {};
        localStorage.setItem('collectedCards', JSON.stringify({
            date: today,
            cards: {}
        }));
    }

    updateSlots();
}

// Guardar carta en localStorage
function saveCard(index) {
    const today = new Date().toDateString();
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;

    collectedCards[index] = {
        message: CARD_CONFIG[index].message,
        emoji: CARD_CONFIG[index].emoji,
        period: CARD_CONFIG[index].period,
        time: timeStr
    };

    localStorage.setItem('collectedCards', JSON.stringify({
        date: today,
        cards: collectedCards
    }));

    updateSlots();
}

// Actualizar los slots visuales
function updateSlots() {
    for (let i = 0; i < 4; i++) {
        const slot = document.getElementById(`slot-${i}`);

        if (collectedCards[i]) {
            // Carta recolectada
            slot.classList.add('collected');
            slot.classList.remove('active');
            slot.querySelector('.slot-icon').textContent = CARD_CONFIG[i].emoji;
            slot.querySelector('.slot-label').textContent = CARD_CONFIG[i].period;
            slot.querySelector('.slot-time').textContent = `Abierta: ${collectedCards[i].time}`;

            // Agregar click para ver la carta
            slot.onclick = () => showModal(i);
        } else if (i === getCurrentPeriodIndex()) {
            // Período actual (sin abrir)
            slot.classList.add('active');
            slot.classList.remove('collected');
        } else {
            slot.classList.remove('active', 'collected');
            slot.onclick = null;
        }
    }
}

// Verificar si cambió el período
function checkPeriod() {
    const newIndex = getCurrentPeriodIndex();

    if (newIndex !== currentPeriodIndex) {
        currentPeriodIndex = newIndex;
        const config = CARD_CONFIG[currentPeriodIndex];

        // Actualizar saludo
        document.getElementById('greeting').textContent = config.greeting;

        // Si ya fue recolectada, ocultar carta
        if (collectedCards[currentPeriodIndex]) {
            document.getElementById('current-card').classList.add('carta-hidden');
        } else {
            // Mostrar nueva carta
            showNewCard(config);
        }
    }
}

// Mostrar nueva carta con animación
function showNewCard(config) {
    const card = document.getElementById('current-card');
    const messageEl = document.getElementById('card-message');
    const timeEl = document.getElementById('card-time');

    // Resetear estado
    card.classList.remove('carta-hidden', 'abierta', 'carta-nueva');
    cardOpened = false;

    // Configurar mensaje
    messageEl.textContent = config.message;
    timeEl.textContent = config.period;

    // Forzar reflow para reiniciar animación
    void card.offsetWidth;

    // Agregar animación de entrada
    card.classList.add('carta-nueva');

    // Reproducir sonido
    playNotification();
}

// Abrir carta
function abrirCarta() {
    const card = document.getElementById('current-card');

    if (cardOpened) return;

    cardOpened = true;
    card.classList.add('abierta');

    // Guardar carta después de abrirla
    setTimeout(() => {
        saveCard(currentPeriodIndex);

        // Después de 5 segundos, guardar y ocultar
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) translateY(-20px)';

            setTimeout(() => {
                card.classList.add('carta-hidden');
                card.style.opacity = '';
                card.style.transform = '';
                card.style.transition = '';
            }, 500);
        }, 5000);
    }, 1000);
}

// Reproducir sonido de notificación
function playNotification() {
    const sound = document.getElementById('notification-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {
            // Los navegadores bloquean autoplay sin interacción
            console.log('El sonido se reproducirá cuando interactúes');
        });
    }
}

/* ============================================
   7. MODAL PARA VER CARTAS GUARDADAS
   ============================================ */
function showModal(index) {
    const card = collectedCards[index];
    if (!card) return;

    document.getElementById('modal-emoji').textContent = card.emoji;
    document.getElementById('modal-message').textContent = card.message;
    document.getElementById('modal-time').textContent =
        `${card.period} · ${card.time}`;

    document.getElementById('modal').classList.add('show');
}

function cerrarModal(event) {
    if (event.target === document.getElementById('modal') ||
        event.target.classList.contains('modal-close')) {
        document.getElementById('modal').classList.remove('show');
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('modal').classList.remove('show');
    }
});

/* ============================================
   8. INICIALIZAR TODO
   ============================================ */
loadCollectedCards();