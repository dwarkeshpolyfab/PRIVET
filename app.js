/* ============================================
   DayPilot - Daily Schedule Assistant
   Application Logic
   ============================================ */

// ---- Data & State ----
const STORAGE_KEY = 'daypilot_entries';
const SETTINGS_KEY = 'daypilot_settings';

const MORNING_QUESTIONS = [
    { key: 'important_task', question: "What is today's most important task? 🎯", placeholder: "e.g., Close the deal with ABC Corp" },
    { key: 'skills_to_learn', question: "What skills do you want to learn or improve today? 📚", placeholder: "e.g., Negotiation, Excel pivot tables" },
    { key: 'markets_to_touch', question: "Which markets do you need to touch today? 📊", placeholder: "e.g., IT sector, Healthcare" },
    { key: 'areas_industries', question: "Which areas & industries will you cover today? 🏭", placeholder: "e.g., Andheri - Real Estate, Bandra - Finance" },
    { key: 'afternoon_plan', question: "What's your afternoon plan? ☀️", placeholder: "e.g., Client meetings, follow-ups" },
    { key: 'morning_motivation', question: "One thing that will make today great? 💪", placeholder: "e.g., Closing 3 deals, learning something new" },
];

const EVENING_QUESTIONS = [
    { key: 'day_mood', question: "How was your day today? 🌟", type: 'mood' },
    { key: 'total_calls', question: "How many calls did you make today? 📞", type: 'number' },
    { key: 'followup_clients', question: "How many follow-up clients did you contact? 🔄", type: 'number' },
    { key: 'new_clients', question: "How many new clients did you connect with? 🤝", type: 'number' },
    { key: 'quotations_sent', question: "How many quotations did you send today? 📋", type: 'number' },
    { key: 'day_description', question: "Describe your day in short ✍️", type: 'text', placeholder: "Share your day's highlights..." },
    { key: 'tomorrow_task', question: "What's tomorrow's most important task? 📌", type: 'text', placeholder: "e.g., Meeting with XYZ at 10 AM" },
    { key: 'tomorrow_visits', question: "Any visits or meetings planned for tomorrow? 🗓️", type: 'text', placeholder: "e.g., Visit ABC office, Bandra" },
];

let state = {
    currentScreen: 'home',
    morningStep: 0,
    eveningStep: 0,
    morningAnswers: {},
    eveningAnswers: {},
    entries: [],
    settings: {
        name: '',
        morningTime: '07:00',
        eveningTime: '18:00',
        darkMode: true,
    }
};

// ---- DOM References ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadSettings();
    applyTheme();
    initSplash();
    initNavigation();
    initMorningSession();
    initEveningSession();
    initSettings();
    initHistory();
    initModals();
    updateHomeScreen();
    startClock();
    checkTodayStatus();
});

// ---- Splash Screen ----
function initSplash() {
    const splash = $('#splash-screen');
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
            $('#app').classList.remove('hidden');
        }, 600);
    }, 2200);
}

// ---- Clock & Greeting ----
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    $('#current-time').textContent = `${h12}:${minutes} ${ampm}`;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    $('#current-date').textContent = now.toLocaleDateString('en-US', options);

    const name = state.settings.name ? `, ${state.settings.name}` : '';
    let greeting, sub;
    if (hours < 12) {
        greeting = `Good Morning${name}! ☀️`;
        sub = "Let's plan an incredible day ahead!";
    } else if (hours < 17) {
        greeting = `Good Afternoon${name}! 🌤️`;
        sub = "How's your day going? Keep pushing!";
    } else if (hours < 21) {
        greeting = `Good Evening${name}! 🌆`;
        sub = "Time to review your day!";
    } else {
        greeting = `Good Night${name}! 🌙`;
        sub = "Rest well, tomorrow is a new opportunity!";
    }

    $('#greeting-text').textContent = greeting;
    $('#greeting-sub').textContent = sub;
}

// ---- Navigation ----
function initNavigation() {
    // Bottom nav
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            navigateTo(screen);
        });
    });

    // Session buttons
    $('#btn-morning').addEventListener('click', () => startSession('morning'));
    $('#btn-evening').addEventListener('click', () => startSession('evening'));

    // Back buttons
    $('#btn-back-morning').addEventListener('click', () => endSession('morning'));
    $('#btn-back-evening').addEventListener('click', () => endSession('evening'));

    // Settings
    $('#btn-settings').addEventListener('click', () => navigateTo('settings'));
    $('#btn-back-settings').addEventListener('click', () => navigateTo('home'));

    // Notifications
    $('#btn-notification').addEventListener('click', requestNotificationPermission);
}

