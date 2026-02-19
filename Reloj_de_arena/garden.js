/* ============================================
   JARDÍN SECRETO - Sistema Completo
   ============================================ */

/* ============================================
   1. CONFIGURACIÓN
   ============================================ */
const PLANT_STAGES = [
    { emoji: "🌱", name: "Brote", minGrowth: 0 },
    { emoji: "🌿", name: "Tallo pequeño", minGrowth: 15 },
    { emoji: "☘️", name: "Planta joven", minGrowth: 30 },
    { emoji: "🪴", name: "Planta en crecimiento", minGrowth: 50 },
    { emoji: "🌷", name: "Capullo", minGrowth: 70 },
    { emoji: "🌸", name: "Flor en progreso", minGrowth: 85 },
    { emoji: "💮", name: "Flor completa", minGrowth: 95 },
    { emoji: "💐", name: "Flor radiante", minGrowth: 100 }
];

const LOVE_MESSAGES = [
    "Tu planta se siente querida 💜",
    "Las hojas brillan con tu cariño ✨",
    "La planta se mueve suavemente hacia ti 🌿",
    "Puedes sentir una calidez especial 🌟",
    "La planta parece sonreír 😊",
    "Tu amor la hace más fuerte 💪",
    "Las raíces crecen más profundo con tu afecto 🌱"
];

const SING_MESSAGES = [
    "🎵 La planta baila suavemente con la música...",
    "🎶 Las hojas tiemblan de felicidad...",
    "🎵 Parece que le gusta esa melodía...",
    "🎶 La planta crece un poquito más con cada nota...",
    "🎵 Sus pétalos se abren al ritmo de tu canción..."
];

/* ============================================
   2. VARIABLES DEL JARDÍN
   ============================================ */
let gardenData = null;
let secretProgress = 0;
const SECRET_THRESHOLD = 7;
let plantingStep = 0;

/* ============================================
   3. GUARDAR Y CARGAR DATOS
   ============================================ */
function loadGardenData() {
    const saved = localStorage.getItem('gardenData');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        secretDiscovered: false,
        planted: false,
        plantDate: null,
        plantName: null,
        water: 0,
        love: 0,
        growth: 0,
        stage: 0,
        diary: [],
        lastActions: {},
        totalDaysCared: 0
    };
}

function saveGardenData() {
    localStorage.setItem('gardenData', JSON.stringify(gardenData));
}

/* ============================================
   4. INTERACCIÓN SECRETA CON EL RELOJ
   ============================================ */
function initSecretInteraction() {
    const arenaWrapper = document.getElementById('arena-wrapper');

    if (!arenaWrapper) return;

    // Hacer que el área de Lottie NO bloquee clicks
    const arenaDiv = document.getElementById('arena');
    if (arenaDiv) {
        arenaDiv.style.pointerEvents = 'none';
    }

    // CLICK para PC
    arenaWrapper.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSecretTap();
    });

    // TOUCH para celular
    arenaWrapper.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSecretTap();
    });

    // Cargar datos guardados
    gardenData = loadGardenData();

    // Si ya tiene planta, resetear el progreso visual del anillo
    if (gardenData.secretDiscovered) {
        secretProgress = SECRET_THRESHOLD;
        updateSecretRing();
        document.getElementById('arena-glow').classList.add('glowing');
    }
}

function handleSecretTap() {
    // Si ya tiene planta, abrir jardín directo
    if (gardenData && gardenData.planted) {
        showPhase(3);
        updatePlantDisplay();
        document.getElementById('garden-modal').classList.add('show');
        return;
    }

    // Si ya descubrió el secreto pero no plantó
    if (gardenData && gardenData.secretDiscovered) {
        document.getElementById('garden-modal').classList.add('show');
        return;
    }

    // Incrementar progreso
    secretProgress++;

    // Actualizar anillo
    updateSecretRing();

    // Efecto visual
    createTapEffect();

    // Hint a los 3 toques
    if (secretProgress >= 3) {
        document.getElementById('secret-hint').classList.add('visible');
    }

    // Brillo gradual
    if (secretProgress >= 2) {
        document.getElementById('arena-glow').classList.add('glowing');
    }

    // ¡Secreto descubierto!
    if (secretProgress >= SECRET_THRESHOLD) {
        discoverSecret();
    }
}

