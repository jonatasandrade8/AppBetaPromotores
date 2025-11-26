// ==================== CONFIGURAÇÃO DE TAREFAS ====================
const DAILY_TASKS = [
    { time: "22:31", message: "Bom dia! Tenha um excelente dia de trabalho", tag: "bom_dia", label: "Alerta de Bom Dia" },
    { time: "22:32", message: "É hora de tirar fotos da bancada!", tag: "bancada_foto", label: "Fotos da Bancada" },
    { time: "22:33", message: "É hora de passar o estoque!", tag: "estoque_registro", label: "Registro de Estoque" },
    { time: "22:34", message: "Lembre-se de tirar fotos da bancada antes de finalizar a jornada!", tag: "foto_final", label: "Fotos Finais" }
];

// ==================== 1. FUNÇÃO CORE DE PERMISSÃO ====================

/**
 * @description Garante a permissão de notificação ANTES de qualquer ação.
 * @param {function(boolean)} callback - Executado após a verificação, com 'true' se a permissão foi concedida.
 */
function ensureNotificationPermission(callback) {
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações.");
        if (callback) callback(false);
        return;
    }

    if (Notification.permission === "granted") {
        if (callback) callback(true); // Já temos permissão
    } else if (Notification.permission !== "denied") {
        // "default" ou "prompt" - É aqui que pedimos
        Notification.requestPermission().then((permission) => {
            if (callback) callback(permission === "granted");
        });
    } else {
        // "denied" - O usuário bloqueou permanentemente
        console.warn("As notificações foram bloqueadas permanentemente pelo usuário.");
        if (callback) callback(false);
    }
}

// ==================== 2. FUNÇÕES DE ALERTA, VOZ E SOM ====================

/**
 * @description Toca um som de alerta persistente por 4 segundos.
 */
function playPersistentAlert(callback) {
    const audioUrl = './sounds/alert.mp3'; 
    const alertDurationMs = 4000; 
    const audio = new Audio(audioUrl);
    
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; 
            if (callback) callback(); 
        }, alertDurationMs);
    }).catch(error => {
        console.warn("⚠️ Som bloqueado pelo navegador. A voz será iniciada em 1s.", error);
        if (callback) setTimeout(callback, 1000); 
    });
}

/**
 * @description Converte o texto da mensagem em voz.
 */
function speakAlert(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; 
        utterance.volume = 1.0; 
        utterance.rate = 1.1; 
        utterance.pitch = 1.0; 
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("A API de Síntese de Fala não é suportada neste navegador.");
    }
}

/**
 * @description Exibe um modal de pop-up dentro da aplicação.
 */
function showInAppAlert(message) {
    const modal = document.getElementById('in-app-alert-modal');
    const messageEl = document.getElementById('in-app-alert-message');
    const closeBtn = document.getElementById('in-app-alert-close');
    
    if (modal && messageEl && closeBtn) {
        messageEl.textContent = message;
        modal.classList.add('active');
        
        const closeHandler = () => {
            modal.classList.remove('active');
            closeBtn.removeEventListener('click', closeHandler);
        };
        closeBtn.addEventListener('click', closeHandler);
    }
}

/**
 * @description Sequencia todos os 4 tipos de notificação.
 * Verifica se a tarefa foi ignorada ("check") pelo usuário.
 */
function sendNotificationAndSpeak(task, voiceMessage) {
    
    // --- VERIFICAÇÃO DE "CHECK" (IGNORAR) ---
    const todayStr = new Date().toISOString().split('T')[0];
    const skippedTasks = JSON.parse(localStorage.getItem('skippedTasks')) || {};
    
    if (skippedTasks[task.tag] === todayStr) {
        console.log(`Alerta ignorado (check): ${task.message}`);
        return; // Pula o alerta
    }
    // --- FIM DA VERIFICAÇÃO ---

    // 1. Notificação Visual (Pop-up/Balloon do Navegador)
    if (Notification.permission === "granted") {
        new Notification("🚨 Lembrete: Qdelícia Frutas", {
            body: task.message,
            icon: './images/logo-qdelicia.png', 
            tag: task.tag, 
            renotify: true 
        });
    }

    // 2. Pop-up interno da Aplicação
    showInAppAlert(task.message);

    // 3. Som de Alerta Nativo (MP3) e Voz
    playPersistentAlert(() => {
        speakAlert(voiceMessage);
    });
}

// ==================== 3. LÓGICA DE AGENDAMENTO DIÁRIO ====================

/**
 * @description Inicia o agendamento de todas as tarefas.
 * Esta função SÓ DEVE ser chamada após a permissão ser concedida e na pág. principal.
 */
