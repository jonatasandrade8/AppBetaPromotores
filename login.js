// =================================================================
// 1. ESTRUTURA DE DADOS CENTRALIZADA
// =================================================================
const APP_DATA_FULL = {
    "Rio Grande do Norte": {
        "Miqueias": { id: "RN1001", redes: { "Assaí": ["Ponta Negra"] } },
        "Jordão": { id: "RN2001", redes: { "Superfácil": ["Olho d'ÁGua", "Emaús"], "Mar Vermelho": ["BR-101 Sul"] } },
        "Cosme": { id: "RN1002", redes: { "Assaí": ["Zona Norte"] } },
        "David": { id: "RN1003", redes: { "Assaí": ["Zona Sul"] } },
        "Erivan": { id: "RN1004", redes: { "Assaí": ["Maria Lacerda"] } },
        "Inacio": { id: "RN1005", redes: { "Atacadão": ["Prudente"] } },
        "Vivian": { id: "RN1006", redes: { "Atacadão": ["BR-101 Sul"] } },
        "Amarildo": { id: "RN1007", redes: { "Atacadão": ["Zona Norte"], "Nordestão": ["Loja 05"] } },
        "Nilson": { id: "RN1008", redes: { "Atacadão": ["Parnamirim"] } },
        "Markson": { id: "RN1009", redes: { "Nordestão": ["Loja 08"], "Mar Vermelho": ["Parnamirim"], "Atacadão": ["BR-101 Sul"] } },
        "Mateus": { id: "RN1010", redes: { "Nordestão": ["Loja 04"], "Carrefour": ["Zona Sul"] } },
        "Cristiane": { id: "RN1011", redes: { "Nordestão": ["Loja 07"] } },
        "J Mauricio": { id: "RN1012", redes: { "Nordestão": ["Loja 03"] } },
        "Neto": { id: "RN1013", redes: { "Superfácil": ["Emaús"] } },
        "Antonio": { id: "RN1014", redes: { "Superfácil": ["Nazaré"] } }
    },
    "Paraíba": {
        "João": { id: "PB2001", redes: { "RDAAAAA": ["MKBBB", "MKCCC"]} }
    }
};

// =================================================================
// 2. ELEMENTOS DO DOM
// =================================================================
const selectEstado = document.getElementById('select-estado');
const selectPromotor = document.getElementById('select-promotor');
const inputId = document.getElementById('input-id');
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const testAlertBtn = document.getElementById('test-alert-btn'); 

const loadingOverlay = document.getElementById('loading-overlay');
const welcomeMessageElement = document.getElementById('loading-welcome-message');
const loadingStatusElement = document.getElementById('loading-status');

const togglePassword = document.getElementById('toggle-password');
const rememberMeCheckbox = document.getElementById('remember-me');


// =================================================================
// 3. FUNÇÕES DE SUPORTE (Dropdowns e Erros)
// =================================================================

function populateEstado() {
    selectEstado.innerHTML = '<option value="" disabled selected>Selecione seu Estado</option>';
    Object.keys(APP_DATA_FULL).forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        selectEstado.appendChild(option);
    });
}

function populatePromotor(estado) {
    selectPromotor.innerHTML = '<option value="" disabled selected>Selecione seu Nome</option>';
    selectPromotor.disabled = true;
    inputId.disabled = true;

    if (APP_DATA_FULL[estado]) {
        Object.keys(APP_DATA_FULL[estado]).forEach(promotorNome => {
            const option = document.createElement('option');
            option.value = promotorNome;
            option.textContent = promotorNome;
            selectPromotor.appendChild(option);
        });
        selectPromotor.disabled = false;
        inputId.disabled = false;
    }
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    inputId.value = '';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4000);
}


// =================================================================
// 4. FUNÇÃO CORE: LÓGICA DE LOGIN (Logout à meia-noite)
// =================================================================

function handleLogin(e) {
    e.preventDefault();

    const estadoSelecionado = selectEstado.value;
    const promotorSelecionado = selectPromotor.value;
    const idDigitado = inputId.value.trim();

    if (!estadoSelecionado || !promotorSelecionado || !idDigitado) {
        displayError("Por favor, preencha todos os campos.");
        return;
    }

    const promotorData = APP_DATA_FULL[estadoSelecionado] ? APP_DATA_FULL[estadoSelecionado][promotorSelecionado] : null;

    if (promotorData && idDigitado === promotorData.id) {
        
        try {
            // Define a expiração para 23:59:59 do dia de hoje
            const expiryTime = new Date();
            expiryTime.setHours(23, 59, 59, 999); // Garante logout à meia-noite

            const sessionData = {
                id: promotorData.id,
                name: promotorSelecionado,
                expiry: expiryTime.getTime(), 
                token_v: 1 
            };
            const sessionToken = btoa(JSON.stringify(sessionData));
            
            // Salva ou limpa a preferência "Lembrar-me"
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEstado', estadoSelecionado);
                localStorage.setItem('rememberedPromotor', promotorSelecionado);
                localStorage.setItem('rememberMePreference', 'true');
            } else {
                localStorage.removeItem('rememberedEstado');
                localStorage.removeItem('rememberedPromotor');
                localStorage.removeItem('rememberMePreference');
            }

            // Armazena os dados no localStorage
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('promotorNome', promotorSelecionado);
            localStorage.setItem('promotorEstado', estadoSelecionado);
            localStorage.setItem('promotorId', promotorData.id);
            localStorage.removeItem('isAuthenticated'); 
            
            // ATIVAÇÃO DO LOADING
            if (loadingOverlay) {
                loginForm.style.display = 'none'; 
                welcomeMessageElement.textContent = `Bem-vindo(a), ${promotorSelecionado}!`;
                loadingStatusElement.textContent = `Ativando sistema de alertas diários...`;
                loadingOverlay.classList.add('active'); 
            }

            // LÓGICA DE ÁUDIO E PERMISSÃO
            if (typeof window.welcomeAndStartAlerts === 'function') {
                window.welcomeAndStartAlerts(promotorSelecionado);
            } else {
                console.warn("Aviso: Função (welcomeAndStartAlerts) não encontrada.");
            }

            // IMPLEMENTAÇÃO DO DELAY (APENAS PARA REDIRECIONAMENTO)
            setTimeout(() => {
                // CORREÇÃO: Usando './' para garantir que o caminho seja relativo
                window.location.href = './index.html';
            }, 5000); 

        } catch (e) {
            console.error("Erro ao gerar ou armazenar token de sessão:", e);
            displayError("Erro interno de autenticação. Tente novamente.");
            if (loadingOverlay) {
                loginForm.style.display = 'block'; 
                loadingOverlay.classList.remove('active');
            }
        }

    } else {
        displayError("Dados de login inválidos. Verifique Estado, Promotor e ID Pessoal Único.");
    }
}


