// live.js
// Modalità Live: un brano alla volta a schermo grande, barra di navigazione, cambio parte da tastiera o pedaliera
// Bluetooth (che invia tasti), timer del concerto e schermo sempre acceso.
// Dipende da funzioni/variabili globali di index.html: songs, renderApp, switchPart, openModal, closeModal, escHtml.

const SparkLive = (() => {
    const DEFAULT_KEYS = { partNext: ['ArrowRight', 'PageDown'], partPrev: ['ArrowLeft', 'PageUp'], songNext: ['n'], songPrev: ['p'] };
    const ACTION_LABELS = { partNext: 'Parte successiva', partPrev: 'Parte precedente', songNext: 'Brano successivo', songPrev: 'Brano precedente' };
    const KEY_STORE = 'sparkLiveKeys', TARGET_STORE = 'sparkTargetMin';

    let on = false, songIdx = -1, wake = null, bar = null, tickId = null, listening = null;
    const timer = { start: 0, acc: 0, running: false };
    let keyMap = loadKeys();

    const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignora */ } };

    function loadKeys() {
        try { const k = JSON.parse(lsGet(KEY_STORE)); if (k && k.partNext) return k; } catch (e) { /* default */ }
        return JSON.parse(JSON.stringify(DEFAULT_KEYS));
    }
    const normKey = (k) => (k && k.length === 1 ? k.toLowerCase() : k);
    const keyLabel = (k) => ({ ' ': 'Spazio', ArrowRight: '→', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓' }[k] || k);

    // brani della serata: quelli con la stella, altrimenti tutti
    function list() {
        const starred = []; const all = [];
        songs.forEach((s, i) => { all.push(i); if (s.isSetlist) starred.push(i); });
        return starred.length ? starred : all;
    }
    function currentIndex() {
        const l = list();
        if (!l.length) return -1;
        if (!l.includes(songIdx)) songIdx = l[0];
        return songIdx;
    }
    function targetMin() { return Number(lsGet(TARGET_STORE)) || 60; }
    function setTargetMin(m) { lsSet(TARGET_STORE, String(Math.max(1, Math.round(m)))); }

    function remainingPlanned() {
        const l = list(); const pos = l.indexOf(songIdx);
        return l.slice(Math.max(pos, 0)).reduce((a, i) => a + (Number(songs[i].duration) || 4), 0);
    }
    const fmt = (ms) => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; const p = (n) => String(n).padStart(2, '0'); return (h ? h + ':' + p(m) : m) + ':' + p(ss); };
    const elapsed = () => timer.acc + (timer.running ? Date.now() - timer.start : 0);

    // ---------- navigazione
    function nextSong() { const l = list(); const p = l.indexOf(currentIndex()); if (p < l.length - 1) { songIdx = l[p + 1]; renderApp(); window.scrollTo(0, 0); } }
    function prevSong() { const l = list(); const p = l.indexOf(currentIndex()); if (p > 0) { songIdx = l[p - 1]; renderApp(); window.scrollTo(0, 0); } }
    function nextPart() {
        const i = currentIndex(); if (i < 0) return; const s = songs[i];
        if (s.activePartIndex < s.parts.length - 1) switchPart(i, s.activePartIndex + 1);
        else { const l = list(); if (l.indexOf(i) < l.length - 1) { songIdx = l[l.indexOf(i) + 1]; songs[songIdx].activePartIndex = 0; renderApp(); } }
    }
    function prevPart() {
        const i = currentIndex(); if (i < 0) return; const s = songs[i];
        if (s.activePartIndex > 0) switchPart(i, s.activePartIndex - 1);
        else { const l = list(); const p = l.indexOf(i); if (p > 0) { songIdx = l[p - 1]; songs[songIdx].activePartIndex = songs[songIdx].parts.length - 1; renderApp(); } }
    }
    const ACTIONS = { songNext: nextSong, songPrev: prevSong, partNext: nextPart, partPrev: prevPart };

    // ---------- barra in basso
    function buildBar() {
        bar = document.createElement('div');
        bar.id = 'live-bar';
        bar.innerHTML = `
            <div class="lb-row"><button data-a="songPrev" aria-label="Brano precedente">⏮</button><div class="lb-title" id="lb-title"></div><button data-a="songNext" aria-label="Brano successivo">⏭</button></div>
            <div class="lb-row"><button data-a="partPrev" aria-label="Parte precedente">◀</button><div class="lb-part" id="lb-part"></div><button data-a="partNext" aria-label="Parte successiva">▶</button></div>
            <div class="lb-row lb-meta"><span id="lb-timer" class="lb-timer"></span><button data-a="timer" id="lb-timer-btn" aria-label="Avvia o ferma il timer">▶</button><button data-a="timerReset" aria-label="Azzera il timer">↺</button><button data-a="keys" aria-label="Tasti">⌨️</button><button data-a="exit" class="lb-exit">Esci</button></div>`;
        document.body.appendChild(bar);
        bar.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-a]'); if (!b) return;
            const a = b.dataset.a;
            if (ACTIONS[a]) ACTIONS[a]();
            else if (a === 'timer') { toggleTimer(); }
            else if (a === 'timerReset') { timer.acc = 0; timer.running = false; refreshTimer(); }
            else if (a === 'keys') openKeysDialog();
            else if (a === 'exit') exit();
        });
    }

    function toggleTimer() {
        if (timer.running) { timer.acc += Date.now() - timer.start; timer.running = false; }
        else { timer.start = Date.now(); timer.running = true; }
        refreshTimer();
    }
    function refreshTimer() {
        if (!bar) return;
        const el = bar.querySelector('#lb-timer'), btn = bar.querySelector('#lb-timer-btn');
        const e = elapsed(), leftMin = targetMin() - e / 60000, need = remainingPlanned();
        const late = timer.running || e > 0 ? leftMin < need : false;
        el.textContent = `⏱ ${fmt(e)} · scaletta rimasta ${need} min`;
        el.classList.toggle('late', late);
        btn.textContent = timer.running ? '⏸' : '▶';
    }

    function refresh() {
        if (!on || !bar) return;
        const l = list(), i = currentIndex();
        if (i < 0) { bar.querySelector('#lb-title').textContent = 'Nessun brano'; return; }
        const s = songs[i], pos = l.indexOf(i) + 1;
        bar.querySelector('#lb-title').textContent = `${pos}/${l.length} · ${s.title}`;
        const p = s.parts[s.activePartIndex];
        bar.querySelector('#lb-part').textContent = `${p ? p.name : ''} (${s.activePartIndex + 1}/${s.parts.length})`;
        refreshTimer();
    }

    // ---------- tastiera / pedaliera
    function onKey(e) {
        if (listening) {
            e.preventDefault(); e.stopPropagation();
            if (e.key === 'Escape') { listening = null; renderKeysDialog(); return; }
            const k = normKey(e.key);
            Object.keys(keyMap).forEach(a => { keyMap[a] = keyMap[a].filter(x => x !== k); });
            keyMap[listening].push(k); lsSet(KEY_STORE, JSON.stringify(keyMap));
            listening = null; renderKeysDialog(); return;
        }
        if (!on) return;
        const t = e.target && e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
        const k = normKey(e.key);
        const action = Object.keys(keyMap).find(a => keyMap[a].includes(k));
        if (action) { e.preventDefault(); ACTIONS[action](); }
    }
    document.addEventListener('keydown', onKey, true);

    let keysBody = null;
    function openKeysDialog() {
        keysBody = openModal('⌨️ Tasti per il cambio', '');
        renderKeysDialog();
    }
    function renderKeysDialog() {
        if (!keysBody) return;
        keysBody.innerHTML = `
            <p class="sp-note">Una pedaliera Bluetooth per chitarra (o per spartiti) si comporta come una tastiera. Premi "Assegna" e poi il pedale che vuoi usare.</p>
            ${Object.keys(ACTION_LABELS).map(a => `
                <div class="sp-keyrow">
                    <div><b>${ACTION_LABELS[a]}</b><br><span class="sp-note">${keyMap[a].map(k => `<span class="sp-chip">${escHtml(keyLabel(k))}</span>`).join(' ') || 'nessun tasto'}</span></div>
                    <button class="btn btn-secondary" data-assign="${a}">${listening === a ? 'Premi un tasto…' : 'Assegna'}</button>
                </div>`).join('')}
            <div class="sp-keyrow"><div><b>Durata del concerto</b><br><span class="sp-note">Per il timer in basso</span></div>
                <div><input type="number" id="sp-target" min="1" max="600" value="${targetMin()}" style="width:80px"> min</div></div>
            <div class="sp-actions"><button class="btn btn-secondary" id="sp-keys-reset">Ripristina predefiniti</button><button class="btn" id="sp-keys-ok">Fatto</button></div>`;
        keysBody.querySelectorAll('[data-assign]').forEach(b => b.onclick = () => { listening = b.dataset.assign; renderKeysDialog(); });
        keysBody.querySelector('#sp-keys-reset').onclick = () => { keyMap = JSON.parse(JSON.stringify(DEFAULT_KEYS)); lsSet(KEY_STORE, JSON.stringify(keyMap)); listening = null; renderKeysDialog(); };
        keysBody.querySelector('#sp-target').onchange = (e) => { setTargetMin(e.target.value); refreshTimer(); };
        keysBody.querySelector('#sp-keys-ok').onclick = () => { listening = null; closeModal(); };
    }

    // ---------- schermo sempre acceso
    async function requestWake() {
        try { if (navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { wake = null; }
    }
    function releaseWake() { try { if (wake) wake.release(); } catch (e) { /* ignora */ } wake = null; }
    document.addEventListener('visibilitychange', () => { if (on && document.visibilityState === 'visible' && !wake) requestWake(); });

    function enter() {
        on = true; songIdx = -1; currentIndex();
        document.body.classList.add('live-mode');
        if (!bar) buildBar();
        bar.style.display = 'block';
        clearInterval(tickId); tickId = setInterval(refreshTimer, 1000);
        requestWake(); renderApp();
    }
    function exit() {
        on = false; document.body.classList.remove('live-mode');
        if (bar) bar.style.display = 'none';
        clearInterval(tickId); releaseWake(); renderApp();
    }

    return { enter, exit, toggle: () => (on ? exit() : enter()), isOn: () => on, currentIndex, refresh, list, targetMin, setTargetMin, remainingPlanned };
})();