function startAlertSystem() {
    console.log("Iniciando Sistema de Alertas...");
    if (Notification.permission !== "granted") {
        console.warn("Agendamento de alertas visuais pulado: permissão não concedida.");
        return;
    }

    // Limpa os "checks" (ignorados) do dia anterior
    const todayStr = new Date().toISOString().split('T')[0];
    let skippedTasks = JSON.parse(localStorage.getItem('skippedTasks')) || {};
    for (const tag in skippedTasks) {
        if (skippedTasks[tag] !== todayStr) {
            delete skippedTasks[tag];
        }
    }
    localStorage.setItem('skippedTasks', JSON.stringify(skippedTasks));
    
    const promotorNome = localStorage.getItem('promotorNome') || "Promotor(a)";
    
    DAILY_TASKS.forEach(task => {
        const personalizedTask = { 
            ...task,
            voiceMessage: `${promotorNome}, ${task.message}`
        };
        scheduleDailyNotification(personalizedTask);
    });
    
    console.log("✅ Sistema de alertas visuais ativado e agendado.");
    localStorage.setItem('alertsScheduled', 'true'); // Flag (usada pelo login)
}

/**
 * @description Agenda a notificação para um horário específico de forma recursiva (diária).
 */
function scheduleDailyNotification(task) {
    const [targetHour, targetMinute] = task.time.split(':').map(Number);
    
    const calculateDelay = () => {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);

        if (target.getTime() <= now.getTime()) {
            // Se o horário já passou hoje, agenda para amanhã
            target.setDate(target.getDate() + 1); 
        }
        return target.getTime() - now.getTime();
    };
    
    const delay = calculateDelay();

    console.log(`Tarefa agendada: ${task.label}. Próxima execução em ${Math.round(delay / 1000 / 60)} min.`);

    setTimeout(() => {
        // Envia todos os 4 tipos de alerta
        sendNotificationAndSpeak(task, task.voiceMessage);
        // Re-agenda para o próximo dia
        scheduleDailyNotification(task); 
    }, delay);
}

// ==================== 4. FUNÇÕES EXPOSTAS PARA O EXTERIOR ====================

/**
 * @description Pede permissão e DEPOIS fala.
 * Usado pelo login.js (DOMContentLoaded) para o boas-vindas genérico.
 */
window.requestPermissionAndSpeak = function(text) {
    ensureNotificationPermission(() => {
        // A permissão é solicitada, mas o áudio toca independentemente
        speakAlert(text);
    });
};

/**
 * @description (CORRIGIDO) Pede permissão e fala. NÃO inicia mais o sistema.
 * Usado pelo login.js (handleLogin) ao clicar em "Entrar".
 * @param {string} promotorNome - O nome do promotor logado.
 */
window.welcomeAndStartAlerts = function(promotorNome) {
    
    // 1. Pede a permissão primeiro
    ensureNotificationPermission((permissionGranted) => {
        
        // 2. Toca o áudio de "configuração"
        const welcomeMessage = `Bem-vindo, ${promotorNome}! Iniciando configuração de alertas sonoros.`;
        speakAlert(welcomeMessage);

        // 3. (CORREÇÃO) A chamada 'startAlertSystem()' foi REMOVIDA daqui.
        // O agendamento agora é feito pelo DOMContentLoaded da 'index.html'.
        
        if (!permissionGranted) {
             console.warn("Sistema de alertas visuais (pop-ups) desativado. Permissão negada ou bloqueada.");
        }
    });
}

/**
 * @description Expondo a função de teste de áudio (usada em login.html).
 */
window.unlockAndTestAudio = function() {
    ensureNotificationPermission(() => {
        playPersistentAlert(() => {
            speakAlert("Teste de áudio e voz realizado com sucesso!");
        });
    });
};

/**
 * @description Expõe a lista de tarefas para o script.js (contadores).
 */
window.getDailyTasks = function() {
    return DAILY_TASKS;
}

/**
 * @description (CORRIGIDO) Lógica de inicialização do sistema na 'index.html'.
 * Esta é agora a ÚNICA fonte de agendamento de alertas.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na 'index.html' (ou qualquer página com 'session-countdown')
    const isOnAppPage = document.getElementById('session-countdown-container');
    
    // Se a permissão já foi dada E estamos na página principal,
    // o sistema DEVE iniciar o agendamento sempre que a página é carregada.
    if (Notification.permission === 'granted' && isOnAppPage) {
        // A verificação 'alertsScheduled' foi removida para garantir
        // que os 'setTimeout' sejam recriados em cada carregamento da página.
        startAlertSystem(); 
    }
});