function navigateTo(screen) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(`#screen-${screen}`).classList.add('active');
    state.currentScreen = screen;

    // Update nav buttons
    $$('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Show/hide bottom nav
    if (screen === 'morning' || screen === 'evening' || screen === 'settings') {
        $('#bottom-nav').style.display = 'none';
    } else {
        $('#bottom-nav').style.display = 'flex';
    }

    if (screen === 'history') {
        renderHistory();
    }

    if (screen === 'home') {
        updateHomeScreen();
    }
}

// ---- Session Management ----
function startSession(type) {
    const today = getTodayKey();
    const existing = state.entries.find(e => e.date === today && e.type === type);

    if (existing) {
        // Already completed today
        if (confirm(`You've already completed your ${type} session today. Do you want to do it again? (The previous entry will be replaced)`)) {
            state.entries = state.entries.filter(e => !(e.date === today && e.type === type));
        } else {
            return;
        }
    }

    if (type === 'morning') {
        state.morningStep = 0;
        state.morningAnswers = {};
        $('#morning-chat').innerHTML = '';
        navigateTo('morning');
        setTimeout(() => showMorningQuestion(), 500);
    } else {
        state.eveningStep = 0;
        state.eveningAnswers = {};
        $('#evening-chat').innerHTML = '';
        navigateTo('evening');
        setTimeout(() => showEveningQuestion(), 500);
    }
}

function endSession(type) {
    if (type === 'morning' && state.morningStep > 0 && state.morningStep < MORNING_QUESTIONS.length) {
        if (!confirm('Are you sure you want to leave? Your progress will be lost.')) return;
    }
    if (type === 'evening' && state.eveningStep > 0 && state.eveningStep < EVENING_QUESTIONS.length) {
        if (!confirm('Are you sure you want to leave? Your progress will be lost.')) return;
    }
    navigateTo('home');
}

// ---- Morning Session ----
function initMorningSession() {
    const input = $('#morning-input');
    const sendBtn = $('#morning-send');

    sendBtn.addEventListener('click', () => submitMorningAnswer());

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMorningAnswer();
        }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    });
}

function showMorningQuestion() {
    if (state.morningStep >= MORNING_QUESTIONS.length) {
        completeMorningSession();
        return;
    }

    const q = MORNING_QUESTIONS[state.morningStep];
    addChatBubble('morning-chat', q.question, 'bot', 'morning-bot');
    updateProgress('morning', state.morningStep, MORNING_QUESTIONS.length);

    const input = $('#morning-input');
    input.placeholder = q.placeholder || 'Type your answer...';
    input.value = '';
    input.focus();
    scrollChatToBottom('morning-chat');
}

function submitMorningAnswer() {
    const input = $('#morning-input');
    const answer = input.value.trim();
    if (!answer) return;

    const q = MORNING_QUESTIONS[state.morningStep];
    state.morningAnswers[q.key] = answer;

    addChatBubble('morning-chat', answer, 'user');
    input.value = '';
    input.style.height = 'auto';

    state.morningStep++;

    // Small delay before next question
    setTimeout(() => {
        if (state.morningStep < MORNING_QUESTIONS.length) {
            addTypingIndicator('morning-chat');
            setTimeout(() => {
                removeTypingIndicator('morning-chat');
                showMorningQuestion();
            }, 800);
        } else {
            addTypingIndicator('morning-chat');
            setTimeout(() => {
                removeTypingIndicator('morning-chat');
                completeMorningSession();
            }, 800);
        }
    }, 300);
}

function completeMorningSession() {
    const entry = {
        id: Date.now(),
        date: getTodayKey(),
        type: 'morning',
        timestamp: new Date().toISOString(),
        answers: { ...state.morningAnswers }
    };

    state.entries.push(entry);
    saveData();

    addChatBubble('morning-chat', "Awesome! Your day is all planned out! 🚀 Go crush it!", 'bot', 'morning-bot');
    updateProgress('morning', MORNING_QUESTIONS.length, MORNING_QUESTIONS.length);

    // Show completion modal
    showCompletionModal('morning', entry);
    checkTodayStatus();
}

