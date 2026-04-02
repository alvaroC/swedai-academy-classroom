// ====================================================
// SwedAI Academy Classroom – Standalone app.js
// Two-column: Classroom (left) + Bygg AI (right)
// No Supabase, no auth.
// ====================================================

const COURSE_CATALOG = {
    'chatgpt-mastery': { id: 'chatgpt-mastery', name: 'Introduktion till ChatGPT Mastery Program' },
    'intro-ai': { id: 'intro-ai', name: 'Introduktion till AI' },
    'prompt-eng': { id: 'prompt-eng', name: 'ChatGPT Prompt Engineering' },
    'deep-research': { id: 'deep-research', name: 'ChatGPT Deep Research' },
    'agent-läge': { id: 'agent-läge', name: 'ChatGPT Agentläge' },
    'gpt': { id: 'gpt', name: 'Skapa GPTs' },
    'agent-builder': { id: 'agent-builder', name: 'ChatGPT Agent Builder' },
    'claude-mastery': { id: 'claude-mastery', name: 'Introduktion till Claude Mastery Program' },
    // Bygg AI Förmåga
    'system-processer': { id: 'system-processer', name: 'System och processer' },
    'informationslager': { id: 'informationslager', name: 'Informationslager' },
    'growth-marketing': { id: 'growth-marketing', name: 'Growth Marketing' },
};

function getCourseData(courseId) {
    if (!window.notebookData) return null;
    if (window.notebookData[courseId]) return window.notebookData[courseId];
    
    if (window.notebookData["ai-models"]) {
        const models = window.notebookData["ai-models"];
        if (models.chatgpt && models.chatgpt[courseId]) return models.chatgpt[courseId];
        if (models.claude && models.claude[courseId]) return models.claude[courseId];
    }
    return null;
}

let currentCourseId = 'chatgpt-mastery';
let currentCourseId2 = 'intro-ai';
let currentByggCourseId = 'system-processer';

// -------------------------------------------------------
// RENDERERS – Classroom (left column)
// -------------------------------------------------------
// -------------------------------------------------------
// ARTIFACT HEAD BUILDER – shared helper
// -------------------------------------------------------
function artifactHead({ icon, label, title, subtitle, gradient, titleColor, subtitleColor }) {
    return `
    <div class="artifact-head" style="background:${gradient};">
        <div class="artifact-head-icon">${icon}</div>
        <div class="artifact-head-label">${label}</div>
        <h2 class="artifact-head-title" style="color:${titleColor};">${title}</h2>
        <p class="artifact-head-subtitle" style="color:${subtitleColor};">${subtitle}</p>
    </div>`;
}