// =================================================================
// 6. VERIFICAÇÃO DE SESSÃO EXISTENTE (CORRIGIDO)
// =================================================================
function checkExistingSession() {
    const token = localStorage.getItem('sessionToken');
    if (!token) return false;

    try {
        const sessionData = JSON.parse(atob(token));
        // Esta verificação agora invalida o token após a meia-noite
        if (Date.now() < sessionData.expiry) {
            // CORREÇÃO: Usando './' para garantir que o caminho seja relativo
            window.location.href = './index.html'; 
            return true;
        } else {
            localStorage.clear(); // Limpa sessão expirada
            return false;
        }
    } catch (e) {
        localStorage.clear();
        return false;
    }
}

// =================================================================
// 6.5. VERIFICA JANELA DE HORÁRIO DE LOGIN (06:00 - 15:20)
// =================================================================
function checkLoginWindow() {
    const loginBtn = document.getElementById('login-btn');
    const restrictionMsg = document.getElementById('time-restriction-message');
    const formElements = [ selectEstado, selectPromotor, inputId, loginBtn, testAlertBtn, rememberMeCheckbox ];

    if (!loginBtn || !restrictionMsg) {
        console.warn("Elementos de restrição de login não encontrados.");
        return; 
    }

    const now = new Date();
    const currentTimeInMinutes = (now.getHours() * 60) + now.getMinutes();
    const startTimeInMinutes = 0 * 60;       // 06:00
    const endTimeInMinutes = (23 * 60) + 20; // 15:20

    // Para testes, descomente a linha abaixo
    // const isAllowed = true;
    const isAllowed = (currentTimeInMinutes >= startTimeInMinutes && 
                       currentTimeInMinutes <= endTimeInMinutes);

    if (isAllowed) {
        formElements.forEach(el => el && (el.disabled = false));
        restrictionMsg.style.display = 'none';
        if (!selectEstado.value) {
            selectPromotor.disabled = true;
            inputId.disabled = true;
        }
    } else {
        formElements.forEach(el => el && (el.disabled = true));
        restrictionMsg.textContent = "Horário de login (06:00 às 15:20) encerrado. Nos vemos amanhã!";
        restrictionMsg.style.display = 'block';
    }
}


// =================================================================
// 7. LISTENERS E INICIALIZAÇÃO
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Redireciona imediatamente se um token de sessão VÁLIDO for encontrado
    if (checkExistingSession()) {
        return; 
    }

    // 2. Mensagem de boas-vindas genérica (Delay de 3s)
    setTimeout(() => {
        if (typeof window.requestPermissionAndSpeak === 'function') {
            window.requestPermissionAndSpeak("Bem-vindo ao portal do promotor Q delícia frutas. Por favor, faça o login.");
        }
    }, 3000); 

    // 3. Inicializa os dropdowns e listeners de formulário
    if (selectEstado && loginForm) {
        populateEstado(); 
        
        const rememberedEstado = localStorage.getItem('rememberedEstado');
        const rememberedPromotor = localStorage.getItem('rememberedPromotor');
        const rememberPreference = localStorage.getItem('rememberMePreference');

        if (rememberPreference === 'true' && rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }

        if (rememberedEstado) {
            selectEstado.value = rememberedEstado;
            populatePromotor(rememberedEstado); 
            
            if (rememberedPromotor) {
                selectPromotor.value = rememberedPromotor; 
            }
        }
        
        selectEstado.addEventListener('change', (e) => populatePromotor(e.target.value));
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 4. Listener do Botão de Teste de Áudio
    if (testAlertBtn) {
        testAlertBtn.addEventListener('click', () => {
            if (typeof window.unlockAndTestAudio === 'function') {
                window.unlockAndTestAudio();
            }
        });
    }

    // Listener do "Mostrar Senha"
    if (togglePassword && inputId) {
        togglePassword.addEventListener('click', () => {
            const type = inputId.getAttribute('type') === 'password' ? 'text' : 'password';
            inputId.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
    
    // 5. Ativa a verificação de horário de login
    checkLoginWindow();
    setInterval(checkLoginWindow, 60000); 
});
