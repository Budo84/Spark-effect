// cloud_presets.js
// Database espanso di preset basati su GuitarCloud e Tonebridge

const cloudPresets = [
    { 
        title: "Pink Floyd - Time (GuitarCloud Rig)", 
        // Realtà: Fuzz Face + Hiwatt Custom 100 + Binson Echorec
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"09 Fuzz Face", Amp:"21 RB 101", Mod:"Nessun Pedale", Delay:"05 Multi Head", Reverb:"03 Hall Nat."}
    },
    { 
        title: "U2 - Where The Streets Have No Name (Tonebridge)", 
        // Realtà: Korg SDD-3000 + Vox AC30 + Herdim Pick
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"22 British 30", Mod:"02 Chorus", Delay:"05 Multi Head", Reverb:"05 Hall Amb."}
    },
    { 
        title: "Nirvana - Come As You Are (Tonebridge)", 
        // Realtà: Electro-Harmonix Small Clone + Fender Twin Reverb
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"Nessun Pedale", Amp:"02 Black Duo", Mod:"08 Cloner", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Metallica - Master of Puppets (GuitarCloud Rig)", 
        // Realtà: ProCo RAT + Mesa Boogie Mark IIC+
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"10 Black Op", Amp:"26 Treadplate", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "The Police - Message In A Bottle (Tonebridge)", 
        // Realtà: MXR Dyna Comp + Electric Mistress + Marshall JMP
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"16 Plexiglas", Mod:"03 Flanger", Delay:"01 Digital", Reverb:"04 Plate Short"}
    }
];