// ---- Evening Session ----
function initEveningSession() {
    // Mood buttons
    $$('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            setTimeout(() => submitEveningMood(btn.dataset.mood), 300);
        });
    });

    // Number input
    const numInput = $('#evening-number-input');
    $('#num-minus').addEventListener('click', () => {
        const val = parseInt(numInput.value) || 0;
        if (val > 0) numInput.value = val - 1;
    });
    $('#num-plus').addEventListener('click', () => {
        numInput.value = (parseInt(numInput.value) || 0) + 1;
    });
    $('#evening-number-send').addEventListener('click', () => submitEveningNumber());
    numInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitEveningNumber();
    });

    // Text input
    const textInput = $('#evening-input');
    $('#evening-send').addEventListener('click', () => submitEveningText());
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitEveningText();
        }
    });
    textInput.addEventListener('input', () => {
        textInput.style.height = 'auto';
        textInput.style.height = textInput.scrollHeight + 'px';
    });
}

function showEveningQuestion() {
    if (state.eveningStep >= EVENING_QUESTIONS.length) {
        completeEveningSession();
        return;
    }

    const q = EVENING_QUESTIONS[state.eveningStep];
    addChatBubble('evening-chat', q.question, 'bot', 'evening-bot');
    updateProgress('evening', state.eveningStep, EVENING_QUESTIONS.length);

    // Show appropriate input
    $('#mood-selector').style.display = 'none';
    $('#number-input-wrapper').style.display = 'none';
    $('#evening-text-wrapper').style.display = 'none';

    if (q.type === 'mood') {
        $('#mood-selector').style.display = 'flex';
        $$('.mood-btn').forEach(b => b.classList.remove('selected'));
    } else if (q.type === 'number') {
        $('#number-input-wrapper').style.display = 'flex';
        $('#evening-number-input').value = 0;
        $('#evening-number-input').focus();
    } else {
        $('#evening-text-wrapper').style.display = 'flex';
        const input = $('#evening-input');
        input.placeholder = q.placeholder || 'Type your answer...';
        input.value = '';
        input.focus();
    }

    scrollChatToBottom('evening-chat');
}

function submitEveningMood(mood) {
    const q = EVENING_QUESTIONS[state.eveningStep];
    state.eveningAnswers[q.key] = mood;
    addChatBubble('evening-chat', mood, 'user');
    $('#mood-selector').style.display = 'none';

    state.eveningStep++;
    advanceEveningQuestion();
}

function submitEveningNumber() {
    const val = parseInt($('#evening-number-input').value) || 0;
    const q = EVENING_QUESTIONS[state.eveningStep];
    state.eveningAnswers[q.key] = val;
    addChatBubble('evening-chat', val.toString(), 'user');
    $('#number-input-wrapper').style.display = 'none';

    state.eveningStep++;
    advanceEveningQuestion();
}

function submitEveningText() {
    const input = $('#evening-input');
    const answer = input.value.trim();
    if (!answer) return;

    const q = EVENING_QUESTIONS[state.eveningStep];
    state.eveningAnswers[q.key] = answer;
    addChatBubble('evening-chat', answer, 'user');
    input.value = '';
    input.style.height = 'auto';
    $('#evening-text-wrapper').style.display = 'none';

    state.eveningStep++;
    advanceEveningQuestion();
}

function advanceEveningQuestion() {
    setTimeout(() => {
        if (state.eveningStep < EVENING_QUESTIONS.length) {
            addTypingIndicator('evening-chat');
            setTimeout(() => {
                removeTypingIndicator('evening-chat');
                showEveningQuestion();
            }, 800);
        } else {
            addTypingIndicator('evening-chat');
            setTimeout(() => {
                removeTypingIndicator('evening-chat');
                completeEveningSession();
            }, 800);
        }
    }, 300);
}

function completeEveningSession() {
    const entry = {
        id: Date.now(),
        date: getTodayKey(),
        type: 'evening',
        timestamp: new Date().toISOString(),
        answers: { ...state.eveningAnswers }
    };

    state.entries.push(entry);
    saveData();

    addChatBubble('evening-chat', "Great day review! 🎉 Rest well and come back stronger tomorrow!", 'bot', 'evening-bot');
    updateProgress('evening', EVENING_QUESTIONS.length, EVENING_QUESTIONS.length);

    showCompletionModal('evening', entry);
    checkTodayStatus();
}