function updateSecretRing() {
    const progress = Math.min(secretProgress / SECRET_THRESHOLD, 1);
    const circumference = 2 * Math.PI * 110;
    const offset = circumference * (1 - progress);

    const ring = document.getElementById('ring-progress');
    if (ring) {
        ring.style.strokeDashoffset = offset;
    }
}

function createTapEffect() {
    const wrapper = document.getElementById('arena-wrapper');
    if (!wrapper) return;

    const colors = ['#c9a0dc', '#9b59b6', '#e8d5f5', '#7d3c98'];

    for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 6;
        const distance = 40 + Math.random() * 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const color = colors[Math.floor(Math.random() * colors.length)];

        spark.style.cssText = `
            position: absolute;
            width: 5px;
            height: 5px;
            background: ${color};
            border-radius: 50%;
            top: 50%;
            left: 50%;
            z-index: 10;
            pointer-events: none;
            transition: all 0.6s ease-out;
            transform: translate(-50%, -50%);
            opacity: 1;
        `;

        wrapper.appendChild(spark);

        // Animar con requestAnimationFrame
        requestAnimationFrame(() => {
            spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
            spark.style.opacity = '0';
        });

        setTimeout(() => spark.remove(), 700);
    }

    // Efecto de escala en el wrapper
    wrapper.style.transition = 'transform 0.15s ease';
    wrapper.style.transform = 'scale(0.95)';
    setTimeout(() => {
        wrapper.style.transform = 'scale(1)';
    }, 150);
}

function discoverSecret() {
    gardenData = loadGardenData();
    gardenData.secretDiscovered = true;
    saveGardenData();

    createCelebration();

    setTimeout(() => {
        showPhase(0);
        document.getElementById('garden-modal').classList.add('show');
        document.getElementById('secret-hint').classList.remove('visible');
    }, 800);
}

/* ============================================
   5. CELEBRACIÓN (CONFETI)
   ============================================ */
function createCelebration() {
    const colors = ['#9b59b6', '#c9a0dc', '#e8d5f5', '#7d3c98', '#f1c40f', '#e74c3c'];

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 8 + 5) + 'px';
            confetti.style.height = (Math.random() * 8 + 5) + 'px';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }

    // Vibración en móviles
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
}

/* ============================================
   6. FASES DEL JARDÍN
   ============================================ */
function showPhase(num) {
    document.querySelectorAll('.garden-phase').forEach(p => {
        p.classList.add('hidden');
    });
    const phase = document.getElementById(`phase-${num}`);
    if (phase) {
        phase.classList.remove('hidden');
    }
}

function closeGarden() {
    document.getElementById('garden-modal').classList.remove('show');
}

// FASE 0: Abrir sobre
function openEnvelope() {
    const envelope = document.getElementById('secret-envelope');
    if (envelope) {
        envelope.classList.add('opening');
        setTimeout(() => {
            showPhase(1);
        }, 800);
    }
}

// FASE 1: Tomar semilla
function takeSeed() {
    const seed = document.getElementById('magic-seed');
    if (!seed) return;

    seed.style.animation = 'none';
    seed.style.transition = 'all 0.5s ease';
    seed.style.transform = 'scale(0) rotate(180deg)';
    seed.style.opacity = '0';

    setTimeout(() => {
        showPhase(2);
        plantingStep = 0;
        updatePlantingUI();
    }, 600);
}

/* ============================================
   7. FASE 2: PLANTAR
   ============================================ */
