// ai_engine.js
// Motore AI per Spark Preset Editor.
//  - Con una chiave API Anthropic usa Claude: genera la catena di effetti (pedali + manopole)
//    scegliendo SOLO tra i pedali presenti in catalog.js.
//  - Senza chiave (o se la chiamata fallisce) usa un motore locale a regole, che funziona offline.
// Dipende da: catalog.js (catalog), pedal_info.js (pedalInfo, opzionale), cloud_presets.js (cloudPresets, opzionale).

const SparkAI = (() => {
    const SETTINGS_KEY = 'sparkAISettings';
    const CATS = ['Gate', 'Comp', 'Drive', 'Amp', 'Mod', 'Delay', 'Reverb'];
    const PART_NAMES = ['Accompagnamento', 'Assolo', 'Intro / Riff', 'Clean / Arpeggio'];
    const NONE = 'Nessun Pedale';
    const DEFAULT_MODEL = 'claude-sonnet-5-5';
    const MODEL_SUGGESTIONS = ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5'];
    const API_URL = 'https://api.anthropic.com/v1/messages';

    // ---------------------------------------------------------------- impostazioni
    function getSettings() {
        let s = {};
        try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch (e) { s = {}; }
        return { apiKey: s.apiKey || '', model: s.model || DEFAULT_MODEL, localOnly: !!s.localOnly, useTaste: s.useTaste !== false };
    }
    function saveSettings(s) {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) { /* storage non disponibile */ }
    }
    let sampleOk = false;
    function hasKey() { const s = getSettings(); return (!!s.apiKey || sampleOk) && !s.localOnly; }

    // ---------------------------------------------------------------- utilità
    const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
    const clamp10 = (n) => Math.min(10, Math.max(0, Math.round(n)));
    const clone = (o) => JSON.parse(JSON.stringify(o));

    // valori di partenza ragionevoli per ogni manopola (scala 0-10)
    const BASE = {
        Thresh: 3, Decay: 5, Comp: 5, Gain: 5, Level: 6, Vol: 6, Sustain: 5, Attack: 5, Sens: 5, Rel: 5,
        Tone: 5, Drive: 5, Bass: 5, Mid: 5, Treb: 5, Pres: 5, Master: 6, Fuzz: 6, Dist: 6, Filter: 5,
        Speed: 4, Depth: 5, Intens: 5, Time: 4, Feed: 3, Head: 5, Dwell: 5, Blend: 5, Pedal: 5
    };
    const KNOB_GROUPS = [
        ['vol', 'level', 'volume', 'master'], ['treb', 'treble'], ['pres', 'presence'], ['thresh', 'threshold'],
        ['rel', 'release'], ['intens', 'intensity'], ['feed', 'feedback'], ['sens', 'sensitivity']
    ];

    function pedalsOf(cat) { return (typeof catalog !== 'undefined' && catalog[cat]) || []; }

    function findPedal(cat, name) {
        const list = pedalsOf(cat);
        if (!name) return null;
        let p = list.find(x => x.name === name);
        if (p) return p;
        const n = norm(name);
        p = list.find(x => norm(x.name) === n);
        if (p) return p;
        // il modello può scrivere "Black Duo" invece di "02 Black Duo"
        const strip = (s) => norm(s).replace(/^\d+/, '').replace(/^jh/, '');
        const sn = strip(name);
        if (sn.length >= 3) p = list.find(x => strip(x.name) === sn) || list.find(x => strip(x.name).includes(sn) || sn.includes(strip(x.name)));
        return p && p.name !== NONE ? p : null;
    }

    function readKnob(map, label) {
        const keys = [norm(label)];
        const grp = KNOB_GROUPS.find(g => g.includes(norm(label)));
        if (grp) keys.push(...grp);
        for (const k of keys) {
            if (map[k] !== undefined) { const v = Number(map[k]); if (isFinite(v)) return v; }
        }
        return undefined;
    }

    // crea uno slot compatibile con il formato dell'editor
    function makeSlot(cat, spec) {
        const name = typeof spec === 'string' ? spec : (spec && spec.name) || NONE;
        const pedal = findPedal(cat, name) || pedalsOf(cat)[0] || { name: NONE, img: '', params: [] };
        const knobs = {};
        if (spec && typeof spec === 'object' && spec.knobs && typeof spec.knobs === 'object') {
            Object.keys(spec.knobs).forEach(k => { knobs[norm(k)] = spec.knobs[k]; });
        }
        const paramValues = (pedal.params || []).map(label => {
            const v = readKnob(knobs, label);
            return String(v === undefined ? (BASE[label] !== undefined ? BASE[label] : 5) : clamp10(v));
        });
        return { category: cat, name: pedal.name, img: pedal.img || '', status: pedal.name === NONE ? 'off' : 'on', paramValues };
    }

    function normalizePartName(n) {
        const t = String(n || '').toLowerCase();
        return PART_NAMES.find(x => x.toLowerCase() === t)
            || (/solo|assolo|lead/.test(t) ? 'Assolo' : /clean|arpegg/.test(t) ? 'Clean / Arpeggio' : /intro|riff/.test(t) ? 'Intro / Riff' : 'Accompagnamento');
    }

    function cleanTags(t) { return (Array.isArray(t) ? t : []).map(x => String(x).trim().toLowerCase().slice(0, 24)).filter(Boolean).slice(0, 4); }

    function normalizeResult(raw, source) {
        const parts = (raw && raw.parts || []).slice(0, 4).map(p => ({
            name: normalizePartName(p.name),
            slots: CATS.map(c => makeSlot(c, p.chain && p.chain[c])),
            notes: String(p.notes || '').trim()
        }));
        if (!parts.length) throw new Error('La risposta non contiene nessuna catena di effetti.');
        return { title: String(raw.title || '').trim(), summary: String(raw.summary || '').trim(), tags: cleanTags(raw.tags), source, parts };
    }

    // trasforma gli slot correnti in testo leggibile per il prompt
    function describeSlots(slots) {
        return (slots || []).map(s => {
            if (!s || s.name === NONE) return `${s ? s.category : '?'}: ${NONE}`;
            const p = findPedal(s.category, s.name);
            const knobs = (p ? p.params : []).map((l, i) => `${l} ${s.paramValues && s.paramValues[i] !== undefined ? s.paramValues[i] : 5}`).join(', ');
            return `${s.category}: ${s.name}${knobs ? ' (' + knobs + ')' : ''}${s.status === 'off' ? ' [spento]' : ''}`;
        }).join('\n');
    }

    // ---------------------------------------------------------------- gusti dell'utente
    let tasteFn = null;
    function setTasteProvider(fn) { tasteFn = fn; }
    function tasteProfile() {
        const st = getSettings();
        if (!st.useTaste || !tasteFn) return null;
        try { return tasteFn() || null; } catch (e) { return null; }
    }
    function tasteText(t) {
        if (!t) return '';
        const top = Object.keys(t.top || {}).filter(c => t.top[c].length).map(c => `${c}: ${t.top[c].join(', ')}`).join(' | ');
        const avg = t.avg || {};
        const bits = [];
        if (avg.reverb != null) bits.push(`riverbero medio ${avg.reverb.toFixed(1)}/10`);
        if (avg.delay != null) bits.push(`delay medio ${avg.delay.toFixed(1)}/10`);
        if (avg.ampGain != null) bits.push(`gain ampli medio ${avg.ampGain.toFixed(1)}/10`);
        return `Gusti dell'utente, ricavati da ${t.n} suoi preset salvati (sono tendenze da usare come punto di partenza, non obblighi: se la richiesta chiede altro, segui la richiesta). Pedali più usati -> ${top || 'n/d'}. ${bits.join(', ')}.`;
    }

    // ---------------------------------------------------------------- analisi audio (locale, nessun dato esce dal dispositivo)
    function fft(re, im) {
        const n = re.length;
        for (let i = 1, j = 0; i < n; i++) {
            let bit = n >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
        }
        for (let len = 2; len <= n; len <<= 1) {
            const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
            for (let i = 0; i < n; i += len) {
                let cr = 1, ci = 0;
                for (let k = 0; k < len / 2; k++) {
                    const a = i + k, b = i + k + len / 2;
                    const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
                    re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
                    const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
                }
            }
        }
    }

    async function analyzeAudio(file) {
        if (file.size > 40 * 1024 * 1024) throw new Error('File audio troppo grande (massimo 40 MB).');
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) throw new Error('Questo browser non può analizzare l\'audio.');
        const ctx = new AC();
        let buf;
        try { buf = await ctx.decodeAudioData(await file.arrayBuffer()); }
        catch (e) { throw new Error('Formato audio non leggibile. Prova con MP3, WAV o M4A.'); }
        finally { try { ctx.close(); } catch (e) { /* ignora */ } }
        const sr = buf.sampleRate, ch = buf.getChannelData(0), N = Math.min(ch.length, sr * 90), SIZE = 2048, WIN = 48;
        const power = new Float64Array(SIZE / 2), re = new Float64Array(SIZE), im = new Float64Array(SIZE);
        const hann = new Float64Array(SIZE).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (SIZE - 1)));
        const rmsDb = []; let peak = 0, used = 0, sumSq = 0, count = 0;
        const step = Math.max(SIZE, Math.floor((N - SIZE) / WIN));
        for (let start = 0; start + SIZE <= N; start += step) {
            let e = 0;
            for (let i = 0; i < SIZE; i++) { const v = ch[start + i]; e += v * v; if (Math.abs(v) > peak) peak = Math.abs(v); }
            const rms = Math.sqrt(e / SIZE);
            if (rms < 0.01) continue;                      // salta i silenzi
            rmsDb.push(20 * Math.log10(rms)); sumSq += e; count += SIZE; used++;
            for (let i = 0; i < SIZE; i++) { re[i] = ch[start + i] * hann[i]; im[i] = 0; }
            fft(re, im);
            for (let k = 0; k < SIZE / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
        }
        if (used < 3) throw new Error('Nell\'audio c\'è troppo silenzio o è troppo breve per analizzarlo.');
        const binHz = sr / SIZE; let total = 0, cen = 0, low = 0, mid = 0, high = 0, lg = 0, am = 0, nb = 0;
        for (let k = 1; k < SIZE / 2; k++) {
            const f = k * binHz, pw = power[k]; total += pw; cen += f * pw;
            if (f < 250) low += pw; else if (f < 2000) mid += pw; else high += pw;
            if (f >= 500 && f <= 5000) { lg += Math.log(pw + 1e-12); am += pw; nb++; }
        }
        const centroid = cen / total, flat = Math.exp(lg / nb) / (am / nb);
        const rms = Math.sqrt(sumSq / count), crest = 20 * Math.log10(peak / rms);
        const mean = rmsDb.reduce((a, b) => a + b, 0) / rmsDb.length;
        const dyn = Math.sqrt(rmsDb.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rmsDb.length);
        const gainScore = (flat > 0.15 ? 2 : flat > 0.06 ? 1 : 0) + (crest < 10 ? 2 : crest < 14 ? 1 : 0);
        const profile = {
            gain: gainScore >= 3 ? 'high' : gainScore === 2 ? 'crunch' : 'clean',
            tone: centroid < 1100 ? 'dark' : centroid > 2400 ? 'bright' : 'balanced',
            bass: low / total > 0.4 ? 'heavy' : low / total < 0.12 ? 'thin' : 'ok',
            compressed: dyn < 3
        };
        const L = { gain: { high: 'molto distorto (high gain)', crunch: 'crunch / overdrive', clean: 'pulito' }, tone: { dark: 'scuro e caldo', bright: 'brillante e tagliente', balanced: 'equilibrato' }, bass: { heavy: 'abbondanti', thin: 'scarsi', ok: 'equilibrati' } };
        const text = `Analisi automatica della registrazione (stime approssimative): carattere ${L.gain[profile.gain]}, timbro ${L.tone[profile.tone]}, bassi ${L.bass[profile.bass]}, dinamica ${profile.compressed ? 'compressa' : 'ampia'} (centroide spettrale ${Math.round(centroid)} Hz, crest factor ${crest.toFixed(1)} dB, ${Math.round(N / sr)} s analizzati).`;
        return { text, profile, name: file.name };
    }

    // ridimensiona una foto (max 1280 px) per inviarla a Claude
    function prepareImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file), img = new Image();
            img.onload = () => {
                const k = Math.min(1, 1280 / Math.max(img.width, img.height));
                const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                c.toBlob(blob => {
                    URL.revokeObjectURL(url);
                    if (!blob) return reject(new Error('Immagine non leggibile.'));
                    const r = new FileReader();
                    r.onload = () => resolve({ blob, mediaType: 'image/jpeg', base64: String(r.result).split(',')[1], name: file.name });
                    r.readAsDataURL(blob);
                }, 'image/jpeg', 0.85);
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Immagine non leggibile.')); };
            img.src = url;
        });
    }

    // ---------------------------------------------------------------- prompt per Claude
    function catalogText() {
        const info = (typeof pedalInfo !== 'undefined') ? pedalInfo : {};
        return CATS.map(cat => {
            const rows = pedalsOf(cat).filter(p => p.name !== NONE).map(p => {
                const base = info[p.name] ? ` — basato su ${info[p.name]}` : '';
                return `  - ${p.name}${base} | manopole: ${p.params.join(', ') || 'nessuna'}`;
            });
            return `[${cat}] (oppure "${NONE}" per lasciare lo slot vuoto)\n${rows.join('\n')}`;
        }).join('\n\n');
    }

    function buildSystemPrompt() {
        return `Sei un esperto sound designer di chitarra e conosci a fondo l'amplificatore Positive Grid Spark e la sua app.
Il tuo compito è costruire catene di effetti per il Spark: 7 slot in quest'ordine fisso: Gate, Comp, Drive, Amp, Mod, Delay, Reverb.

REGOLE
- Usa SOLO i pedali elencati nel catalogo qui sotto, scrivendo il nome ESATTAMENTE come appare. Nello slot Mod ci sono anche gli equalizzatori.
- Se il rig originale usa un pedale che non esiste, scegli il modello Spark più vicino per carattere (guarda il campo "basato su").
- Le manopole usano una scala intera da 0 a 10 e vanno indicate con i nomi esatti del catalogo. Se uno slot è vuoto, "knobs" resta vuoto.
- Ragiona sul gain staging: pochi pedali ben scelti battono una catena piena. Lascia vuoti gli slot che non servono.
- Tieni conto del tipo di pickup se indicato (single coil: più ronzio, serve il Gate; humbucker: più bassi e uscita, attenzione all'impasto).
- Se la richiesta contiene più sezioni (ritmica, assolo, intro, clean) crea più parti (massimo 4) con nomi tra: ${PART_NAMES.join(', ')}. Altrimenti una sola parte. Le parti di una stessa canzone devono avere volumi bilanciati: l'assolo di solito ha più Level/delay.
- Nel campo "notes" di ogni parte scrivi 2-3 frasi pratiche in italiano: perché hai scelto quei pedali e consigli di esecuzione (pickup, volume della chitarra, plettrata).
- Nel campo "summary" scrivi una frase in italiano sul carattere complessivo del suono.
- Nel campo "tags" metti da 1 a 3 etichette brevi in minuscolo (genere o stile, es. "blues", "hard rock", "ambient").
- Se ti viene data una foto, riconosci ampli e pedali visibili (anche i modelli reali) e traducili nel catalogo Spark; se non sei sicuro di un modello dillo nelle note.
- Se ti viene data un'analisi automatica di una registrazione, trattala come indizio approssimativo del timbro, non come certezza.
- Rispondi sempre chiamando lo strumento crea_preset.

CATALOGO SPARK
${catalogText()}`;
    }

    function buildTool() {
        const chainProps = {};
        CATS.forEach(c => {
            chainProps[c] = {
                type: 'object',
                properties: {
                    name: { type: 'string', enum: pedalsOf(c).map(p => p.name) },
                    knobs: { type: 'object', description: 'Nome manopola -> valore intero 0-10', additionalProperties: { type: 'number' } }
                },
                required: ['name']
            };
        });
        return {
            name: 'crea_preset',
            description: 'Restituisce il preset (una o più parti) per l\'amplificatore Spark.',
            input_schema: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Titolo breve del suono o del brano' },
                    summary: { type: 'string' },
                    tags: { type: 'array', maxItems: 3, items: { type: 'string' } },
                    parts: {
                        type: 'array', minItems: 1, maxItems: 4,
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', enum: PART_NAMES },
                                chain: { type: 'object', properties: chainProps, required: CATS },
                                notes: { type: 'string' }
                            },
                            required: ['name', 'chain', 'notes']
                        }
                    }
                },
                required: ['title', 'parts']
            }
        };
    }

    function buildUserPrompt(opts) {
        const lines = [`Richiesta: ${opts.prompt}`];
        if (opts.pickup) lines.push(`Pickup della chitarra: ${opts.pickup}`);
        if (opts.audioText) lines.push(opts.audioText);
        if (opts.image) lines.push('Ti allego una foto: mostra il rig o la pedaliera di cui voglio ricreare il suono.');
        const taste = tasteText(opts.taste);
        if (taste) lines.push(taste);
        if (opts.scope === 'active-part') {
            lines.push(`\nModifica la parte «${opts.currentPartName || 'attuale'}» partendo da questa catena (cambia solo ciò che serve alla richiesta, mantieni il resto):\n${describeSlots(opts.currentSlots)}`);
            lines.push('\nRestituisci ESATTAMENTE una parte.');
        } else if (opts.scope === 'single') {
            lines.push('\nRestituisci ESATTAMENTE una parte.');
        } else {
            lines.push('\nSe il brano ha sezioni diverse (ritmica, assolo...) crea più parti, altrimenti una sola.');
        }
        return lines.join('\n');
    }

    async function apiPost(body, settings, signal) {
        let res;
        try {
            res = await fetch(API_URL, {
                method: 'POST', signal,
                headers: { 'content-type': 'application/json', 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
                body: JSON.stringify(body)
            });
        } catch (e) {
            if (e.name === 'AbortError') throw e;
            throw new Error('Connessione non riuscita. Sei online?');
        }
        if (!res.ok) {
            let detail = '';
            try { const j = await res.json(); detail = j && j.error && j.error.message || ''; } catch (e) { /* ignore */ }
            const map = {
                401: 'Chiave API non valida. Controllala nelle impostazioni AI.',
                403: 'La chiave API non ha il permesso di usare questo modello.',
                404: `Modello «${settings.model}» non trovato. Cambia modello nelle impostazioni AI.`,
                429: 'Troppe richieste o credito esaurito. Riprova tra poco.',
                529: 'Il servizio è sovraccarico. Riprova tra poco.'
            };
            throw new Error((map[res.status] || `Errore del servizio (${res.status}).`) + (detail && !map[res.status] ? ' ' + detail : ''));
        }
        return res.json();
    }

    async function callClaude(opts, settings, signal) {
        const tool = buildTool();
        const text = buildUserPrompt(opts);
        const content = opts.image
            ? [{ type: 'image', source: { type: 'base64', media_type: opts.image.mediaType, data: opts.image.base64 } }, { type: 'text', text }]
            : text;
        const data = await apiPost({
            model: settings.model, max_tokens: 4000,
            system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
            tools: [tool], tool_choice: { type: 'tool', name: tool.name },
            messages: [{ role: 'user', content }]
        }, settings, signal);
        const block = (data.content || []).find(b => b.type === 'tool_use');
        if (!block) throw new Error('Il modello non ha restituito un preset valido. Riprova.');
        return block.input;
    }

    // ---------------------------------------------------------------- motore locale (offline)
    // Ogni stile: parole chiave, catena base e manopole per categoria.
    const STYLES = {
        clean: {
            label: 'Clean / Pop / Jazz', kw: ['clean', 'pulito', 'jazz', 'cristallino', 'pop', 'ballad', 'ballata', 'soul', 'rnb', 'bossa', 'sultans', 'knopfler'],
            chain: { Gate: '01 NoisGate', Comp: '01 LA Comp', Drive: NONE, Amp: '02 Black Duo', Mod: NONE, Delay: NONE, Reverb: '04 Plate Short' },
            k: { Amp: { Gain: 2, Bass: 5, Mid: 5, Treb: 6, Pres: 5, Master: 6 }, Comp: { Comp: 4, Gain: 5, Level: 6 }, Reverb: { Level: 3, Time: 4, Tone: 6, Dwell: 4 } },
            tip: 'Il compressore LA-2A livella il volume in modo naturale: alza "Level" per usarlo come boost.'
        },
        blues: {
            label: 'Blues', kw: ['blues', 'bb king', 'clapton', 'srv', 'vaughan', 'gary moore', 'texas', 'bluesy'],
            chain: { Gate: NONE, Comp: NONE, Drive: '02 Clone Drv', Amp: '18 Lux Verb', Mod: NONE, Delay: NONE, Reverb: '04 Plate Short' },
            k: { Drive: { Gain: 3, Treb: 5, Vol: 6 }, Amp: { Gain: 5, Bass: 5, Mid: 6, Treb: 6, Pres: 4, Master: 6 }, Reverb: { Level: 3, Time: 4, Tone: 5, Dwell: 4 } },
            tip: 'Il Klon sempre acceso con poco Gain dà sensibilità al tocco: abbassa il volume della chitarra per pulire.'
        },
        classic: {
            label: 'Classic Rock / Crunch', kw: ['classic rock', 'crunch', 'acdc', 'ac/dc', 'angus', 'rock', 'stones', 'zeppelin', 'who', 'marshall', 'british', 'beatles', 'queen', 'brian may'],
            chain: { Gate: NONE, Comp: NONE, Drive: NONE, Amp: '16 Plexiglas', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Amp: { Gain: 6, Bass: 5, Mid: 7, Treb: 6, Pres: 5, Master: 6 }, Reverb: { Level: 2, Time: 3, Tone: 5, Dwell: 4 } },
            tip: 'Un ampli stile Marshall lavora meglio spinto di volume: usa il Master alto e pulisci con la manopola della chitarra.'
        },
        hardrock: {
            label: 'Hard Rock', kw: ['hard rock', 'hardrock', 'guns', 'slash', 'sweet child', 'gnr', 'heavy', 'van halen', 'aerosmith', 'kiss', 'ozzy', 'sabbath', 'maiden'],
            chain: { Gate: '01 NoisGate', Comp: NONE, Drive: '04 Over Drv', Amp: '17 JM45', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Drive: { Drive: 3, Tone: 6, Level: 7 }, Amp: { Gain: 6, Bass: 5, Mid: 7, Treb: 6, Pres: 6, Master: 6 }, Gate: { Thresh: 3, Decay: 5 } },
            tip: 'Davanti all\'ampli, un overdrive con Drive basso spinge il lead senza impastare gli accordi.'
        },
        metal: {
            label: 'Metal / High Gain', kw: ['metal', 'metallica', 'djent', 'thrash', 'high gain', 'high-gain', 'pantera', 'slayer', 'megadeth', 'tool', 'drop d', 'drop c', 'distorto', 'heavy metal', 'riff veloci', 'stretto'],
            chain: { Gate: '01 NoisGate', Comp: NONE, Drive: '03 Tube Drv', Amp: '26 Treadplate', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Gate: { Thresh: 5, Decay: 3 }, Drive: { Drive: 0, Tone: 6, Level: 10 }, Amp: { Gain: 7, Bass: 5, Mid: 5, Treb: 5, Pres: 5, Master: 6 }, Reverb: { Level: 1, Time: 2, Tone: 4, Dwell: 3 } },
            tip: 'Tube Drive con Drive 0 e Level 10 davanti all\'ampli high-gain taglia i bassi impastati e stringe il punch ritmico.'
        },
        fuzz: {
            label: 'Fuzz / Psichedelico', kw: ['fuzz', 'psichedel', 'psychedel', 'hendrix', 'purple haze', 'pink floyd', 'floyd', 'gilmour', 'comfortably', 'stoner', 'doom', 'wild thing', 'vintage', '70s', 'anni 70'],
            chain: { Gate: NONE, Comp: NONE, Drive: '09 Fuzz Face', Amp: '21 RB 101', Mod: NONE, Delay: '05 Multi Head', Reverb: '03 Hall Nat.' },
            k: { Drive: { Fuzz: 7, Vol: 6 }, Amp: { Gain: 4, Bass: 5, Mid: 6, Treb: 6, Pres: 5, Master: 6 }, Delay: { Time: 5, Feed: 4, Head: 5, Level: 4 }, Reverb: { Level: 4, Time: 6, Tone: 5, Dwell: 5 } },
            tip: 'Il Fuzz Face risponde alla chitarra: abbassa il volume per pulire, alzalo per la saturazione piena.'
        },
        funk: {
            label: 'Funk', kw: ['funk', 'chicken', 'scratch', 'nile rodgers', 'disco', 'groove', 'rhcp', 'chili peppers', 'frusciante'],
            chain: { Gate: NONE, Comp: '03 Red Comp', Drive: NONE, Amp: '02 Black Duo', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Comp: { Sens: 6, Level: 6 }, Amp: { Gain: 3, Bass: 4, Mid: 5, Treb: 7, Pres: 6, Master: 6 }, Reverb: { Level: 2, Time: 2, Tone: 5, Dwell: 3 } },
            tip: 'Il compressore stile Dyna Comp "schiaccia" il segnale: perfetto per il suono scattante delle ritmiche funk.'
        },
        country: {
            label: 'Country', kw: ['country', 'nashville', 'twang', 'telecaster', 'tele', 'bluegrass', 'chet atkins'],
            chain: { Gate: NONE, Comp: '03 Red Comp', Drive: '01 Booster', Amp: '02 Black Duo', Mod: NONE, Delay: '03 Vintage', Reverb: '04 Plate Short' },
            k: { Comp: { Sens: 6, Level: 6 }, Drive: { Gain: 3, Bass: 4, Treb: 6, Vol: 6 }, Amp: { Gain: 3, Bass: 4, Mid: 5, Treb: 7, Pres: 6, Master: 6 }, Delay: { Time: 2, Feed: 2, Tone: 5, Level: 3 }, Reverb: { Level: 3, Time: 4, Tone: 6, Dwell: 4 } },
            tip: 'Un delay corto con poco feedback (slapback) è il classico "twang" country.'
        },
        ambient: {
            label: 'Ambient / Post-rock', kw: ['ambient', 'post rock', 'post-rock', 'shoegaze', 'atmosfer', 'u2', 'edge', 'coldplay', 'eterea', 'sognante', 'pad', 'spaziale', 'cinematic'],
            chain: { Gate: NONE, Comp: NONE, Drive: '01 Booster', Amp: '01 Silver 120', Mod: '02 Chorus', Delay: '06 Echo Tape', Reverb: '05 Hall Amb.' },
            k: { Drive: { Gain: 2, Bass: 5, Treb: 5, Vol: 6 }, Amp: { Gain: 2, Bass: 5, Mid: 5, Treb: 6, Pres: 5, Master: 6 }, Delay: { Time: 6, Feed: 5, Tone: 5, Level: 5 }, Reverb: { Level: 6, Time: 7, Tone: 5, Dwell: 6 } },
            tip: 'Per ambient parti da un ampli ultra-pulito: con troppi delay e reverb su un ampli che satura, ottieni solo rumore dissonante.'
        },
        grunge: {
            label: 'Grunge / Punk / Alternative', kw: ['grunge', 'nirvana', 'punk', 'alternative', 'alt rock', 'garage', 'pearl jam', 'soundgarden', 'green day', 'ramones', 'smashing', 'weezer', 'cobain'],
            chain: { Gate: NONE, Comp: NONE, Drive: '12 Guitar Muff', Amp: '02 Black Duo', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Drive: { Sustain: 5, Tone: 5, Vol: 6 }, Amp: { Gain: 5, Bass: 5, Mid: 5, Treb: 6, Pres: 5, Master: 6 }, Reverb: { Level: 2, Time: 3, Tone: 5, Dwell: 3 } },
            tip: 'Il Big Muff dà il muro di suono: il volume della chitarra lo trasforma da pulito a sporco.'
        },
        acoustic: {
            label: 'Acustica', kw: ['acustic', 'folk', 'unplugged', 'fingerstyle', 'dodici corde', '12 corde', '12-string', 'ukulele'],
            chain: { Gate: NONE, Comp: '05 Optical', Drive: NONE, Amp: '35 Flat Ac.', Mod: NONE, Delay: NONE, Reverb: '01 Room A' },
            k: { Comp: { Comp: 4, Tone: 5, Level: 6 }, Amp: { Gain: 3, Bass: 5, Mid: 5, Treb: 6, Pres: 5, Master: 6 }, Reverb: { Level: 3, Time: 3, Tone: 6, Dwell: 4 } },
            tip: 'Il compressore ottico è trasparente: mantiene il suono naturale e controlla solo i picchi.'
        }
    };
    const STYLE_ORDER = ['metal', 'hardrock', 'grunge', 'fuzz', 'funk', 'country', 'ambient', 'acoustic', 'blues', 'classic', 'clean'];

    function detectStyle(text) {
        const t = ' ' + String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + ' ';
        let best = null, bestScore = 0;
        STYLE_ORDER.forEach(key => {
            let score = 0;
            STYLES[key].kw.forEach(k => { if (t.includes(k)) score += k.length > 4 ? 2 : 1; });
            if (score > bestScore) { best = key; bestScore = score; }
        });
        return best;
    }

    // cerca un preset della libreria cloud che combaci con la richiesta
    const STOP = new Set(['the', 'and', 'solo', 'lead', 'clean', 'guitar', 'chitarra', 'suono', 'brano', 'song', 'per', 'con', 'come', 'del', 'della', 'dei', 'fra', 'tra', 'un', 'una', 'che', 'in', 'di', 'da', 'il', 'la', 'le', 'lo', 'ritmica', 'assolo', 'intro', 'riff', 'rig', 'tone', 'sound', 'crunch']);
    function matchCloudPreset(text) {
        if (typeof cloudPresets === 'undefined') return null;
        const tokens = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9']+/).filter(w => w.length > 2 && !STOP.has(w));
        if (!tokens.length) return null;
        let best = null, bestScore = 0;
        cloudPresets.forEach(p => {
            const title = ' ' + p.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + ' ';
            let score = 0;
            tokens.forEach(tok => { if (title.includes(tok)) score += tok.length >= 6 ? 2 : 1; });
            if (score > bestScore) { best = p; bestScore = score; }
        });
        return bestScore >= 2 ? best : null;
    }

    function slotsFromNames(names, knobsByCat) {
        return CATS.map(c => makeSlot(c, { name: names[c] || NONE, knobs: (knobsByCat && knobsByCat[c]) || {} }));
    }

    function setKnob(slots, cat, label, fn) {
        const s = slots.find(x => x.category === cat);
        if (!s || s.name === NONE) return;
        const p = findPedal(cat, s.name);
        const i = p ? p.params.findIndex(l => norm(l) === norm(label)) : -1;
        if (i >= 0) s.paramValues[i] = String(clamp10(fn(Number(s.paramValues[i]))));
    }
    function setPedal(slots, cat, name, knobs) {
        const i = slots.findIndex(x => x.category === cat);
        if (i >= 0) slots[i] = makeSlot(cat, { name, knobs: knobs || {} });
    }
    const isNone = (slots, cat) => { const s = slots.find(x => x.category === cat); return !s || s.name === NONE; };

    function applyPickup(slots, pickup) {
        const p = String(pickup || '').toLowerCase();
        if (/single|strat|tele|coil/.test(p)) {
            if (isNone(slots, 'Gate')) setPedal(slots, 'Gate', '01 NoisGate', { Thresh: 5, Decay: 5 });
            else setKnob(slots, 'Gate', 'Thresh', v => v + 1);
            setKnob(slots, 'Amp', 'Treb', v => v - 1);
        } else if (/humb|les paul|sg|pafs?/.test(p)) {
            setKnob(slots, 'Amp', 'Treb', v => v + 1);
            setKnob(slots, 'Amp', 'Bass', v => v - 1);
        }
    }

    function soloVariant(rhythm, styleKey) {
        const s = clone(rhythm);
        if (isNone(s, 'Drive')) setPedal(s, 'Drive', styleKey === 'clean' || styleKey === 'ambient' ? '02 Clone Drv' : '01 Booster', styleKey === 'clean' || styleKey === 'ambient' ? { Gain: 4, Treb: 5, Vol: 7 } : { Gain: 3, Bass: 5, Treb: 6, Vol: 8 });
        else setKnob(s, 'Drive', 'Level', v => v + 1), setKnob(s, 'Drive', 'Vol', v => v + 1);
        setKnob(s, 'Amp', 'Mid', v => v + 1);
        setKnob(s, 'Amp', 'Master', v => v + 1);
        if (isNone(s, 'Delay')) setPedal(s, 'Delay', '01 Digital', { Time: 4, Feed: 3, Level: 4 });
        else setKnob(s, 'Delay', 'Level', v => v + 1);
        setKnob(s, 'Reverb', 'Level', v => v + 1);
        return s;
    }
    function cleanVariant(rhythm) {
        const s = clone(rhythm);
        setPedal(s, 'Drive', NONE);
        setKnob(s, 'Amp', 'Gain', v => Math.min(v, 2));
        if (isNone(s, 'Mod')) setPedal(s, 'Mod', '02 Chorus', { Speed: 3, Depth: 4, Vol: 6 });
        if (isNone(s, 'Delay')) setPedal(s, 'Delay', '03 Vintage', { Time: 5, Feed: 3, Tone: 5, Level: 4 });
        setKnob(s, 'Reverb', 'Level', v => v + 2);
        return s;
    }

    // modifiche a parole sulla catena corrente (motore locale)
    const TWEAKS = [
        [/(piu|più) scur|meno acut|meno treble|meno brill|troppo tagliente|troppi acut|stridul|fastidios|stanc/, (s) => { setKnob(s, 'Amp', 'Treb', v => v - 2); setKnob(s, 'Amp', 'Pres', v => v - 1); }],
        [/(piu|più) brillant|(piu|più) acut|(piu|più) treble|(piu|più) aperto/, (s) => { setKnob(s, 'Amp', 'Treb', v => v + 2); setKnob(s, 'Amp', 'Pres', v => v + 1); }],
        [/(piu|più) (gain|distors|sporco|saturo|cattivo)/, (s) => { setKnob(s, 'Amp', 'Gain', v => v + 2); setKnob(s, 'Drive', 'Gain', v => v + 1); }],
        [/meno (gain|distors|sporco|saturo)|(piu|più) puli/, (s) => { setKnob(s, 'Amp', 'Gain', v => v - 2); setKnob(s, 'Drive', 'Gain', v => v - 1); }],
        [/(piu|più) delay|(piu|più) eco/, (s) => { if (isNone(s, 'Delay')) setPedal(s, 'Delay', '01 Digital', { Time: 4, Feed: 3, Level: 4 }); else setKnob(s, 'Delay', 'Level', v => v + 2); }],
        [/meno delay|meno eco|senza delay/, (s) => { setKnob(s, 'Delay', 'Level', v => v - 2); }],
        [/(piu|più) riverbero|(piu|più) reverb|(piu|più) spaziale/, (s) => { setKnob(s, 'Reverb', 'Level', v => v + 2); setKnob(s, 'Reverb', 'Time', v => v + 1); }],
        [/meno riverbero|meno reverb|(piu|più) secco/, (s) => { setKnob(s, 'Reverb', 'Level', v => v - 2); }],
        [/(piu|più) bass|(piu|più) corpo|(piu|più) grasso/, (s) => { setKnob(s, 'Amp', 'Bass', v => v + 2); }],
        [/meno bass|troppi bass|bassi eccessiv|rimbomb|boom|impast|confus|fangos/, (s) => { setKnob(s, 'Amp', 'Bass', v => v - 2); }],
        [/(piu|più) med|(piu|più) present|taglia nel mix|debole|sepolt|non si sente|poco presente/, (s) => { setKnob(s, 'Amp', 'Mid', v => v + 2); }],
        [/(piu|più) volume|(piu|più) forte/, (s) => { setKnob(s, 'Amp', 'Master', v => v + 1); }],
        [/meno volume|(piu|più) piano/, (s) => { setKnob(s, 'Amp', 'Master', v => v - 1); }],
        [/(piu|più) compress|(piu|più) sustain/, (s) => { if (isNone(s, 'Comp')) setPedal(s, 'Comp', '01 LA Comp', { Comp: 5, Gain: 5, Level: 6 }); else setKnob(s, 'Comp', 'Comp', v => v + 2); }],
        [/meno rumore|ronzio|hum|fruscio/, (s) => { if (isNone(s, 'Gate')) setPedal(s, 'Gate', '01 NoisGate', { Thresh: 5, Decay: 5 }); else setKnob(s, 'Gate', 'Thresh', v => v + 2); }]
    ];

    const TAGS = { clean: 'clean', blues: 'blues', classic: 'classic rock', hardrock: 'hard rock', metal: 'metal', fuzz: 'psichedelico', funk: 'funk', country: 'country', ambient: 'ambient', grunge: 'grunge', acoustic: 'acustica' };

    function localGenerate(opts) {
        const text = String(opts.prompt || '');
        const lower = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

        // 1) perfezionamento della catena corrente
        const emptyChain = !opts.currentSlots || opts.currentSlots.every(s => !s || s.name === NONE);
        if (opts.scope === 'active-part' && opts.currentSlots && !emptyChain) {
            const slots = clone(opts.currentSlots);
            let hit = 0;
            TWEAKS.forEach(([re, fn]) => { if (re.test(lower)) { fn(slots); hit++; } });
            applyPickup(slots, opts.pickup);
            return {
                title: '', tags: [], source: 'local',
                summary: hit ? 'Ritocchi applicati dal motore locale.' : 'Il motore locale non ha riconosciuto la modifica richiesta.',
                parts: [{
                    name: opts.currentPartName || 'Accompagnamento', slots,
                    notes: hit ? 'Modifiche a regole (es. "più scuro", "più delay", "meno gain"). Con una chiave AI puoi descrivere cambi più complessi.' : 'Prova frasi come "più scuro", "più gain", "più riverbero", "meno bassi". Con una chiave AI capisco richieste libere.'
                }]
            };
        }

        // 2) generazione da zero
        const matched = matchCloudPreset(text);
        const ap = opts.audioProfile || null;
        let styleKey = detectStyle(text);
        if (!styleKey) styleKey = ap ? (ap.gain === 'high' ? (ap.tone === 'bright' ? 'metal' : 'hardrock') : ap.gain === 'crunch' ? 'classic' : 'clean') : 'classic';
        const style = STYLES[styleKey];
        let names = Object.assign({}, style.chain);
        let knobs = clone(style.k || {});
        let label = style.label, tip = style.tip;

        if (matched) { names = Object.assign({}, names, matched.chain); label = matched.title; }
        if (/hendrix|purple haze|jimi/.test(lower)) names.Amp = 'J.H. Super 100';
        if (/dumble|srv|vaughan/.test(lower) && !matched) names.Amp = '05 OSD 50';

        const base = slotsFromNames(names, knobs);
        applyPickup(base, opts.pickup);
        if (ap) {
            if (ap.tone === 'dark') { setKnob(base, 'Amp', 'Treb', v => v - 2); setKnob(base, 'Amp', 'Pres', v => v - 1); }
            if (ap.tone === 'bright') { setKnob(base, 'Amp', 'Treb', v => v + 1); }
            if (ap.bass === 'heavy') setKnob(base, 'Amp', 'Bass', v => v + 2);
            if (ap.bass === 'thin') setKnob(base, 'Amp', 'Bass', v => v - 2);
            if (ap.compressed && isNone(base, 'Comp')) setPedal(base, 'Comp', '01 LA Comp', { Comp: 5, Gain: 5, Level: 6 });
        }
        const taste = opts.taste;
        if (taste && taste.avg) {   // avvicina riverbero, delay e gain ai gusti dell'utente
            const pull = (cat, label, target) => { if (target != null) setKnob(base, cat, label, v => v + (target - v) * 0.35); };
            pull('Reverb', 'Level', taste.avg.reverb); pull('Delay', 'Level', taste.avg.delay); pull('Amp', 'Gain', taste.avg.ampGain);
        }
        const wantsSolo = /assolo|solo|lead/.test(lower);
        const wantsClean = /arpegg|intro|ballad|ballata|clean/.test(lower);

        const parts = [];
        if (opts.scope === 'single' || opts.scope === 'active-part') {
            parts.push({ name: wantsSolo ? 'Assolo' : 'Accompagnamento', slots: wantsSolo ? soloVariant(base, styleKey) : base });
        } else {
            parts.push({ name: 'Accompagnamento', slots: base });
            parts.push({ name: 'Assolo', slots: soloVariant(base, styleKey) });
            if (wantsClean && styleKey !== 'clean' && styleKey !== 'acoustic') parts.push({ name: 'Clean / Arpeggio', slots: cleanVariant(base) });
        }
        const notesFor = (p) => {
            if (p.name === 'Assolo') return 'Rispetto alla ritmica: più volume, un po\' di medi e delay per far emergere il lead nel mix.';
            if (p.name === 'Clean / Arpeggio') return 'Niente drive, gain basso, chorus e delay per arpeggi ampi e puliti.';
            return `${tip} Ricorda: il volume e il selettore pickup della chitarra cambiano molto il carattere.`;
        };
        parts.forEach(p => { p.notes = notesFor(p); });

        return {
            title: opts.title || '', tags: [TAGS[styleKey]], source: matched ? 'preset' : 'local',
            summary: matched ? `Basato sul preset «${matched.title}» della libreria.` : `Stile riconosciuto: ${label}.`,
            parts
        };
    }

    // ---------------------------------------------------------------- Claude integrato (pagine pubblicate su claude.ai)
    async function getSample() {
        try { return (typeof window !== 'undefined' && window.claude && window.claude.use) ? await window.claude.use('sample') : null; } catch (e) { return null; }
    }
    async function callSample(opts, sample, signal) {
        const schema = `{"title": "...", "summary": "...", "parts": [{"name": "${PART_NAMES.join(' | ')}", "chain": {${CATS.map(c => `"${c}": {"name": "<nome esatto dal catalogo o ${NONE}>", "knobs": {"<manopola>": 0-10}}`).join(', ')}}, "notes": "..."}]}`;
        const text = `${buildSystemPrompt()}\n\nFORMATO DI RISPOSTA: rispondi SOLO con un oggetto JSON valido (nessun testo prima o dopo, nessun markdown) con questa forma:\n${schema}\n\n${buildUserPrompt(opts)}`;
        const o = { signal, cache: false, modelTier: 'default' };
        if (opts.image) {
            const lim = await sample.limits().catch(() => null);
            if (!lim || !lim.images) throw new Error('In questa pagina non posso inviare foto a Claude.');
            o.images = [opts.image.blob];
        }
        try {
            return await sample.json(text, o);
        } catch (e) {
            if (e && e.name === 'AbortError') throw e;
            if (e && e.code === 'not_granted') throw new Error('Permesso negato: consenti a Claude di rispondere dalla pagina, oppure usa il motore locale.');
            if (e && e.code === 'rate_limited') throw new Error('Troppe richieste, riprova tra poco.');
            throw new Error((e && e.message) || 'Claude non ha restituito un preset valido. Riprova.');
        }
    }

    async function cloudAvailable() {
        const st = getSettings();
        if (st.localOnly) return false;
        return !!(await getSample()) || !!st.apiKey;
    }
    // domanda libera a Claude (usata ad esempio per spiegare le differenze tra due versioni)
    async function askText(prompt, signal) {
        const st = getSettings();
        if (st.localOnly) throw new Error('Il motore locale non può spiegare: disattiva "solo motore locale" nelle impostazioni.');
        const sample = await getSample();
        if (sample) {
            try { const r = await sample(prompt, { signal, cache: false, modelTier: 'quick' }); return r.text; }
            catch (e) { if (e && e.name === 'AbortError') throw e; throw new Error((e && e.message) || 'Claude non ha risposto.'); }
        }
        if (st.apiKey) {
            const data = await apiPost({ model: st.model, max_tokens: 800, messages: [{ role: 'user', content: prompt }] }, st, signal);
            return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
        }
        throw new Error('Serve Claude: inserisci una chiave in ⚙️ nella finestra AI.');
    }

    // ---------------------------------------------------------------- generazione (entry point)
    // Ordine: Claude integrato (se la pagina lo offre) -> chiave API personale -> motore locale
    async function generate(opts, signal) {
        const settings = getSettings();
        const o = Object.assign({ scope: 'multi' }, opts);
        if (!o.prompt || !String(o.prompt).trim()) throw new Error('Scrivi cosa vuoi ottenere (brano, artista o tipo di suono).');
        o.taste = tasteProfile();
        let raw = null;
        if (!settings.localOnly) {
            const sample = await getSample();
            if (sample) raw = await callSample(o, sample, signal);
            else if (settings.apiKey) raw = await callClaude(o, settings, signal);
        }
        if (!raw) {
            if (o.image) throw new Error('Le foto si leggono solo con Claude: inserisci una chiave in ⚙️ (o usa la versione pubblicata su claude.ai).');
            return localGenerate(o);
        }
        const result = normalizeResult(raw, 'claude');
        if (o.scope === 'active-part' || o.scope === 'single') result.parts = result.parts.slice(0, 1);
        return result;
    }

    // ================================================================= INTERFACCIA
    let ui = null, ctx = null, lastResult = null, abortCtl = null;

    function injectStyles() {
        if (document.getElementById('ai-engine-styles')) return;
        const st = document.createElement('style');
        st.id = 'ai-engine-styles';
        st.textContent = `
        .ai-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:none;align-items:flex-start;justify-content:center;padding:15px;overflow-y:auto;box-sizing:border-box}
        .ai-overlay.open{display:flex}
        .ai-modal{background:var(--bg-card,#1e1e1e);border:1px solid var(--spark-gold,#d4af37);border-radius:14px;width:100%;max-width:680px;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,.7);color:var(--text-main,#f0f0f0);box-sizing:border-box;margin:auto 0}
        .ai-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
        .ai-head h2{margin:0;flex:1;color:var(--spark-gold,#d4af37);font-size:1.2em}
        .ai-icon-btn{background:none;border:none;color:var(--text-muted,#aaa);font-size:1.3em;cursor:pointer;padding:4px 8px}
        .ai-icon-btn:hover{color:#fff}
        .ai-badge{display:inline-block;font-size:.75em;padding:3px 9px;border-radius:12px;font-weight:bold;margin-bottom:10px}
        .ai-badge.cloud{background:rgba(142,68,173,.25);color:#c39bd3;border:1px solid #8e44ad}
        .ai-badge.local{background:rgba(212,175,55,.12);color:var(--spark-gold,#d4af37);border:1px solid var(--spark-gold,#d4af37)}
        .ai-modal label{display:block;font-size:.8em;color:var(--text-muted,#aaa);margin:10px 0 4px}
        .ai-modal textarea,.ai-modal input[type=text],.ai-modal input[type=password],.ai-modal select{width:100%;background:#111;color:#fff;border:1px solid #444;border-radius:8px;padding:10px;font-size:.95em;box-sizing:border-box;font-family:inherit}
        .ai-modal textarea{min-height:80px;resize:vertical}
        .ai-modal textarea:focus,.ai-modal input:focus,.ai-modal select:focus{outline:none;border-color:var(--spark-gold,#d4af37)}
        .ai-row{display:flex;gap:10px;flex-wrap:wrap}
        .ai-row>div{flex:1;min-width:150px}
        .ai-modal .btn{background:var(--spark-gold,#d4af37);color:#000;border:none;padding:10px 15px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:.9em;text-align:center;display:inline-block}
        .ai-modal .btn-secondary{background:#444;color:#fff}
        .ai-modal .btn:disabled{cursor:default}
        .ai-attach{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px}
        .ai-attach .ai-note{margin:0;flex:1;min-width:140px}
        .ai-warn{font-size:.78em;color:#f5b041;margin-top:6px;line-height:1.35}
        .ai-tags{margin-top:6px;display:flex;gap:5px;flex-wrap:wrap}
        .ai-tag{background:#2a2a2a;border:1px solid #555;border-radius:10px;padding:2px 8px;font-size:.72em;color:#ccc}
        .ai-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
        .ai-chip{background:#2a2a2a;border:1px solid #444;color:var(--text-muted,#aaa);border-radius:14px;padding:4px 10px;font-size:.75em;cursor:pointer}
        .ai-chip:hover{border-color:var(--spark-gold,#d4af37);color:#fff}
        .ai-actions{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
        .ai-actions .btn{flex:1}
        .ai-error{background:rgba(192,57,43,.18);border:1px solid var(--spark-red,#c0392b);color:#ff9d92;border-radius:8px;padding:10px;font-size:.85em;margin-top:12px;display:none}
        .ai-note{font-size:.78em;color:var(--text-muted,#aaa);margin-top:8px;line-height:1.4}
        .ai-result{margin-top:16px;border-top:1px dashed #444;padding-top:12px;display:none}
        .ai-result h3{margin:0 0 4px;color:var(--spark-gold,#d4af37);font-size:1.05em}
        .ai-summary{font-size:.85em;color:var(--text-muted,#aaa);margin-bottom:10px}
        .ai-part{background:#252525;border:1px solid #3a3a3a;border-radius:10px;padding:10px;margin-bottom:10px}
        .ai-part h4{margin:0 0 6px;font-size:.95em;color:#fff}
        .ai-pills{display:flex;flex-wrap:wrap;gap:5px}
        .ai-pill{background:#1a1a1a;border:1px solid #444;border-radius:8px;padding:4px 8px;font-size:.72em}
        .ai-pill b{color:var(--spark-gold,#d4af37)}
        .ai-pill span{color:var(--text-muted,#aaa)}
        .ai-part-notes{font-size:.8em;color:#ccc;margin-top:8px;line-height:1.4}
        .ai-spinner{display:none;font-size:.85em;color:var(--spark-gold,#d4af37);margin-top:12px}
        .ai-settings{display:none;background:#181818;border:1px solid #444;border-radius:10px;padding:12px;margin-bottom:12px}
        .ai-check{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:.85em;color:var(--text-main,#f0f0f0)}
        .ai-check input{width:auto;margin:0}
        .ai-status-ok{color:#2ecc71;font-size:.8em;margin-top:6px}
        `;
        document.head.appendChild(st);
    }

    function buildUI() {
        injectStyles();
        const ov = document.createElement('div');
        ov.className = 'ai-overlay';
        ov.id = 'ai-overlay';
        ov.innerHTML = `
        <div class="ai-modal" role="dialog" aria-modal="true" aria-label="Generatore AI">
            <div class="ai-head">
                <h2>✨ AI Tone Generator</h2>
                <button class="ai-icon-btn" id="ai-settings-btn" title="Impostazioni AI">⚙️</button>
                <button class="ai-icon-btn" id="ai-close-btn" title="Chiudi">✖</button>
            </div>
            <div id="ai-badge" class="ai-badge"></div>

            <div class="ai-settings" id="ai-settings">
                <label for="ai-key">Chiave API Anthropic</label>
                <input type="password" id="ai-key" placeholder="sk-ant-..." autocomplete="off" spellcheck="false">
                <label for="ai-model">Modello</label>
                <input type="text" id="ai-model" list="ai-models" spellcheck="false">
                <datalist id="ai-models">${MODEL_SUGGESTIONS.map(m => `<option value="${m}">`).join('')}</datalist>
                <div class="ai-check"><input type="checkbox" id="ai-use-taste"><label for="ai-use-taste" style="margin:0;color:inherit;font-size:1em">Impara dai miei preset (usa i miei gusti come punto di partenza)</label></div>
                <div class="ai-check"><input type="checkbox" id="ai-local-only"><label for="ai-local-only" style="margin:0;color:inherit;font-size:1em">Usa solo il motore locale (offline, senza chiave)</label></div>
                <div class="ai-actions">
                    <button class="btn" id="ai-save-settings">💾 Salva</button>
                    <button class="btn btn-secondary" id="ai-test-conn">🔌 Prova connessione</button>
                </div>
                <div id="ai-test-out" class="ai-note"></div>
                <div class="ai-note">🔒 La chiave resta solo in questo browser (localStorage) e viene inviata soltanto ad Anthropic. Non scriverla nei file del progetto: se pubblichi l'app su GitHub sarebbe visibile a tutti.</div>
            </div>

            <label for="ai-prompt" id="ai-prompt-label">Descrivi il suono che vuoi</label>
            <textarea id="ai-prompt" placeholder="Es. Comfortably Numb, assolo con Stratocaster, suono caldo alla Gilmour con delay lungo&#10;oppure: metal moderno stretto per riff in drop D"></textarea>
            <div class="ai-attach">
                <label class="btn btn-secondary" for="ai-file">📎 Foto del rig o registrazione</label>
                <input type="file" id="ai-file" accept="image/*,audio/*" hidden>
                <span class="ai-note" id="ai-file-info">Facoltativo: una foto della pedaliera o un file audio della chitarra.</span>
            </div>
            <div class="ai-chips" id="ai-chips"></div>

            <div class="ai-row">
                <div>
                    <label for="ai-pickup">Pickup della chitarra</label>
                    <select id="ai-pickup">
                        <option value="">Non specificato</option>
                        <option value="single coil">Single coil (Strat/Tele)</option>
                        <option value="humbucker">Humbucker (Les Paul/SG)</option>
                        <option value="P90">P90</option>
                    </select>
                </div>
                <div>
                    <label for="ai-scope">Cosa fare</label>
                    <select id="ai-scope"></select>
                </div>
            </div>

            <div class="ai-actions">
                <button class="btn" id="ai-generate">✨ Genera</button>
            </div>
            <div class="ai-spinner" id="ai-spinner">⏳ Sto creando il suono…</div>
            <div class="ai-error" id="ai-error"></div>

            <div class="ai-result" id="ai-result"></div>
        </div>`;
        document.body.appendChild(ov);

        const $ = (id) => ov.querySelector('#' + id);
        ui = {
            ov, $,
            badge: $('ai-badge'), prompt: $('ai-prompt'), pickup: $('ai-pickup'), scope: $('ai-scope'),
            gen: $('ai-generate'), spin: $('ai-spinner'), err: $('ai-error'), res: $('ai-result'),
            settings: $('ai-settings'), key: $('ai-key'), model: $('ai-model'), localOnly: $('ai-local-only'), useTaste: $('ai-use-taste'), file: $('ai-file'), fileInfo: $('ai-file-info'),
            testOut: $('ai-test-out'), chips: $('ai-chips'), promptLabel: $('ai-prompt-label')
        };

        $('ai-close-btn').onclick = close;
        ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
        $('ai-settings-btn').onclick = () => toggleSettings();
        $('ai-save-settings').onclick = () => { persistSettings(); ui.testOut.innerHTML = '<span class="ai-status-ok">✅ Salvato</span>'; refreshBadge(); };
        $('ai-test-conn').onclick = testConnection;
        ui.gen.onclick = runGenerate;
        ui.file.onchange = onFilePicked;
        ui.prompt.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runGenerate(); });
    }

    function persistSettings() {
        const s = { apiKey: ui.key.value.trim(), model: ui.model.value.trim() || DEFAULT_MODEL, localOnly: ui.localOnly.checked, useTaste: ui.useTaste.checked };
        saveSettings(s);
        return s;
    }
    function toggleSettings(force) {
        const show = force !== undefined ? force : ui.settings.style.display !== 'block';
        if (show) {
            const s = getSettings();
            ui.key.value = s.apiKey; ui.model.value = s.model; ui.localOnly.checked = s.localOnly; ui.useTaste.checked = s.useTaste;
            ui.testOut.textContent = '';
        }
        ui.settings.style.display = show ? 'block' : 'none';
    }
    function refreshBadge() {
        const s = getSettings();
        if (sampleOk && !s.localOnly) {
            ui.badge.className = 'ai-badge cloud';
            ui.badge.textContent = '🧠 Claude (integrato)';
        } else if (s.apiKey && !s.localOnly) {
            ui.badge.className = 'ai-badge cloud';
            ui.badge.textContent = `🧠 Claude · ${s.model}`;
        } else {
            ui.badge.className = 'ai-badge local';
            ui.badge.textContent = s.localOnly ? '⚙️ Motore locale (scelto da te)' : '⚙️ Motore locale · aggiungi una chiave in ⚙️ per usare Claude';
        }
    }

    async function testConnection() {
        const s = persistSettings();
        refreshBadge();
        if (!s.apiKey) { ui.testOut.textContent = 'Inserisci prima la chiave.'; return; }
        ui.testOut.textContent = '⏳ Provo…';
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-api-key': s.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
                body: JSON.stringify({ model: s.model, max_tokens: 8, messages: [{ role: 'user', content: 'ok' }] })
            });
            if (res.ok) ui.testOut.innerHTML = '<span class="ai-status-ok">✅ Connessione riuscita</span>';
            else {
                let m = ''; try { m = (await res.json()).error.message; } catch (e) { /* ignore */ }
                ui.testOut.textContent = `❌ Errore ${res.status}${m ? ': ' + m : ''}`;
            }
        } catch (e) { ui.testOut.textContent = '❌ Connessione non riuscita. Sei online?'; }
    }

    let attached = null;
    function clearAttachment() { attached = null; if (ui) { ui.file.value = ''; ui.fileInfo.textContent = 'Facoltativo: una foto della pedaliera o un file audio della chitarra.'; } }
    async function onFilePicked() {
        const f = ui.file.files && ui.file.files[0];
        attached = null; showError('');
        if (!f) { clearAttachment(); return; }
        ui.fileInfo.textContent = '⏳ Leggo il file…';
        try {
            if (f.type.startsWith('image/')) {
                const img = await prepareImage(f);
                attached = { kind: 'image', image: img };
                ui.fileInfo.innerHTML = `🖼️ ${esc(f.name)} <a href="#" id="ai-detach" style="color:#c39bd3">rimuovi</a><br>La foto viene letta da Claude.`;
            } else if (f.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(f.name)) {
                const a = await analyzeAudio(f);
                attached = { kind: 'audio', audio: a };
                ui.fileInfo.innerHTML = `🎵 ${esc(f.name)} <a href="#" id="ai-detach" style="color:#c39bd3">rimuovi</a><br>${esc(a.text)}`;
            } else throw new Error('Formato non supportato: usa una foto (JPG/PNG) o un audio (MP3/WAV/M4A).');
            const d = ui.fileInfo.querySelector('#ai-detach'); if (d) d.onclick = (e) => { e.preventDefault(); clearAttachment(); };
        } catch (e) { clearAttachment(); showError(e.message || 'File non leggibile.'); }
    }

    function setBusy(b) {
        ui.gen.disabled = b;
        ui.gen.style.opacity = b ? 0.6 : 1;
        ui.spin.style.display = b ? 'block' : 'none';
    }
    function showError(msg) { ui.err.textContent = msg; ui.err.style.display = msg ? 'block' : 'none'; }

    function pillsHTML(slots) {
        const rows = (slots || []).filter(s => s.name !== NONE).map(s => {
            const p = findPedal(s.category, s.name);
            const kn = (p ? p.params : []).map((l, i) => `${esc(l)} ${esc(s.paramValues[i])}`).join(' · ');
            return `<div class="ai-pill"><b>${esc(s.category)}</b> ${esc(s.name)}${kn ? `<br><span>${kn}</span>` : ''}</div>`;
        });
        return rows.length ? rows.join('') : '<div class="ai-pill"><span>Nessun effetto</span></div>';
    }

    function warnHTML(slots) {
        if (typeof SparkValidate === 'undefined') return '';
        const w = SparkValidate.validateChain(slots, 'cuffie').filter(x => x.level === 'warn');
        return w.length ? `<div class="ai-warn">${w.map(x => '⚠️ ' + esc(x.text)).join('<br>')}</div>` : '';
    }

    function renderResult(r) {
        const srcLabel = r.source === 'claude' ? '🧠 Generato da Claude' : r.source === 'preset' ? '📚 Dalla libreria preset' : '⚙️ Motore locale';
        ui.res.innerHTML = `
            <h3>${esc(r.title || 'Preset generato')}</h3>
            <div class="ai-summary">${srcLabel}${r.summary ? ' — ' + esc(r.summary) : ''}</div>
            ${(r.tags && r.tags.length) ? `<div class="ai-tags">${r.tags.map(t => `<span class="ai-tag">#${esc(t)}</span>`).join('')}</div>` : ''}
            ${r.parts.map(p => `<div class="ai-part"><h4>🎛️ ${esc(p.name)}</h4><div class="ai-pills">${pillsHTML(p.slots)}</div>${p.notes ? `<div class="ai-part-notes">📝 ${esc(p.notes)}</div>` : ''}${warnHTML(p.slots)}</div>`).join('')}
            <div class="ai-actions">
                <button class="btn" id="ai-apply">✅ Applica</button>
                <button class="btn btn-secondary" id="ai-regen">🔁 Rigenera</button>
            </div>`;
        ui.res.style.display = 'block';
        ui.res.querySelector('#ai-apply').onclick = applyResult;
        ui.res.querySelector('#ai-regen').onclick = runGenerate;
    }

    async function runGenerate() {
        showError('');
        let prompt = ui.prompt.value.trim();
        if (!prompt && attached && attached.kind === 'image') prompt = 'Riproduci il suono del rig mostrato nella foto.';
        if (!prompt && attached && attached.kind === 'audio') prompt = 'Ricrea il suono di questa registrazione.';
        if (!prompt) { showError('Scrivi cosa vuoi ottenere (brano, artista o tipo di suono).'); return; }
        if (abortCtl) abortCtl.abort();
        abortCtl = new AbortController();
        const scope = ui.scope.value;
        const opts = {
            prompt, pickup: ui.pickup.value, scope,
            title: ctx.title, currentSlots: ctx.currentSlots, currentPartName: ctx.currentPartName
        };
        if (attached && attached.kind === 'image') opts.image = attached.image;
        if (attached && attached.kind === 'audio') { opts.audioText = attached.audio.text; opts.audioProfile = attached.audio.profile; }
        setBusy(true);
        ui.res.style.display = 'none';
        try {
            const result = await generate(opts, abortCtl.signal);
            lastResult = { result, scope };
            renderResult(result);
        } catch (e) {
            if (e.name !== 'AbortError') {
                // se Claude fallisce, offri comunque il motore locale
                const local = !hasKey() ? null : e;
                showError(e.message || 'Errore imprevisto.' + (local ? ' Puoi riprovare, oppure attiva "solo motore locale" nelle impostazioni.' : ''));
            }
        } finally {
            setBusy(false);
        }
    }

    function applyResult() {
        if (!lastResult || !ctx || typeof ctx.onApply !== 'function') return;
        ctx.onApply(lastResult.result, lastResult.scope);
        close();
    }

    function close() {
        if (abortCtl) { abortCtl.abort(); abortCtl = null; }
        if (ui) ui.ov.classList.remove('open');
        document.body.style.overflow = '';
    }

    // c = { title, isNew, currentSlots, currentPartName, onApply(result, scope) }
    function openGenerator(c) {
        if (!ui) buildUI();
        ctx = c || {};
        lastResult = null;
        showError('');
        ui.res.style.display = 'none';
        ui.res.innerHTML = '';
        setBusy(false);
        toggleSettings(false);
        refreshBadge();
        getSample().then(sm => { sampleOk = !!sm; refreshBadge(); });

        const opts = ctx.forceScope
            ? [[ctx.forceScope, ctx.forceLabel || 'Perfeziona la parte']]
            : ctx.isNew
            ? [['multi', '🆕 Crea nuovo brano (più parti)'], ['single', '🆕 Crea nuovo brano (una parte)']]
            : [['multi', '♻️ Sostituisci tutte le parti'], ['add', '➕ Aggiungi come nuove parti'], ['active-part', `🎚️ Perfeziona la parte «${ctx.currentPartName || 'attuale'}»`]];
        ui.scope.innerHTML = opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');

        ui.prompt.value = ctx.prefill != null ? ctx.prefill : (ctx.title && ctx.title !== 'Nuovo Brano' && !ctx.forceScope ? ctx.title : '');
        ui.ov.querySelector('.ai-head h2').textContent = ctx.heading || '✨ AI Tone Generator';
        clearAttachment();
        const chips = !ctx.forceScope && (ctx.isNew || ctx.title)
            ? ['Pink Floyd – Comfortably Numb (assolo)', 'Metal moderno stretto in drop D', 'Blues caldo con Stratocaster', 'Ambient shoegaze con delay lungo', 'Funk pulito e scattante']
            : [];
        ui.chips.innerHTML = chips.map(t => `<span class="ai-chip">${esc(t)}</span>`).join('');
        ui.chips.querySelectorAll('.ai-chip').forEach(el => el.onclick = () => { ui.prompt.value = el.textContent; ui.prompt.focus(); });
        const refine = () => {
            ui.promptLabel.textContent = ui.scope.value === 'active-part' ? 'Cosa vuoi cambiare? (es. "più scuro, meno gain, delay più lungo")' : 'Descrivi il suono che vuoi';
            ui.chips.style.display = ui.scope.value === 'active-part' ? 'none' : 'flex';
        };
        ui.scope.onchange = refine; refine();

        ui.ov.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => ui.prompt.focus(), 50);
    }

    return { openGenerator, generate, localGenerate, setTasteProvider, cloudAvailable, askText, analyzeAudio, normalizeResult, getSettings, saveSettings, hasKey, describeSlots, buildTool, buildSystemPrompt, detectStyle };
})();
