Guia da Aplicação de Alertas para Promotores (Qdelícia Frutas)

Este documento é o guia oficial para manutenção, personalização e teste da aplicação de alertas para promotores.

1. Visão Geral

Esta aplicação web serve como um assistente diário para os promotores, fornecendo:

Um sistema de login seguro com restrição de horário.

Uma sessão de utilizador que expira automaticamente à meia-noite, forçando um novo login diário.

Um sistema de alertas diários multi-plataforma (Pop-up Nativo, Som, Voz Sintetizada e Modal Interno).

Contadores regressivos visuais para as próximas tarefas.

Funcionalidade para "ignorar" (check) tarefas já realizadas.

2. Estrutura dos Ficheiros

Para modificar a aplicação, é crucial entender a responsabilidade de cada ficheiro:

login.html: Apenas a estrutura visual da página de login.

login.js: O "cérebro" do login. Controla:

A lista de utilizadores e IDs (APP_DATA_FULL).

A restrição de horário (06:00 - 15:20).

A criação da sessão (token) que expira à meia-noite.

A lógica do "Lembrar-me".

index.html: A página principal. Contém os "locais" (placeholders) para os contadores e o modal de alerta.

script.js: O "cérebro" da página principal. Controla:

A atualização dos contadores regressivos (updateCountdowns).

A lógica dos botões "Ignorar" (check).

O contador visual da sessão (15:20).

O menu lateral e o botão de logout.

alert.js: O "cérebro" dos alertas. Controla:

A lista de tarefas diárias (DAILY_TASKS).

O pedido de permissão de notificação ao navegador.

O agendamento (setTimeout) e o disparo de todos os 4 tipos de alertas.

style.css: Todos os estilos visuais da aplicação.

/sounds/alert.mp3: O som de alerta.

3. Guia de Modificação e Ajustes

Aqui estão as instruções para as personalizações mais comuns.

3.1. Como Adicionar/Remover Promotores ou Mudar IDs

Ficheiro: login.js

Local: Procure pela constante APP_DATA_FULL no topo do ficheiro.

A estrutura é:

const APP_DATA_FULL = {
    "Rio Grande do Norte": {
        "Miqueias": { id: "RN1001", redes: { ... } },
        "Jordão": { id: "RN2001", redes: { ... } }
    },
    "Paraíba": {
        "João": { id: "PB2001", redes: { ... } }
    }
};


Para adicionar um promotor: Adicione uma nova linha no estado correto (ex: "Novo Promotor": { id: "RN1015", redes: {} }).

Para alterar um ID: Simplesmente mude o valor da id (ex: id: "RN1001").

3.2. Como Adicionar/Remover/Mudar Alertas Diários

Este é o controlo principal do seu sistema.

Ficheiro: alert.js

Local: Procure pela constante DAILY_TASKS no topo do ficheiro.

A estrutura é:

const DAILY_TASKS = [
    { time: "HH:MM", message: "Mensagem de alerta", tag: "id_unico", label: "Texto do Contador" },
    ...
];


time: O horário de disparo no formato "HH:MM" (24 horas).

message: A mensagem que será lida em voz alta e mostrada no pop-up.

tag: Um identificador único em texto. Não pode ser repetido.

label: O texto que aparece no contador da index.html.

Para adicionar um alerta: Copie uma linha {...}, inteira, cole-a e modifique os 4 valores.

Para remover um alerta: Apague a linha inteira do alerta (incluindo o { e o },).

3.3. Como Mudar Textos da Interface (Modais e Botões)

A. Modal de Alerta (Pop-up Interno)

Ficheiro: index.html

Local: Perto do final do ficheiro, procure por id="in-app-alert-modal".

<div id="in-app-alert-modal" ...>
    <div class="in-app-modal-content">
        <!-- PODE MUDAR O TÍTULO AQUI -->
        <h3><i class="fas fa-bell"></i> Lembrete Qdelícia</h3>

        <p id="in-app-alert-message">...</p>

        <!-- PODE MUDAR O TEXTO DO BOTÃO AQUI -->
        <button id="in-app-alert-close">Entendido</button>
    </div>
</div>


B. Botão "Ignorar" (Check)

Ficheiro: script.js

Local: Procure pela função initializeTaskTrackers().

Instrução: Altere o texto ou o ícone dentro do molde innerHTML:

trackerEl.innerHTML = `
    ...
    <button class="task-check-btn" ...>
        <!-- PODE MUDAR AQUI -->
        <i class="fas fa-check"></i> Ignorar
    </button>
`;


C. Checkbox "Lembrar-me" (Login)

Ficheiro: login.html

Local: Procure por id="remember-me".

Instrução: Altere o texto dentro da <label>:

<div class="options-group">
    <input type="checkbox" id="remember-me">
    <!-- PODE MUDAR O TEXTO AQUI -->
    <label for="remember-me">Lembrar meu Estado e Nome</label>
</div>


4. Guia de Testes

A aplicação é baseada em tempo, o que torna os testes difíceis. Use estes "modos de teste" para verificar as funcionalidades a qualquer hora.

4.1. Teste Essencial: Login Fora do Horário (06:00 - 15:20)

Para testar o login a qualquer hora (ex: às 22:00):

Abra: login.js

Encontre: A função checkLoginWindow().

Procure: A linha que começa com const isAllowed = ... (perto da linha 218).

Mude:

// Linha Original:
const isAllowed = (currentTimeInMinutes >= startTimeInMinutes && ...);

// Mude PARA:
const isAllowed = true;


Salve o ficheiro. Agora pode fazer login 24/7.

IMPORTANTE: Lembre-se de reverter esta alteração (const isAllowed = true;) para a linha original antes de publicar a aplicação.

4.2. Teste Rápido de Alertas

Quer testar se um alerta específico está a funcionar?

Abra: alert.js

Encontre: const DAILY_TASKS.

Ajuste: Veja que horas são agora (ex: 14:50). Mude o time de um dos alertas para 1-2 minutos no futuro (ex: time: "14:52").

Salve, faça login (com a restrição do passo 4.1 desligada) e aguarde. O alerta deve disparar.

4.3. Teste Completo de Alertas (Som, Voz, Pop-up, Modal)

A forma mais fácil de testar todos os 4 tipos de notificação de uma vez.

Vá para: A página de login.html no navegador.

Clique: No botão "Testar Áudio/Notificação".

O que acontece: O sistema irá pedir permissão (se necessário) e disparar imediatamente o primeiro alerta da DAILY_TASKS (o de "Bom dia"), ativando o som, a voz, o pop-up nativo e o modal interno.

4.4. Teste de Logout Automático (Meia-noite)

Quer testar se o logout à meia-noite está a funcionar, mas não quer esperar?

Abra: login.js

Encontre: A função handleLogin().

Procure: As linhas (perto da linha 113):

// Define a expiração para 23:59:59 do dia de hoje
const expiryTime = new Date();
expiryTime.setHours(23, 59, 59, 999);


Altere: Mude essas linhas para definir uma expiração de 1 minuto:

// (MODO DE TESTE) Define a expiração para 1 minuto no futuro
const expiryTime = new Date(Date.now() + (1 * 60 * 1000));


Salve, faça login. Aceda à index.html. Aguarde 1 minuto e tente recarregar a página. Será redirecionado para o login.

IMPORTANTE: Lembre-se de reverter esta alteração para o setHours(23, 59, 59, 999) original.