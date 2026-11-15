// catalog.js
// Inventario completo dei pedali Spark con TUTTE le manopole (controlli) sbloccate + Pacchetto Hendrix Completo.

const catalog = {
    "Gate": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 NoisGate", img: "database/1-noisegate/NoiseGate-01-NoisGate.webp", params: ["Thresh", "Decay"] }
    ],
    "Comp": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 LA Comp", img: "database/2-COMP-WAH/COMP-WAH-01-LA-Comp.webp", params: ["Comp", "Gain"] },
        { name: "02 Sustain", img: "database/2-COMP-WAH/COMP-WAH-02-Sustain-Comp.webp", params: ["Sustain", "Attack", "Level"] },
        { name: "03 Red Comp", img: "database/2-COMP-WAH/COMP-WAH-03-Red-Comp.webp", params: ["Sens", "Level"] },
        { name: "04 Bass Comp", img: "database/2-COMP-WAH/COMP-WAH-04-Bass-Comp.webp", params: ["Comp", "Rel", "Level"] },
        { name: "05 Optical", img: "database/2-COMP-WAH/COMP-WAH-05-Optical-Comp.webp", params: ["Comp", "Tone", "Level"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "J.H. Legendary Wah", img: "database/2-COMP-WAH/JH-Legendary-Wah.webp", params: ["Pedal"] }
    ],
    "Drive": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Booster", img: "database/3-Drive/Drive-01-Booster.webp", params: ["Gain", "Bass", "Treb", "Vol"] },
        { name: "02 Clone Drv", img: "database/3-Drive/Drive-02-Clone-Drive.webp", params: ["Gain", "Treb", "Vol"] },
        { name: "03 Tube Drv", img: "database/3-Drive/Drive-03-Tube-Drive.webp", params: ["Drive", "Tone", "Level"] },
        { name: "04 Over Drv", img: "database/3-Drive/Drive-04-Over-Drive.webp", params: ["Drive", "Tone", "Level"] },
        { name: "09 Fuzz Face", img: "database/3-Drive/Drive-09-Fuzz-Face.webp", params: ["Fuzz", "Vol"] },
        { name: "10 Black Op", img: "database/3-Drive/Drive-10-Black-Op.webp", params: ["Dist", "Filter", "Vol"] },
        { name: "11 Bass Muff", img: "database/3-Drive/Drive-11-Bass-Muff.webp", params: ["Sustain", "Tone", "Vol"] },
        { name: "12 Guitar Muff", img: "database/3-Drive/Drive-12-Guitar-Muff.webp", params: ["Sustain", "Tone", "Vol"] },
        { name: "13 Bassmaster", img: "database/3-Drive/Drive-13-Bassmaster.webp", params: ["Drive", "Tone", "Vol"] },
        { name: "14 SAB Driver", img: "database/3-Drive/Drive-14-SAB-driver.webp", params: ["Drive", "Bass", "Treb", "Blend", "Pres", "Vol"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "J.H. Axle Fuzz", img: "database/3-Drive/JH-Axle-Fuzz.webp", params: ["Fuzz", "Vol"] },
        { name: "J.H. Super Fuzz", img: "database/3-Drive/JH-Super-Fuzz.webp", params: ["Fuzz", "Level"] },
        { name: "J.H. Octave Fuzz", img: "database/3-Drive/JH-Octave-Fuzz.webp", params: ["Fuzz", "Level"] },
        { name: "J.H. Fuzz Zone", img: "database/3-Drive/JH-Fuzz-Zone.webp", params: ["Attack", "Vol"] }
    ],
    "Amp": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Silver 120", img: "database/4-AMP/Amp-01-Silver-120.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "02 Black Duo", img: "database/4-AMP/Amp-02-Black-Duo.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "03 AD Clean", img: "database/4-AMP/Amp-03-AD-Clean.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "04 Match Dc", img: "database/4-AMP/Amp-04-Match-Dc.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "05 OSD 50", img: "database/4-AMP/Amp-05-OSD-50.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "08 Blues Boy", img: "database/4-AMP/Amp-08-Blues-Boy.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "09 Tweed Bass", img: "database/4-AMP/Amp-09-Tweed-Bass.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "10 Ac Boost", img: "database/4-AMP/Amp-10-Ac-Boost.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "11 Checkmate", img: "database/4-AMP/Amp-11-Checkmate.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "12 Two Stone", img: "database/4-AMP/Amp-12-Two-Stone-SP50.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "15 Am. Dlx", img: "database/4-AMP/Amp-15-American-Deluxe.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "16 Plexiglas", img: "database/4-AMP/Amp-16-Plexiglas.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "17 JM45", img: "database/4-AMP/Amp-17-JM45.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "18 Lux Verb", img: "database/4-AMP/AMP-18-Lux-Verb.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "21 RB 101", img: "database/4-AMP/AMP-21-RB-101.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "22 British 30", img: "database/4-AMP/AMP-22-British-30.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "23 Am. H.Gain", img: "database/4-AMP/AMP-23-American-High-Gain.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "24 SLO 100", img: "database/4-AMP/AMP-24-SLO-100.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "25 YJM100", img: "database/4-AMP/AMP-25-YJM100.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "26 Treadplate", img: "database/4-AMP/AMP-26-Treadplate.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "27 Insane", img: "database/4-AMP/AMP-27-Insane.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "28 Insane 6508", img: "database/4-AMP/AMP-28-Insane-6508.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "29 SwitchAxe", img: "database/4-AMP/AMP-29-SwitchAxe.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "30 Rocker V", img: "database/4-AMP/AMP-30-Rocker-V.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "31 BE 101", img: "database/4-AMP/AMP-31-BE-101.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "32 Acoustic", img: "database/4-AMP/AMP-32-Pure-Acoustic.webp", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "33 Fishboy", img: "database/4-AMP/AMP-33-Fishboy.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "34 Jumbo", img: "database/4-AMP/AMP-34-Jumbo.webp", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "35 Flat Ac.", img: "database/4-AMP/AMP-35-Flat-Acoustic.webp", params: ["Gain", "Bass", "Mid", "Treb", "Master"] },
        { name: "36 RB 800", img: "database/4-AMP/AMP-36-RB-800.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "37 Sunny 3000", img: "database/4-AMP/AMP-37-Sunny-3000.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "38 W600", img: "database/4-AMP/AMP-38-W600.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "39 Hammer 500", img: "database/4-AMP/AMP-39-Hammer-500.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "J.H. Super 100", img: "database/4-AMP/Amp-JH-Super-100.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "J.H. Tone City 100", img: "database/4-AMP/Amp-JH-Tone-City.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "J.H. D-Show Master", img: "database/4-AMP/Amp-JH-D-Show.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "J.H. Bass Master", img: "database/4-AMP/Amp-JH-Bass-Master.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "J.H. Sun 100S", img: "database/4-AMP/Amp-JH-Sun-100S.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] },
        { name: "J.H. 45/100", img: "database/4-AMP/Amp-JH-45-100.webp", params: ["Gain", "Bass", "Mid", "Treb", "Pres", "Master"] }
    ],
    "Mod": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Tremolo", img: "database/5-MOD-EQ/MOD-EQ-01-Tremolo.webp", params: ["Speed", "Depth", "Level"] },
        { name: "02 Chorus", img: "database/5-MOD-EQ/MOD-EQ-02-Chorus.webp", params: ["Rate", "Depth", "Level"] },
        { name: "03 Flanger", img: "database/5-MOD-EQ/MOD-EQ-03-Flanger.webp", params: ["Rate", "Depth", "Res", "Manual"] },
        { name: "04 Phaser", img: "database/5-MOD-EQ/MOD-EQ-04-Phaser.webp", params: ["Speed", "Depth"] },
        { name: "05 Vibrato", img: "database/5-MOD-EQ/MOD-EQ-05-Vibrato.webp", params: ["Rate", "Depth"] },
        { name: "06 UniVibe", img: "database/5-MOD-EQ/MOD-EQ-06-UniVibe.webp", params: ["Speed", "Depth", "Vol"] },
        { name: "08 Cloner", img: "database/5-MOD-EQ/MOD-EQ-08-Cloner-Chorus.webp", params: ["Rate", "Depth"] },
        { name: "09 Classic Vibe", img: "database/5-MOD-EQ/MOD-EQ-09-Classic-Vibe.webp", params: ["Speed", "Depth", "Vol"] },
        { name: "10 Tremolator", img: "database/5-MOD-EQ/MOD-EQ-10-Tremolator.webp", params: ["Speed", "Depth", "Vol"] },
        { name: "11 Trem. Square", img: "database/5-MOD-EQ/MOD-EQ-11-Tremolo-Square.webp", params: ["Speed", "Depth", "Vol"] },
        { name: "12 Guitar EQ", img: "database/5-MOD-EQ/MOD-EQ-12-Guitar-EQ.webp", params: ["100Hz", "200Hz", "400Hz", "800Hz", "1.6k", "3.2k", "Vol"] },
        { name: "13 Bass EQ", img: "database/5-MOD-EQ/MOD-EQ-13-Bass-EQ.webp", params: ["50Hz", "120Hz", "400Hz", "500Hz", "800Hz", "4.5k", "Vol"] },
        // --- INIZIO PACCHETTO HENDRIX ---
        { name: "J.H. Legendary Vibe", img: "database/5-MOD-EQ/JH-Legendary-Vibe.webp", params: ["Speed", "Intens"] },
        { name: "J.H. Micro Vibe", img: "database/5-MOD-EQ/JH-Micro-Vibe.webp", params: ["Speed", "Intens"] }
    ],
    "Delay": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Digital", img: "database/6-Delay/Delay-01-Digital-Delay.webp", params: ["Time", "Feed", "Level"] },
        { name: "02 Echo Fit", img: "database/6-Delay/Delay-02-Echo-Fit.webp", params: ["Time", "Feed", "Level"] },
        { name: "03 Vintage", img: "database/6-Delay/Delay-03-Vintage-Delay.webp", params: ["Time", "Feed", "Tone", "Level"] },
        { name: "04 Reverse", img: "database/6-Delay/Delay-04-Reverse-Delay.webp", params: ["Time", "Feed", "Level"] },
        { name: "05 Multi Head", img: "database/6-Delay/Delay-05-Multi-Head.webp", params: ["Time", "Feed", "Head", "Level"] },
        { name: "06 Echo Tape", img: "database/6-Delay/Delay-06-Echo-Tape.ipg.webp", params: ["Time", "Feed", "Tone", "Level"] }
    ],
    "Reverb": [
        { name: "Nessun Pedale", img: "", params: [] },
        { name: "01 Room A", img: "database/7-Reverb/Reverb-01-Room-Studio-A.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "02 Chamber", img: "database/7-Reverb/Reverb-02-Chamber.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "03 Hall Nat.", img: "database/7-Reverb/Reverb-03-Hall-Natural.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "04 Plate Short", img: "database/7-Reverb/Reverb-04-Plate-Short.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "05 Hall Amb.", img: "database/7-Reverb/Reverb-05-Hall-Ambient.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "06 Plate Rich", img: "database/7-Reverb/Reverb-06-Plate-Rich.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "07 Hall Med.", img: "database/7-Reverb/Reverb-07-Hall-Medium.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "08 Plate Long", img: "database/7-Reverb/Reverb-08-Plate-Long.webp", params: ["Level", "Time", "Tone", "Dwell"] },
        { name: "09 Room B", img: "database/7-Reverb/Reverb-09-Room-Studio-B.webp", params: ["Level", "Time", "Tone", "Dwell"] }
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
