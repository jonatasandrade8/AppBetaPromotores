(function() {
    'use strict';

    let countdownInterval = null;

    function startSessionCountdown() {
        const countdownElement = document.getElementById('session-countdown');
        const container = document.getElementById('session-countdown-container');
        if (!countdownElement || !container) return;
        
        const targetTime = new Date();
        targetTime.setHours(15, 20, 0, 0);
        const expiryTime = targetTime.getTime();

        let sessionInterval = null; 

        const updateCountdown = () => {
            const now = Date.now();
            const timeRemaining = expiryTime - now;

            if (timeRemaining <= 0) {
                clearInterval(sessionInterval);
                countdownElement.textContent = '00:00:00';
                container.classList.add('warning');
            } else {
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                
                countdownElement.textContent = 
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                if (timeRemaining < 10 * 60 * 1000) container.classList.add('warning');
            }
        };
        
        container.style.display = 'block';
        updateCountdown(); 
        sessionInterval = setInterval(updateCountdown, 1000); 
    }

    function updateCountdowns() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const skippedTasks = JSON.parse(localStorage.getItem('skippedTasks')) || {};

        const trackers = document.querySelectorAll('.task-tracker[data-tag]');
        
        trackers.forEach(tracker => {
            const tag = tracker.dataset.tag;
            const time = tracker.dataset.time;
            const countdownEl = tracker.querySelector('.task-countdown');
            const checkBtn = tracker.querySelector('.task-check-btn');

            if (!time || !countdownEl || !checkBtn) return;

            if (skippedTasks[tag] === todayStr) {
                countdownEl.textContent = "Ignorado para hoje";
                tracker.classList.add('checked');
                checkBtn.disabled = true;
                return;
            }

            const [targetHour, targetMinute] = time.split(':').map(Number);
            const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
            const timeRemaining = targetTime.getTime() - now.getTime();

            if (timeRemaining <= 0) {
                countdownEl.textContent = "Alerta disparado";
                tracker.classList.add('expired');
                checkBtn.disabled = true;
            } else {
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                
                countdownEl.textContent = 
                    `Faltam ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        });
    }

    function handleTaskSkip(e) {
        const button = e.currentTarget;
        const tag = button.dataset.tag;
        if (!tag) return;

        const todayStr = new Date().toISOString().split('T')[0];
        let skippedTasks = JSON.parse(localStorage.getItem('skippedTasks')) || {};
        
        skippedTasks[tag] = todayStr;
        localStorage.setItem('skippedTasks', JSON.stringify(skippedTasks));
        
        updateCountdowns();
    }

    function initializeTaskTrackers() {
        if (typeof window.getDailyTasks !== 'function') {
            return;
        }

        const tasks = window.getDailyTasks();
        const container = document.getElementById('task-trackers');
        if (!container) return;

        container.innerHTML = '<h2>Próximos Alertas do Dia</h2>'; 

        tasks.forEach(task => {
            const trackerEl = document.createElement('div');
            trackerEl.className = 'task-tracker';
            trackerEl.dataset.tag = task.tag;
            trackerEl.dataset.time = task.time; 

            trackerEl.innerHTML = `
                <div class="task-info">
                    <span class="task-label">${task.label}</span>
                    <span class="task-countdown">Calculando...</span>
                </div>
                <button class="task-check-btn" data-tag="${task.tag}" aria-label="Ignorar alerta ${task.label}">
                    <i class="fas fa-check"></i> Ignorar
                </button>
            `;
            
            container.appendChild(trackerEl);
            trackerEl.querySelector('.task-check-btn').addEventListener('click', handleTaskSkip);
        });

        updateCountdowns();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdowns, 1000);
    }

    function initializeCarousel() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0 || dots.length === 0) return;

        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        showSlide(0);
        setInterval(nextSlide, 5000);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
    }
    
    function initializeWelcomeMessage() {
        const welcomeElement = document.getElementById('welcome-message');
        const promotorNome = localStorage.getItem('promotorNome');
        if (welcomeElement && promotorNome) {
            welcomeElement.textContent = `Bem-vindo(a), ${promotorNome}!`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeWelcomeMessage();
        startSessionCountdown(); 
        initializeCarousel();
        initializeTaskTrackers();
    });

})();