// ---- Chat Helpers ----
function addChatBubble(containerId, text, type, extraClass = '') {
    const container = $(`#${containerId}`);
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type} ${extraClass}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    scrollChatToBottom(containerId);
}

function addTypingIndicator(containerId) {
    const container = $(`#${containerId}`);
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot typing-bubble';
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(bubble);
    scrollChatToBottom(containerId);
}

function removeTypingIndicator(containerId) {
    const container = $(`#${containerId}`);
    const typing = container.querySelector('.typing-bubble');
    if (typing) typing.remove();
}

function scrollChatToBottom(containerId) {
    const container = $(`#${containerId}`);
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
}

function updateProgress(type, current, total) {
    const pct = (current / total) * 100;
    $(`#${type}-progress`).style.width = `${pct}%`;
    $(`#${type}-step-label`).textContent = current >= total
        ? '✅ Complete!'
        : `Question ${current + 1} of ${total}`;
}

// ---- Home Screen Updates ----
function updateHomeScreen() {
    // Calculate stats
    const streak = calculateStreak();
    const totalEntries = state.entries.length;
    const avgMood = calculateAvgMood();

    $('#stat-streak').textContent = streak;
    $('#stat-entries').textContent = totalEntries;
    $('#stat-avg-mood').textContent = avgMood || '--';

    // Show today's plan if morning is done
    showTodayPreview();
}

function checkTodayStatus() {
    const today = getTodayKey();
    const morningDone = state.entries.some(e => e.date === today && e.type === 'morning');
    const eveningDone = state.entries.some(e => e.date === today && e.type === 'evening');

    const morningStatus = $('#morning-status');
    const eveningStatus = $('#evening-status');

    if (morningDone) {
        morningStatus.classList.add('completed');
        morningStatus.querySelector('.status-text').textContent = 'Done ✓';
    } else {
        morningStatus.classList.remove('completed');
        morningStatus.querySelector('.status-text').textContent = 'Start';
    }

    if (eveningDone) {
        eveningStatus.classList.add('completed');
        eveningStatus.querySelector('.status-text').textContent = 'Done ✓';
    } else {
        eveningStatus.classList.remove('completed');
        eveningStatus.querySelector('.status-text').textContent = 'Start';
    }
}

