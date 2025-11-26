(function() {
    'use strict';

    const MENU_ITEMS = [
        { href: 'index.html', icon: 'fas fa-home', label: 'Início' },
        { href: 'estoque.html', icon: 'fas fa-boxes-stacked', label: 'Estoque' },
        { href: 'caixas.html', icon: 'fas fa-box-open', label: 'Caixas' },
        { href: 'camera.html', icon: 'fas fa-camera', label: 'Câmera' },
        { href: 'relatorio.html', icon: 'fas fa-file-alt', label: 'Relatório/Qualidade' }
    ];

    function checkSession() {
        const token = localStorage.getItem('sessionToken');

        if (!token) {
            window.location.href = './login.html';
            return false;
        }

        try {
            const sessionData = JSON.parse(atob(token));

            if (Date.now() > sessionData.expiry) {
                console.warn('Sessão expirada. Redirecionando para login.');
                localStorage.clear();
                window.location.href = './login.html';
                return false;
            }

            if (sessionData.id !== localStorage.getItem('promotorId')) {
                console.error('Inconsistência de ID detectada. Forçando logout.');
                localStorage.clear();
                window.location.href = './login.html';
                return false;
            }

            return true;
        } catch (e) {
            console.error('Token de sessão inválido ou corrompido.', e);
            localStorage.clear();
            window.location.href = './login.html';
            return false;
        }
    }

    function logout() {
        console.log("Executando logout...");
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('promotorNome');
        localStorage.removeItem('promotorEstado');
        localStorage.removeItem('promotorId');
        localStorage.removeItem('alertsScheduled');
        localStorage.removeItem('skippedTasks');
        window.location.href = './login.html';
    }

    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return page;
    }

    function renderSideMenu() {
        const sideMenu = document.querySelector('.side-menu');
        if (!sideMenu) return;

        const currentPage = getCurrentPage();
        let menuHTML = '';

        MENU_ITEMS.forEach(item => {
            const isActive = item.href === currentPage ? ' class="active"' : '';
            menuHTML += `<a href="./${item.href}"${isActive}><i class="${item.icon}"></i> ${item.label}</a>\n`;
        });

        menuHTML += `<a href="#" id="logout-btn-menu"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
        sideMenu.innerHTML = menuHTML;
    }

    function renderNavMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const currentPage = getCurrentPage();
        let navHTML = '';

        MENU_ITEMS.forEach(item => {
            const isActive = item.href === currentPage ? ' class="active"' : '';
            navHTML += `<a href="./${item.href}"${isActive}>${item.label}</a>\n`;
        });

        nav.innerHTML = navHTML;
    }

    function initializeMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const menuOverlay = document.querySelector('.menu-overlay');
        const logoutBtn = document.getElementById('logout-btn-menu');

        if (menuToggle && sideMenu && menuOverlay) {
            const toggleMenu = () => {
                sideMenu.classList.toggle('active');
                menuOverlay.classList.toggle('active');
            };

            menuToggle.addEventListener('click', toggleMenu);
            menuOverlay.addEventListener('click', toggleMenu);

            sideMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    sideMenu.classList.remove('active');
                    menuOverlay.classList.remove('active');
                });
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }

    function initializeBackToTop() {
        const backToTop = document.querySelector('.back-to-top');
        if (!backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initializeShared() {
        renderSideMenu();
        renderNavMenu();
        initializeMenu();
        initializeBackToTop();
    }

    window.QdeliciaShared = {
        checkSession: checkSession,
        logout: logout,
        initializeShared: initializeShared,
        renderSideMenu: renderSideMenu,
        renderNavMenu: renderNavMenu,
        initializeMenu: initializeMenu,
        initializeBackToTop: initializeBackToTop,
        MENU_ITEMS: MENU_ITEMS
    };

    document.addEventListener('DOMContentLoaded', () => {
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (!isLoginPage) {
            initializeShared();
        }
    });

})();