const renderers = {

    podcast: (data) => `
        <div class="artifact-card-new">
            ${artifactHead({
        icon: '<i class="fas fa-microphone-alt"></i>',
        label: 'PODCAST',
        title: data.title,
        subtitle: data.description || 'Lyssna på veckans avsnitt',
        gradient: 'linear-gradient(135deg, #0f2c4a 0%, #1a5276 50%, #117a8b 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(180,230,255,0.85)'
    })}
            <div class="artifact-body">
                <audio controls src="${data.url}" preload="auto"></audio>
            </div>
        </div>`,

    infographic: (data) => `
        <div class="artifact-card-new">
            ${artifactHead({
        icon: '<i class="fas fa-chart-bar"></i>',
        label: 'INFOGRAFIK',
        title: data.title,
        subtitle: data.summary || 'Klicka på bilden för att zooma',
        gradient: 'linear-gradient(135deg, #6b1a4b 0%, #c0392b 50%, #e74c3c 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(255,200,200,0.85)'
    })}
            <div class="artifact-body">
                <div style="cursor:zoom-in;" onclick="openLightbox('${data.imageUrl}')">
                    <img src="${data.imageUrl}" alt="${data.title}"
                         style="width:100%;height:auto;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                    <p style="text-align:center;font-size:0.75rem;color:#94a3b8;margin-top:8px;">🔍 Klicka för att zooma</p>
                </div>
            </div>
        </div>`,

    video: (data) => `
        <div class="artifact-card-new">
            ${artifactHead({
        icon: '<i class="fas fa-film"></i>',
        label: 'VIDEO',
        title: data.title,
        subtitle: data.description || 'Titta på kursvideo',
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #5b2d8e 50%, #8e44ad 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(220,190,255,0.85)'
    })}
            <div class="artifact-body">
                <video controls width="100%" src="${data.url}" style="border-radius:8px;">
                    ${data.captions ? `<track src="${data.captions}" kind="captions" srclang="sv" label="Svenska" default>` : ''}
                </video>
            </div>
        </div>`,

    mindmap: (data) => `
        <div class="artifact-card-new">
            ${artifactHead({
        icon: '<i class="fas fa-brain"></i>',
        label: 'MIND MAP',
        title: data.title,
        subtitle: 'Interaktiv kunskapsöversikt',
        gradient: 'linear-gradient(135deg, #0b3d2e 0%, #1a7a50 50%, #27ae60 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(160,255,200,0.85)'
    })}
            <div class="artifact-body artifact-body-mindmap">
                <div class="markmap">
                    <script type="text/template">${data.content}<\/script>
                </div>
            </div>
        </div>`,

    quiz: (data, activeCourseId = 'default') => `
        <div class="artifact-card-new quiz-container" id="quiz-area-${activeCourseId}">
            ${artifactHead({
        icon: '<i class="fas fa-question-circle"></i>',
        label: 'QUIZ',
        title: data.title,
        subtitle: 'Testa dina kunskaper',
        gradient: 'linear-gradient(135deg, #7d3c00 0%, #d35400 50%, #e67e22 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(255,220,160,0.85)'
    })}
            <div class="artifact-body" style="text-align:center;">
                <button class="nav-btn active" onclick="loadActiveQuiz('${activeCourseId}')" style="margin:0 auto;display:inline-flex;">Starta Quiz</button>
            </div>
        </div>`,

    report: (data) => `
        <div class="artifact-card-new">
            ${artifactHead({
        icon: '<i class="fas fa-file-alt"></i>',
        label: 'RAPPORT / E-BOOK',
        title: data.title,
        subtitle: data.summary || 'Fördjupa din kunskap',
        gradient: 'linear-gradient(135deg, #1c2b3a 0%, #2c3e50 50%, #34495e 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(180,210,240,0.85)'
    })}
            <div class="artifact-body">
                <div class="report-preview-box">
                    <h3 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:0.6rem;">Innehåll:</h3>
                    <ul class="report-chapter-list">
                        ${data.chapters.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
                <div class="report-actions">
                    <a href="${data.fileUrl}" download class="download-btn">
                        <span>📥</span> Ladda ned (PDF)
                    </a>
                </div>
            </div>
        </div>`,

    table: async (tableConfig) => {
        try {
            const response = await fetch(tableConfig.sourceFile);
            const fullData = await response.json();
            return `
            <div class="artifact-card-new">
                ${artifactHead({
                icon: '<i class="fas fa-table"></i>',
                label: 'JÄMFÖRELSETABELL',
                title: fullData.titel,
                subtitle: 'Strukturerad kunskapsöversikt',
                gradient: 'linear-gradient(135deg, #1a3a5c 0%, #1a6fa8 50%, #2980b9 100%)',
                titleColor: '#ffffff',
                subtitleColor: 'rgba(180,220,255,0.85)'
            })}
                <div class="artifact-body artifact-body-table">
                    <table class="comparison-grid">
                        <thead>
                            <tr>
                                <th style="width:40%">BESKRIVNING</th>
                                <th style="width:30%">ANALOGI</th>
                                <th style="width:30%">EXEMPEL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fullData.grenar.map(gren => `
                                <tr class="branch-header-row"><td colspan="3"><h4>${gren.typ}</h4></td></tr>
                                <tr class="branch-content-row">
                                    <td><p>${gren.beskrivning}</p></td>
                                    <td><span class="analogi-text">"${gren.analogi}"</span></td>
                                    <td><ul class="example-list">${gren.exempel.map(ex => `<li>${ex}</li>`).join('')}</ul></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (e) {
            return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Kunde inte ladda tabellen.</div></div>`;
        }
    },

    flashcards: async (data) => {
        let cards = data.cards;
        let title = data.title;

        if (data.flashcardsUrl) {
            try {
                const response = await fetch(data.flashcardsUrl);
                const loadedData = await response.json();
                cards = loadedData.cards;
                title = loadedData.title || title;
            } catch (e) {
                return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Kunde inte ladda flashcards.</div></div>`;
            }
        }

        if (!cards || cards.length === 0) {
            return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Inga flashcards hittades.</div></div>`;
        }

        let currentIndex = 0;
        let isShowingAnswer = false;

        window.refreshFlashcard = () => {
            const cardText = document.getElementById('fc-display-text');
            const actionBtn = document.getElementById('fc-action-btn');
            const counter = document.getElementById('fc-counter-text');
            if (!cardText) return;

            if (isShowingAnswer) {
                cardText.innerHTML = `<div class="answer-reveal"><strong>SVAR:</strong><br>${cards[currentIndex].a}</div>`;
                actionBtn.innerText = "Nästa kort →";
                actionBtn.onclick = () => {
                    currentIndex = (currentIndex + 1) % cards.length;
                    isShowingAnswer = false;
                    window.refreshFlashcard();
                };
            } else {
                cardText.innerHTML = `<div class="question-view">${cards[currentIndex].q}</div>`;
                actionBtn.innerText = "Visa Svar";
                actionBtn.onclick = () => { isShowingAnswer = true; window.refreshFlashcard(); };
            }
            counter.innerText = `Kort ${currentIndex + 1} av ${cards.length}`;
        };

        return `
        <div class="artifact-card-new">
            ${artifactHead({
            icon: '<i class="fas fa-clone"></i>',
            label: 'FLASHCARDS',
            title: title,
            subtitle: `${cards.length} kort – testa ditt minne`,
            gradient: 'linear-gradient(135deg, #5c3d00 0%, #b7770d 50%, #f0a500 100%)',
            titleColor: '#ffffff',
            subtitleColor: 'rgba(255,240,180,0.9)'
        })}
            <div class="artifact-body">
                <div class="fc-header" style="margin-bottom:0.8rem;justify-content:flex-end;">
                    <span id="fc-counter-text" class="badge">Laddar...</span>
                </div>
                <div id="fc-display-text" class="fc-content-area">${cards[0].q}</div>
                <div class="fc-footer" style="margin-top:1rem;">
                    <button id="fc-action-btn" onclick="window.refreshFlashcard()">Visa Svar</button>
                </div>
            </div>
        </div>
        <script>setTimeout(window.refreshFlashcard, 50);<\/script>`;
    },

    presentation: (data) => {
        let currentSlide = 0;

        window.refreshPresentation = () => {
            const img = document.getElementById('pres-img');
            const counter = document.getElementById('pres-counter');
            const nextBtn = document.getElementById('pres-next-btn');
            if (!img) return;
            img.src = data.slides[currentSlide];
            counter.innerText = `Slide ${currentSlide + 1} av ${data.slides.length}`;
            nextBtn.innerText = (currentSlide === data.slides.length - 1) ? "Börja om" : "Nästa →";
        };

        window.changeSlide = (step) => {
            currentSlide = (currentSlide + step + data.slides.length) % data.slides.length;
            window.refreshPresentation();
        };

        return `
        <div class="artifact-card-new">
            ${artifactHead({
            icon: '<i class="fas fa-tv"></i>',
            label: 'PRESENTATION',
            title: data.title,
            subtitle: `${data.slides.length} slides – klicka dig igenom`,
            gradient: 'linear-gradient(135deg, #3d0066 0%, #7b1fa2 50%, #ab47bc 100%)',
            titleColor: '#ffffff',
            subtitleColor: 'rgba(230,180,255,0.85)'
        })}
            <div class="artifact-body">
                <div class="fc-header" style="margin-bottom:0.8rem;justify-content:flex-end;">
                    <span id="pres-counter" class="badge">Laddar...</span>
                </div>
                <div class="pres-viewer">
                    <img id="pres-img" src="${data.slides[0]}" alt="Slide">
                </div>
                <div class="fc-footer" style="margin-top:1rem;">
                    <button class="nav-btn" onclick="changeSlide(-1)">← Föregående</button>
                    <button id="pres-next-btn" class="fc-red-btn" onclick="changeSlide(1)">Nästa →</button>
                </div>
            </div>
        </div>
        <script>setTimeout(window.refreshPresentation, 50);<\/script>`;
    },
};

let _enrollCounter = 0;

// -------------------------------------------------------
// ENROLLMENT BANNER (Classroom - Left)
// -------------------------------------------------------
function enrollmentBannerClassroom(courseId, courseName) {
    const uid = `enroll-${++_enrollCounter}`;
    return `
    <div class="enroll-banner">
        <div class="enroll-banner-inner">
            <h2 class="enroll-title">
                VILL DU BLI AI-PROFFS?
            </h2>
            <p class="enroll-body">
                Denna <strong>"Nivå 1" </strong> är gratis men det finns ytterligare 5 nivåer inom CharGPT Mastery programmet som hjälper dig att utveckla din AI-professionella
                kompetens på ett strukturerat och effektivt sätt.
            </p>
            <p class="enroll-cta-text">
                <strong>"ChatGPT Mastery Program"</strong> lanseras snart. Anmäl dig till programmet:
            </p>
            <div class="enroll-form-row">
                <label class="enroll-label" for="${uid}">Ange din e-postadress.</label>
                <div class="enroll-input-group">
                    <input
                        id="${uid}"
                        type="email"
                        class="enroll-input"
                        placeholder="din@email.se"
                    >
                    <button
                        class="enroll-btn"
                        onclick="handleEnrollSubmit(this, '${uid}', '${courseId}', '${courseName}')"
                    >Skicka</button>
                </div>
                <p id="${uid}-feedback" class="enroll-feedback"></p>
            </div>
            <p class="enroll-note">
                <strong>OBS: De 20 första anmälda får 15 % rabatt. Erbjudandet är tidsbegränsat.</strong>
            </p>
        </div>
    </div>`;
}

// -------------------------------------------------------
// ENROLLMENT BANNER (Bygg AI - Right)
// -------------------------------------------------------
function enrollmentBannerBygg(courseId, courseName) {
    const uid = `enroll-${++_enrollCounter}`;
    return `
    <div class="enroll-banner">
        <div class="enroll-banner-inner">
            <h2 class="enroll-title">
                VILL DU TÄNKA SOM EN AI-STRATEG?
            </h2>
            <p class="enroll-body">
                I nivåerna 1–4 lär du dig hur ChatGPT-ekosystemet fungerar. I nivå 5 (AI-konsult) lär du dig hur detta
                 ekosystem kan användas i praktiken för att lösa verkliga problem. I denna nivå 6, som kompletterar de tidigare
                  nivåerna, tar du nästa steg </p>

             <p class="enroll-body">      
                  Nivån 6 handlar om att tänka som en AI-strateg – ett sätt att förstå 
                  hur AI förändrar arbete, organisationer och affärsmodeller, och hur du kan använda AI för att möta 
                  framtidens utmaningar, både som kunskapsarbetare eller som entreprenör                
            </p>
            <p class="enroll-cta-text">
                <strong>"ChatGPT Mastery Program"</strong> lanseras snart. Anmäl dig till programmet:
            </p>
            <div class="enroll-form-row">
                <label class="enroll-label" for="${uid}">Ange din e-postadress.</label>
                <div class="enroll-input-group">
                    <input
                        id="${uid}"
                        type="email"
                        class="enroll-input"
                        placeholder="din@email.se"
                    >
                    <button
                        class="enroll-btn"
                        onclick="handleEnrollSubmit(this, '${uid}', '${courseId}', '${courseName}')"
                    >Skicka</button>
                </div>
                <p id="${uid}-feedback" class="enroll-feedback"></p>
            </div>
            <p class="enroll-note">
                <strong>OBS: De 20 första anmälda får 15 % rabatt. Erbjudandet är tidsbegränsat.</strong>
            </p>
        </div>
    </div>`;
}


// -------------------------------------------------------
// LEFT COLUMN / RIGHT COLUMN – Classroom course selector
// -------------------------------------------------------
function selectCourse(courseId, column = 1) {
    const isCol1 = column === 1;
    if (isCol1) {
        currentCourseId = courseId;
    } else {
        currentCourseId2 = courseId;
    }

    const nameEl = document.getElementById(isCol1 ? 'active-course-name' : 'active-course-name-2');
    if (nameEl && COURSE_CATALOG[courseId]) nameEl.innerText = COURSE_CATALOG[courseId].name;

    const grid = document.getElementById(isCol1 ? 'gallery-grid' : 'gallery-grid-2');
    if (grid) {
        grid.innerHTML = `
        <div class="light-welcome-msg">
            <span style="font-size:1.6rem;">👋</span>
            <strong>Välkommen till ${COURSE_CATALOG[courseId]?.name || courseId}</strong>
            <span>Välj ett material i menyn ovan för att börja.</span>
        </div>`;
    }

    const filterDrop = document.getElementById(isCol1 ? 'content-filter-dropdown' : 'content-filter-dropdown-2');
    if (filterDrop) filterDrop.value = 'all';
}

// -------------------------------------------------------
// LEFT COLUMN / RIGHT COLUMN – Material gallery filter
// -------------------------------------------------------
async function filterGallery(contentType, column = 1) {
    const isCol1 = column === 1;
    const gridId = isCol1 ? 'gallery-grid' : 'gallery-grid-2';
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';
    _enrollCounter = 0; // reset counter for fresh IDs

    const activeCourseId = isCol1 ? currentCourseId : currentCourseId2;
    const courseData = getCourseData(activeCourseId);

    if (!courseData || Object.keys(courseData).length === 0) {
        grid.innerHTML = `
        <div class="light-welcome-msg">
            <div style="font-size:2.5rem;opacity:0.5;">🎯</div>
            <strong>Innehåll under utveckling</strong>
            <span>Material för <em>${COURSE_CATALOG[activeCourseId]?.name || activeCourseId}</em> kommer snart!</span>
        </div>`;
        return;
    }

    const keysToSkip = ['title', 'updates', 'exercises'];
    const keys = Object.keys(courseData).filter(k => !keysToSkip.includes(k));
    let hasContent = false;
    const courseName = COURSE_CATALOG[activeCourseId]?.name || activeCourseId;

    for (const key of keys) {
        if (contentType !== 'all' && contentType !== key) continue;
        if (!renderers[key]) continue;
        try {
            const html = await renderers[key](courseData[key], activeCourseId);
            grid.insertAdjacentHTML('beforeend', html);
            // 👉 Lägg till enrollment-banners efter varje artefakt
            grid.insertAdjacentHTML('beforeend', enrollmentBannerClassroom(activeCourseId, courseName));
            hasContent = true;
        } catch (e) {
            console.error(`Render error for "${key}":`, e);
        }
    }

    if (!hasContent) {
        grid.innerHTML = `
        <div class="light-welcome-msg">
            <span style="font-size:2rem;">🔍</span>
            <span>Inget <strong>${contentType}</strong>-material finns för denna kurs.</span>
        </div>`;
    }

    if (window.markmap && window.markmap.autoLoader) window.markmap.autoLoader.renderAll();
}

// -------------------------------------------------------
// RIGHT COLUMN – Bygg AI Förmåga
// -------------------------------------------------------
window.selectByggCourse = function (courseId) {
    currentByggCourseId = courseId;
    const byggGrid = document.getElementById('bygg-gallery');
    if (byggGrid) {
        byggGrid.innerHTML = `
        <div class="dark-welcome-msg">
            <span style="font-size:1.6rem;">👋</span>
            <span>Välkommen!</span>
            <span style="font-size:0.82rem;opacity:0.55;">Välj material i menyn ovan för att börja.</span>
        </div>`;
    }
    const filterDrop = document.getElementById('bygg-filter-dropdown');
    if (filterDrop) filterDrop.value = 'all';
}

// -------------------------------------------------------
// RIGHT COLUMN – Bygg AI material filter
// -------------------------------------------------------
window.filterByggGallery = async function (contentType) {
    const grid = document.getElementById('bygg-gallery');
    if (!grid) return;

    grid.innerHTML = '';
    _enrollCounter = 0;

    const courseData = getCourseData(currentByggCourseId);

    if (!courseData || Object.keys(courseData).length === 0) {
        grid.innerHTML = `
        <div class="dark-welcome-msg">
            <div style="font-size:2.5rem;opacity:0.4;">🎯</div>
            <span>Material under utveckling – kom tillbaka snart!</span>
        </div>`;
        return;
    }

    const keysToSkip = ['title', 'updates', 'exercises'];
    const keys = Object.keys(courseData).filter(k => !keysToSkip.includes(k));
    let hasContent = false;

    const courseName = COURSE_CATALOG[currentByggCourseId]?.name || currentByggCourseId;

    for (const key of keys) {
        if (contentType !== 'all' && contentType !== key) continue;
        if (!renderers[key]) continue;
        try {
            const html = await renderers[key](courseData[key], currentByggCourseId);
            // Wrap in dark-styled container
            grid.insertAdjacentHTML('beforeend', `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1rem;color:rgba(255,255,255,0.9); margin-bottom: 2rem;">
                ${html}
            </div>`);

            // Add enrollment-banner after each artifact
            grid.insertAdjacentHTML('beforeend', enrollmentBannerBygg(currentByggCourseId, courseName));

            hasContent = true;
        } catch (e) {
            console.error(`Bygg render error for "${key}":`, e);
        }
    }

    if (!hasContent) {
        grid.innerHTML = `
        <div class="dark-welcome-msg">
            <span style="font-size:1.8rem;">🔍</span>
            <span>Inget material av typen <strong>${contentType}</strong> hittades.</span>
        </div>`;
    }
}

// -------------------------------------------------------
// QUIZ (left column)
// -------------------------------------------------------
window.activeQuizModules = [];
window.quizScore = 0;
window.quizTotal = 0;

window.loadActiveQuiz = async function (clickedCourseId) {
    const courseIdToLoad = clickedCourseId || currentCourseId;
    const courseData = getCourseData(courseIdToLoad);
    const quizInfo = courseData ? courseData.quiz : null;
    if (!quizInfo || !quizInfo.quizUrl) { alert('Quiz-filen saknas.'); return; }

    try {
        const resp = await fetch(quizInfo.quizUrl);
        const quizData = await resp.json();

        let modules = [];
        if (quizData.modules) {
            modules = quizData.modules;
        } else if (quizData.quiz) {
            // Treat all questions as a single continuous module so they flow in order of ID
            const questions = quizData.quiz.map(q => {
                const optKeys = Object.keys(q.options || {});
                const optArray = optKeys.map(k => q.options[k]);
                const correctIndex = optKeys.indexOf(q.correct_answer);

                return {
                    question: q.question,
                    category: q.category || 'Quiz',
                    options: optArray,
                    correct_answer_index: correctIndex >= 0 ? correctIndex : 0,
                    explanation: q.explanation
                };
            });
            modules = [{
                module_name: 'Quiz',
                questions: questions
            }];
        }

        window.activeQuizModules = modules;
        window.quizScore = 0;
        window.quizTotal = 0;

        if (modules.length > 0 && modules[0].questions.length > 0) {
            window.renderQuizQuestion(0, 0, courseIdToLoad);
        } else {
            console.error('Quiz data saknar frågor eller moduler.', quizData);
        }
    } catch (e) { console.error('Quiz load error:', e); }
};

window.renderQuizQuestion = function (mIdx, qIdx, activeCourseId) {
    const module = window.activeQuizModules[mIdx];
    const question = module.questions[qIdx];
    const area = document.getElementById(`quiz-area-${activeCourseId}`) || document.querySelector('.quiz-container');
    if (!area) return;

    area.innerHTML = `
    <div class="quiz-active-card">
        <div class="quiz-header">
            <span class="module-name">${question.category || module.module_name}</span>
            <span class="progress">Fråga ${qIdx + 1} av ${module.questions.length}</span>
        </div>
        <h2 class="quiz-question-text">${question.question}</h2>
        <div class="quiz-options-grid">
            ${question.options.map((opt, i) => `
                <button class="quiz-option-btn" onclick="submitQuizAnswer(${mIdx},${qIdx},${i},'${activeCourseId}')">${opt}</button>
            `).join('')}
        </div>
        <div id="quiz-feedback-${activeCourseId}" style="margin-top:0.8rem;"></div>
    </div>`;
};

window.submitQuizAnswer = function (mIdx, qIdx, selectedIdx, activeCourseId) {
    const module = window.activeQuizModules[mIdx];
    const question = module.questions[qIdx];
    const fb = document.getElementById(`quiz-feedback-${activeCourseId}`) || document.getElementById('quiz-feedback');
    const isCorrect = selectedIdx === question.correct_answer_index;

    if (fb.getAttribute('data-answered') === 'true') return;

    window.quizTotal++;

    if (isCorrect) {
        window.quizScore++;
        fb.setAttribute('data-answered', 'true');

        let html = `<p style="color:#059669;font-weight:600;font-size:0.9rem;margin-bottom:0.5rem;">✅ Rätt svar!</p>`;

        if (question.explanation) {
            html += `<div style="background:#f8fafc; border-left:4px solid #059669; padding:0.75rem; border-radius:4px; margin-bottom:1rem; text-align:left;">
                        <strong style="color:#059669;font-size:0.85rem;text-transform:uppercase;">Förklaring</strong>
                        <p style="color:#334155;font-size:0.95rem;margin-top:0.3rem;">${question.explanation}</p>
                     </div>`;
        }

        html += `<button class="nav-btn active" onclick="window.nextQuizQuestion(${mIdx}, ${qIdx}, '${activeCourseId}')" style="padding:0.6rem 1.2rem;">Nästa →</button>`;
        fb.innerHTML = html;

        const optionsGrid = fb.previousElementSibling;
        if (optionsGrid) {
            const btns = optionsGrid.querySelectorAll('.quiz-option-btn');
            btns.forEach((btn, idx) => {
                btn.style.pointerEvents = 'none';
                if (idx === selectedIdx) {
                    btn.style.backgroundColor = '#d1fae5';
                    btn.style.borderColor = '#059669';
                    btn.style.color = '#065f46';
                } else {
                    btn.style.opacity = '0.5';
                }
            });
        }
    } else {
        fb.innerHTML = `<p style="color:#ef4444;font-weight:600;font-size:0.9rem;">❌ Fel svar – försök igen!</p>`;
    }
}

window.nextQuizQuestion = function (mIdx, qIdx, activeCourseId) {
    const module = window.activeQuizModules[mIdx];
    if (qIdx + 1 < module.questions.length) {
        renderQuizQuestion(mIdx, qIdx + 1, activeCourseId);
    } else if (mIdx + 1 < window.activeQuizModules.length) {
        renderQuizQuestion(mIdx + 1, 0, activeCourseId);
    } else {
        const area = document.getElementById(`quiz-area-${activeCourseId}`) || document.querySelector('.quiz-container');
        if (area) area.innerHTML = `
            <div style="text-align:center;padding:2rem 0.5rem;">
                <div style="font-size:3rem;margin-bottom:0.8rem;">🎉</div>
                <h2 style="font-size:1.2rem;">Quiz slutfört!</h2>
                <p style="font-size:1rem;margin:0.8rem 0;">Du fick <strong>${window.quizScore} av ${window.quizTotal}</strong> rätt</p>
                <button class="btn-primary" onclick="loadActiveQuiz('${activeCourseId}')" style="margin-top:0.8rem;">Försök igen</button>
            </div>`;
        window.quizScore = 0;
        window.quizTotal = 0;
    }
};


// -------------------------------------------------------
// LIGHTBOX (ZOOM IN IMAGES)
// -------------------------------------------------------
function openLightbox(src) {
    const overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
    <div class="lightbox-content">
        <span class="lightbox-close" onclick="closeLightbox()">×</span>
        <img src="${src}" class="lightbox-image">
    </div>`;
    overlay.style.display = 'flex';
    overlay.onclick = (e) => { if (e.target === overlay) closeLightbox(); };
}

function closeLightbox() {
    const o = document.getElementById('lightbox-overlay');
    if (o) o.style.display = 'none';
}

// -------------------------------------------------------
// GLOBAL AUDIO BAR (Right column)
// -------------------------------------------------------
let mainAudio = null;
window.toggleMainAudio = function (btn, url) {
    if (!mainAudio) {
        mainAudio = new Audio(url);
        mainAudio.onended = () => {
            btn.innerHTML = '<i class="fas fa-play"></i> AUDIO';
            btn.classList.remove('playing');
        };
    }

    if (mainAudio.paused) {
        mainAudio.play().catch(e => console.error("Audio play error:", e));
        btn.innerHTML = '<i class="fas fa-pause"></i> AUDIO (Playing)';
        btn.classList.add('playing');
    } else {
        mainAudio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i> AUDIO';
        btn.classList.remove('playing');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SwedAI Academy Classroom – Two-column ready');
});
