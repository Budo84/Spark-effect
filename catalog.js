// catalog.js
// Inventario completo dei pedali Spark con TUTTE le manopole (controlli) sbloccate + Pacchetto Hendrix.

const catalog = {
    "Gate": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 NoisGate", img: "database/1-noisegate/NoiseGate-01-NoisGate.jpg", params: ["Thresh", "Decay"] }
    ],
    "Comp": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 LA Comp", img: "database/2-COMP-WAH/COMP-WAH-01-LA-Comp.jpg", params: ["Comp", "Gain"] },
        { name: "02 Sustain", img: "database/2-COMP-WAH/COMP-WAH-02-Sustain-Comp.jpg", params: ["Sustain", "Attack", "Level"] },
        { name: "03 Red Comp", img: "database/2-COMP-WAH/COMP-WAH-03-Red-Comp.jpg", params: ["Sens", "Level"] },
        { name: "04 Bass Comp", img: "database/2-COMP-WAH/COMP-WAH-04-Bass-Comp.jpg", params: ["Comp", "Rel", "Level"] },
        { name: "05 Optical", img: "database/2-COMP-WAH/COMP-WAH-05-Optical-Comp.jpg", params: ["Comp", "Tone", "Level"] }
    ],
    "Drive": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Booster", img: "database/3-Drive/Drive-01-Booster.jpg", params: ["Gain", "Bass", "Treb", "Vol"] },
        { name: "02 Clone Drv", img: "database/3-Drive/Drive-02-Clone-Drive.jpg", params: ["Gain", "Treb", "Vol"] },
        { name: "03 Tube Drv", img: "database/3-Drive/Drive-03-Tube-Drive.jpg", params: ["Drive", "Tone", "Level"] },
        { name: "04 Over Drv", img: "database/3-Drive/Drive-04-Over-Drive.jpg", params: ["Drive", "Tone", "Level"] },
        { name: "09 Fuzz Face", img: "database/3-Drive/Drive-09-Fuzz-Face.jpg", params: ["Fuzz", "Vol"] },
        { name: "10 Black Op", img: "database/3-Drive/Drive-10-Black-Op.jpg", params: ["Dist", "Filter", "Vol"] },
        { name: "11 Bass Muff", img: "database/3-Drive/Drive-11-Bass-Muff.jpg", params: ["Sustain", "Tone", "Vol"] },
        { name: "12 Guitar Muff", img: "database/3-Drive/Drive-12-Guitar-Muff.jpg", params: ["Sustain", "Tone", "Vol"] },
        { name: "13 Bassmaster", img: "database/3-Drive/Drive-13-Bassmaster.jpg", params: ["Drive", "Tone", "Vol"] },
        { name: "14 SAB Driver", img: "database/3-Drive/Drive-14-SAB-driver.jpg", params: ["Drive", "Bass", "Treb", "Blend", "Pres", "Vol"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "Hendrix Fuzz", img: "database/3-Drive/Hendrix-Fuzz.jpg", params: ["Fuzz", "Vol"] },
        { name: "Hendrix Octavia", img: "database/3-Drive/Hendrix-Octavia.jpg", params: ["Drive", "Vol"] }
    ],
    "Amp": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Silver 120", img: "database/4-AMP/Amp-01-Silver-120.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "02 Black Duo", img: "database/4-AMP/Amp-02-Black-Duo.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "03 AD Clean", img: "database/4-AMP/Amp-03-AD-Clean.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "04 Match Dc", img: "database/4-AMP/Amp-04-Match-Dc.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "05 OSD 50", img: "database/4-AMP/Amp-05-OSD-50.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "08 Blues Boy", img: "database/4-AMP/Amp-08-Blues-Boy.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "09 Tweed Bass", img: "database/4-AMP/Amp-09-Tweed-Bass.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "10 Ac Boost", img: "database/4-AMP/Amp-10-Ac-Boost.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "11 Checkmate", img: "database/4-AMP/Amp-11-Checkmate.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "12 Two Stone", img: "database/4-AMP/Amp-12-Two-Stone-SP50.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "15 Am. Dlx", img: "database/4-AMP/Amp-15-American-Deluxe.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "16 Plexiglas", img: "database/4-AMP/Amp-16-Plexiglas.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "17 JM45", img: "database/4-AMP/Amp-17-JM45.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "18 Lux Verb", img: "database/4-AMP/AMP-18-Lux-Verb.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "21 RB 101", img: "database/4-AMP/AMP-21-RB-101.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "22 British 30", img: "database/4-AMP/AMP-22-British-30.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "23 Am. H.Gain", img: "database/4-AMP/AMP-23-American-High-Gain.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "24 SLO 100", img: "database/4-AMP/AMP-24-SLO-100.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "25 YJM100", img: "database/4-AMP/AMP-25-YJM100.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "26 Treadplate", img: "database/4-AMP/AMP-26-Treadplate.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "27 Insane", img: "database/4-AMP/AMP-27-Insane.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "28 Insane 6508", img: "database/4-AMP/AMP-28-Insane-6508.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "29 SwitchAxe", img: "database/4-AMP/AMP-29-SwitchAxe.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "30 Rocker V", img: "database/4-AMP/AMP-30-Rocker-V.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "31 BE 101", img: "database/4-AMP/AMP-31-BE-101.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "32 Acoustic", img: "database/4-AMP/AMP-32-Pure-Acoustic.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "33 Fishboy", img: "database/4-AMP/AMP-33-Fishboy.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "34 Jumbo", img: "database/4-AMP/AMP-34-Jumbo.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "35 Flat Ac.", img: "database/4-AMP/AMP-35-Flat-Acoustic.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "36 RB 800", img: "database/4-AMP/AMP-36-RB-800.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "37 Sunny 3000", img: "database/4-AMP/AMP-37-Sunny-3000.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "38 W600", img: "database/4-AMP/AMP-38-W600.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "39 Hammer 500", img: "database/4-AMP/AMP-39-Hammer-500.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "Hendrix JTM45", img: "database/4-AMP/Amp-Hendrix-JTM45.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "Hendrix Sunn", img: "database/4-AMP/Amp-Hendrix-Sunn.jpg", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] }
    ],
    "Mod": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Tremolo", img: "database/5-MOD-EQ/MOD-EQ-01-Tremolo.jpg", params: ["Speed", "Depth", "Level"] },
        { name: "02 Chorus", img: "database/5-MOD-EQ/MOD-EQ-02-Chorus.jpg", params: ["Rate", "Depth", "Level"] },
        { name: "03 Flanger", img: "database/5-MOD-EQ/MOD-EQ-03-Flanger.jpg", params: ["Rate", "Depth", "Res", "Manual"] },
        { name: "04 Phaser", img: "database/5-MOD-EQ/MOD-EQ-04-Phaser.jpg", params: ["Speed", "Depth"] },
        { name: "05 Vibrato", img: "database/5-MOD-EQ/MOD-EQ-05-Vibrato.jpg", params: ["Rate", "Depth"] },
        { name: "06 UniVibe", img: "database/5-MOD-EQ/MOD-EQ-06-UniVibe.jpg", params: ["Speed", "Depth", "Vol"] },
        { name: "08 Cloner", img: "database/5-MOD-EQ/MOD-EQ-08-Cloner-Chorus.jpg", params: ["Rate", "Depth"] },
        { name: "09 Classic Vibe", img: "database/5-MOD-EQ/MOD-EQ-09-Classic-Vibe.jpg", params: ["Speed", "Depth", "Vol"] },
        { name: "10 Tremolator", img: "database/5-MOD-EQ/MOD-EQ-10-Tremolator.jpg", params: ["Speed", "Depth", "Vol"] },
        { name: "11 Trem. Square", img: "database/5-MOD-EQ/MOD-EQ-11-Tremolo-Square.jpg", params: ["Speed", "Depth", "Vol"] },
        { name: "12 Guitar EQ", img: "database/5-MOD-EQ/MOD-EQ-12-Guitar-EQ.jpg", params: ["100Hz", "200Hz", "400Hz", "800Hz", "1.6k", "3.2k", "Vol"] },
        { name: "13 Bass EQ", img: "database/5-MOD-EQ/MOD-EQ-13-Bass-EQ.jpg", params: ["50Hz", "120Hz", "400Hz", "500Hz", "800Hz", "4.5k", "Vol"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "Hendrix Vibe", img: "database/5-MOD-EQ/Hendrix-Vibe.jpg", params: ["Speed", "Depth", "Vol"] }
    ],
    "Delay": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Digital", img: "database/6-Delay/Delay-01-Digital-Delay.jpg", params: ["Time", "Feed", "Level"] },
        { name: "02 Echo Fit", img: "database/6-Delay/Delay-02-Echo-Fit.jpg", params: ["Time", "Feed", "Level"] },
        { name: "03 Vintage", img: "database/6-Delay/Delay-03-Vintage-Delay.jpg", params: ["Time", "Feed", "Tone", "Level"] },
        { name: "04 Reverse", img: "database/6-Delay/Delay-04-Reverse-Delay.jpg", params: ["Time", "Feed", "Level"] },
        { name: "05 Multi Head", img: "database/6-Delay/Delay-05-Multi-Head.jpg", params: ["Time", "Feed", "Head", "Level"] },
        { name: "06 Echo Tape", img: "database/6-Delay/Delay-06-Echo-Tape.ipg.jpg", params: ["Time", "Feed", "Tone", "Level"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "Hendrix Tape Echo", img: "database/6-Delay/Hendrix-Tape-Echo.jpg", params: ["Time", "Feed", "Tone", "Level"] }
    ],
    "Reverb": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Room A", img: "database/7-Reverb/Reverb-01-Room-Studio-A.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "02 Chamber", img: "database/7-Reverb/Reverb-02-Chamber.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "03 Hall Nat.", img: "database/7-Reverb/Reverb-03-Hall-Natural.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "04 Plate Short", img: "database/7-Reverb/Reverb-04-Plate-Short.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "05 Hall Amb.", img: "database/7-Reverb/Reverb-05-Hall-Ambient.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "06 Plate Rich", img: "database/7-Reverb/Reverb-06-Plate-Rich.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "07 Hall Med.", img: "database/7-Reverb/Reverb-07-Hall-Medium.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "08 Plate Long", img: "database/7-Reverb/Reverb-08-Plate-Long.jpg", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "09 Room B", img: "database/7-Reverb/Reverb-09-Room-Studio-B.jpg", params: ["Level", "Time", "Tone", "Dwell"] }
    ]
};

const defaultChain = [
    { category: "Gate", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Comp", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Drive", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Amp", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Mod", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Delay", name: "Nessun Pedale", img: "", status: "on", paramValues: [] },
    { category: "Reverb", name: "Nessun Pedale", img: "", status: "on", paramValues: [] }
];
