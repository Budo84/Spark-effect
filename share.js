// share.js
// Condivisione di un brano come link o codice di testo (nessun server: il preset viaggia dentro il link).
// Dipende da: catalog.js, e dalla funzione globale fixSlots() definita in index.html.

const SparkShare = (() => {
    const NONE = 'Nessun Pedale';

    function packChain(slots) {
        return (slots || []).map(s => [s.name, (s.paramValues || []).map(Number), s.status === 'off' ? 0 : 1]);
    }
    function unpackChain(arr) {
        const cats = ['Gate', 'Comp', 'Drive', 'Amp', 'Mod', 'Delay', 'Reverb'];
        return cats.map((cat, i) => {
            const e = (arr && arr[i]) || [NONE, [], 0];
            return { category: cat, name: e[0], status: e[2] === 0 ? 'off' : 'on', paramValues: (e[1] || []).map(String) };
        });
    }

    function compact(song) {
        return {
            v: 1, t: song.title, n: song.notes || '', g: song.tags || [], d: song.duration || 4, a: song.activePartIndex || 0,
            p: song.parts.map(p => ({ n: p.name, c: packChain(p.modes.cuffie), i: packChain(p.modes.input) }))
        };
    }
    function expand(c) {
        if (!c || !Array.isArray(c.p) || !c.p.length) throw new Error('Il codice non contiene un brano valido.');
        const song = {
            title: String(c.t || 'Brano condiviso').slice(0, 120), notes: String(c.n || '').slice(0, 4000),
            tags: (c.g || []).map(String).slice(0, 12), duration: Number(c.d) || 4,
            activePartIndex: 0, activeMode: 'cuffie',
            parts: c.p.slice(0, 8).map(p => ({ name: String(p.n || 'Accompagnamento').slice(0, 40), modes: { cuffie: unpackChain(p.c), input: unpackChain(p.i) } }))
        };
        return migrateToModes([song])[0]; // normalizza nomi e valori sul catalogo
    }

    const b64u = (bytes) => { let s = ''; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    const unb64u = (str) => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };

    async function pipe(bytes, stream) {
        const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
        return new Uint8Array(await out.arrayBuffer());
    }

    async function encode(song) {
        const raw = new TextEncoder().encode(JSON.stringify(compact(song)));
        if (typeof CompressionStream !== 'undefined') {
            try { return 'Z' + b64u(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (e) { /* ripiega sul testo semplice */ }
        }
        return 'T' + b64u(raw);
    }

    async function decode(code) {
        let c = String(code || '').trim();
        const m = c.match(/#s=([A-Za-z0-9_-]+)/) || c.match(/^([ZT][A-Za-z0-9_-]+)$/);
        if (!m) throw new Error('Codice non riconosciuto. Incolla il link o il codice completo.');
        c = m[1];
        let bytes = unb64u(c.slice(1));
        if (c[0] === 'Z') {
            if (typeof DecompressionStream === 'undefined') throw new Error('Questo browser non sa leggere il codice compresso.');
            bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
        }
        let obj;
        try { obj = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw new Error('Il codice è danneggiato o incompleto.'); }
        return expand(obj);
    }

    async function link(song) {
        const code = await encode(song);
        return { code, url: location.href.split('#')[0] + '#s=' + code };
    }

    return { encode, decode, link };
})();