function useTool(tool) {
    const toolEl = document.getElementById(`tool-${tool}`);
    if (!toolEl) return;
    if (toolEl.classList.contains('disabled') || toolEl.classList.contains('used')) return;

    switch (tool) {
        case 'shovel':
            if (plantingStep !== 0) return;
            digHole();
            break;
        case 'seed':
            if (plantingStep !== 1) return;
            plantSeedInGround();
            break;
        case 'cover':
            if (plantingStep !== 2) return;
            coverSeed();
            break;
        case 'water':
            if (plantingStep !== 3) return;
            waterSeed();
            break;
    }
}

function digHole() {
    document.getElementById('tool-shovel').classList.add('used');
    document.getElementById('hole').classList.remove('hidden');
    document.getElementById('garden-instruction').textContent = '🫘 Coloca la semilla';

    plantingStep = 1;
    updatePlantingUI();
    if (navigator.vibrate) navigator.vibrate(50);
}

function plantSeedInGround() {
    document.getElementById('tool-seed').classList.add('used');
    document.getElementById('planted-seed').classList.remove('hidden');
    document.getElementById('garden-instruction').textContent = '🪏 Tapa la semilla';

    plantingStep = 2;
    updatePlantingUI();
    if (navigator.vibrate) navigator.vibrate(30);
}

function coverSeed() {
    document.getElementById('tool-cover').classList.add('used');
    document.getElementById('hole').classList.add('hidden');
    document.getElementById('planted-seed').classList.add('hidden');
    document.getElementById('mound').classList.remove('hidden');
    document.getElementById('garden-instruction').textContent = '🚿 Riega la tierra';

    plantingStep = 3;
    updatePlantingUI();
    if (navigator.vibrate) navigator.vibrate(30);
}

function waterSeed() {
    document.getElementById('tool-water').classList.add('used');
    document.getElementById('water-drops').classList.remove('hidden');
    document.getElementById('garden-instruction').textContent = '✨ Algo está pasando...';

    plantingStep = 4;
    updatePlantingUI();

    setTimeout(() => {
        document.getElementById('water-drops').classList.add('hidden');
        document.getElementById('mound').classList.add('hidden');
        document.getElementById('sprout').classList.remove('hidden');
        document.getElementById('garden-instruction').textContent = '🌱 ¡Tu planta ha nacido!';

        createCelebration();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Guardar planta
        gardenData.planted = true;
        gardenData.plantDate = new Date().toISOString();
        gardenData.water = 50;
        gardenData.love = 50;
        gardenData.growth = 5;
        gardenData.stage = 0;
        gardenData.diary = [{
            date: new Date().toLocaleString(),
            text: "🌱 ¡La planta ha nacido! Un nuevo comienzo..."
        }];
        gardenData.lastActions = {};
        saveGardenData();

        // Ir a fase 3
        setTimeout(() => {
            showPhase(3);
            updatePlantDisplay();
            document.getElementById('name-plant').classList.remove('hidden');
        }, 2000);

    }, 1500);
}

function updatePlantingUI() {
    const tools = ['shovel', 'seed', 'cover', 'water'];
    tools.forEach((tool, i) => {
        const el = document.getElementById(`tool-${tool}`);
        if (!el) return;
        if (i === plantingStep) {
            el.classList.remove('disabled');
            el.classList.add('active');
        } else if (i < plantingStep) {
            el.classList.remove('active');
        } else {
            el.classList.add('disabled');
            el.classList.remove('active');
        }
    });

    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step && i <= plantingStep) {
            step.classList.add('done');
        }
    }
}

/* ============================================
   8. NOMBRAR LA PLANTA
   ============================================ */
function namePlant() {
    const input = document.getElementById('plant-name-input');
    const name = input.value.trim();

    if (!name) {
        input.style.borderColor = '#e74c3c';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 1000);
        return;
    }

    gardenData.plantName = name;
    gardenData.diary.push({
        date: new Date().toLocaleString(),
        text: `💜 La planta ahora se llama "${name}"`
    });
    saveGardenData();

    // Ocultar input y mostrar mensaje
    document.getElementById('name-plant').classList.add('hidden');

    // Actualizar display
    updatePlantDisplay();

    // Celebración pequeña
    createCelebration();
}