function showTodayPreview() {
    const today = getTodayKey();
    const morningEntry = state.entries.find(e => e.date === today && e.type === 'morning');
    const preview = $('#today-preview');

    if (morningEntry) {
        preview.style.display = 'block';
        const content = $('#today-preview-content');
        content.innerHTML = '';

        const labels = {
            important_task: '🎯 Task',
            skills_to_learn: '📚 Skills',
            markets_to_touch: '📊 Markets',
            areas_industries: '🏭 Areas',
            afternoon_plan: '☀️ Afternoon',
            morning_motivation: '💪 Motivation',
        };

        Object.entries(morningEntry.answers).forEach(([key, value]) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <span class="preview-item-label">${labels[key] || key}</span>
                <span class="preview-item-value">${escapeHtml(value)}</span>
            `;
            content.appendChild(div);
        });
    } else {
        preview.style.display = 'none';
    }
}

function calculateStreak() {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = formatDateKey(date);

        const hasEntry = state.entries.some(e => e.date === key);
        if (hasEntry) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

function calculateAvgMood() {
    const moods = state.entries
        .filter(e => e.type === 'evening' && e.answers.day_mood)
        .map(e => e.answers.day_mood);

    if (moods.length === 0) return null;

    const moodMap = { 'Normal': 1, 'Good': 2, 'Very Good': 3, 'Excellent': 4, 'Very Happy': 5 };
    const emojiMap = { 1: '😐', 2: '🙂', 3: '😊', 4: '😄', 5: '🤩' };

    const sum = moods.reduce((acc, m) => acc + (moodMap[m] || 0), 0);
    const avg = Math.round(sum / moods.length);

    return emojiMap[avg] || '😐';
}

// ---- History ----
function initHistory() {
    // Export CSV
    $('#btn-export-csv').addEventListener('click', exportToCSV);

    // Clear data
    $('#btn-clear-data').addEventListener('click', () => {
        $('#confirm-modal').style.display = 'flex';
    });

    // Filters
    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHistory(btn.dataset.filter);
        });
    });
}

function renderHistory(filter = 'all') {
    const container = $('#history-list');
    const empty = $('#history-empty');

    let entries = [...state.entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filter !== 'all') {
        entries = entries.filter(e => e.type === filter);
    }

    if (entries.length === 0) {
        container.innerHTML = '';
        container.appendChild(empty);
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = '';

    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.dataset.id = entry.id;

        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const icon = entry.type === 'morning' ? '🌅' : '🌆';
        const label = entry.type === 'morning' ? 'Morning Planning' : 'Evening Review';

        let detailsHTML = '';
        const questions = entry.type === 'morning' ? MORNING_QUESTIONS : EVENING_QUESTIONS;

        questions.forEach(q => {
            const val = entry.answers[q.key];
            if (val !== undefined) {
                const displayLabel = q.question.replace(/[🎯📚📊🏭☀️💪🌟📞🔄🤝📋✍️📌🗓️]/g, '').trim();
                let displayValue = escapeHtml(String(val));

                if (q.key === 'day_mood') {
                    const moodEmojis = { 'Normal': '😐', 'Good': '🙂', 'Very Good': '😊', 'Excellent': '😄', 'Very Happy': '🤩' };
                    displayValue = `<span class="history-mood-badge">${moodEmojis[val] || ''} ${val}</span>`;
                }

                detailsHTML += `
                    <div class="history-detail">
                        <span class="history-detail-label">${displayLabel.substring(0, 30)}</span>
                        <span class="history-detail-value">${displayValue}</span>
                    </div>
                `;
            }
        });

        div.innerHTML = `
            <div class="history-entry-header">
                <div class="history-entry-header-left">
                    <span class="history-entry-type">${icon}</span>
                    <div class="history-entry-info">
                        <h4>${label}</h4>
                        <span>${dateStr} at ${timeStr}</span>
                    </div>
                </div>
                <svg class="history-entry-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="history-entry-body">
                ${detailsHTML}
            </div>
        `;

        // Toggle expand
        div.querySelector('.history-entry-header').addEventListener('click', () => {
            div.classList.toggle('expanded');
        });

        container.appendChild(div);
    });
}

// ---- Export CSV ----
function exportToCSV() {
    if (state.entries.length === 0) {
        alert('No entries to export yet!');
        return;
    }

    // Gather all unique answer keys
    const morningKeys = MORNING_QUESTIONS.map(q => q.key);
    const eveningKeys = EVENING_QUESTIONS.map(q => q.key);
    const allKeys = [...new Set([...morningKeys, ...eveningKeys])];

    const morningLabels = {};
    MORNING_QUESTIONS.forEach(q => morningLabels[q.key] = q.question.replace(/[🎯📚📊🏭☀️💪]/g, '').trim());
    const eveningLabels = {};
    EVENING_QUESTIONS.forEach(q => eveningLabels[q.key] = q.question.replace(/[🌟📞🔄🤝📋✍️📌🗓️]/g, '').trim());

    const headers = ['Date', 'Time', 'Session Type', ...allKeys.map(k => morningLabels[k] || eveningLabels[k] || k)];

    const rows = state.entries
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(entry => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('en-US');
            const timeStr = date.toLocaleTimeString('en-US');
            const type = entry.type === 'morning' ? 'Morning' : 'Evening';

            const values = allKeys.map(key => {
                const val = entry.answers[key];
                return val !== undefined ? String(val) : '';
            });

            return [dateStr, timeStr, type, ...values];
        });

    // Build CSV
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    // Download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DayPilot_Journal_${getTodayKey()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// ---- Settings ----
function initSettings() {
    const nameInput = $('#setting-name');
    const morningTime = $('#setting-morning-time');
    const eveningTime = $('#setting-evening-time');
    const darkMode = $('#setting-dark-mode');

    // Load
    nameInput.value = state.settings.name;
    morningTime.value = state.settings.morningTime;
    eveningTime.value = state.settings.eveningTime;
    darkMode.checked = state.settings.darkMode;

    // Save on change
    nameInput.addEventListener('input', () => {
        state.settings.name = nameInput.value;
        saveSettings();
        updateClock();
    });

    morningTime.addEventListener('change', () => {
        state.settings.morningTime = morningTime.value;
        saveSettings();
        scheduleNotifications();
    });

    eveningTime.addEventListener('change', () => {
        state.settings.eveningTime = eveningTime.value;
        saveSettings();
        scheduleNotifications();
    });

    darkMode.addEventListener('change', () => {
        state.settings.darkMode = darkMode.checked;
        saveSettings();
        applyTheme();
    });
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
}

// ---- Modals ----
function initModals() {
    $('#modal-close').addEventListener('click', () => {
        $('#completion-modal').style.display = 'none';
        navigateTo('home');
    });

    $('#confirm-cancel').addEventListener('click', () => {
        $('#confirm-modal').style.display = 'none';
    });

    $('#confirm-delete').addEventListener('click', () => {
        state.entries = [];
        saveData();
        $('#confirm-modal').style.display = 'none';
        renderHistory();
        updateHomeScreen();
        checkTodayStatus();
    });
}

function showCompletionModal(type, entry) {
    const modal = $('#completion-modal');
    const icon = type === 'morning' ? '🌅' : '🌆';
    const title = type === 'morning' ? 'Morning Plan Set! 🚀' : 'Day Review Complete! 🎉';
    const message = type === 'morning'
        ? 'Your day is structured and ready. Go make it count!'
        : 'Great reflection! Your data is saved and ready for export.';

    $('#modal-icon').textContent = icon;
    $('#modal-title').textContent = title;
    $('#modal-message').textContent = message;

    // Summary
    const summary = $('#modal-summary');
    summary.innerHTML = '';

    const questions = type === 'morning' ? MORNING_QUESTIONS : EVENING_QUESTIONS;
    questions.forEach(q => {
        const val = entry.answers[q.key];
        if (val !== undefined) {
            const label = q.question.replace(/[🎯📚📊🏭☀️💪🌟📞🔄🤝📋✍️📌🗓️]/g, '').trim();
            summary.innerHTML += `
                <div class="summary-item">
                    <span class="summary-label">${label.substring(0, 25)}</span>
                    <span class="summary-value">${escapeHtml(String(val))}</span>
                </div>
            `;
        }
    });

    modal.style.display = 'flex';
}

// ---- Notifications ----
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported in your browser.');
        return;
    }

    Notification.requestPermission().then(permission => {
        const btn = $('#btn-notification');
        if (permission === 'granted') {
            btn.classList.add('active');
            scheduleNotifications();
            new Notification('DayPilot 🚀', {
                body: 'Notifications enabled! You\'ll be reminded for morning & evening sessions.',
                icon: '🚀'
            });
        } else {
            btn.classList.remove('active');
        }
    });
}

function scheduleNotifications() {
    // Clear existing timers
    if (window._morningTimer) clearTimeout(window._morningTimer);
    if (window._eveningTimer) clearTimeout(window._eveningTimer);

    if (Notification.permission !== 'granted') return;

    const now = new Date();

    // Morning notification
    const [mH, mM] = state.settings.morningTime.split(':').map(Number);
    const morningTime = new Date(now);
    morningTime.setHours(mH, mM, 0, 0);
    if (morningTime <= now) morningTime.setDate(morningTime.getDate() + 1);

    const morningDelay = morningTime - now;
    window._morningTimer = setTimeout(() => {
        new Notification('Good Morning! ☀️', {
            body: 'Time to plan your day. Open DayPilot and set your goals!',
            tag: 'morning-reminder'
        });
    }, morningDelay);

    // Evening notification
    const [eH, eM] = state.settings.eveningTime.split(':').map(Number);
    const eveningTime = new Date(now);
    eveningTime.setHours(eH, eM, 0, 0);
    if (eveningTime <= now) eveningTime.setDate(eveningTime.getDate() + 1);

    const eveningDelay = eveningTime - now;
    window._eveningTimer = setTimeout(() => {
        new Notification('Evening Review 🌆', {
            body: 'How was your day? Open DayPilot to log your progress!',
            tag: 'evening-reminder'
        });
    }, eveningDelay);
}

// ---- Data Persistence ----
function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            state.entries = JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading data:', e);
        state.entries = [];
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (data) {
            state.settings = { ...state.settings, ...JSON.parse(data) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

// ---- Utility Functions ----
function getTodayKey() {
    return formatDateKey(new Date());
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Service Worker Registration ----
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}
