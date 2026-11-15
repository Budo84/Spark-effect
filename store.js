// store.js
// Backup dei brani: copie di sicurezza in IndexedDB (ultime 10), file di backup collegato (dove il browser lo permette)
// e promemoria per scaricare un backup. Tutto è facoltativo: se il browser non lo supporta l'app funziona lo stesso.

const SparkStore = (() => {
    const DB_NAME = 'sparkEditorDB', KV = 'kv', MAX_SNAPSHOTS = 10;
    const SNAP_EVERY_MS = 20 * 60 * 1000;
    let dbPromise = null, debounce = null, lastFileStatus = '';

    function openDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve) => {
            try {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = () => req.result.createObjectStore(KV);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
                req.onblocked = () => resolve(null);
            } catch (e) { resolve(null); }
        });
        return dbPromise;
    }
    async function idbGet(key) {
        const db = await openDB(); if (!db) return undefined;
        return new Promise(res => { try { const r = db.transaction(KV).objectStore(KV).get(key); r.onsuccess = () => res(r.result); r.onerror = () => res(undefined); } catch (e) { res(undefined); } });
    }
    async function idbSet(key, val) {
        const db = await openDB(); if (!db) return false;
        return new Promise(res => { try { const tx = db.transaction(KV, 'readwrite'); tx.objectStore(KV).put(val, key); tx.oncomplete = () => res(true); tx.onerror = () => res(false); } catch (e) { res(false); } });
    }
    const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage non disponibile */ } };

    function count(json) { try { const a = JSON.parse(json); return Array.isArray(a) ? a.length : 0; } catch (e) { return 0; } }

    async function saveSnapshot(json, force) {
        if (count(json) === 0) return;
        const list = (await idbGet('snapshots')) || [];
        const last = list[0];
        if (!force && last && Date.now() - last.t < SNAP_EVERY_MS) return;
        if (last && last.data === json) return;
        list.unshift({ t: Date.now(), n: count(json), data: json });
        await idbSet('snapshots', list.slice(0, MAX_SNAPSHOTS));
    }

    // ---- file collegato (File System Access API, solo browser desktop Chromium)
    const fileSupported = () => typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
    async function fileHandle() { return idbGet('fileHandle'); }
    async function linkFile(json) {
        if (!fileSupported()) throw new Error('Il tuo browser non permette il backup su file collegato. Usa "Scarica backup".');
        const h = await window.showSaveFilePicker({ suggestedName: 'spark_backup.json', types: [{ description: 'Backup Spark', accept: { 'application/json': ['.json'] } }] });
        await idbSet('fileHandle', h);
        await writeFile(json, true);
        return h.name;
    }
    async function unlinkFile() { await idbSet('fileHandle', null); lastFileStatus = ''; }
    async function writeFile(json, interactive) {
        const h = await fileHandle();
        if (!h) return false;
        try {
            let perm = await h.queryPermission({ mode: 'readwrite' });
            if (perm !== 'granted' && interactive) perm = await h.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') { lastFileStatus = 'serve il permesso: premi "Backup" e poi "Riattiva file"'; return false; }
            const w = await h.createWritable(); await w.write(json); await w.close();
            lastFileStatus = 'ok ' + new Date().toLocaleTimeString('it-IT'); return true;
        } catch (e) { lastFileStatus = 'errore: ' + (e && e.message || e); return false; }
    }

    // chiamata a ogni salvataggio dei brani
    function onChange(json) {
        clearTimeout(debounce);
        debounce = setTimeout(() => { saveSnapshot(json, false); writeFile(json, false); }, 2500);
    }

    async function list() { return (await idbGet('snapshots')) || []; }
    async function status() {
        const h = await fileHandle();
        return { fileSupported: fileSupported(), linkedName: h ? h.name : '', fileStatus: lastFileStatus, lastDownload: Number(lsGet('sparkLastBackup')) || 0 };
    }

    // ---- promemoria
    function markDownloaded() { lsSet('sparkLastBackup', String(Date.now())); lsSet('sparkBackupSnooze', '0'); }
    function reminderDays(hasSongs) {
        if (!hasSongs) return 0;
        const last = Number(lsGet('sparkLastBackup')) || 0;
        const snooze = Number(lsGet('sparkBackupSnooze')) || 0;
        if (snooze > Date.now()) return 0;
        if (!last) { // primo avvio: parte da ora, niente allarme subito
            lsSet('sparkLastBackup', String(Date.now()));
            return 0;
        }
        const d = Math.floor((Date.now() - last) / 86400000);
        return d >= 7 ? d : 0;
    }
    function snooze() { lsSet('sparkBackupSnooze', String(Date.now() + 86400000)); }

    return { saveSnapshot, list, onChange, status, linkFile, unlinkFile, writeFile, markDownloaded, reminderDays, snooze, fileSupported, count };
})();