/* ============================================
   9. DISPLAY DE LA PLANTA
   ============================================ */
function updatePlantDisplay() {
    if (!gardenData || !gardenData.planted) return;

    // Determinar etapa
    let currentStage = PLANT_STAGES[0];
    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
        if (gardenData.growth >= PLANT_STAGES[i].minGrowth) {
            currentStage = PLANT_STAGES[i];
            gardenData.stage = i;
            break;
        }
    }

    // Actualizar visual de la planta
    const plantVisual = document.getElementById('plant-visual');
    if (plantVisual) {
        plantVisual.innerHTML = `<span style="font-size: ${3 + gardenData.stage * 0.5}rem">${currentStage.emoji}</span>`;
    }

    // Actualizar status
    const statusEl = document.getElementById('plant-status');
    if (statusEl) {
        const plantName = gardenData.plantName || 'Tu planta';
        statusEl.textContent = `${plantName} - ${currentStage.name}`;
    }

    // Actualizar barras
    const waterBar = document.getElementById('water-bar');
    const loveBar = document.getElementById('love-bar');
    const growthBar = document.getElementById('growth-bar');

    if (waterBar) waterBar.style.width = Math.min(gardenData.water, 100) + '%';
    if (loveBar) loveBar.style.width = Math.min(gardenData.love, 100) + '%';
    if (growthBar) growthBar.style.width = Math.min(gardenData.growth, 100) + '%';

    // Actualizar diario
    updateDiary();

    // Actualizar botones
    updateActionButtons();

    saveGardenData();
}

/* ============================================
   10. ACCIONES DIARIAS
   ============================================ */
function dailyAction(action) {
    if (!gardenData || !gardenData.planted) return;

    const today = new Date().toDateString();
    if (!gardenData.lastActions) gardenData.lastActions = {};

    // Verificar si ya hizo esta acción hoy
    if (gardenData.lastActions[action] === today) {
        return;
    }

    gardenData.lastActions[action] = today;

    let diaryText = '';
    const plantName = gardenData.plantName || 'La planta';

    switch (action) {
        case 'water':
            gardenData.water = Math.min(gardenData.water + 25, 100);
            gardenData.growth = Math.min(gardenData.growth + 5, 100);
            diaryText = `💧 Regaste a ${plantName}. ¡Se ve refrescante!`;

            // Animación de gotas
            showFloatingEmoji('💧');
            break;

        case 'love':
            gardenData.love = Math.min(gardenData.love + 20, 100);
            gardenData.growth = Math.min(gardenData.growth + 4, 100);
            const loveMsg = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];
            diaryText = loveMsg;

            showFloatingEmoji('💜');
            break;

        case 'sing':
            gardenData.love = Math.min(gardenData.love + 15, 100);
            gardenData.growth = Math.min(gardenData.growth + 6, 100);
            const singMsg = SING_MESSAGES[Math.floor(Math.random() * SING_MESSAGES.length)];
            diaryText = singMsg;

            showFloatingEmoji('🎵');
            break;
    }

    // Agregar al diario
    gardenData.diary.push({
        date: new Date().toLocaleString(),
        text: diaryText
    });

    // Vibración satisfactoria
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

    // Verificar si subió de nivel
    checkLevelUp();

    // Actualizar todo
    updatePlantDisplay();

    // Efecto en la planta
    const plantVisual = document.getElementById('plant-visual');
    if (plantVisual) {
        plantVisual.classList.add('celebrating');
        setTimeout(() => plantVisual.classList.remove('celebrating'), 600);
    }

    // Verificar si la planta llegó al máximo
    if (gardenData.growth >= 100) {
        setTimeout(() => {
            createCelebration();
            gardenData.diary.push({
                date: new Date().toLocaleString(),
                text: `🌸 ¡${plantName} ha florecido completamente! ¡Es hermosa!`
            });
            saveGardenData();
            updateDiary();
        }, 800);
    }
}

