// validator.js
// Controlli di coerenza su una catena di effetti. Restituisce avvisi leggibili, mai errori bloccanti.
// Usa catalog.js. Funziona sia sugli slot dell'editor sia sui risultati dell'AI.

const SparkValidate = (() => {
    const NONE = 'Nessun Pedale';
    const FUZZ = ['09 Fuzz Face', 'J.H. Axle Fuzz', 'J.H. Super Fuzz', 'J.H. Octave Fuzz', 'J.H. Fuzz Zone', '12 Guitar Muff', '11 Bass Muff'];
    const ACOUSTIC_AMPS = ['32 Acoustic', '34 Jumbo', '35 Flat Ac.'];

    function slotOf(slots, cat) { return (slots || []).find(s => s && s.category === cat); }
    function isOn(s) { return !!s && s.name !== NONE && s.status !== 'off'; }
    function knob(s, label) {
        if (!s || s.name === NONE) return null;
        const list = (typeof catalog !== 'undefined' && catalog[s.category]) || [];
        const p = list.find(x => x.name === s.name);
        if (!p) return null;
        const i = p.params.findIndex(l => l.toLowerCase() === label.toLowerCase());
        if (i < 0) return null;
        const v = Number(s.paramValues && s.paramValues[i]);
        return isFinite(v) ? v : null;
    }
    const first = (s, labels) => { for (const l of labels) { const v = knob(s, l); if (v !== null) return v; } return null; };

    // avvisi su una singola catena. mode: 'cuffie' | 'input'
    function validateChain(slots, mode) {
        const out = [];
        const add = (level, text) => out.push({ level, text });
        const gate = slotOf(slots, 'Gate'), comp = slotOf(slots, 'Comp'), drive = slotOf(slots, 'Drive'),
            amp = slotOf(slots, 'Amp'), delay = slotOf(slots, 'Delay'), reverb = slotOf(slots, 'Reverb');

        const used = (slots || []).filter(s => s && s.name !== NONE);
        if (!used.length) { add('info', 'Catena vuota: nessun effetto selezionato.'); return out; }
        if (!used.some(s => s.status !== 'off')) add('warn', 'Tutti gli effetti sono spenti.');

        if (mode !== 'input' && (!amp || amp.name === NONE)) add('warn', 'Nessun ampli selezionato: in modalità cuffie il suono resta senza ampli.');
        if (amp && amp.name !== NONE && amp.status === 'off') add('info', 'L\'ampli è selezionato ma spento.');

        const ampGain = first(amp, ['Gain']);
        const driveAmt = first(drive, ['Drive', 'Gain', 'Fuzz', 'Dist', 'Sustain']);
        if (isOn(drive) && isOn(amp) && driveAmt !== null && ampGain !== null && driveAmt >= 7 && ampGain >= 7)
            add('warn', 'Doppia saturazione: drive alto davanti a un ampli già distorto. Può impastare; abbassa il Gain dell\'ampli o usa il drive come boost (Drive 0, Level alto).');
        if (isOn(drive) && FUZZ.includes(drive.name) && ampGain !== null && ampGain >= 7)
            add('warn', 'Fuzz davanti a un ampli ad alto gain: il suono diventa confuso. Prova un ampli più pulito.');
        if (isOn(drive) && isOn(amp) && ACOUSTIC_AMPS.includes(amp.name))
            add('warn', 'Un pedale di distorsione davanti a un modello acustico suona innaturale.');

        const thr = first(gate, ['Thresh']);
        if (isOn(gate) && thr !== null && thr >= 8) add('warn', 'Soglia del Gate molto alta: taglierà la coda delle note (sustain).');

        if (isOn(comp)) {
            const lvl = first(comp, ['Level']);
            if (lvl !== null && lvl >= 9) add('info', 'Level del compressore molto alto: il volume salirà molto quando è attivo.');
        }

        const dLvl = first(delay, ['Level']), dFeed = first(delay, ['Feed']);
        const rLvl = first(reverb, ['Level']), rTime = first(reverb, ['Time']);
        if (isOn(delay) && isOn(reverb) && dLvl !== null && rLvl !== null && dLvl >= 7 && rLvl >= 7)
            add('warn', 'Delay e riverbero entrambi molto alti: il suono diventa un\'unica nebbia. Abbassa uno dei due.');
        if (isOn(delay) && dFeed !== null && dFeed >= 8) add('warn', 'Feedback del delay molto alto: le ripetizioni possono non spegnersi mai.');
        if (isOn(reverb) && rTime !== null && rLvl !== null && rTime >= 9 && rLvl >= 7) add('info', 'Riverbero lungo e forte: ottimo per ambient, ma copre gli accordi veloci.');

        const treb = first(amp, ['Treb']), pres = first(amp, ['Pres']), bass = first(amp, ['Bass']);
        if (isOn(amp) && treb !== null && pres !== null && treb >= 9 && pres >= 8) add('warn', 'Treble e Presence molto alti: suono tagliente che stanca l\'orecchio.');
        if (isOn(amp) && bass !== null && ampGain !== null && bass >= 9 && ampGain >= 6) add('warn', 'Bassi molto alti con gain elevato: il suono rischia di impastarsi.');
        return out;
    }

    // stima grezza di quanto "suona forte" una catena (solo per confronti tra parti)
    function loudness(slots) {
        const amp = slotOf(slots, 'Amp'), drive = slotOf(slots, 'Drive'), comp = slotOf(slots, 'Comp');
        let v = 0, n = 0;
        const m = first(amp, ['Master', 'Vol']); if (m !== null && isOn(amp)) { v += m; n++; }
        const d = isOn(drive) ? first(drive, ['Vol', 'Level']) : null; if (d !== null) { v += d - 5; }
        const c = isOn(comp) ? first(comp, ['Level']) : null; if (c !== null) { v += (c - 5) * 0.5; }
        return n ? v : null;
    }

    // avvisi di un intero brano (modalità attiva)
    function validateSong(song) {
        const mode = song.activeMode === 'input' ? 'input' : 'cuffie';
        const part = song.parts[song.activePartIndex];
        const out = part ? validateChain(part.modes[mode], mode).map(w => Object.assign({ part: part.name }, w)) : [];
        const vols = song.parts.map(p => ({ name: p.name, v: loudness(p.modes[mode]) })).filter(x => x.v !== null);
        if (vols.length > 1) {
            const max = vols.reduce((a, b) => (b.v > a.v ? b : a)), min = vols.reduce((a, b) => (b.v < a.v ? b : a));
            if (max.v - min.v >= 3) out.push({ level: 'warn', part: '', text: `Volume sbilanciato tra le parti: «${max.name}» suona molto più forte di «${min.name}». Pareggia Master e Level.` });
        }
        return out;
    }

    return { validateChain, validateSong, loudness };
})();
