const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const loadingScreen = document.getElementById('loadingScreen');
const mainContent = document.getElementById('mainContent');

// DOM elementlari
const aboutTextContainer = document.querySelector('.about-text');
const aboutStatsContainer = document.getElementById('about-stats');
const skillsGridContainer = document.getElementById('skills-grid');
const projectsGridContainer = document.getElementById('projects-grid');
const contactContentContainer = document.getElementById('contact-content');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const animateSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillsSection = document.querySelector('#skills');
    if (!skillsSection || !skillBars.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const level = bar.getAttribute('data-level');
                    bar.style.width = level + '%';
                });
                observer.unobserve(skillsSection); 
            }
        });
    }, { threshold: 0.2 });

    observer.observe(skillsSection);
};

// --------------------------------------------------------
// DATA.JSON DAN SAHIFANI TO'LDIRISH MANTIQI
// --------------------------------------------------------
const loadDataAndRenderPage = async () => {
    try {
        const response = await fetch('data.json'); 
        if (!response.ok) throw new Error(`HTTP Xato: ${response.status} ${response.statusText}`);
        const data = await response.json();
        
        // About
        if (data.about && aboutTextContainer && aboutStatsContainer) {
            aboutTextContainer.innerHTML = data.about.text.map(p => `<p>${p}</p>`).join('');
            aboutStatsContainer.innerHTML = data.about.stats.map(stat => `
                <div class="stat-card">
                    <h3>${stat.value}</h3>
                    <p>${stat.label}</p>
                </div>
            `).join('');
        }

        // Skills
        if (data.skills && skillsGridContainer) {
            skillsGridContainer.innerHTML = data.skills.map(skill => {
                const isSpecial = skill.isSpecial;
                const levelDisplay = isSpecial ? skill.level : `${skill.level}%`;
                const levelValue = isSpecial ? 100 : skill.level; 
                
                return `
                    <div class="skill-card ${isSpecial ? 'special-card' : ''}">
                        <div class="skill-header">
                            <h3>${skill.name}</h3>
                            ${isSpecial ? `<div class="vibe-badge"><i class="fas fa-hand-peace"></i> ${levelDisplay}</div>` : `<span>${levelDisplay}</span>`}
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-level="${levelValue}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Projects
        if (data.projects && projectsGridContainer) {
            projectsGridContainer.innerHTML = data.projects.map(project => `
                <div class="project-card">
                    <div class="project-inner">
                        <div class="project-front">
                            <div class="project-image">
                                <img src="${project.image}" alt="${project.title} loyihasi">
                            </div>
                            <div class="project-info">
                                <h3>${project.title}</h3>
                                <p>${project.description}</p>
                                <div class="project-tech">
                                    ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="project-back">
                            <p>${project.detailedDescription}</p>
                            <div class="project-links">
                                <a href="${project.url}" target="_blank" class="project-link">
                                    <i class="fas fa-eye"></i> Ko'rish
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            handleProjectImageErrors();
        }

        // Contact
        if (data.contact && contactContentContainer) {
            contactContentContainer.innerHTML = `
                <p class="contact-description">${data.contact.description}</p>
                <a href="${data.contact.telegram.url}" target="_blank" class="telegram-button">
                    <i class="fab fa-telegram-plane"></i> ${data.contact.telegram.username}
                </a>
            `;
        }

        return data;

    } catch (error) {
        console.error('Data yuklashda fatal xato:', error);
        if (aboutTextContainer) {
            aboutTextContainer.innerHTML = `<p class="text-red-500 text-center">Xatolik: Ma'lumotlarni yuklab bo'lmadi. data.json faylini tekshiring. (Xato: ${error.message})</p>`;
        }
        return null;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadDataAndRenderPage();
    if (loadingScreen && mainContent) {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContent.style.display = 'block';
                animateSkillBars();
            }, 500);
        }, 50);
    }
});

const handleProjectImageErrors = () => {
    document.querySelectorAll('.project-image img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const parent = this.parentElement;
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1f1f2f, #2d2d44);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 0.9rem;
                border-radius: 8px;
                padding: 10px;
                text-align: center;
            `;
            placeholder.textContent = this.closest('.project-card').querySelector('h3').textContent;
            parent.appendChild(placeholder);
        });
    });
}