function checkLevelUp() {
    const oldStage = gardenData.stage;
    let newStage = 0;

    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
        if (gardenData.growth >= PLANT_STAGES[i].minGrowth) {
            newStage = i;
            break;
        }
    }

    if (newStage > oldStage) {
        gardenData.stage = newStage;
        const stage = PLANT_STAGES[newStage];

        gardenData.diary.push({
            date: new Date().toLocaleString(),
            text: `🎉 ¡Tu planta evolucionó a ${stage.name}! ${stage.emoji}`
        });

        createCelebration();
    }
}

function updateActionButtons() {
    const today = new Date().toDateString();
    if (!gardenData.lastActions) gardenData.lastActions = {};

    const actions = ['water', 'love', 'sing'];
    actions.forEach(action => {
        const btn = document.getElementById(`btn-${action}`);
        if (btn) {
            if (gardenData.lastActions[action] === today) {
                btn.disabled = true;
                btn.textContent = btn.textContent.split(' ')[0] + ' ✓ Hecho';
            } else {
                btn.disabled = false;
            }
        }
    });
}

function showFloatingEmoji(emoji) {
    const plantVisual = document.getElementById('plant-visual');
    if (!plantVisual) return;

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const float = document.createElement('div');
            float.textContent = emoji;
            float.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                pointer-events: none;
                left: ${30 + Math.random() * 40}%;
                bottom: 20%;
                z-index: 10;
                animation: emojiFloat 1.5s ease-out forwards;
            `;
            plantVisual.appendChild(float);
            setTimeout(() => float.remove(), 1500);
        }, i * 200);
    }

    // Agregar animación si no existe
    if (!document.getElementById('emoji-float-style')) {
        const style = document.createElement('style');
        style.id = 'emoji-float-style';
        style.textContent = `
            @keyframes emojiFloat {
                0% { transform: translateY(0) scale(0.5); opacity: 1; }
                100% { transform: translateY(-80px) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================
   11. DIARIO DE LA PLANTA
   ============================================ */
function updateDiary() {
    const diaryEl = document.getElementById('plant-diary');
    if (!diaryEl || !gardenData.diary) return;

    // Mostrar las últimas 10 entradas (más recientes primero)
    const entries = gardenData.diary.slice(-10).reverse();

    diaryEl.innerHTML = entries.map(entry => `
        <div class="diary-entry">
            <small>${entry.date}</small><br>
            ${entry.text}
        </div>
    `).join('');
}

/* ============================================
   12. PARTÍCULAS DE FONDO
   ============================================ */
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        container.appendChild(particle);
    }
}

/* ============================================
   13. DEGRADAR STATS CON EL TIEMPO
   ============================================ */
function degradeStats() {
    if (!gardenData || !gardenData.planted) return;

    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().toDateString();

    if (lastVisit && lastVisit !== now) {
        // Pasó al menos un día - degradar un poco
        gardenData.water = Math.max(gardenData.water - 10, 0);
        gardenData.love = Math.max(gardenData.love - 8, 0);

        if (gardenData.water <= 0 || gardenData.love <= 0) {
            gardenData.diary.push({
                date: new Date().toLocaleString(),
                text: "😢 Tu planta te extraña... necesita que la cuides"
            });
        }

        saveGardenData();
    }

    localStorage.setItem('lastVisit', now);
}

/* ============================================
   14. INICIALIZAR TODO
   ============================================ */
function initGarden() {
    // Cargar datos
    gardenData = loadGardenData();

    // Crear partículas
    createParticles();

    // Inicializar interacción secreta
    initSecretInteraction();

    // Degradar stats si pasó tiempo
    degradeStats();

    // Si ya tiene planta, preparar la fase 3
    if (gardenData.planted) {
        updatePlantDisplay();
    }
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGarden);
} else {
    initGarden();
}