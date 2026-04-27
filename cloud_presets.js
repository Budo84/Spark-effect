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
    },
    { 
        title: "Acoustic 12-String (Simulazione Acustica)", 
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"35 Flat Ac.", Mod:"02 Chorus", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "AC/DC - Classic Crunch (Angus Young)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"Nessun Pedale", Amp:"16 Plexiglas", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Queen - Bohemian Rhapsody (Brian May)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"22 British 30", Mod:"02 Chorus", Delay:"Nessun Pedale", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Pink Floyd - Comfortably Numb (Solo)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"12 Guitar Muff", Amp:"21 RB 101", Mod:"Nessun Pedale", Delay:"05 Multi Head", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Ozzy Osbourne - Crazy Train (Randy Rhoads)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"10 Black Op", Amp:"36 RB 800", Mod:"02 Chorus", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Dire Straits - Clean Tone (Mark Knopfler)", 
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"02 Black Duo", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"04 Plate Short"}
    },
    { 
        title: "Van Halen - Brown Sound (Eruption)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"Nessun Pedale", Amp:"16 Plexiglas", Mod:"04 Phaser", Delay:"03 Vintage", Reverb:"04 Plate Short"}
    },
    { 
        title: "Metallica - Enter Sandman", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"10 Black Op", Amp:"26 Treadplate", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Europe - The Final Countdown", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"04 Over Drv", Amp:"24 SLO 100", Mod:"02 Chorus", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Foo Fighters - Rock Rhythm (Dave Grohl)", 
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"Nessun Pedale", Amp:"26 Treadplate", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Foo Fighters - Everlong (Clean/Rhythm)", 
        // Realtà: AC Boost (Vox) in pulito, senza distorsori
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"Nessun Pedale", Amp:"22 British 30", Mod:"Nessun Pedale", Delay:"03 Vintage", Reverb:"01 Room A"}
    },
    { 
        title: "Guns N' Roses - Slash Classic Lead", 
        // Realtà: TS9 (Booster) + Plexi spinta
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"16 Plexiglas", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Jimi Hendrix - Purple Haze", 
        // Realtà: Fuzz Face + Orange AD30 + Chorus/Vibe
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"09 Fuzz Face", Amp:"25 Citrus 30", Mod:"02 Chorus", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Iron Maiden - Seventh Son", 
        // Realtà: TS9 + Marshall JTM45 (Overdriven JM45)
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"15 JM45", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Jethro Tull - High Gain Crunch", 
        // Realtà: Compressore + Plexi 
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"16 Plexiglas", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Guns N' Roses - Knocking on Heaven's Door (Lead)", 
        // Realtà: Comp + SwitchAxe Lead (SLO 100)
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"01 Booster", Amp:"24 SLO 100", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Lynyrd Skynyrd - Classic Clean / Crunch", 
        // Realtà: Comp + Fender Twin (con Tube Screamer leggero)
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"01 Booster", Amp:"02 Black Duo", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Metallica - Master of Puppets (Heavy)", 
        // Realtà: Mesa Boogie Rectifier + TS9 come filtro
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"26 Treadplate", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Metallica - Nothing Else Matters (Clean Electric)", 
        // Realtà: Roland JC120 (AD Clean) + Flanger per il chorus liquido
        chain: {Gate:"01 NoisGate", Comp:"05 Optical", Drive:"Nessun Pedale", Amp:"01 Silver 120", Mod:"03 Flanger", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Metallica - Nothing Else Matters (Acoustic Sim)", 
        // Realtà: Comp + Simulatore Acustico + Small Clone (Cloner)
        chain: {Gate:"01 NoisGate", Comp:"05 Optical", Drive:"Nessun Pedale", Amp:"35 Flat Ac.", Mod:"08 Cloner", Delay:"Nessun Pedale", Reverb:"04 Plate Short"}
    },
    { 
        title: "Metallica - Nothing Else Matters (Acoustic 2)", 
        // Realtà: Compressore Ottico + Simulatore Acustico + Chorus/Cloner
        chain: {Gate:"01 NoisGate", Comp:"05 Optical", Drive:"Nessun Pedale", Amp:"35 Flat Ac.", Mod:"08 Cloner", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Guns N' Roses - November Rain (Solo)", 
        // Realtà: Big Muff + Marshall Plexi + Vintage Delay per sustain estremo
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"12 Guitar Muff", Amp:"16 Plexiglas", Mod:"Nessun Pedale", Delay:"03 Vintage", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Oasis - Classic Crunch", 
        // Realtà: Compressore Ottico + Vox AC30 spinto
        chain: {Gate:"01 NoisGate", Comp:"05 Optical", Drive:"Nessun Pedale", Amp:"22 British 30", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Guns N' Roses - Paradise City (Intro)", 
        // Realtà: Compressore + Marshall JTM45 (OverDrivenJM45) + Chorus
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"15 JM45", Mod:"02 Chorus", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Red Hot Chili Peppers - Under The Bridge", 
        // Realtà: Compressore + Marshall JTM45 clean/crunch + Flanger
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"15 JM45", Mod:"03 Flanger", Delay:"Nessun Pedale", Reverb:"01 Room A"}
    },
    { 
        title: "Santana - Black Magic Woman (Lead)", 
        // Realtà: Comp + Tube Screamer (Booster) + Marshall JTM45
        chain: {Gate:"01 NoisGate", Comp:"05 Optical", Drive:"01 Booster", Amp:"15 JM45", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Joe Satriani - Satch Boogie", 
        // Realtà: Tube Screamer + Mesa Boogie Rectifier + Delay
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"26 Treadplate", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Guns N' Roses - Slash Appetite For Destruction (AFD)", 
        // Realtà: Tube Screamer (Booster) + Marshall JTM45 modificato
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"15 JM45", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Guns N' Roses - Don't Cry (Solo)", 
        // Realtà: Comp + Tube Screamer + Plexi + Tremolo
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"01 Booster", Amp:"16 Plexiglas", Mod:"01 Tremolo", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Slash - Signature Modern Lead", 
        // Realtà: Comp + Overdrive + Marshall JTM45 + Delay
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"04 Over Drv", Amp:"15 JM45", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Led Zeppelin - Stairway to Heaven (Solo)", 
        // Realtà: Compressore + Tube Screamer + Orange AD30
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"01 Booster", Amp:"25 Citrus 30", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Dire Straits - Sultans of Swing (Clean Twin)", 
        // Realtà: Compressore + Booster + Fender Twin + Tremolo
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"01 Booster", Amp:"02 Black Duo", Mod:"01 Tremolo", Delay:"Nessun Pedale", Reverb:"04 Plate Short"}
    },
    { 
        title: "Dire Straits - Sultans of Swing (Crunch Lux)", 
        // Realtà: Booster + Fender Deluxe Reverb in leggero crunch
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"06 Lux Verb", Mod:"Nessun Pedale", Delay:"Nessun Pedale", Reverb:"04 Plate Short"}
    },
    { 
        title: "Guns N' Roses - Sweet Child O' Mine", 
        // Realtà: Tube Screamer (Booster) + Marshall JTM45 + Delay
        chain: {Gate:"01 NoisGate", Comp:"Nessun Pedale", Drive:"01 Booster", Amp:"15 JM45", Mod:"Nessun Pedale", Delay:"01 Digital", Reverb:"03 Hall Nat."}
    },
    { 
        title: "Van Halen - Ain't Talkin' 'Bout Love", 
        // Realtà: Compressore + Mesa Rectifier + Phaser + Tape Delay
        chain: {Gate:"01 NoisGate", Comp:"01 LA Comp", Drive:"Nessun Pedale", Amp:"26 Treadplate", Mod:"04 Phaser", Delay:"03 Vintage", Reverb:"04 Plate Short"}
    }
];
