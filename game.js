// ============================================================
// TENFOLD LEGENDS — game.js
// Shared hero data, sprite paths, API helpers, game state
// ============================================================

// ── SAFE STORAGE WRAPPERS ─────────────────────────────────────
// MIT App Inventor WebViewer (and some Android WebViews) throw a
// SecurityError when code touches localStorage / sessionStorage.
// These wrappers silently fall back to an in-memory Map so the
// game never crashes with "storage is unavailable".
(function() {
  // Persistent fallback for MIT App Inventor WebViewer.
  // Uses window.name only when browser storage is unavailable.
  const FALLBACK_PREFIX = 'TENFOLD_PERSIST:';
  let fallbackData = {};

  function loadFallback() {
    try {
      const raw = String(window.name || '');
      if (raw.startsWith(FALLBACK_PREFIX)) {
        const parsed = JSON.parse(decodeURIComponent(raw.slice(FALLBACK_PREFIX.length)));
        if (parsed && typeof parsed === 'object') fallbackData = parsed;
      }
    } catch (_) {}
  }
  function saveFallback() {
    try {
      window.name = FALLBACK_PREFIX + encodeURIComponent(JSON.stringify(fallbackData));
    } catch (_) {}
  }
  loadFallback();

  function makeFallbackStore(bucket) {
    if (!fallbackData[bucket] || typeof fallbackData[bucket] !== 'object') fallbackData[bucket] = {};
    const data = fallbackData[bucket];
    return {
      getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      setItem(k, v) { data[k] = String(v); saveFallback(); },
      removeItem(k) { delete data[k]; saveFallback(); },
      clear() { Object.keys(data).forEach(k => delete data[k]); saveFallback(); }
    };
  }

  function getNative(name) {
    try { return window[name]; } catch (_) { return null; }
  }
  function storageOk(store) {
    try {
      const TEST = '__tfl_test__';
      store.setItem(TEST, '1');
      store.removeItem(TEST);
      return true;
    } catch (_) { return false; }
  }

  const nativeLocal = getNative('localStorage');
  const nativeSession = getNative('sessionStorage');
  window.safeLocalStorage = nativeLocal && storageOk(nativeLocal)
    ? nativeLocal : makeFallbackStore('local');
  window.safeSessionStorage = nativeSession && storageOk(nativeSession)
    ? nativeSession : makeFallbackStore('session');
})();

// ── APPS SCRIPT WEB APP URL ───────────────────────────────────
// After deploying Code.gs as a Web App, paste the URL here:
const API_URL = 'https://script.google.com/macros/s/AKfycbzsePzbkciToeJwjmIFOJH8glRUQnlc4p6Z5hQnouApgnDSO21ge5KCrpxp_q_TZKrP/exec';

// ── HERO DATABASE ─────────────────────────────────────────────
const HEROES = {
  aeron: {
    id: 'aeron',
    facesRight: true,   // sprite default faces RIGHT
    name: 'Aeron',
    title: 'Flameborn',
    quote: '"Flames do not just burn, they forge legends."',
    element: 'Fire',
    weapon: 'Greatsword',
    fightingStyle: 'Aggressive / Heavy Damage',
    role: 'Damage Dealer',
    color: '#ff4500',
    glowColor: 'rgba(255,69,0,0.6)',
    bgColor: '#1a0800',
    // Base stats (Lv 1)
    stats: { hp: 1000, atk: 120, def: 80, spd: 90, crit: 15 },
    // Sprite paths
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/idle.webp',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/walk.webp',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/run.webp',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/sprint.webp',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/attack.webp',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/aeron_hero_profile_portrait.webp',
      lifeBar: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/aeron_life_bar_ui.webp',
      manaBar: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Level Badge  Nameplate.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/1background.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/2background.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/3background.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/4background.webp'
      ]
    },
    skills: {
      basic: {
        name: 'Flame Slash',
        type: 'Basic Skill',
        desc: 'Fast sword slash that deals fire damage.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/FlameSlash_basic_skill_icon.webp',
        manaCost: 5,
        damage: 80,
        cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_5_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/flame_slash_frame_6_transparent.webp'
        ]
      },
      special: {
        name: 'Inferno Burst',
        type: 'Special Skill',
        desc: 'Releases a wave of fire toward the enemy.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/infernoBurst_special_skill_icon.webp',
        manaCost: 10,
        damage: 160,
        cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_5_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/inferno_burst_frame_6_transparent.webp'
        ]
      },
      ultimate: {
        name: 'Phoenix Reign',
        type: 'Ultimate Skill',
        desc: 'Surrounds himself with flames and performs a powerful burning attack.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/PhoenixReign_ultimate_skill_icon.webp',
        manaCost: 20,
        damage: 300,
        cooldown: 6,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_5_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Aeron/Phoenix_Reign_frame_6_transparent.webp'
        ]
      }
    }
  },

  lyra: {
    id: 'lyra',
    facesRight: false,  // sprite default faces LEFT
    name: 'Lyra',
    title: 'Frostblade',
    quote: '"The cold is not my weakness, it is my strength."',
    element: 'Ice',
    weapon: 'Dual Blades',
    fightingStyle: 'Fast & Agile',
    role: 'Damage Dealer',
    color: '#00cfff',
    glowColor: 'rgba(0,207,255,0.6)',
    bgColor: '#00101a',
    stats: { hp: 1000, atk: 120, def: 89, spd: 100, crit: 15 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Idle.webp',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/walk.webp',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Run.webp',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Run.webp',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/attack.webp',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Lyra_Frostblade_Profile.webp',
      lifeBar: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Lyra_life_bar_ui.webp',
      manaBar: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Level Badge  Nameplate.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/background3.webp'
      ]
    },
    skills: {
      basic: {
        name: 'Frost Cut',
        type: 'Basic Skill',
        desc: 'Two quick ice-infused strikes.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Frost_Cut_Skill_Icon.webp',
        manaCost: 5,
        damage: 80,
        cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_5_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frost_cut_frame_6_transparent.webp'
        ]
      },
      special: {
        name: 'Frozen Prison',
        type: 'Special Skill',
        desc: 'Freezes the enemy temporarily.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Frozen_Prison_Skill_Icon.webp',
        manaCost: 10,
        damage: 120,
        cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_5_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/frozen_prison_frame_6_transparent.webp'
        ]
      },
      ultimate: {
        name: 'Absolute Zero',
        type: 'Ultimate Skill',
        desc: 'Creates a massive ice explosion that heavily damages the enemy.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/Absolute_Zero.webp',
        manaCost: 20,
        damage: 300,
        cooldown: 6,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/absolute_zero_frame_1_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/absolute_zero_frame_2_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/absolute_zero_frame_3_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/absolute_zero_frame_4_transparent.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Lyra/absolute_zero_frame_5_transparent.webp'
        ]
      }
    }
  },

  // ── Heroes 3-10: no sprites yet, placeholder data ─────────
  kael: {
    id: 'kael', facesRight: true, name: 'Kael', title: 'Storm Hunter',
    quote: '"Lightning is not just a force... it\'s my weapon, my will, and my path."',
    element: 'Lightning', weapon: 'Spear', fightingStyle: 'Speed & Precision', role: 'Damage Dealer',
    color: '#ffe600', glowColor: 'rgba(255,230,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 950, atk: 130, def: 70, spd: 120, crit: 20 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Kael_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_life_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Level Badge Nameplate.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/background2.webp'
      ]
    },
    skills: {
      basic: {
        name:'Thunder Thrust', type:'Basic Skill', desc:'Lightning-powered spear attack.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Thunder_Thrust_Skill_Icon.webp',
        manaCost:5, damage:90, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/kael_thunder_thrust_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Lightning Rush', type:'Special Skill', desc:'Dashes through the enemy with multiple strikes.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Lighting_Rush_Skill_Icon.webp',
        manaCost:10, damage:180, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/lightning_rush_effect_only_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Storm Judgment', type:'Ultimate Skill', desc:'Summons several lightning strikes from the sky.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/Storm_Judgment_Skill_Icon.webp',
        manaCost:20, damage:320, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Kael/storm_judgment_transparent_frame_6.webp'
        ]
      }
    }
  },
  riven: {
    id: 'riven', facesRight: false, name: 'Riven', title: 'Earthbreaker',
    quote: '"The earth does not yield to the weak."',
    element: 'Earth', weapon: 'War Hammer', fightingStyle: 'Slow & Heavy', role: 'Damage Dealer',
    color: '#a0522d', glowColor: 'rgba(160,82,45,0.6)', bgColor: '#0d0800',
    stats: { hp: 1200, atk: 110, def: 100, spd: 60, crit: 10 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_life_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Level Badge Template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/background2.webp'
      ]
    },
    skills: {
      basic: {
        name:'Stone Smash', type:'Basic Skill', desc:'Heavy hammer attack.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Stone_Smash_Basic_Skill_Icon.webp',
        manaCost:5, damage:100, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Stone_Smash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Earth Wall', type:'Special Skill', desc:'Creates a barrier that reduces incoming damage.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Earth_Wall_Special_Skill_Icon.webp',
        manaCost:10, damage:0, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Earth_Wall_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Mountain Collapse', type:'Ultimate Skill', desc:'Smashes the ground, creating a massive shockwave.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Mountain_Collapse_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:350, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Riven/Riven_Mountain_Collapse_effect_frame_6.webp'
        ]
      }
    }
  },
  selene: {
    id: 'selene', facesRight: true, name: 'Selene', title: 'Moon Archer',
    quote: '"The moon guides my arrow, and the stars light my path."',
    element: 'Light', weapon: 'Bow', fightingStyle: 'Ranged & Precise', role: 'Damage Dealer',
    color: '#c8a8ff', glowColor: 'rgba(200,168,255,0.6)', bgColor: '#0a0014',
    stats: { hp: 900, atk: 140, def: 60, spd: 110, crit: 25 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/selene_life_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Level Badge  Nameplate.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Lunar Arrow', type:'Basic Skill', desc:'Shoots a fast energy arrow.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Lunar__Arrow_Basic_Skill_Icon.webp',
        manaCost:5, damage:95, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Lunar_Arrow_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Moon Rain', type:'Special Skill', desc:'Fires multiple arrows from above.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Moon_Rain_Special_Skill_Icon.webp',
        manaCost:10, damage:190, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Rain_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Moonfall', type:'Ultimate Skill', desc:'Launches a giant light arrow that deals massive damage.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Moon_Fall_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:330, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Selene/Selene_Moon_Fall_effect_frame_6.webp'
        ]
      }
    }
  },
  draven: {
    id: 'draven', facesRight: false, name: 'Draven', title: 'Shadow Fang',
    quote: '"The shadows are my home, and the night is my weapon."',
    element: 'Dark', weapon: 'Twin Daggers', fightingStyle: 'Stealth / Agile', role: 'Assassin',
    color: '#9932cc', glowColor: 'rgba(153,50,204,0.6)', bgColor: '#0a0010',
    stats: { hp: 850, atk: 160, def: 70, spd: 130, crit: 28 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_life_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Level Badge Template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/background3.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/background4.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/background5.webp'
      ]
    },
    skills: {
      basic: {
        name:'Shadow Strike', type:'Basic Skill', desc:'Quick attack from behind the enemy.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Shadow_Strike_Basic_Skill_Icon.webp',
        manaCost:5, damage:105, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Shadow_Strike_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Dark Step', type:'Special Skill', desc:'Becomes invisible briefly and performs a critical strike.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Dark_Step_Special_Skill_Icon.webp',
        manaCost:10, damage:200, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Dark_Step_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Nightmare Execution', type:'Ultimate Skill', desc:'Rapidly attacks the enemy from multiple directions.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Nightmare_Execution_ultimate_Skill_Icon.webp',
        manaCost:20, damage:360, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Draven/Draven_Nightmare_Execution_effect_frame_6.webp'
        ]
      }
    }
  },
  mira: {
    id: 'mira', facesRight: false, name: 'Mira', title: 'Tidecaller',
    quote: '"The ocean never forgets, and neither do I."',
    element: 'Water', weapon: 'Trident', fightingStyle: 'Magic / Control', role: 'Support / Damage',
    color: '#00bfff', glowColor: 'rgba(0,191,255,0.6)', bgColor: '#000d1a',
    stats: { hp: 920, atk: 130, def: 85, spd: 95, crit: 15 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Profile_Portfait.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/mira_hp_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/ManaEnergy Bar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Level Badge Template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/background3.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/background4.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/background5.webp'
      ]
    },
    skills: {
      basic: {
        name:'Water Pierce', type:'Basic Skill', desc:'Thrusts the trident with water energy.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/WaterPierce_Basic_Skill_Icon.webp',
        manaCost:5, damage:85, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Water_Pierce_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Healing Tide', type:'Special Skill', desc:'Restores a portion of own HP.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Healing_Tide_Special_Skill_Icon.webp',
        manaCost:10, damage:-400, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Healing_Tide_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:"Ocean's Wrath", type:'Ultimate Skill', desc:'Summons a huge wave that damages the opponent.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Ocean_Wrath_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:310, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Mira/Mira_Ocean_Wrath_s_effect_frame_6.webp'
        ]
      }
    }
  },
  orion: {
    id: 'orion', facesRight: false, name: 'Orion', title: 'Stormcaller',
    quote: '"The wind does not ask permission — and neither do I."',
    element: 'Wind', weapon: 'Dual Blades', fightingStyle: 'Swift / Agile', role: 'Damage Dealer',
    color: '#88ffcc', glowColor: 'rgba(136,255,204,0.6)', bgColor: '#001a0d',
    stats: { hp: 920, atk: 135, def: 75, spd: 130, crit: 22 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_hp_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Manabar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Level Badge Template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Wind Slash', type:'Basic Skill', desc:'A razor-fast dual-blade slash charged with wind.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Wind_Slash_Basic_Skill_Icon.webp',
        manaCost:5, damage:90, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Wind_Slash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Gale Dash', type:'Special Skill', desc:'Dashes through the enemy at blinding speed, striking multiple times.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Gale_Dash_Special_Skill_Icon.webp',
        manaCost:10, damage:175, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Gale_Dash_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Tempest Dance', type:'Ultimate Skill', desc:'Launches a massive wind burst that launches the enemy skyward.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Tempest_Dance_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:340, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Orion/Orion_Tempest_Dance_effect_frame_6.webp'
        ]
      }
    }
  },
  brutus: {
    id: 'brutus', facesRight: false, name: 'Brutus', title: 'Iron Guardian',
    quote: '"My shield protects what matters. My axe delivers justice."',
    element: 'Metal', weapon: 'Shield & Axe', fightingStyle: 'Heavy / Defensive', role: 'Tank',
    color: '#c0c0c0', glowColor: 'rgba(192,192,192,0.6)', bgColor: '#111111',
    stats: { hp: 1300, atk: 120, def: 130, spd: 65, crit: 10 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/brutus_hp_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Manabar.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/level badge template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/background3.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/background4.webp'
      ]
    },
    skills: {
      basic: {
        name:'Iron Bash', type:'Basic Skill', desc:'Shield strike followed by an axe attack.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Iron_Bash_Basic_Skill_Icon.webp',
        manaCost:5, damage:90, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Iron_Bash_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Steel Guard', type:'Special Skill', desc:'Raises a steel guard, reducing incoming damage by 60% for this turn.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Steel_Guard_Special_Skill_Icon.webp',
        manaCost:10, damage:0, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Steel_Guard_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Titan Breaker', type:'Ultimate Skill', desc:'Charges forward and delivers a devastating strike.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Titan_Breaker_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:340, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Brutus/Brutus_Titan_Breaker_effect_frame_6.webp'
        ]
      }
    }
  },
  elysia: {
    id: 'elysia', facesRight: false, name: 'Elysia', title: 'Celestial Mage',
    quote: '"The stars are not just lights, they are within us."',
    element: 'Arcane', weapon: 'Magic Staff', fightingStyle: 'Magic / Burst', role: 'Mage',
    color: '#ff88ff', glowColor: 'rgba(255,136,255,0.6)', bgColor: '#100010',
    stats: { hp: 850, atk: 150, def: 60, spd: 100, crit: 28 },
    sprites: {
      idle:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/idle.webp',
      walk:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/walk.webp',
      run:      'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/run.webp',
      sprint:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/sprint.webp',
      attack:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Portfait_Profile.webp',
      lifeBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/elysia_hp_bar_ui.webp',
      manaBar:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Manabar Energy.webp',
      namePlate:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Level Badge Template.webp',
      backgrounds: [
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/background1.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/background2.webp',
        'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/background3.webp'
      ]
    },
    skills: {
      basic: {
        name:'Arcane Bolt', type:'Basic Skill', desc:'Fires magical energy at the opponent.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Arcane_Bolt_Basic_Skill_Icon.webp',
        manaCost:5, damage:100, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Arcane_Bolt_effect_frame_6.webp'
        ]
      },
      special: {
        name:'Mana Surge', type:'Special Skill', desc:'Increases attack power and restores some HP.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Mana_Surge_Special_Skill_Icon.webp',
        manaCost:10, damage:-600, cooldown:3,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Mana_Surge_effect_frame_6.webp'
        ]
      },
      ultimate: {
        name:'Celestial Judgment', type:'Ultimate Skill', desc:'Releases a powerful beam of cosmic energy.',
        icon:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Celestial_Judgment_Ultimate_Skill_Icon.webp',
        manaCost:20, damage:380, cooldown:6,
        frames:[
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Sprite/Elysia/Elysia_Celestial_Judgment_effect_frame_6.webp'
        ]
      }
    }
  },
};

// Ordered list for UI  (Chapter unlock order: 1→10)
const HERO_ORDER = ['aeron','lyra','kael','riven','selene','draven','mira','orion','brutus','elysia'];

// ── STORY ENEMY DATABASE ──────────────────────────────────────
// Monsters used in story stages (non-hero enemies)
const STORY_ENEMIES = {

  // ══════════════════════════════════════════════════════════
  // CHAPTER 1 — THE AWAKENING  (Fire enemies)
  // ══════════════════════════════════════════════════════════
  flame_imp: {
    id: 'flame_imp', facesRight: false,
    name: 'Flame Imp', title: 'Fire Minion',
    element: 'Fire', role: 'Monster',
    color: '#ff4500', glowColor: 'rgba(255,69,0,0.6)', bgColor: '#1a0800',
    stats: { hp: 420, atk: 75, def: 40, spd: 85, crit: 10 },
    sprites: {
      idle:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/idle.webp',
      walk:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/walk.webp',
      run:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/run.webp',
      sprint: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/sprint.webp',
      attack: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/attack.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/idle.webp',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/1background.webp']
    },
    skills: {
      basic: {
        name: 'Flame Claw', type: 'Basic Skill', desc: 'Slashes with burning claws.',
        icon: '', manaCost: 0, damage: 75, cooldown: 0,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame4.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame5.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Flame Imp/Flame_Claw_Effect_Frame6.webp'
        ]
      },
      special:  { name: 'Ember Burst',  type: 'Special Skill',  desc: 'Releases a burst of embers.', icon: '', manaCost: 10, damage: 110, cooldown: 3, frames: [] },
      ultimate: { name: 'Inferno Rush', type: 'Ultimate Skill', desc: 'Charges with full body aflame.', icon: '', manaCost: 20, damage: 200, cooldown: 6, frames: [] }
    }
  },

  ash_wolf: {
    id: 'ash_wolf', facesRight: false,
    name: 'Ash Wolf', title: 'Fire Beast',
    element: 'Fire', role: 'Monster',
    color: '#ff6600', glowColor: 'rgba(255,102,0,0.6)', bgColor: '#1a0800',
    stats: { hp: 560, atk: 95, def: 55, spd: 100, crit: 12 },

    sprites: {
      idle:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/idle.webp',
      walk:   'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/walk.webp',
      sprint: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/sprint.webp',
      attack: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/walk.webp',
      portrait: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/idle.webp',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/2background.webp']
    },
    skills: {
      basic: {
        name: 'Ash Bite', type: 'Basic Skill', desc: 'Lunges and bites with lava-infused jaws.',
        icon: '', manaCost: 0, damage: 95, cooldown: 0,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/Basic Skill Effect Frame 1.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/Basic Skill Effect Frame 2.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/Basic Skill Effect Frame 3.webp',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Ash Wolf/Basic Skill Effect Frame 4.webp'
        ]
      },
      special:  { name: 'Lava Howl',   type: 'Special Skill',  desc: 'Releases a scorching howl that burns the enemy.', icon: '', manaCost: 10, damage: 130, cooldown: 3, frames: [] },
      ultimate: { name: 'Magma Frenzy', type: 'Ultimate Skill', desc: 'Unleashes a wild flurry of magma-coated strikes.', icon: '', manaCost: 20, damage: 240, cooldown: 6, frames: [] }
    }
  },

  magma_scorcher: {
    id: 'magma_scorcher', facesRight: false,
    name: 'Magma Scorcher', title: 'Lava Predator',
    element: 'Fire', role: 'Monster',
    color: '#ff5500', glowColor: 'rgba(255,85,0,0.6)', bgColor: '#1a0600',
    stats: { hp: 640, atk: 108, def: 60, spd: 95, crit: 14 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/idle2.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/idle.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/idle2.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/4background.webp']
    },
    skills: {
      basic: {
        name: 'Scorch Strike', type: 'Basic Skill', desc: 'Claws the enemy with superheated talons.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/basicskill.png', manaCost: 0, damage: 82, cooldown: 0,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/basicskilleffect.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Lava Surge',    type: 'Special Skill',  desc: 'Releases a pressurized stream of magma.', icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Magma Scorcher/basicskill2.png', manaCost: 10, damage: 120, cooldown: 3, frames: [] },
      ultimate: { name: 'Eruption Sting', type: 'Ultimate Skill', desc: 'Injects molten venom in a rapid burst.', icon: '', manaCost: 20, damage: 220, cooldown: 6, frames: [] }
    }
  },

  pyro_wraith: {
    id: 'pyro_wraith', facesRight: false,
    name: 'Pyro Wraith', title: 'Flame Specter',
    element: 'Fire', role: 'Monster',
    color: '#ff2200', glowColor: 'rgba(255,34,0,0.6)', bgColor: '#180400',
    stats: { hp: 590, atk: 120, def: 45, spd: 120, crit: 18 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/idle2.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/idle.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/idle2.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/2background.webp']
    },
    skills: {
      basic: {
        name: 'Phantom Flame', type: 'Basic Skill', desc: 'Hurls spectral fire that phases through defenses.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/basicskill.png', manaCost: 0, damage: 82, cooldown: 0,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/basicskilleffect.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Soul Scorch',   type: 'Special Skill',  desc: 'Burns the enemy\'s spirit directly.', icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Pyro Wraith/basicskill2.png', manaCost: 10, damage: 130, cooldown: 3, frames: [] },
      ultimate: { name: 'Inferno Wraith', type: 'Ultimate Skill', desc: 'Fully ignites into a wraith of pure flame.', icon: '', manaCost: 20, damage: 240, cooldown: 6, frames: [] }
    }
  },

  cinder_golem: {
    id: 'cinder_golem', facesRight: true,
    name: 'Cinder Golem', title: 'Stone & Fire',
    element: 'Fire', role: 'Monster',
    color: '#ff7722', glowColor: 'rgba(255,119,34,0.6)', bgColor: '#1a0800',
    stats: { hp: 750, atk: 105, def: 90, spd: 55, crit: 8 },
    sprites: {
      idle:   'StoryEnemies/Fire/Cinder Golem/idle.png',
      walk:   'StoryEnemies/Fire/Cinder Golem/walk.png',
      run:    'StoryEnemies/Fire/Cinder Golem/run.png',
      sprint: 'StoryEnemies/Fire/Cinder Golem/sprint.png',
      attack: 'StoryEnemies/Fire/Cinder Golem/attack.png',
      portrait: 'StoryEnemies/Fire/Cinder Golem/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Cinder Golem/background.png']
    },
    skills: {
      basic:    { name: 'Rock Smash',     type: 'Basic Skill',   desc: 'Slams the ground with burning fists.', icon: '', manaCost: 0,  damage: 100, cooldown: 0, frames: [] },
      special:  { name: 'Magma Shield',   type: 'Special Skill', desc: 'Hardens body with molten rock, blocking damage.',  icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Eruption Slam',  type: 'Ultimate Skill',desc: 'Leaps and crashes down with explosive force.',  icon: '', manaCost: 20, damage: 260, cooldown: 6, frames: [] }
    }
  },

  magma_serpent: {
    id: 'magma_serpent', facesRight: false,
    name: 'Magma Serpent', title: 'Living Lava',
    element: 'Fire', role: 'Monster',
    color: '#ff3300', glowColor: 'rgba(255,51,0,0.6)', bgColor: '#200800',
    stats: { hp: 680, atk: 115, def: 65, spd: 110, crit: 15 },
    sprites: {
      idle:   'StoryEnemies/Fire/Magma Serpent/idle.png',
      walk:   'StoryEnemies/Fire/Magma Serpent/walk.png',
      run:    'StoryEnemies/Fire/Magma Serpent/run.png',
      sprint: 'StoryEnemies/Fire/Magma Serpent/sprint.png',
      attack: 'StoryEnemies/Fire/Magma Serpent/attack.png',
      portrait: 'StoryEnemies/Fire/Magma Serpent/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Magma Serpent/background.png']
    },
    skills: {
      basic:    { name: 'Lava Fang',    type: 'Basic Skill',   desc: 'Strikes with molten fangs.',      icon: '', manaCost: 0,  damage: 110, cooldown: 0, frames: [] },
      special:  { name: 'Scorch Coil',  type: 'Special Skill', desc: 'Wraps around and burns the foe.', icon: '', manaCost: 10, damage: 150, cooldown: 3, frames: [] },
      ultimate: { name: 'Inferno Tide', type: 'Ultimate Skill',desc: 'Releases a torrent of molten fire.',icon: '', manaCost: 20, damage: 280, cooldown: 6, frames: [] }
    }
  },

  lirael: {
    id: 'lirael', facesRight: false,
    name: 'Lirael', title: 'The Phoenix Seraphim',
    element: 'Fire', role: 'Boss',
    color: '#ff2200', glowColor: 'rgba(255,34,0,0.9)', bgColor: '#200500',
    stats: { hp: 1050, atk: 125, def: 82, spd: 95, crit: 16 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle2.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle3.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle4.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle5.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/3background.webp']
    },
    skills: {
      basic: {
        name: 'Phoenix Talon', type: 'Basic Skill', desc: 'Rakes with wings of living fire.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/basicskill.png',
        manaCost: 0, damage: 82, cooldown: 0,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/basicskilleffect.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/basicskilleffect2.png'
        ]
      },
      special: {
        name: 'Seraph Blaze', type: 'Special Skill', desc: 'Channels celestial fire into a devastating eruption.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/specialskill.png',
        manaCost: 10, damage: 165, cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/specialskilleffect.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/specialskilleffect(1).png'
        ]
      },
      ultimate: {
        name: 'Eternal Rebirth', type: 'Ultimate Skill', desc: 'Rises from ash and unleashes the full fury of the undying phoenix.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/ultimateskill.png',
        manaCost: 20, damage: 310, cooldown: 6,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/ultimateskilleffect.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Aeron-Flame/Final Boss_ Lirael, The Phoenix Seraphim/ultimateskilleffect(1).png'
        ]
      }
    }
  },

  inferno_lord: {
    id: 'inferno_lord', facesRight: true,
    name: 'Inferno Lord', title: 'Chapter 1 Boss',
    element: 'Fire', role: 'Boss',
    color: '#ff1100', glowColor: 'rgba(255,17,0,0.8)', bgColor: '#2a0400',
    stats: { hp: 1200, atk: 135, def: 80, spd: 90, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Fire/Inferno Lord/idle.png',
      walk:   'StoryEnemies/Fire/Inferno Lord/walk.png',
      run:    'StoryEnemies/Fire/Inferno Lord/run.png',
      sprint: 'StoryEnemies/Fire/Inferno Lord/sprint.png',
      attack: 'StoryEnemies/Fire/Inferno Lord/attack.png',
      portrait: 'StoryEnemies/Fire/Inferno Lord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Fire/Inferno Lord/background.png']
    },
    skills: {
      basic:    { name: 'Hellfire Strike',  type: 'Basic Skill',   desc: 'A devastating blow wreathed in hellfire.',   icon: '', manaCost: 0,  damage: 130, cooldown: 0, frames: [] },
      special:  { name: 'Flame Dominion',   type: 'Special Skill', desc: 'Commands the flames to engulf the enemy.',   icon: '', manaCost: 10, damage: 200, cooldown: 3, frames: [] },
      ultimate: { name: 'Apocalypse Flame', type: 'Ultimate Skill',desc: 'Unleashes the full wrath of the inferno.',   icon: '', manaCost: 20, damage: 380, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 2 — LYRA'S BLIZZARD  (Frost enemies)
  // ══════════════════════════════════════════════════════════
  frostling_brawler: {
    id: 'frostling_brawler', facesRight: false,
    name: 'Frostling Brawler', title: 'Ice Brute',
    element: 'Ice', role: 'Monster',
    color: '#88ddff', glowColor: 'rgba(136,221,255,0.6)', bgColor: '#000d18',
    stats: { hp: 500, atk: 80, def: 55, spd: 75, crit: 10 },
    sprites: {
      idle:    'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/idle.png',
      walk:    'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/idle.png',
      run:     'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/idle.png',
      sprint:  'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/idle.png',
      attack:  'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskill.png',
      portrait:'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/battlefield_image.jpg']
    },
    skills: {
      basic: {
        name: 'Frost Punch', type: 'Basic Skill', desc: 'Slams with ice-hardened fists.',
        icon: 'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskill.png',
        manaCost: 0, damage: 80, cooldown: 0,
        frames: [
          'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskilleffect.png',
          'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Ice Slam',     type: 'Special Skill',  desc: 'Leaps and crashes down with frozen force.', icon: 'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskill2.png', manaCost: 10, damage: 120, cooldown: 3, frames: [] },
      ultimate: { name: 'Glacial Rage', type: 'Ultimate Skill', desc: 'Enters a berserk state coated in ice shards.', icon: 'StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/basicskill3.png', manaCost: 20, damage: 230, cooldown: 6, frames: [] }
    }
  },

  glacier_golem: {
    id: 'glacier_golem', facesRight: false,
    name: 'Glacier Golem', title: 'Living Ice',
    element: 'Ice', role: 'Monster',
    color: '#55bbee', glowColor: 'rgba(85,187,238,0.6)', bgColor: '#00081a',
    stats: { hp: 720, atk: 95, def: 110, spd: 45, crit: 8 },
    sprites: {
      idle:    'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/idle.png',
      walk:    'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/idle.png',
      run:     'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/idle.png',
      sprint:  'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/idle.png',
      attack:  'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/basicskill.png',
      portrait:'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/battlefield_image.jpg']
    },
    skills: {
      basic: {
        name: 'Ice Crush', type: 'Basic Skill', desc: 'Smashes with a massive frozen fist.',
        icon: 'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/basicskill.png',
        manaCost: 0, damage: 95, cooldown: 0,
        frames: [
          'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/effect.png',
          'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/effect2.png',
          'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/effect3.png'
        ]
      },
      special:  { name: 'Frozen Wall',    type: 'Special Skill',  desc: 'Raises a wall of ice to block and retaliate.', icon: 'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/basicskill2.png', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Avalanche Slam', type: 'Ultimate Skill', desc: 'Brings down a mountain of glacial ice.',        icon: 'StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/basicskill4.png', manaCost: 20, damage: 260, cooldown: 6, frames: [] }
    }
  },

  chillwind_sprite: {
    id: 'chillwind_sprite', facesRight: false,
    name: 'Chill-Wind Sprite', title: 'Frost Wisp',
    element: 'Ice', role: 'Monster',
    color: '#aaeeff', glowColor: 'rgba(170,238,255,0.6)', bgColor: '#00060f',
    stats: { hp: 460, atk: 105, def: 40, spd: 130, crit: 16 },
    sprites: {
      idle:    'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/idle.png',
      walk:    'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/idle2.png',
      run:     'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/idle3.png',
      sprint:  'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/idle4.png',
      attack:  'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/basicskill.png',
      portrait:'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lyra-Frost/enemy1_Frostling Brawler/battlefield_image.jpg']
    },
    skills: {
      basic: {
        name: 'Frost Bolt', type: 'Basic Skill', desc: 'Fires a piercing shard of ice.',
        icon: 'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/basicskill.png',
        manaCost: 0, damage: 100, cooldown: 0,
        frames: [
          'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/effect.png',
          'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/effect2.png'
        ]
      },
      special:  { name: 'Blizzard Volley', type: 'Special Skill',  desc: 'Unleashes a flurry of ice projectiles.',     icon: 'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/basicskill2.png', manaCost: 10, damage: 145, cooldown: 3, frames: [] },
      ultimate: { name: 'Arctic Storm',    type: 'Ultimate Skill', desc: 'Summons a raging blizzard on the enemy.',    icon: 'StoryEnemies/Lyra-Frost/enemy3_Chill-Wind Sprite (Ranged Mob)/basicskill3.png', manaCost: 20, damage: 260, cooldown: 6, frames: [] }
    }
  },

  frostbite_phantom: {
    id: 'frostbite_phantom', facesRight: false,
    name: 'Frostbite Phantom', title: 'Elite Frost Specter',
    element: 'Ice', role: 'Monster',
    color: '#66ccff', glowColor: 'rgba(102,204,255,0.7)', bgColor: '#000a14',
    stats: { hp: 680, atk: 100, def: 65, spd: 115, crit: 8 },
    sprites: {
      idle:    'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/idle.png',
      walk:    'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/idle2.png',
      run:     'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/idle3.png',
      sprint:  'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/idle4.png',
      attack:  'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/basicskill.png',
      portrait:'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lyra-Frost/enemy2_Glacier Golem/battlefield.jpg']
    },
    skills: {
      basic: {
        name: 'Phantom Chill', type: 'Basic Skill', desc: 'Phases through and strikes with frozen claws.',
        icon: 'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/basicskill.png',
        manaCost: 0, damage: 115, cooldown: 0,
        frames: [
          'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/effect.png',
          'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/effect2.png',
          'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/effect3.png'
        ]
      },
      special:  { name: 'Frostbite',      type: 'Special Skill',  desc: 'Inflicts deep freeze on contact.',            icon: 'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/basicskill2.png', manaCost: 10, damage: 130, cooldown: 3, frames: [] },
      ultimate: { name: 'Soul Freeze',    type: 'Ultimate Skill', desc: 'Locks the enemy in a cocoon of absolute cold.', icon: 'StoryEnemies/Lyra-Frost/enemy4_Frostbite Phantom (Elite Mob)/basicskill3.png', manaCost: 20, damage: 210, cooldown: 6, frames: [] }
    }
  },

  kaelen: {
    id: 'kaelen', facesRight: false,
    name: 'Kaelen', title: 'The Corrupted Frostlord',
    element: 'Ice', role: 'Boss',
    color: '#00cfff', glowColor: 'rgba(0,207,255,0.9)', bgColor: '#000d1a',
    stats: { hp: 1050, atk: 125, def: 90, spd: 100, crit: 16 },
    sprites: {
      idle:    'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/kaelen_frostlord_idle_1.png',
      walk:    'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/kaelen_frostlord_idle_2.png',
      run:     'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/kaelen_frostlord_idle_3.png',
      sprint:  'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/kaelen_frostlord_idle_2.png',
      attack:  'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/basicattack.png',
      portrait:'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/kaelen_frostlord_idle_1.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/battlefield_final.jpg']
    },
    skills: {
      basic: {
        name: 'Glacial Cleave', type: 'Basic Skill', desc: 'Slashes with a blade of corrupted ice.',
        icon: 'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/basicattack.png',
        manaCost: 0, damage: 82, cooldown: 0,
        frames: [
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/effect_glacial_cleave_frame_1.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/effect_glacial_cleave_frame_2.png'
        ]
      },
      special: {
        name: 'Clash of Ice', type: 'Special Skill', desc: 'Opens a vortex of frozen energy that erupts in ice shards.',
        icon: 'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/specialskill.png',
        manaCost: 10, damage: 165, cooldown: 3,
        frames: [
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/clashofice_frame_01_energy_prelude_transparent.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/clashofice_frame_02_vortex_open_transparent.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/clashofice_frame_03_ice_star_ring_transparent.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/clashofice_frame_04_ice_shard_burst_transparent.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/clashofice_frame_05_frost_mist_fade_transparent.png'
        ]
      },
      ultimate: {
        name: 'Frostlord\'s Wrath', type: 'Ultimate Skill', desc: 'Erupts glaciers from the ground in a cataclysmic ice explosion.',
        icon: 'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ultimateskill.png',
        manaCost: 20, damage: 310, cooldown: 6,
        frames: [
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ice_sprite_crack_ground_01.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ice_sprite_small_pillar_02.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ice_sprite_eruption_cluster_03.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ice_sprite_large_wall_04.png',
          'StoryEnemies/Lyra-Frost/Final Boss_Kaelen, The Corrupted Frostlord/ice_sprite_mist_smoke_06.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 3 — KAEL'S STORM  (Storm / Lightning enemies)
  // ══════════════════════════════════════════════════════════
  storm_goblin: {
    id: 'storm_goblin', facesRight: false,
    name: 'Storm Goblin', title: 'Thunder Pest',
    element: 'Lightning', role: 'Monster',
    color: '#ffee00', glowColor: 'rgba(255,238,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 480, atk: 88, def: 40, spd: 110, crit: 13 },
    sprites: {
      idle:    'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of idle.png',
      walk:    'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of idle2.png',
      run:     'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of idle3.png',
      sprint:  'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of idle4.png',
      attack:  'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of basicskill.png',
      portrait:'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Kael-Storm/enemy1_Storm Goblin/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Spark Slash', type: 'Basic Skill', desc: 'Slashes with a crackling bolt of lightning.',
        icon: 'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of basicskill.png',
        manaCost: 0, damage: 85, cooldown: 0,
        frames: [
          'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of effectskill.png',
          'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of effectskill2.png'
        ]
      },
      special:  { name: 'Volt Lunge',    type: 'Special Skill',  desc: 'Charges at enemy in a burst of electricity.', icon: 'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of basicskill2.png', manaCost: 10, damage: 125, cooldown: 3, frames: [] },
      ultimate: { name: 'Thunder Frenzy', type: 'Ultimate Skill', desc: 'Goes berserk, striking repeatedly with lightning.', icon: 'StoryEnemies/Kael-Storm/enemy1_Storm Goblin/Copy of basicskill3.png', manaCost: 20, damage: 235, cooldown: 6, frames: [] }
    }
  },

  thunder_brute: {
    id: 'thunder_brute', facesRight: false,
    name: 'Thunder Brute', title: 'Storm Colossus',
    element: 'Lightning', role: 'Monster',
    color: '#ffdd00', glowColor: 'rgba(255,221,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 680, atk: 112, def: 75, spd: 65, crit: 11 },
    sprites: {
      idle:    'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/idle.png',
      walk:    'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/idle2.png',
      run:     'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/idle3.png',
      sprint:  'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/idle4.png',
      attack:  'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/basicskill.png',
      portrait:'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Kael-Storm/enemy2_Thunder Brute/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Thunderclap Fist', type: 'Basic Skill', desc: 'Delivers a crushing blow that echoes like thunder.',
        icon: 'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/basicskill.png',
        manaCost: 0, damage: 108, cooldown: 0,
        frames: [
          'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/effectskill.png',
          'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/effectskill2.png',
          'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/effectskill3.png',
          'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/effectskill4.png',
          'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/effectskill5.png'
        ]
      },
      special:  { name: 'Storm Slam',    type: 'Special Skill',  desc: 'Leaps and crashes down with electric force.', icon: 'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/basicskill2.png', manaCost: 10, damage: 155, cooldown: 3, frames: [] },
      ultimate: { name: 'Tempest Roar',  type: 'Ultimate Skill', desc: 'Lets out a roar that summons a torrent of lightning.', icon: 'StoryEnemies/Kael-Storm/enemy2_Thunder Brute/basicskill3.png', manaCost: 20, damage: 275, cooldown: 6, frames: [] }
    }
  },

  tempest_archer: {
    id: 'tempest_archer', facesRight: false,
    name: 'Tempest Archer', title: 'Storm Marksman',
    element: 'Lightning', role: 'Monster',
    color: '#aaee00', glowColor: 'rgba(170,238,0,0.6)', bgColor: '#080d00',
    stats: { hp: 540, atk: 118, def: 50, spd: 120, crit: 17 },
    sprites: {
      idle:    'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/idle.png',
      walk:    'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/idle2.png',
      run:     'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/idle3.png',
      sprint:  'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/idle4.png',
      attack:  'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/basicskill.png',
      portrait:'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Kael-Storm/enemy3_Tempest Archer/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Bolt Arrow', type: 'Basic Skill', desc: 'Fires an arrow charged with storm energy.',
        icon: 'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/basicskill.png',
        manaCost: 0, damage: 112, cooldown: 0,
        frames: [
          'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/effectskill.png',
          'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/effectskill2.png'
        ]
      },
      special:  { name: 'Chain Lightning', type: 'Special Skill',  desc: 'Releases a volley that chains between targets.', icon: 'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/basicskill2.png', manaCost: 10, damage: 158, cooldown: 3, frames: [] },
      ultimate: { name: 'Storm Barrage',   type: 'Ultimate Skill', desc: 'Unleashes a rain of electrified arrows.', icon: 'StoryEnemies/Kael-Storm/enemy3_Tempest Archer/basicskill3.png', manaCost: 20, damage: 280, cooldown: 6, frames: [] }
    }
  },

  sky_reaper: {
    id: 'sky_reaper', facesRight: false,
    name: 'Sky Reaper', title: 'Elite Storm Hunter',
    element: 'Lightning', role: 'Monster',
    color: '#ccdd00', glowColor: 'rgba(204,221,0,0.7)', bgColor: '#0a0d00',
    stats: { hp: 700, atk: 125, def: 68, spd: 115, crit: 20 },
    sprites: {
      idle:    'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/idle.png',
      walk:    'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/idle2.png',
      run:     'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/idle3.png',
      sprint:  'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/idle4.png',
      attack:  'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/basicskill.png',
      portrait:'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Kael-Storm/enemy4_Sky Reaper/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Sky Slash', type: 'Basic Skill', desc: 'Dives from above with an electrified blade.',
        icon: 'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/basicskill.png',
        manaCost: 0, damage: 120, cooldown: 0,
        frames: [
          'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/skilleffect.png',
          'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/skilleffect2.png',
          'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/skilleffect3.png'
        ]
      },
      special:  { name: 'Reaping Gale',  type: 'Special Skill',  desc: 'Sweeps through in a lightning-infused arc.', icon: 'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/basicskill2.png', manaCost: 10, damage: 170, cooldown: 3, frames: [] },
      ultimate: { name: 'Death Descent', type: 'Ultimate Skill', desc: 'Plunges from the stratosphere at lethal speed.', icon: 'StoryEnemies/Kael-Storm/enemy4_Sky Reaper/basicskill3.png', manaCost: 20, damage: 305, cooldown: 6, frames: [] }
    }
  },

  zephyron: {
    id: 'zephyron', facesRight: false,
    name: 'Zephyron', title: 'The Tempest King',
    element: 'Lightning', role: 'Boss',
    color: '#ffee00', glowColor: 'rgba(255,238,0,0.9)', bgColor: '#111100',
    stats: { hp: 1000, atk: 135, def: 75, spd: 105, crit: 17 },
    sprites: {
      idle:    'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/idle.png',
      walk:    'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/idle2.png',
      run:     'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/idle3.png',
      sprint:  'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/idle4.png',
      attack:  'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/basicskill.png',
      portrait:'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Tempest Strike', type: 'Basic Skill', desc: 'Smashes with a condensed bolt of pure storm energy.',
        icon: 'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/basicskill.png',
        manaCost: 0, damage: 92, cooldown: 0,
        frames: [
          'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/basicskilleffect.png'
        ]
      },
      special: {
        name: 'Storm Sovereign', type: 'Special Skill', desc: 'Calls down five consecutive thunderbolts.',
        icon: 'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/specialskill.png',
        manaCost: 10, damage: 175, cooldown: 3,
        frames: [
          'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/specialkilleffect.png'
        ]
      },
      ultimate: {
        name: 'King\'s Wrath', type: 'Ultimate Skill', desc: 'Unleashes the full fury of the tempest in one devastating blast.',
        icon: 'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/ultimateskill.png',
        manaCost: 20, damage: 325, cooldown: 6,
        frames: [
          'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/ultimateskilleffect.png',
          'StoryEnemies/Kael-Storm/FinalBoss_ZEPHYRON, THE TEMPEST KING/ultimateskilleffect2.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 4 — RIVEN'S FORTRESS  (Earth / Wind enemies)
  // ══════════════════════════════════════════════════════════
  dust_golem: {
    id: 'dust_golem', facesRight: false,
    name: 'Dust Golem', title: 'Earth Brute',
    element: 'Earth', role: 'Monster',
    color: '#cc9944', glowColor: 'rgba(204,153,68,0.6)', bgColor: '#100a00',
    stats: { hp: 620, atk: 92, def: 100, spd: 50, crit: 9 },
    sprites: {
      idle:    'StoryEnemies/Earth-Riven/enemy1_Dust Golem/idle.png',
      walk:    'StoryEnemies/Earth-Riven/enemy1_Dust Golem/sprinttoattack.png',
      run:     'StoryEnemies/Earth-Riven/enemy1_Dust Golem/sprinttoattack2.png',
      sprint:  'StoryEnemies/Earth-Riven/enemy1_Dust Golem/sprinttoattack3.png',
      attack:  'StoryEnemies/Earth-Riven/enemy1_Dust Golem/basicskill.png',
      portrait:'StoryEnemies/Earth-Riven/enemy1_Dust Golem/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Earth-Riven/enemy1_Dust Golem/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Rock Smash', type: 'Basic Skill', desc: 'Slams with a boulder-heavy fist.',
        icon: 'StoryEnemies/Earth-Riven/enemy1_Dust Golem/basicskill.png',
        manaCost: 0, damage: 92, cooldown: 0,
        frames: ['StoryEnemies/Earth-Riven/enemy1_Dust Golem/basicskilleffect.png',
                 'StoryEnemies/Earth-Riven/enemy1_Dust Golem/sprinttoattackeffect.png']
      },
      special:  { name: 'Quake Stomp',   type: 'Special Skill',  desc: 'Stomps the ground, sending shockwaves outward.', icon: '', manaCost: 10, damage: 140, cooldown: 3, frames: [] },
      ultimate: { name: 'Dust Storm',    type: 'Ultimate Skill', desc: 'Explodes into a blinding storm of rock and dust.',  icon: '', manaCost: 20, damage: 255, cooldown: 6, frames: [] }
    }
  },

  gale_harrier: {
    id: 'gale_harrier', facesRight: false,
    name: 'Gale Harrier', title: 'Wind Predator',
    element: 'Earth', role: 'Monster',
    color: '#aacc66', glowColor: 'rgba(170,204,102,0.6)', bgColor: '#080d00',
    stats: { hp: 540, atk: 105, def: 55, spd: 115, crit: 14 },
    sprites: {
      idle:    'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/idle.png',
      walk:    'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/idle2.png',
      run:     'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/sprinttoattack.png',
      sprint:  'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/sprinttoattack2.png',
      attack:  'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/sprinttoattack3.png',
      portrait:'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Earth-Riven/enemy2_Gale Harrier/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Wind Rake', type: 'Basic Skill', desc: 'Swoops in and rakes with gale-force talons.',
        icon: 'StoryEnemies/Earth-Riven/enemy2_Gale Harrier/basicskill2.png',
        manaCost: 0, damage: 100, cooldown: 0,
        frames: []
      },
      special:  { name: 'Dive Slash',   type: 'Special Skill',  desc: 'Plunges from height with slicing wings.', icon: '', manaCost: 10, damage: 148, cooldown: 3, frames: [] },
      ultimate: { name: 'Gale Assault', type: 'Ultimate Skill', desc: 'Repeatedly strikes in a blur of wind.',    icon: '', manaCost: 20, damage: 268, cooldown: 6, frames: [] }
    }
  },

  sky_rift_falcon: {
    id: 'sky_rift_falcon', facesRight: false,
    name: 'Sky-Rift Falcon', title: 'Storm Raptor',
    element: 'Earth', role: 'Monster',
    color: '#88bb44', glowColor: 'rgba(136,187,68,0.6)', bgColor: '#060d00',
    stats: { hp: 610, atk: 118, def: 62, spd: 125, crit: 16 },
    sprites: {
      idle:    'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/idle.png',
      walk:    'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/idle.png',
      run:     'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/basicattack.png',
      sprint:  'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/basicattack2.png',
      attack:  'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/basicattack.png',
      portrait:'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/battlefield.jpg']
    },
    skills: {
      basic: {
        name: 'Rift Talon', type: 'Basic Skill', desc: 'Tears through with razor-sharp sky-attuned claws.',
        icon: 'StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/basicattack.png',
        manaCost: 0, damage: 112, cooldown: 0,
        frames: ['StoryEnemies/Earth-Riven/enemy3_Sky-Rift Falcon/basicattackeffect.png']
      },
      special:  { name: 'Sky Rift',     type: 'Special Skill',  desc: 'Tears a rift in the air that blasts the enemy.', icon: '', manaCost: 10, damage: 162, cooldown: 3, frames: [] },
      ultimate: { name: 'Storm Rend',   type: 'Ultimate Skill', desc: 'Shreds through enemy defenses in a sonic dive.',   icon: '', manaCost: 20, damage: 285, cooldown: 6, frames: [] }
    }
  },

  zephyr_sentinel: {
    id: 'zephyr_sentinel', facesRight: false,
    name: 'Zephyr Sentinel', title: 'Wind Guardian',
    element: 'Earth', role: 'Monster',
    color: '#99cc55', glowColor: 'rgba(153,204,85,0.7)', bgColor: '#070d00',
    stats: { hp: 720, atk: 122, def: 88, spd: 90, crit: 15 },
    sprites: {
      idle:    'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/idle.png',
      walk:    'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/idle.png',
      run:     'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/basicskill.png',
      sprint:  'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/basicskill2.png',
      attack:  'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/basicskill.png',
      portrait:'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Sentinel Gale', type: 'Basic Skill', desc: 'Strikes with disciplined wind-enhanced force.',
        icon: 'StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/basicskill.png',
        manaCost: 0, damage: 118, cooldown: 0,
        frames: ['StoryEnemies/Earth-Riven/enemy4_Zephyr Sentinel/basicskilleffect.png']
      },
      special:  { name: 'Wind Barrier',  type: 'Special Skill',  desc: 'Creates a barrier of wind that deflects attacks.', icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Tempest Guard', type: 'Ultimate Skill', desc: 'Unleashes a wind maelstrom as a last resort.',      icon: '', manaCost: 20, damage: 300, cooldown: 6, frames: [] }
    }
  },

  zephyrus: {
    id: 'zephyrus', facesRight: false,
    name: 'Zephyrus', title: 'The Tempest Sovereign',
    element: 'Earth', role: 'Boss',
    color: '#77cc33', glowColor: 'rgba(119,204,51,0.9)', bgColor: '#060e00',
    stats: { hp: 1050, atk: 115, def: 100, spd: 65, crit: 11 },
    sprites: {
      idle:    'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/idle.png',
      walk:    'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/idle.png',
      run:     'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/idle.png',
      sprint:  'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/idle.png',
      attack:  'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/basicskill.png',
      portrait:'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Sovereign Strike', type: 'Basic Skill', desc: 'Delivers a blow that shakes the earth and sky.',
        icon: 'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/basicskill.png',
        manaCost: 0, damage: 102, cooldown: 0,
        frames: ['StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/basicskilleffect.png']
      },
      special: {
        name: 'Tempest Command', type: 'Special Skill', desc: 'Summons a vortex of wind and earth to engulf the enemy.',
        icon: 'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/specialskill.png',
        manaCost: 10, damage: 155, cooldown: 3,
        frames: ['StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/specialskilleffect.png']
      },
      ultimate: {
        name: 'Sovereign\'s Wrath', type: 'Ultimate Skill', desc: 'Calls forth the full might of wind and earth in one cataclysmic strike.',
        icon: 'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/ultimateskill.png',
        manaCost: 20, damage: 360, cooldown: 6,
        frames: [
          'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/ultimateskill(1).png',
          'StoryEnemies/Earth-Riven/FinalBoss_ZEPHYRUS, THE TEMPEST SOVEREIGN/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 5 — SELENE'S MOON HUNT  (Moon / Light enemies)
  // ══════════════════════════════════════════════════════════
  glint_sprite: {
    id: 'glint_sprite', facesRight: false,
    name: 'Glint Sprite', title: 'Moonlight Wisp',
    element: 'Light', role: 'Monster',
    color: '#eeddff', glowColor: 'rgba(238,221,255,0.6)', bgColor: '#08001a',
    stats: { hp: 460, atk: 85, def: 38, spd: 125, crit: 15 },
    sprites: {
      idle:    'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/idle.png',
      walk:    'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/idle2.png',
      run:     'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/idle2.png',
      sprint:  'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/idle2.png',
      attack:  'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/basicskill.png',
      portrait:'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Selene-Moon/enemy1_Glint Sprite/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Moonbeam', type: 'Basic Skill', desc: 'Fires a concentrated beam of moonlight.',
        icon: 'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/basicskill.png',
        manaCost: 0, damage: 82, cooldown: 0,
        frames: ['StoryEnemies/Selene-Moon/enemy1_Glint Sprite/basicskilleffect.png']
      },
      special:  { name: 'Lunar Flash',   type: 'Special Skill',  desc: 'Blinds and strikes with a burst of moonlight.', icon: 'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/basicskill2.png', manaCost: 10, damage: 122, cooldown: 3, frames: [] },
      ultimate: { name: 'Starfall Bolt', type: 'Ultimate Skill', desc: 'Calls down a barrage of falling starlight.',      icon: 'StoryEnemies/Selene-Moon/enemy1_Glint Sprite/basicskill3.png', manaCost: 20, damage: 235, cooldown: 6, frames: [] }
    }
  },

  moonlit_stalker: {
    id: 'moonlit_stalker', facesRight: false,
    name: 'Moonlit Stalker', title: 'Night Predator',
    element: 'Light', role: 'Monster',
    color: '#cc99ff', glowColor: 'rgba(204,153,255,0.6)', bgColor: '#080015',
    stats: { hp: 580, atk: 108, def: 58, spd: 118, crit: 18 },
    sprites: {
      idle:    'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/idle.png',
      walk:    'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/idle2.png',
      run:     'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/idle3.png',
      sprint:  'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/idle3.png',
      attack:  'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskill.png',
      portrait:'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Shadow Pounce', type: 'Basic Skill', desc: 'Leaps from darkness and strikes under moonlight.',
        icon: 'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskill.png',
        manaCost: 0, damage: 105, cooldown: 0,
        frames: [
          'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskilleffect.png',
          'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Lunar Lunge',   type: 'Special Skill',  desc: 'Dashes at blinding speed under the moon\'s blessing.', icon: 'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskill2.png', manaCost: 10, damage: 152, cooldown: 3, frames: [] },
      ultimate: { name: 'Midnight Hunt', type: 'Ultimate Skill', desc: 'Unleashes a flurry of moonlit strikes.',                 icon: 'StoryEnemies/Selene-Moon/enemy2_Moonlit Stalker/basicskill3.png', manaCost: 20, damage: 272, cooldown: 6, frames: [] }
    }
  },

  lunar_warden: {
    id: 'lunar_warden', facesRight: false,
    name: 'Lunar Warden', title: 'Moon Guardian',
    element: 'Light', role: 'Monster',
    color: '#bbaaff', glowColor: 'rgba(187,170,255,0.6)', bgColor: '#06001a',
    stats: { hp: 680, atk: 112, def: 85, spd: 88, crit: 14 },
    sprites: {
      idle:    'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/idle.png',
      walk:    'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/idle2.png',
      run:     'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/idle3.png',
      sprint:  'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/idle3.png',
      attack:  'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskill.png',
      portrait:'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Selene-Moon/enemy3_Lunar Warden/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Moon Slash', type: 'Basic Skill', desc: 'Strikes with a crescent blade of lunar energy.',
        icon: 'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskill.png',
        manaCost: 0, damage: 108, cooldown: 0,
        frames: [
          'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskilleffect.png',
          'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Warden\'s Light', type: 'Special Skill',  desc: 'Calls forth a pillar of moonlight to smite the foe.', icon: 'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskill2.png', manaCost: 10, damage: 158, cooldown: 3, frames: [] },
      ultimate: { name: 'Full Moon Fury',  type: 'Ultimate Skill', desc: 'Draws power from the full moon for a devastating blow.', icon: 'StoryEnemies/Selene-Moon/enemy3_Lunar Warden/basicskill3.png', manaCost: 20, damage: 285, cooldown: 6, frames: [] }
    }
  },

  eclipse_phantom: {
    id: 'eclipse_phantom', facesRight: false,
    name: 'Eclipse Phantom', title: 'Dark Moon Elite',
    element: 'Light', role: 'Monster',
    color: '#9966cc', glowColor: 'rgba(153,102,204,0.7)', bgColor: '#050010',
    stats: { hp: 710, atk: 128, def: 70, spd: 112, crit: 20 },
    sprites: {
      idle:    'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/idle.png',
      walk:    'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/idle.png',
      run:     'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill.png',
      sprint:  'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill2.png',
      attack:  'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill.png',
      portrait:'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/Moon Battlefield Concept (5).png']
    },
    skills: {
      basic: {
        name: 'Eclipse Strike', type: 'Basic Skill', desc: 'Strikes from within the shadow of an eclipse.',
        icon: 'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill.png',
        manaCost: 0, damage: 124, cooldown: 0,
        frames: [
          'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskilleffect.png',
          'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskilleffect2.png'
        ]
      },
      special:  { name: 'Void Eclipse',    type: 'Special Skill',  desc: 'Blots out the light and strikes from all directions.', icon: 'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill2.png', manaCost: 10, damage: 175, cooldown: 3, frames: [] },
      ultimate: { name: 'Dark Totality',   type: 'Ultimate Skill', desc: 'Plunges the battlefield into total eclipse, dealing massive damage.', icon: 'StoryEnemies/Selene-Moon/enemy4_Eclipse Phantom/basicskill3.png', manaCost: 20, damage: 308, cooldown: 6, frames: [] }
    }
  },

  lumina: {
    id: 'lumina', facesRight: false,
    name: 'Lumina', title: 'The Eclipse Empress',
    element: 'Light', role: 'Boss',
    color: '#ddaaff', glowColor: 'rgba(221,170,255,0.9)', bgColor: '#080015',
    stats: { hp: 950, atk: 145, def: 62, spd: 112, crit: 26 },
    sprites: {
      idle:    'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/idle.png',
      walk:    'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/idle.png',
      run:     'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/idle.png',
      sprint:  'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/idle.png',
      attack:  'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/basicskill.png',
      portrait:'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Empress Strike', type: 'Basic Skill', desc: 'Channels moonlight and eclipse energy into a single blow.',
        icon: 'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/basicskill.png',
        manaCost: 0, damage: 97, cooldown: 0,
        frames: [
          'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/basicskilleffect.png'
        ]
      },
      special: {
        name: 'Lunar Dominion', type: 'Special Skill', desc: 'Commands the moon to rain down crescent blades.',
        icon: 'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/specialskill.png',
        manaCost: 10, damage: 195, cooldown: 3,
        frames: [
          'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/specialskilleffect.png',
          'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/specialskilleffect2.png'
        ]
      },
      ultimate: {
        name: 'Eclipse Annihilation', type: 'Ultimate Skill', desc: 'Merges moon and shadow into a world-ending eclipse burst.',
        icon: 'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/ultimateskill.png',
        manaCost: 20, damage: 340, cooldown: 6,
        frames: [
          'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/ultimateskill2.png',
          'StoryEnemies/Selene-Moon/FinalBoss_LUMINA, THE ECLIPSE EMPRESS/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 6 — DRAVEN'S SHADOW  (Shadow / Dark enemies)
  // ══════════════════════════════════════════════════════════
  gloom_bat: {
    id: 'gloom_bat', facesRight: false,
    name: 'Gloom Bat', title: 'Shadow Flyer',
    element: 'Dark', role: 'Monster',
    color: '#8800cc', glowColor: 'rgba(136,0,204,0.6)', bgColor: '#050010',
    stats: { hp: 450, atk: 88, def: 35, spd: 130, crit: 17 },
    sprites: {
      idle:    'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/idle.png',
      walk:    'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/idle2.png',
      run:     'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/idle2.png',
      sprint:  'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/idle2.png',
      attack:  'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/basicskill.png',
      portrait:'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Dark Screech', type: 'Basic Skill', desc: 'Emits a shadow-infused screech that disorients.',
        icon: 'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/basicskill.png',
        manaCost: 0, damage: 85, cooldown: 0,
        frames: ['StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/basicskilleffect.png']
      },
      special:  { name: 'Shadow Dive',   type: 'Special Skill',  desc: 'Dives from darkness at terrifying speed.',      icon: 'StoryEnemies/Draven-Shadow/enemy1_Gloom Bat/basicskill2.png', manaCost: 10, damage: 128, cooldown: 3, frames: [] },
      ultimate: { name: 'Gloom Swarm',   type: 'Ultimate Skill', desc: 'Summons a swarm of shadow bats to overwhelm.',   icon: '', manaCost: 20, damage: 242, cooldown: 6, frames: [] }
    }
  },

  shadow_prowler: {
    id: 'shadow_prowler', facesRight: false,
    name: 'Shadow Prowler', title: 'Darkness Hunter',
    element: 'Dark', role: 'Monster',
    color: '#6600aa', glowColor: 'rgba(102,0,170,0.6)', bgColor: '#050010',
    stats: { hp: 580, atk: 112, def: 58, spd: 122, crit: 20 },
    sprites: {
      idle:    'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/idle.png',
      walk:    'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/idle2.png',
      run:     'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/idle2.png',
      sprint:  'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/idle2.png',
      attack:  'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/basicskill.png',
      portrait:'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Prowl Strike', type: 'Basic Skill', desc: 'Attacks from the shadows with pinpoint precision.',
        icon: 'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/basicskill.png',
        manaCost: 0, damage: 108, cooldown: 0,
        frames: ['StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/basicskilleffect.png']
      },
      special:  { name: 'Umbra Rush',    type: 'Special Skill',  desc: 'Teleports behind enemy and strikes.', icon: 'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/basicskill2.png', manaCost: 10, damage: 158, cooldown: 3, frames: [] },
      ultimate: { name: 'Shadow Storm',  type: 'Ultimate Skill', desc: 'Becomes a shadow storm that attacks from every angle.', icon: 'StoryEnemies/Draven-Shadow/enemy2_Shadow Prowler/basicskill3.png', manaCost: 20, damage: 278, cooldown: 6, frames: [] }
    }
  },

  draven_abyssal_guard: {
    id: 'draven_abyssal_guard', facesRight: false,
    name: 'Abyssal Guard', title: 'Shadow Sentinel',
    element: 'Dark', role: 'Monster',
    color: '#440088', glowColor: 'rgba(68,0,136,0.6)', bgColor: '#040010',
    stats: { hp: 750, atk: 118, def: 95, spd: 78, crit: 14 },
    sprites: {
      idle:    'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/idle.png',
      walk:    'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/idle2.png',
      run:     'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/idle2.png',
      sprint:  'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/idle2.png',
      attack:  'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/basicskill.png',
      portrait:'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Abyss Cleave', type: 'Basic Skill', desc: 'Slashes with a blade forged in the void.',
        icon: 'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/basicskill.png',
        manaCost: 0, damage: 115, cooldown: 0,
        frames: ['StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/basicskilleffect.png']
      },
      special:  { name: 'Void Shield',   type: 'Special Skill',  desc: 'Raises a void barrier that halves incoming damage.', icon: 'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/basicskill2.png', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Dark Judgment', type: 'Ultimate Skill', desc: 'Calls down the wrath of the abyss.',                  icon: 'StoryEnemies/Draven-Shadow/enemy3_Abyssal Guard/basicskill3.png', manaCost: 20, damage: 295, cooldown: 6, frames: [] }
    }
  },

  nightmare_assassin: {
    id: 'nightmare_assassin', facesRight: false,
    name: 'Nightmare Assassin', title: 'Shadow Elite',
    element: 'Dark', role: 'Monster',
    color: '#7700bb', glowColor: 'rgba(119,0,187,0.7)', bgColor: '#050010',
    stats: { hp: 680, atk: 135, def: 62, spd: 128, crit: 24 },
    sprites: {
      idle:    'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/idle.png',
      walk:    'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/idle.png',
      run:     'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskill.png',
      sprint:  'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskill2.png',
      attack:  'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskill.png',
      portrait:'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Nightmare Stab', type: 'Basic Skill', desc: 'Materializes from a nightmare and strikes the heart.',
        icon: 'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskill.png',
        manaCost: 0, damage: 130, cooldown: 0,
        frames: ['StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskilleffect.png']
      },
      special:  { name: 'Dream Shatter', type: 'Special Skill',  desc: 'Tears through the enemy\'s mind and body.', icon: 'StoryEnemies/Draven-Shadow/enemy4_Nightmare Assassin/basicskill2.png', manaCost: 10, damage: 182, cooldown: 3, frames: [] },
      ultimate: { name: 'Eternal Nightmare', type: 'Ultimate Skill', desc: 'Traps the enemy in an unending nightmare.', icon: '', manaCost: 20, damage: 318, cooldown: 6, frames: [] }
    }
  },

  malakor: {
    id: 'malakor', facesRight: false,
    name: 'Malakor', title: 'The Void Lord',
    element: 'Dark', role: 'Boss',
    color: '#aa00ff', glowColor: 'rgba(170,0,255,0.9)', bgColor: '#060012',
    stats: { hp: 900, atk: 165, def: 72, spd: 133, crit: 29 },
    sprites: {
      idle:    'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/idle.png',
      walk:    'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/idle2.png',
      run:     'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/idle2.png',
      sprint:  'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/idle2.png',
      attack:  'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/basicskill.png',
      portrait:'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Void Crush', type: 'Basic Skill', desc: 'Compresses void energy into a crushing blow.',
        icon: 'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/basicskill.png',
        manaCost: 0, damage: 107, cooldown: 0,
        frames: ['StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/basicskilleffect.png']
      },
      special: {
        name: 'Void Dominion', type: 'Special Skill', desc: 'Commands the void to consume everything in its path.',
        icon: 'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/specialskill.png',
        manaCost: 10, damage: 205, cooldown: 3,
        frames: ['StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/specialskilleffect.png']
      },
      ultimate: {
        name: 'Lord\'s Oblivion', type: 'Ultimate Skill', desc: 'Opens a rift to the void that devours all light and hope.',
        icon: 'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/ultimateskill.png',
        manaCost: 20, damage: 370, cooldown: 6,
        frames: [
          'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/ultimateskill2.png',
          'StoryEnemies/Draven-Shadow/FinalBoss_MALAKOR, THE VOID LORD/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 7 — MIRA'S DEEP  (Water enemies)
  // ══════════════════════════════════════════════════════════
  tide_elemental: {
    id: 'tide_elemental', facesRight: false,
    name: 'Tide Elemental', title: 'Living Water',
    element: 'Water', role: 'Monster',
    color: '#0088ff', glowColor: 'rgba(0,136,255,0.6)', bgColor: '#000818',
    stats: { hp: 580, atk: 95, def: 65, spd: 90, crit: 12 },
    sprites: {
      idle:    'StoryEnemies/Mira-Water/enemy1_Tide Elemental/idle.png',
      walk:    'StoryEnemies/Mira-Water/enemy1_Tide Elemental/idle.png',
      run:     'StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskill.png',
      sprint:  'StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskill2.png',
      attack:  'StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskill.png',
      portrait:'StoryEnemies/Mira-Water/enemy1_Tide Elemental/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Mira-Water/enemy1_Tide Elemental/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Tidal Slam', type: 'Basic Skill', desc: 'Crashes into the enemy like a breaking wave.',
        icon: 'StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskill.png',
        manaCost: 0, damage: 92, cooldown: 0,
        frames: ['StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskilleffect.png']
      },
      special:  { name: 'Surge Rush',    type: 'Special Skill',  desc: 'Surges forward in a torrent of water.',        icon: 'StoryEnemies/Mira-Water/enemy1_Tide Elemental/basicskill2.png', manaCost: 10, damage: 138, cooldown: 3, frames: [] },
      ultimate: { name: 'Tidal Fury',    type: 'Ultimate Skill', desc: 'Transforms into a massive wave of destruction.',  icon: '', manaCost: 20, damage: 252, cooldown: 6, frames: [] }
    }
  },

  coral_scuttler: {
    id: 'coral_scuttler', facesRight: false,
    name: 'Coral Scuttler', title: 'Deep Crawler',
    element: 'Water', role: 'Monster',
    color: '#0066cc', glowColor: 'rgba(0,102,204,0.6)', bgColor: '#000a1a',
    stats: { hp: 620, atk: 105, def: 78, spd: 75, crit: 11 },
    sprites: {
      idle:    'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/idle.png',
      walk:    'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/idle2.png',
      run:     'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/idle2.png',
      sprint:  'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/idle2.png',
      attack:  'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/basicskill.png',
      portrait:'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Mira-Water/enemy2_Coral Scuttler/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Coral Snap', type: 'Basic Skill', desc: 'Snaps with reinforced coral claws.',
        icon: 'StoryEnemies/Mira-Water/enemy2_Coral Scuttler/basicskill.png',
        manaCost: 0, damage: 100, cooldown: 0,
        frames: ['StoryEnemies/Mira-Water/enemy2_Coral Scuttler/basicskilleffect.png']
      },
      special:  { name: 'Reef Crush',    type: 'Special Skill',  desc: 'Smashes with the full weight of the reef.',  icon: '', manaCost: 10, damage: 148, cooldown: 3, frames: [] },
      ultimate: { name: 'Coral Storm',   type: 'Ultimate Skill', desc: 'Launches a barrage of razor-sharp coral.',    icon: '', manaCost: 20, damage: 265, cooldown: 6, frames: [] }
    }
  },

  mira_abyssal_guard: {
    id: 'mira_abyssal_guard', facesRight: false,
    name: 'Abyssal Guard', title: 'Deep Warden',
    element: 'Water', role: 'Monster',
    color: '#0044aa', glowColor: 'rgba(0,68,170,0.6)', bgColor: '#000612',
    stats: { hp: 740, atk: 118, def: 92, spd: 72, crit: 13 },
    sprites: {
      idle:    'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/idle.png',
      walk:    'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/idle.png',
      run:     'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskill.png',
      sprint:  'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskill2.png',
      attack:  'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskill.png',
      portrait:'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Mira-Water/enemy3_Abyssal Guard/Battlefield Concept (2).png']
    },
    skills: {
      basic: {
        name: 'Deep Slash', type: 'Basic Skill', desc: 'Strikes with abyssal pressure behind every blow.',
        icon: 'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskill.png',
        manaCost: 0, damage: 115, cooldown: 0,
        frames: ['StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskilleffect.png']
      },
      special:  { name: 'Abyss Tide',    type: 'Special Skill',  desc: 'Calls forth a wave from the deepest ocean.',  icon: 'StoryEnemies/Mira-Water/enemy3_Abyssal Guard/basicskill2.png', manaCost: 10, damage: 165, cooldown: 3, frames: [] },
      ultimate: { name: 'Crushing Depth', type: 'Ultimate Skill', desc: 'Applies the full pressure of the abyss.',    icon: '', manaCost: 20, damage: 295, cooldown: 6, frames: [] }
    }
  },

  deep_sea_siren: {
    id: 'deep_sea_siren', facesRight: false,
    name: 'Deep-Sea Siren', title: 'Ocean Elite',
    element: 'Water', role: 'Monster',
    color: '#0055dd', glowColor: 'rgba(0,85,221,0.7)', bgColor: '#000814',
    stats: { hp: 700, atk: 132, def: 68, spd: 108, crit: 19 },
    sprites: {
      idle:    'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/idle.png',
      walk:    'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/idle2.png',
      run:     'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/idle2.png',
      sprint:  'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/idle2.png',
      attack:  'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/basicskill.png',
      portrait:'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Siren Song', type: 'Basic Skill', desc: 'Strikes with hypnotic aquatic energy.',
        icon: 'StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/basicskill.png',
        manaCost: 0, damage: 128, cooldown: 0,
        frames: ['StoryEnemies/Mira-Water/enemy4_Deep-Sea Siren/basicskilleffect.png']
      },
      special:  { name: 'Abyssal Lure',  type: 'Special Skill',  desc: 'Pulls enemy into a whirlpool of dark water.', icon: '', manaCost: 10, damage: 180, cooldown: 3, frames: [] },
      ultimate: { name: 'Ocean\'s Wail', type: 'Ultimate Skill', desc: 'Unleashes a devastating sonic wave from the deep.', icon: '', manaCost: 20, damage: 315, cooldown: 6, frames: [] }
    }
  },

  leviathan: {
    id: 'leviathan', facesRight: false,
    name: 'Leviathan', title: 'The Ocean Abyss',
    element: 'Water', role: 'Boss',
    color: '#0033bb', glowColor: 'rgba(0,51,187,0.9)', bgColor: '#000510',
    stats: { hp: 970, atk: 135, def: 87, spd: 97, crit: 16 },
    sprites: {
      idle:    'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/idle.png',
      walk:    'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/idle.png',
      run:     'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/idle.png',
      sprint:  'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/idle.png',
      attack:  'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/basicskill.png',
      portrait:'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Titan Crush', type: 'Basic Skill', desc: 'Crushes with the weight of the entire ocean.',
        icon: 'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/basicskill.png',
        manaCost: 0, damage: 87, cooldown: 0,
        frames: ['StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/basicskilleffect.png']
      },
      special: {
        name: 'Ocean Surge', type: 'Special Skill', desc: 'Summons a catastrophic tidal surge.',
        icon: 'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/specialskill.png',
        manaCost: 10, damage: 160, cooldown: 3,
        frames: ['StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/specialskilleffect.png']
      },
      ultimate: {
        name: 'Abyss Awakening', type: 'Ultimate Skill', desc: 'The full wrath of the ocean abyss is unleashed.',
        icon: 'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/ultimateskill.png',
        manaCost: 20, damage: 320, cooldown: 6,
        frames: [
          'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/ultimateskill2.png',
          'StoryEnemies/Mira-Water/FinalBoss_LEVIATHAN, THE OCEAN ABYSS/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 8 — ORION'S TEMPEST  (Wind enemies)
  // ══════════════════════════════════════════════════════════
  gale_wisplet: {
    id: 'gale_wisplet', facesRight: false,
    name: 'Gale Wisplet', title: 'Wind Wisp',
    element: 'Wind', role: 'Monster',
    color: '#aaffcc', glowColor: 'rgba(170,255,204,0.6)', bgColor: '#001408',
    stats: { hp: 460, atk: 88, def: 38, spd: 135, crit: 15 },
    sprites: {
      idle:    'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/idle.png',
      walk:    'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/idle.png',
      run:     'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskill.png',
      sprint:  'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskill2.png',
      attack:  'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskill.png',
      portrait:'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Gust Strike', type: 'Basic Skill', desc: 'Strikes with a concentrated burst of wind.',
        icon: 'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskill.png',
        manaCost: 0, damage: 85, cooldown: 0,
        frames: ['StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskilleffect.png']
      },
      special:  { name: 'Cyclone Dash',  type: 'Special Skill',  desc: 'Spins into a cyclone and rams the enemy.',    icon: 'StoryEnemies/Orion-Wind/enemy1_Gale Wisplet/basicskill2.png', manaCost: 10, damage: 128, cooldown: 3, frames: [] },
      ultimate: { name: 'Wind Torrent',  type: 'Ultimate Skill', desc: 'Releases a torrent of cutting wind blades.',   icon: '', manaCost: 20, damage: 242, cooldown: 6, frames: [] }
    }
  },

  zephyr_stalker: {
    id: 'zephyr_stalker', facesRight: false,
    name: 'Zephyr Stalker', title: 'Wind Hunter',
    element: 'Wind', role: 'Monster',
    color: '#88ffaa', glowColor: 'rgba(136,255,170,0.6)', bgColor: '#001208',
    stats: { hp: 580, atk: 108, def: 58, spd: 125, crit: 17 },
    sprites: {
      idle:    'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/idle.png',
      walk:    'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/idle.png',
      run:     'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskill.png',
      sprint:  'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskill2.png',
      attack:  'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskill.png',
      portrait:'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Wind Claw', type: 'Basic Skill', desc: 'Rakes with wind-enhanced claws.',
        icon: 'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskill.png',
        manaCost: 0, damage: 105, cooldown: 0,
        frames: ['StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskilleffect.png']
      },
      special:  { name: 'Zephyr Pounce', type: 'Special Skill',  desc: 'Leaps with wind-boosted speed for a critical strike.', icon: 'StoryEnemies/Orion-Wind/enemy2_Zephyr Stalker/basicskill2.png', manaCost: 10, damage: 155, cooldown: 3, frames: [] },
      ultimate: { name: 'Gale Rampage',  type: 'Ultimate Skill', desc: 'Goes berserk in a storm of slashing wind.',              icon: '', manaCost: 20, damage: 272, cooldown: 6, frames: [] }
    }
  },

  skyward_guard: {
    id: 'skyward_guard', facesRight: false,
    name: 'Skyward Guard', title: 'Wind Sentinel',
    element: 'Wind', role: 'Monster',
    color: '#66ffbb', glowColor: 'rgba(102,255,187,0.6)', bgColor: '#000f06',
    stats: { hp: 720, atk: 118, def: 90, spd: 88, crit: 14 },
    sprites: {
      idle:    'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/idle.png',
      walk:    'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/idle.png',
      run:     'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskill.png',
      sprint:  'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskill2.png',
      attack:  'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskill.png',
      portrait:'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Orion-Wind/enemy3_Skyward Guard/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Sky Blade', type: 'Basic Skill', desc: 'Swings a blade forged of compressed wind.',
        icon: 'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskill.png',
        manaCost: 0, damage: 115, cooldown: 0,
        frames: ['StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskilleffect.png']
      },
      special:  { name: 'Wind Wall',    type: 'Special Skill',  desc: 'Creates a wall of wind that deflects and retaliates.', icon: 'StoryEnemies/Orion-Wind/enemy3_Skyward Guard/basicskill2.png', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Storm Volley', type: 'Ultimate Skill', desc: 'Launches a relentless barrage of wind blades.',         icon: '', manaCost: 20, damage: 292, cooldown: 6, frames: [] }
    }
  },

  aero_phantom: {
    id: 'aero_phantom', facesRight: false,
    name: 'Aero Phantom', title: 'Sky Elite',
    element: 'Wind', role: 'Monster',
    color: '#44ffcc', glowColor: 'rgba(68,255,204,0.7)', bgColor: '#001210',
    stats: { hp: 700, atk: 130, def: 65, spd: 130, crit: 21 },
    sprites: {
      idle:    'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/idle.png',
      walk:    'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/idle.png',
      run:     'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/basicskill.png',
      sprint:  'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/basicskill.png',
      attack:  'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/basicskill.png',
      portrait:'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Orion-Wind/enemy4_Aero Phantom/Battlefield Concept (8).png']
    },
    skills: {
      basic: {
        name: 'Phantom Gust', type: 'Basic Skill', desc: 'Strikes from within the wind, impossible to anticipate.',
        icon: 'StoryEnemies/Orion-Wind/enemy4_Aero Phantom/basicskill.png',
        manaCost: 0, damage: 126, cooldown: 0,
        frames: ['StoryEnemies/Orion-Wind/enemy4_Aero Phantom/basicskilleffect.png']
      },
      special:  { name: 'Aero Rift',    type: 'Special Skill',  desc: 'Tears a rift through the air for massive damage.', icon: '', manaCost: 10, damage: 178, cooldown: 3, frames: [] },
      ultimate: { name: 'Sky Phantom',  type: 'Ultimate Skill', desc: 'Becomes the wind itself, striking from all sides.',   icon: '', manaCost: 20, damage: 312, cooldown: 6, frames: [] }
    }
  },

  boreas: {
    id: 'boreas', facesRight: false,
    name: 'Boreas', title: 'The Tempest Lord',
    element: 'Wind', role: 'Boss',
    color: '#00ffcc', glowColor: 'rgba(0,255,204,0.9)', bgColor: '#001412',
    stats: { hp: 970, atk: 140, def: 77, spd: 133, crit: 23 },
    sprites: {
      idle:    'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/idle.png',
      walk:    'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/idle.png',
      run:     'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/idle.png',
      sprint:  'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/idle.png',
      attack:  'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/basicskill.png',
      portrait:'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/Battlefield.png']
    },
    skills: {
      basic: {
        name: 'Tempest Blow', type: 'Basic Skill', desc: 'A strike backed by the full force of the tempest.',
        icon: 'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/basicskill.png',
        manaCost: 0, damage: 92, cooldown: 0,
        frames: ['StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/basicskilleffect.png']
      },
      special: {
        name: 'Lord\'s Cyclone', type: 'Special Skill', desc: 'Summons a towering cyclone to engulf the enemy.',
        icon: 'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/specialskill.png',
        manaCost: 10, damage: 178, cooldown: 3,
        frames: ['StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/specialskilleffect.png']
      },
      ultimate: {
        name: 'Eternal Tempest', type: 'Ultimate Skill', desc: 'Unleashes an unending storm that tears through all defenses.',
        icon: 'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/ultimateskill.png',
        manaCost: 20, damage: 350, cooldown: 6,
        frames: [
          'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/ultimateskill2.png',
          'StoryEnemies/Orion-Wind/FinalBoss_BOREAS, THE TEMPEST LORD/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 9 — BRUTUS'S IRON SIEGE  (Metal enemies)
  // ══════════════════════════════════════════════════════════
  scrap_scuttler: {
    id: 'scrap_scuttler', facesRight: false,
    name: 'Scrap Scuttler', title: 'Iron Pest',
    element: 'Metal', role: 'Monster',
    color: '#aaaaaa', glowColor: 'rgba(170,170,170,0.6)', bgColor: '#111111',
    stats: { hp: 520, atk: 90, def: 80, spd: 88, crit: 10 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/idle.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskill.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskill2.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Scrap Slash', type: 'Basic Skill', desc: 'Slashes with jagged scrap metal blades.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskill.png',
        manaCost: 0, damage: 88, cooldown: 0,
        frames: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskilleffect.png']
      },
      special:  { name: 'Iron Scatter',  type: 'Special Skill',  desc: 'Launches a volley of scrap shards.',         icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy1_Scrap Scuttler/basicskill2.png', manaCost: 10, damage: 132, cooldown: 3, frames: [] },
      ultimate: { name: 'Scrap Explosion',type: 'Ultimate Skill', desc: 'Self-detonates scrap plating for massive damage.', icon: '', manaCost: 20, damage: 248, cooldown: 6, frames: [] }
    }
  },

  ironhide_hound: {
    id: 'ironhide_hound', facesRight: false,
    name: 'Ironhide Hound', title: 'Steel Beast',
    element: 'Metal', role: 'Monster',
    color: '#888888', glowColor: 'rgba(136,136,136,0.6)', bgColor: '#0e0e0e',
    stats: { hp: 650, atk: 108, def: 95, spd: 78, crit: 12 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/idle.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskill.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskill2.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Iron Bite', type: 'Basic Skill', desc: 'Clamps down with steel-reinforced jaws.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskill.png',
        manaCost: 0, damage: 105, cooldown: 0,
        frames: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskilleffect.png']
      },
      special:  { name: 'Steel Charge',  type: 'Special Skill',  desc: 'Charges forward with full metal body weight.', icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy2_Ironhide Hound/basicskill2.png', manaCost: 10, damage: 155, cooldown: 3, frames: [] },
      ultimate: { name: 'Iron Frenzy',   type: 'Ultimate Skill', desc: 'Goes into a metal-armored berserk rampage.',    icon: '', manaCost: 20, damage: 275, cooldown: 6, frames: [] }
    }
  },

  steel_sentinel: {
    id: 'steel_sentinel', facesRight: false,
    name: 'Steel Sentinel', title: 'Iron Guard',
    element: 'Metal', role: 'Monster',
    color: '#999999', glowColor: 'rgba(153,153,153,0.6)', bgColor: '#101010',
    stats: { hp: 780, atk: 115, def: 108, spd: 62, crit: 11 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/idle.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskill.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskill2.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Sentinel Slam', type: 'Basic Skill', desc: 'Brings down a steel gauntlet with crushing force.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskill.png',
        manaCost: 0, damage: 112, cooldown: 0,
        frames: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskilleffect.png']
      },
      special:  { name: 'Iron Bulwark',  type: 'Special Skill',  desc: 'Raises an impenetrable steel barrier.',      icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy3_Steel Sentinel/basicskill2.png', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Steel Cascade', type: 'Ultimate Skill', desc: 'Rains down a cascade of steel strikes.',      icon: '', manaCost: 20, damage: 298, cooldown: 6, frames: [] }
    }
  },

  forged_executioner: {
    id: 'forged_executioner', facesRight: false,
    name: 'Forged Executioner', title: 'Metal Elite',
    element: 'Metal', role: 'Monster',
    color: '#bbbbbb', glowColor: 'rgba(187,187,187,0.7)', bgColor: '#121212',
    stats: { hp: 760, atk: 138, def: 85, spd: 82, crit: 16 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/idle.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/basicskill.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/basicskill.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Execution Strike', type: 'Basic Skill', desc: 'A precisely forged blow meant to end battles.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/basicskill.png',
        manaCost: 0, damage: 134, cooldown: 0,
        frames: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/enemy4_Forged Executioner/basicskilleffect.png']
      },
      special:  { name: 'Iron Verdict',  type: 'Special Skill',  desc: 'Delivers an inescapable verdict of steel.', icon: '', manaCost: 10, damage: 188, cooldown: 3, frames: [] },
      ultimate: { name: 'Final Decree',  type: 'Ultimate Skill', desc: 'The last and most devastating blow ever forged.', icon: '', manaCost: 20, damage: 322, cooldown: 6, frames: [] }
    }
  },

  valkor: {
    id: 'valkor', facesRight: false,
    name: 'Valkor', title: 'The Steel Colossus',
    element: 'Metal', role: 'Boss',
    color: '#cccccc', glowColor: 'rgba(204,204,204,0.9)', bgColor: '#141414',
    stats: { hp: 1050, atk: 122, def: 133, spd: 67, crit: 11 },
    sprites: {
      idle:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/idle.png',
      walk:    'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/idle.png',
      run:     'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/idle.png',
      sprint:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/idle.png',
      attack:  'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/basicskill.png',
      portrait:'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Colossus Crush', type: 'Basic Skill', desc: 'Brings down a colossal iron fist.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/basicskill.png',
        manaCost: 0, damage: 92, cooldown: 0,
        frames: ['https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/basicskilleffect.png']
      },
      special: {
        name: 'Iron Dominion', type: 'Special Skill', desc: 'Commands the iron siege to converge on the enemy.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/specialskill.png',
        manaCost: 10, damage: 160, cooldown: 3,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/specialskill2.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/specialskilleffect.png'
        ]
      },
      ultimate: {
        name: 'Steel Apocalypse', type: 'Ultimate Skill', desc: 'Unleashes the full destructive might of the iron colossus.',
        icon: 'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/ultimateskill.png',
        manaCost: 20, damage: 350, cooldown: 6,
        frames: [
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/ultimateskill2.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/ultimateskill3.png',
          'https://res.cloudinary.com/jtrgd4x8/image/upload/f_auto,q_auto/Brutus-Metal/FinalBoss_VALKOR, THE STEEL COLOSSUS/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 10 — ELYSIA'S CELESTIAL TOWER  (Arcane enemies)
  // ══════════════════════════════════════════════════════════
  astral_sprite: {
    id: 'astral_sprite', facesRight: false,
    name: 'Astral Sprite', title: 'Cosmic Wisp',
    element: 'Arcane', role: 'Monster',
    color: '#cc88ff', glowColor: 'rgba(204,136,255,0.6)', bgColor: '#060014',
    stats: { hp: 520, atk: 105, def: 45, spd: 138, crit: 18 },
    sprites: {
      idle:    'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/idle.png',
      walk:    'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/idle.png',
      run:     'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskill.png',
      sprint:  'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskill2.png',
      attack:  'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskill.png',
      portrait:'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Arcane Bolt', type: 'Basic Skill', desc: 'Fires a bolt of pure arcane energy.',
        icon: 'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskill.png',
        manaCost: 0, damage: 102, cooldown: 0,
        frames: ['StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskilleffect.png']
      },
      special:  { name: 'Star Flare',    type: 'Special Skill',  desc: 'Releases a burst of star energy.',           icon: 'StoryEnemies/Elysia-Arcane/enemy1_Astral Sprite/basicskill2.png', manaCost: 10, damage: 148, cooldown: 3, frames: [] },
      ultimate: { name: 'Cosmic Surge',  type: 'Ultimate Skill', desc: 'Channels the cosmos into a devastating beam.', icon: '', manaCost: 20, damage: 265, cooldown: 6, frames: [] }
    }
  },

  starlight_prowler: {
    id: 'starlight_prowler', facesRight: false,
    name: 'Starlight Prowler', title: 'Arcane Hunter',
    element: 'Arcane', role: 'Monster',
    color: '#aa66ff', glowColor: 'rgba(170,102,255,0.6)', bgColor: '#050012',
    stats: { hp: 650, atk: 118, def: 65, spd: 122, crit: 19 },
    sprites: {
      idle:    'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/idle.png',
      walk:    'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/idle.png',
      run:     'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskill.png',
      sprint:  'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskill2.png',
      attack:  'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskill.png',
      portrait:'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Star Strike', type: 'Basic Skill', desc: 'Attacks with a blade of concentrated starlight.',
        icon: 'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskill.png',
        manaCost: 0, damage: 115, cooldown: 0,
        frames: ['StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskilleffect.png']
      },
      special:  { name: 'Nebula Rush',   type: 'Special Skill',  desc: 'Dashes through leaving a trail of star energy.', icon: 'StoryEnemies/Elysia-Arcane/enemy2_Starlight Prowler/basicskill2.png', manaCost: 10, damage: 165, cooldown: 3, frames: [] },
      ultimate: { name: 'Supernova',     type: 'Ultimate Skill', desc: 'Implodes starlight into a supernova blast.',       icon: '', manaCost: 20, damage: 295, cooldown: 6, frames: [] }
    }
  },

  celestial_guard: {
    id: 'celestial_guard', facesRight: false,
    name: 'Celestial Guard', title: 'Arcane Sentinel',
    element: 'Arcane', role: 'Monster',
    color: '#8844ff', glowColor: 'rgba(136,68,255,0.6)', bgColor: '#04000f',
    stats: { hp: 800, atk: 125, def: 105, spd: 75, crit: 15 },
    sprites: {
      idle:    'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/idle.png',
      walk:    'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/idle.png',
      run:     'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/basicskill.png',
      sprint:  'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/basicskill.png',
      attack:  'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/basicskill.png',
      portrait:'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Celestial Slash', type: 'Basic Skill', desc: 'Strikes with an arcane-forged celestial blade.',
        icon: 'StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/basicskill.png',
        manaCost: 0, damage: 122, cooldown: 0,
        frames: ['StoryEnemies/Elysia-Arcane/enemy3_Celestial Guard/basicskilleffect.png']
      },
      special:  { name: 'Arcane Barrier', type: 'Special Skill',  desc: 'Conjures a barrier of arcane energy.',        icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Star Judgment',  type: 'Ultimate Skill', desc: 'Calls down judgment from the celestial realm.', icon: '', manaCost: 20, damage: 305, cooldown: 6, frames: [] }
    }
  },

  cosmic_phantom: {
    id: 'cosmic_phantom', facesRight: false,
    name: 'Cosmic Phantom', title: 'Arcane Elite',
    element: 'Arcane', role: 'Monster',
    color: '#7722ff', glowColor: 'rgba(119,34,255,0.7)', bgColor: '#040010',
    stats: { hp: 780, atk: 140, def: 72, spd: 128, crit: 22 },
    sprites: {
      idle:    'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/idle.png',
      walk:    'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/idle.png',
      run:     'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskill.png',
      sprint:  'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskill2.png',
      attack:  'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskill.png',
      portrait:'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Void Star', type: 'Basic Skill', desc: 'Strikes from within the cosmos, bypassing defenses.',
        icon: 'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskill.png',
        manaCost: 0, damage: 136, cooldown: 0,
        frames: ['StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskilleffect.png']
      },
      special:  { name: 'Galaxy Rift',    type: 'Special Skill',  desc: 'Tears open a rift in the fabric of space.',    icon: 'StoryEnemies/Elysia-Arcane/enemy4_Cosmic Phantom/basicskill2.png', manaCost: 10, damage: 192, cooldown: 3, frames: [] },
      ultimate: { name: 'Cosmic Erasure', type: 'Ultimate Skill', desc: 'Erases the target from existence momentarily.', icon: '', manaCost: 20, damage: 328, cooldown: 6, frames: [] }
    }
  },

  astralis: {
    id: 'astralis', facesRight: false,
    name: 'Astralis', title: 'The Cosmic Emperor',
    element: 'Arcane', role: 'Boss',
    color: '#ff88ff', glowColor: 'rgba(255,136,255,0.9)', bgColor: '#080018',
    stats: { hp: 900, atk: 155, def: 62, spd: 103, crit: 29 },
    sprites: {
      idle:    'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/idle.png',
      walk:    'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/idle.png',
      run:     'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/idle.png',
      sprint:  'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/idle.png',
      attack:  'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/basicskill.png',
      portrait:'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/battlefield.png']
    },
    skills: {
      basic: {
        name: 'Emperor\'s Wrath', type: 'Basic Skill', desc: 'Delivers a blow carrying the full weight of the cosmos.',
        icon: 'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/basicskill.png',
        manaCost: 0, damage: 102, cooldown: 0,
        frames: ['StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/basicskilleffect.png']
      },
      special: {
        name: 'Cosmic Dominion', type: 'Special Skill', desc: 'Commands the stars to rain down upon the enemy.',
        icon: 'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/specialskill.png',
        manaCost: 10, damage: 195, cooldown: 3,
        frames: [
          'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/specialskill2.png',
          'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/specialskilleffect.png'
        ]
      },
      ultimate: {
        name: 'Big Bang', type: 'Ultimate Skill', desc: 'Recreates the birth of the universe in a single devastating explosion.',
        icon: 'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/ultimateskill.png',
        manaCost: 20, damage: 390, cooldown: 6,
        frames: [
          'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/ultimateskill2.png',
          'StoryEnemies/Elysia-Arcane/FinalBoss_ASTRALIS, THE COSMIC EMPEROR/ultimateskilleffect.png'
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 2 — THE SHATTERED REALM  (Lightning enemies — kept for future chapters)
  // ══════════════════════════════════════════════════════════
  storm_sprite: {
    id: 'storm_sprite', facesRight: true,
    name: 'Storm Sprite', title: 'Thunder Wisp',
    element: 'Lightning', role: 'Monster',
    color: '#ffe600', glowColor: 'rgba(255,230,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 460, atk: 85, def: 35, spd: 120, crit: 14 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Storm Sprite/idle.png',
      walk:   'StoryEnemies/Lightning/Storm Sprite/walk.png',
      run:    'StoryEnemies/Lightning/Storm Sprite/run.png',
      sprint: 'StoryEnemies/Lightning/Storm Sprite/sprint.png',
      attack: 'StoryEnemies/Lightning/Storm Sprite/attack.png',
      portrait: 'StoryEnemies/Lightning/Storm Sprite/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Storm Sprite/background.png']
    },
    skills: {
      basic:    { name: 'Spark Jab',     type: 'Basic Skill',   desc: 'Zaps the enemy with a quick bolt.',         icon: '', manaCost: 0,  damage: 80,  cooldown: 0, frames: [] },
      special:  { name: 'Volt Chain',    type: 'Special Skill', desc: 'Chains lightning between multiple hits.',   icon: '', manaCost: 10, damage: 120, cooldown: 3, frames: [] },
      ultimate: { name: 'Thunder Crash', type: 'Ultimate Skill',desc: 'Summons a massive bolt from above.',        icon: '', manaCost: 20, damage: 220, cooldown: 6, frames: [] }
    }
  },

  thunder_hawk: {
    id: 'thunder_hawk', facesRight: false,
    name: 'Thunder Hawk', title: 'Storm Predator',
    element: 'Lightning', role: 'Monster',
    color: '#ffdd00', glowColor: 'rgba(255,221,0,0.6)', bgColor: '#0d0d00',
    stats: { hp: 580, atk: 110, def: 50, spd: 130, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Thunder Hawk/idle.png',
      walk:   'StoryEnemies/Lightning/Thunder Hawk/walk.png',
      run:    'StoryEnemies/Lightning/Thunder Hawk/run.png',
      sprint: 'StoryEnemies/Lightning/Thunder Hawk/sprint.png',
      attack: 'StoryEnemies/Lightning/Thunder Hawk/attack.png',
      portrait: 'StoryEnemies/Lightning/Thunder Hawk/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Thunder Hawk/background.png']
    },
    skills: {
      basic:    { name: 'Talon Strike',  type: 'Basic Skill',   desc: 'Dives with electrified talons.',            icon: '', manaCost: 0,  damage: 100, cooldown: 0, frames: [] },
      special:  { name: 'Storm Dive',    type: 'Special Skill', desc: 'Plummets from the sky at lightning speed.', icon: '', manaCost: 10, damage: 145, cooldown: 3, frames: [] },
      ultimate: { name: 'Gale Screech',  type: 'Ultimate Skill',desc: 'Unleashes a deafening storm shriek.',       icon: '', manaCost: 20, damage: 250, cooldown: 6, frames: [] }
    }
  },

  volt_hound: {
    id: 'volt_hound', facesRight: true,
    name: 'Volt Hound', title: 'Electric Beast',
    element: 'Lightning', role: 'Monster',
    color: '#ffee44', glowColor: 'rgba(255,238,68,0.6)', bgColor: '#0d0d00',
    stats: { hp: 650, atk: 100, def: 60, spd: 115, crit: 16 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Volt Hound/idle.png',
      walk:   'StoryEnemies/Lightning/Volt Hound/walk.png',
      run:    'StoryEnemies/Lightning/Volt Hound/run.png',
      sprint: 'StoryEnemies/Lightning/Volt Hound/sprint.png',
      attack: 'StoryEnemies/Lightning/Volt Hound/attack.png',
      portrait: 'StoryEnemies/Lightning/Volt Hound/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Volt Hound/background.png']
    },
    skills: {
      basic:    { name: 'Static Bite',   type: 'Basic Skill',   desc: 'Bites and shocks simultaneously.',          icon: '', manaCost: 0,  damage: 95,  cooldown: 0, frames: [] },
      special:  { name: 'Volt Pounce',   type: 'Special Skill', desc: 'Leaps forward in a burst of electricity.',  icon: '', manaCost: 10, damage: 140, cooldown: 3, frames: [] },
      ultimate: { name: 'Thunder Maw',   type: 'Ultimate Skill',desc: 'Opens a magnetic jaw that crackles with power.', icon: '', manaCost: 20, damage: 255, cooldown: 6, frames: [] }
    }
  },

  storm_giant: {
    id: 'storm_giant', facesRight: false,
    name: 'Storm Giant', title: 'Thunder Colossus',
    element: 'Lightning', role: 'Monster',
    color: '#cccc00', glowColor: 'rgba(204,204,0,0.6)', bgColor: '#111100',
    stats: { hp: 900, atk: 120, def: 85, spd: 70, crit: 12 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Storm Giant/idle.png',
      walk:   'StoryEnemies/Lightning/Storm Giant/walk.png',
      run:    'StoryEnemies/Lightning/Storm Giant/run.png',
      sprint: 'StoryEnemies/Lightning/Storm Giant/sprint.png',
      attack: 'StoryEnemies/Lightning/Storm Giant/attack.png',
      portrait: 'StoryEnemies/Lightning/Storm Giant/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Storm Giant/background.png']
    },
    skills: {
      basic:    { name: 'Thunderclap',   type: 'Basic Skill',   desc: 'Claps hands together with thunderous force.', icon: '', manaCost: 0,  damage: 115, cooldown: 0, frames: [] },
      special:  { name: 'Stormfist',     type: 'Special Skill', desc: 'Drives a lightning-coated fist into the ground.', icon: '', manaCost: 10, damage: 165, cooldown: 3, frames: [] },
      ultimate: { name: 'Sky Collapse',  type: 'Ultimate Skill',desc: 'Pulls lightning from the clouds and slams it down.', icon: '', manaCost: 20, damage: 300, cooldown: 6, frames: [] }
    }
  },

  zeus_herald: {
    id: 'zeus_herald', facesRight: true,
    name: 'Zeus Herald', title: 'Chapter 2 Boss',
    element: 'Lightning', role: 'Boss',
    color: '#ffee00', glowColor: 'rgba(255,238,0,0.8)', bgColor: '#1a1a00',
    stats: { hp: 1300, atk: 145, def: 85, spd: 105, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Lightning/Zeus Herald/idle.png',
      walk:   'StoryEnemies/Lightning/Zeus Herald/walk.png',
      run:    'StoryEnemies/Lightning/Zeus Herald/run.png',
      sprint: 'StoryEnemies/Lightning/Zeus Herald/sprint.png',
      attack: 'StoryEnemies/Lightning/Zeus Herald/attack.png',
      portrait: 'StoryEnemies/Lightning/Zeus Herald/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Lightning/Zeus Herald/background.png']
    },
    skills: {
      basic:    { name: 'Bolt of Judgment', type: 'Basic Skill',   desc: 'Hurls a divine thunderbolt.',              icon: '', manaCost: 0,  damage: 140, cooldown: 0, frames: [] },
      special:  { name: 'Storm Domain',     type: 'Special Skill', desc: 'Charges the battlefield with electricity.', icon: '', manaCost: 10, damage: 210, cooldown: 3, frames: [] },
      ultimate: { name: 'Divine Thunder',   type: 'Ultimate Skill',desc: 'Calls down a pillar of divine lightning.',  icon: '', manaCost: 20, damage: 400, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 3 — SHADOWS AND STARS  (Dark / Shadow enemies)
  // ══════════════════════════════════════════════════════════
  shade_wraith: {
    id: 'shade_wraith', facesRight: false,
    name: 'Shade Wraith', title: 'Hollow Spirit',
    element: 'Dark', role: 'Monster',
    color: '#9932cc', glowColor: 'rgba(153,50,204,0.6)', bgColor: '#0a0010',
    stats: { hp: 480, atk: 90, def: 30, spd: 115, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Shade Wraith/idle.png',
      walk:   'StoryEnemies/Shadow/Shade Wraith/walk.png',
      run:    'StoryEnemies/Shadow/Shade Wraith/run.png',
      sprint: 'StoryEnemies/Shadow/Shade Wraith/sprint.png',
      attack: 'StoryEnemies/Shadow/Shade Wraith/attack.png',
      portrait: 'StoryEnemies/Shadow/Shade Wraith/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Shade Wraith/background.png']
    },
    skills: {
      basic:    { name: 'Shadow Touch',  type: 'Basic Skill',   desc: 'Drains life with a ghostly hand.',          icon: '', manaCost: 0,  damage: 85,  cooldown: 0, frames: [] },
      special:  { name: 'Void Slash',    type: 'Special Skill', desc: 'Tears through dimensions in a dark arc.',   icon: '', manaCost: 10, damage: 125, cooldown: 3, frames: [] },
      ultimate: { name: 'Soul Rend',     type: 'Ultimate Skill',desc: 'Rips the soul partially from the body.',    icon: '', manaCost: 20, damage: 230, cooldown: 6, frames: [] }
    }
  },

  dark_stalker: {
    id: 'dark_stalker', facesRight: true,
    name: 'Dark Stalker', title: 'Shadow Hunter',
    element: 'Dark', role: 'Monster',
    color: '#7700bb', glowColor: 'rgba(119,0,187,0.6)', bgColor: '#0a0010',
    stats: { hp: 600, atk: 115, def: 55, spd: 125, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Dark Stalker/idle.png',
      walk:   'StoryEnemies/Shadow/Dark Stalker/walk.png',
      run:    'StoryEnemies/Shadow/Dark Stalker/run.png',
      sprint: 'StoryEnemies/Shadow/Dark Stalker/sprint.png',
      attack: 'StoryEnemies/Shadow/Dark Stalker/attack.png',
      portrait: 'StoryEnemies/Shadow/Dark Stalker/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Dark Stalker/background.png']
    },
    skills: {
      basic:    { name: 'Shadowstep',    type: 'Basic Skill',   desc: 'Teleports behind and strikes.',             icon: '', manaCost: 0,  damage: 105, cooldown: 0, frames: [] },
      special:  { name: 'Umbra Strike',  type: 'Special Skill', desc: 'Materializes from darkness for a crit.',    icon: '', manaCost: 10, damage: 160, cooldown: 3, frames: [] },
      ultimate: { name: 'Dark Pursuit',  type: 'Ultimate Skill',desc: 'Relentlessly slashes from every angle.',    icon: '', manaCost: 20, damage: 270, cooldown: 6, frames: [] }
    }
  },

  void_knight: {
    id: 'void_knight', facesRight: false,
    name: 'Void Knight', title: 'Armor of Darkness',
    element: 'Dark', role: 'Monster',
    color: '#5500aa', glowColor: 'rgba(85,0,170,0.6)', bgColor: '#080018',
    stats: { hp: 800, atk: 110, def: 100, spd: 75, crit: 14 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Void Knight/idle.png',
      walk:   'StoryEnemies/Shadow/Void Knight/walk.png',
      run:    'StoryEnemies/Shadow/Void Knight/run.png',
      sprint: 'StoryEnemies/Shadow/Void Knight/sprint.png',
      attack: 'StoryEnemies/Shadow/Void Knight/attack.png',
      portrait: 'StoryEnemies/Shadow/Void Knight/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Void Knight/background.png']
    },
    skills: {
      basic:    { name: 'Dark Blade',    type: 'Basic Skill',   desc: 'Swings an obsidian sword.',                 icon: '', manaCost: 0,  damage: 105, cooldown: 0, frames: [] },
      special:  { name: 'Shadow Guard',  type: 'Special Skill', desc: 'Raises a void shield, nullifying damage.',  icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Abyss Cleave',  type: 'Ultimate Skill',desc: 'Slashes reality itself with dark energy.',  icon: '', manaCost: 20, damage: 290, cooldown: 6, frames: [] }
    }
  },

  nightmare_beast: {
    id: 'nightmare_beast', facesRight: true,
    name: 'Nightmare Beast', title: 'Fear Incarnate',
    element: 'Dark', role: 'Monster',
    color: '#aa0099', glowColor: 'rgba(170,0,153,0.6)', bgColor: '#100010',
    stats: { hp: 750, atk: 130, def: 70, spd: 105, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Nightmare Beast/idle.png',
      walk:   'StoryEnemies/Shadow/Nightmare Beast/walk.png',
      run:    'StoryEnemies/Shadow/Nightmare Beast/run.png',
      sprint: 'StoryEnemies/Shadow/Nightmare Beast/sprint.png',
      attack: 'StoryEnemies/Shadow/Nightmare Beast/attack.png',
      portrait: 'StoryEnemies/Shadow/Nightmare Beast/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Nightmare Beast/background.png']
    },
    skills: {
      basic:    { name: 'Terror Claw',   type: 'Basic Skill',   desc: 'Rakes with nightmare-infused claws.',       icon: '', manaCost: 0,  damage: 120, cooldown: 0, frames: [] },
      special:  { name: 'Dread Howl',    type: 'Special Skill', desc: 'Paralyzes with a blood-curdling screech.',  icon: '', manaCost: 10, damage: 170, cooldown: 3, frames: [] },
      ultimate: { name: 'Void Ravage',   type: 'Ultimate Skill',desc: 'Tears through dimensions with dark claws.', icon: '', manaCost: 20, damage: 310, cooldown: 6, frames: [] }
    }
  },

  shadow_emperor: {
    id: 'shadow_emperor', facesRight: false,
    name: 'Shadow Emperor', title: 'Chapter 3 Boss',
    element: 'Dark', role: 'Boss',
    color: '#cc00ff', glowColor: 'rgba(204,0,255,0.8)', bgColor: '#130020',
    stats: { hp: 1400, atk: 155, def: 90, spd: 110, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Shadow/Shadow Emperor/idle.png',
      walk:   'StoryEnemies/Shadow/Shadow Emperor/walk.png',
      run:    'StoryEnemies/Shadow/Shadow Emperor/run.png',
      sprint: 'StoryEnemies/Shadow/Shadow Emperor/sprint.png',
      attack: 'StoryEnemies/Shadow/Shadow Emperor/attack.png',
      portrait: 'StoryEnemies/Shadow/Shadow Emperor/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Shadow/Shadow Emperor/background.png']
    },
    skills: {
      basic:    { name: 'Eclipse Strike',  type: 'Basic Skill',   desc: 'Strikes with the power of an eclipse.',    icon: '', manaCost: 0,  damage: 145, cooldown: 0, frames: [] },
      special:  { name: 'Dark Dominion',   type: 'Special Skill', desc: 'Commands all shadows to converge.',        icon: '', manaCost: 10, damage: 220, cooldown: 3, frames: [] },
      ultimate: { name: 'Eternal Darkness',type: 'Ultimate Skill',desc: 'Plunges the world into absolute shadow.',   icon: '', manaCost: 20, damage: 420, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 4 — RISE OF THE IRON LEGION  (Metal enemies)
  // ══════════════════════════════════════════════════════════
  iron_grunt: {
    id: 'iron_grunt', facesRight: true,
    name: 'Iron Grunt', title: 'Steel Soldier',
    element: 'Metal', role: 'Monster',
    color: '#aaaaaa', glowColor: 'rgba(170,170,170,0.5)', bgColor: '#111111',
    stats: { hp: 550, atk: 90, def: 90, spd: 65, crit: 10 },
    sprites: {
      idle:   'StoryEnemies/Metal/Iron Grunt/idle.png',
      walk:   'StoryEnemies/Metal/Iron Grunt/walk.png',
      run:    'StoryEnemies/Metal/Iron Grunt/run.png',
      sprint: 'StoryEnemies/Metal/Iron Grunt/sprint.png',
      attack: 'StoryEnemies/Metal/Iron Grunt/attack.png',
      portrait: 'StoryEnemies/Metal/Iron Grunt/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Iron Grunt/background.png']
    },
    skills: {
      basic:    { name: 'Shield Bash',   type: 'Basic Skill',   desc: 'Rams with an iron shield.',                 icon: '', manaCost: 0,  damage: 85,  cooldown: 0, frames: [] },
      special:  { name: 'Steel Wall',    type: 'Special Skill', desc: 'Raises a steel barrier, halving damage.',   icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Iron Avalanche',type: 'Ultimate Skill',desc: 'Charges forward in full armor.',            icon: '', manaCost: 20, damage: 220, cooldown: 6, frames: [] }
    }
  },

  blade_automaton: {
    id: 'blade_automaton', facesRight: false,
    name: 'Blade Automaton', title: 'War Machine',
    element: 'Metal', role: 'Monster',
    color: '#cc9900', glowColor: 'rgba(204,153,0,0.6)', bgColor: '#111100',
    stats: { hp: 680, atk: 120, def: 80, spd: 80, crit: 13 },
    sprites: {
      idle:   'StoryEnemies/Metal/Blade Automaton/idle.png',
      walk:   'StoryEnemies/Metal/Blade Automaton/walk.png',
      run:    'StoryEnemies/Metal/Blade Automaton/run.png',
      sprint: 'StoryEnemies/Metal/Blade Automaton/sprint.png',
      attack: 'StoryEnemies/Metal/Blade Automaton/attack.png',
      portrait: 'StoryEnemies/Metal/Blade Automaton/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Blade Automaton/background.png']
    },
    skills: {
      basic:    { name: 'Spinning Blades', type: 'Basic Skill',   desc: 'Activates rotating saw arms.',             icon: '', manaCost: 0,  damage: 110, cooldown: 0, frames: [] },
      special:  { name: 'Gear Barrage',    type: 'Special Skill', desc: 'Fires a volley of razor-sharp gears.',     icon: '', manaCost: 10, damage: 155, cooldown: 3, frames: [] },
      ultimate: { name: 'Full Assault',    type: 'Ultimate Skill',desc: 'Overclocks all systems for total destruction.', icon: '', manaCost: 20, damage: 270, cooldown: 6, frames: [] }
    }
  },

  steel_colossus: {
    id: 'steel_colossus', facesRight: true,
    name: 'Steel Colossus', title: 'Iron Titan',
    element: 'Metal', role: 'Monster',
    color: '#bbbbbb', glowColor: 'rgba(187,187,187,0.6)', bgColor: '#111111',
    stats: { hp: 1000, atk: 115, def: 120, spd: 50, crit: 9 },
    sprites: {
      idle:   'StoryEnemies/Metal/Steel Colossus/idle.png',
      walk:   'StoryEnemies/Metal/Steel Colossus/walk.png',
      run:    'StoryEnemies/Metal/Steel Colossus/run.png',
      sprint: 'StoryEnemies/Metal/Steel Colossus/sprint.png',
      attack: 'StoryEnemies/Metal/Steel Colossus/attack.png',
      portrait: 'StoryEnemies/Metal/Steel Colossus/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Steel Colossus/background.png']
    },
    skills: {
      basic:    { name: 'Titan Fist',    type: 'Basic Skill',   desc: 'Crushes with a massive iron fist.',          icon: '', manaCost: 0,  damage: 115, cooldown: 0, frames: [] },
      special:  { name: 'Fortress Mode', type: 'Special Skill', desc: 'Locks down with maximum armor density.',     icon: '', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'Colossus Stomp',type: 'Ultimate Skill',desc: 'Shakes the earth with a single step.',       icon: '', manaCost: 20, damage: 290, cooldown: 6, frames: [] }
    }
  },

  war_commander: {
    id: 'war_commander', facesRight: false,
    name: 'War Commander', title: 'Legion General',
    element: 'Metal', role: 'Monster',
    color: '#dd9900', glowColor: 'rgba(221,153,0,0.6)', bgColor: '#150f00',
    stats: { hp: 850, atk: 135, def: 100, spd: 80, crit: 15 },
    sprites: {
      idle:   'StoryEnemies/Metal/War Commander/idle.png',
      walk:   'StoryEnemies/Metal/War Commander/walk.png',
      run:    'StoryEnemies/Metal/War Commander/run.png',
      sprint: 'StoryEnemies/Metal/War Commander/sprint.png',
      attack: 'StoryEnemies/Metal/War Commander/attack.png',
      portrait: 'StoryEnemies/Metal/War Commander/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/War Commander/background.png']
    },
    skills: {
      basic:    { name: 'War Axe',       type: 'Basic Skill',   desc: 'Cleaves with a massive battle axe.',         icon: '', manaCost: 0,  damage: 125, cooldown: 0, frames: [] },
      special:  { name: 'Rally Charge',  type: 'Special Skill', desc: 'Charges with reinforced momentum.',          icon: '', manaCost: 10, damage: 175, cooldown: 3, frames: [] },
      ultimate: { name: 'Iron Dominance',type: 'Ultimate Skill',desc: 'Unleashes the full might of the Iron Legion.',icon: '', manaCost: 20, damage: 320, cooldown: 6, frames: [] }
    }
  },

  iron_overlord: {
    id: 'iron_overlord', facesRight: true,
    name: 'Iron Overlord', title: 'Chapter 4 Boss',
    element: 'Metal', role: 'Boss',
    color: '#ffbb00', glowColor: 'rgba(255,187,0,0.8)', bgColor: '#1a1000',
    stats: { hp: 1500, atk: 160, def: 130, spd: 75, crit: 18 },
    sprites: {
      idle:   'StoryEnemies/Metal/Iron Overlord/idle.png',
      walk:   'StoryEnemies/Metal/Iron Overlord/walk.png',
      run:    'StoryEnemies/Metal/Iron Overlord/run.png',
      sprint: 'StoryEnemies/Metal/Iron Overlord/sprint.png',
      attack: 'StoryEnemies/Metal/Iron Overlord/attack.png',
      portrait: 'StoryEnemies/Metal/Iron Overlord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Metal/Iron Overlord/background.png']
    },
    skills: {
      basic:    { name: 'Judgment Hammer', type: 'Basic Skill',  desc: 'Brings down a hammer of absolute judgment.',  icon: '', manaCost: 0,  damage: 155, cooldown: 0, frames: [] },
      special:  { name: 'Legion Fortify',  type: 'Special Skill',desc: 'Reinforces iron plating to near-invincibility.',icon:'', manaCost: 10, damage: 0,   cooldown: 3, frames: [] },
      ultimate: { name: 'World Crusher',   type: 'Ultimate Skill',desc: 'Brings the full might of the Iron Legion down.',icon:'', manaCost: 20, damage: 440, cooldown: 6, frames: [] }
    }
  },

  // ══════════════════════════════════════════════════════════
  // CHAPTER 5 — THE FINAL RECKONING  (Mixed / Final Bosses)
  // ══════════════════════════════════════════════════════════
  void_sentinel: {
    id: 'void_sentinel', facesRight: false,
    name: 'Void Sentinel', title: 'Gatekeeper',
    element: 'Dark', role: 'Monster',
    color: '#8800cc', glowColor: 'rgba(136,0,204,0.6)', bgColor: '#0e0018',
    stats: { hp: 700, atk: 125, def: 80, spd: 90, crit: 16 },
    sprites: {
      idle:   'StoryEnemies/Final/Void Sentinel/idle.png',
      walk:   'StoryEnemies/Final/Void Sentinel/walk.png',
      run:    'StoryEnemies/Final/Void Sentinel/run.png',
      sprint: 'StoryEnemies/Final/Void Sentinel/sprint.png',
      attack: 'StoryEnemies/Final/Void Sentinel/attack.png',
      portrait: 'StoryEnemies/Final/Void Sentinel/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Void Sentinel/background.png']
    },
    skills: {
      basic:    { name: 'Void Lance',    type: 'Basic Skill',   desc: 'Hurls a spear of pure void energy.',         icon: '', manaCost: 0,  damage: 120, cooldown: 0, frames: [] },
      special:  { name: 'Gate Seal',     type: 'Special Skill', desc: 'Seals the enemy\'s power temporarily.',      icon: '', manaCost: 10, damage: 160, cooldown: 3, frames: [] },
      ultimate: { name: 'Void Collapse', type: 'Ultimate Skill',desc: 'Implodes a pocket of void energy on the foe.',icon:'', manaCost: 20, damage: 300, cooldown: 6, frames: [] }
    }
  },

  chaos_dragon: {
    id: 'chaos_dragon', facesRight: true,
    name: 'Chaos Dragon', title: 'Harbinger of Ruin',
    element: 'Fire', role: 'Monster',
    color: '#ff2200', glowColor: 'rgba(255,34,0,0.7)', bgColor: '#1a0500',
    stats: { hp: 900, atk: 150, def: 90, spd: 100, crit: 20 },
    sprites: {
      idle:   'StoryEnemies/Final/Chaos Dragon/idle.png',
      walk:   'StoryEnemies/Final/Chaos Dragon/walk.png',
      run:    'StoryEnemies/Final/Chaos Dragon/run.png',
      sprint: 'StoryEnemies/Final/Chaos Dragon/sprint.png',
      attack: 'StoryEnemies/Final/Chaos Dragon/attack.png',
      portrait: 'StoryEnemies/Final/Chaos Dragon/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Chaos Dragon/background.png']
    },
    skills: {
      basic:    { name: 'Dragon Claw',   type: 'Basic Skill',   desc: 'Rakes with massive chaos-touched claws.',    icon: '', manaCost: 0,  damage: 140, cooldown: 0, frames: [] },
      special:  { name: 'Chaos Breath',  type: 'Special Skill', desc: 'Breathes swirling flames of pure entropy.',  icon: '', manaCost: 10, damage: 200, cooldown: 3, frames: [] },
      ultimate: { name: 'Dragon\'s Wrath',type:'Ultimate Skill',desc: 'Unleashes total draconic destruction.',      icon: '', manaCost: 20, damage: 360, cooldown: 6, frames: [] }
    }
  },

  phantom_warlord: {
    id: 'phantom_warlord', facesRight: false,
    name: 'Phantom Warlord', title: 'Fallen Champion',
    element: 'Dark', role: 'Monster',
    color: '#bb44ff', glowColor: 'rgba(187,68,255,0.7)', bgColor: '#100015',
    stats: { hp: 1000, atk: 145, def: 95, spd: 105, crit: 22 },
    sprites: {
      idle:   'StoryEnemies/Final/Phantom Warlord/idle.png',
      walk:   'StoryEnemies/Final/Phantom Warlord/walk.png',
      run:    'StoryEnemies/Final/Phantom Warlord/run.png',
      sprint: 'StoryEnemies/Final/Phantom Warlord/sprint.png',
      attack: 'StoryEnemies/Final/Phantom Warlord/attack.png',
      portrait: 'StoryEnemies/Final/Phantom Warlord/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Phantom Warlord/background.png']
    },
    skills: {
      basic:    { name: 'Phantom Slash', type: 'Basic Skill',   desc: 'A ghostly strike that bypasses defenses.',   icon: '', manaCost: 0,  damage: 135, cooldown: 0, frames: [] },
      special:  { name: 'Spectral Surge',type: 'Special Skill', desc: 'Charges with spectral energy.',              icon: '', manaCost: 10, damage: 195, cooldown: 3, frames: [] },
      ultimate: { name: 'Warlord\'s Rage',type:'Ultimate Skill',desc: 'Unleashes the full fury of a fallen champion.',icon:'', manaCost: 20, damage: 350, cooldown: 6, frames: [] }
    }
  },

  genesis_titan: {
    id: 'genesis_titan', facesRight: true,
    name: 'Genesis Titan', title: 'World Ender',
    element: 'Arcane', role: 'Boss',
    color: '#ff88ff', glowColor: 'rgba(255,136,255,0.8)', bgColor: '#150020',
    stats: { hp: 1600, atk: 165, def: 110, spd: 95, crit: 24 },
    sprites: {
      idle:   'StoryEnemies/Final/Genesis Titan/idle.png',
      walk:   'StoryEnemies/Final/Genesis Titan/walk.png',
      run:    'StoryEnemies/Final/Genesis Titan/run.png',
      sprint: 'StoryEnemies/Final/Genesis Titan/sprint.png',
      attack: 'StoryEnemies/Final/Genesis Titan/attack.png',
      portrait: 'StoryEnemies/Final/Genesis Titan/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Genesis Titan/background.png']
    },
    skills: {
      basic:    { name: 'Cosmic Slam',    type: 'Basic Skill',   desc: 'Crashes down with the weight of the cosmos.', icon:'', manaCost: 0,  damage: 150, cooldown: 0, frames: [] },
      special:  { name: 'Star Collapse',  type: 'Special Skill', desc: 'Implodes a star onto the enemy.',             icon:'', manaCost: 10, damage: 220, cooldown: 3, frames: [] },
      ultimate: { name: 'Genesis Burst',  type: 'Ultimate Skill',desc: 'Detonates primordial energy across reality.',  icon:'', manaCost: 20, damage: 460, cooldown: 6, frames: [] }
    }
  },

  tenfold_sovereign: {
    id: 'tenfold_sovereign', facesRight: false,
    name: 'Tenfold Sovereign', title: 'FINAL BOSS',
    element: 'Arcane', role: 'Final Boss',
    color: '#ffcc00', glowColor: 'rgba(255,204,0,0.9)', bgColor: '#100020',
    stats: { hp: 2000, atk: 180, def: 120, spd: 110, crit: 26 },
    sprites: {
      idle:   'StoryEnemies/Final/Tenfold Sovereign/idle.png',
      walk:   'StoryEnemies/Final/Tenfold Sovereign/walk.png',
      run:    'StoryEnemies/Final/Tenfold Sovereign/run.png',
      sprint: 'StoryEnemies/Final/Tenfold Sovereign/sprint.png',
      attack: 'StoryEnemies/Final/Tenfold Sovereign/attack.png',
      portrait: 'StoryEnemies/Final/Tenfold Sovereign/idle.png',
      lifeBar: '', manaBar: '', namePlate: '',
      backgrounds: ['StoryEnemies/Final/Tenfold Sovereign/background.png']
    },
    skills: {
      basic:    { name: 'Sovereign Strike',   type: 'Basic Skill',   desc: 'An unstoppable blow from the sovereign.',     icon:'', manaCost: 0,  damage: 170, cooldown: 0, frames: [] },
      special:  { name: 'Tenfold Judgement',  type: 'Special Skill', desc: 'Calls down ten simultaneous blasts.',          icon:'', manaCost: 10, damage: 240, cooldown: 3, frames: [] },
      ultimate: { name: 'Absolute Dominion',  type: 'Ultimate Skill',desc: 'The final, world-ending move of the sovereign.',icon:'', manaCost: 20, damage: 500, cooldown: 6, frames: [] }
    }
  },
};

// ── GAME STATE ────────────────────────────────────────────────
const Game = {
  user: null,
  selectedHero: null,
  storyChapter: 1,
  storyStage: 1,
  _readSession() {
    // 1st: try safeLocalStorage (survives MIT App Inventor WebViewer page navigation)
    try {
      const raw = safeLocalStorage.getItem('TENFOLD_SESSION');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },
  _writeSession() {
    try {
      const data = JSON.stringify({user:this.user, selectedHero:this.selectedHero});
      safeLocalStorage.setItem('TENFOLD_SESSION', data);
    } catch (e) {}
  },
  login(data) { this.user = data; this._writeSession(); },
  isAdmin() { return !!(this.user && this.user.isAdmin); },
  logout() { this.user=null; this.selectedHero=null; safeLocalStorage.removeItem('TENFOLD_SESSION'); window.location.href='index.html'; },
  loadUser() {
    if (this.user) return this.user;
    const saved=this._readSession();
    if (saved && saved.user) { this.user=saved.user; this.selectedHero=saved.selectedHero||null; }
    return this.user;
  },
  requireLogin() {
    if (!this.loadUser()) { window.location.href='index.html'; return false; }
    return true;
  },
  selectHero(id) { this.selectedHero=id; this.loadUser(); this._writeSession(); },
  getSelectedHero() {
    if (this.selectedHero) return this.selectedHero;
    const saved=this._readSession();
    if (saved && saved.selectedHero) { this.selectedHero=saved.selectedHero; return this.selectedHero; }
    return null;
  },

  // Fetch the authoritative TotalScore directly from Google Sheets.
  // This prevents a stale local/session score from remaining visible.
  async syncScore() {
    this.loadUser();
    if (!this.user || !this.user.userID) return null;

    try {
      const res = await apiCall({ action: 'getScore', userID: this.user.userID }, 6500);
      if (res && res.success && res.totalScore !== undefined) {
        const score = Math.max(0, parseInt(res.totalScore, 10) || 0);
        this.user.totalScore = score;
        this._writeSession();
        try {
          safeLocalStorage.setItem('tenfold_score_cache_' + this.user.userID, String(score));
          safeLocalStorage.setItem('tenfold_score_cache', String(score));
        } catch (_) {}
        return score;
      }
    } catch (_) {}
    return null;
  }
};

// ── API HELPER ────────────────────────────────────────────────
function apiCall(params, timeoutMs = 6500) {
  return new Promise((resolve) => {
    if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      resolve({ success: false, message: 'API not configured.' });
      return;
    }

    // MIT App Inventor WebViewer can block normal fetch/CORS requests.
    // JSONP uses a normal <script> request and works in WebViewer.
    const callbackName = '__tfl_jsonp_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const url = new URL(API_URL);

    Object.entries(params || {}).forEach(([k, v]) => {
      url.searchParams.append(k, v == null ? '' : String(v));
    });
    url.searchParams.set('callback', callbackName);

    let finished = false;
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
    };
    const finish = (result) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result && typeof result === 'object'
        ? result
        : { success: false, message: 'Invalid server response.' });
    };

    window[callbackName] = finish;
    script.async = true;

    try {
      script.src = url.toString();
    } catch (err) {
      finish({
        success: false,
        message: 'Invalid Apps Script Web App URL.'
      });
      return;
    }
    script.onerror = () => finish({
      success: false,
      message: 'Cannot connect to Google Sheets. Check your Apps Script Web App deployment and internet connection.'
    });

    // Never leave the MIT App Inventor WebViewer waiting forever.
    setTimeout(() => {
      if (!finished) finish({
        success: false,
        timeout: true,
        message: 'Connection timed out. Make sure the Apps Script Web App is deployed as Anyone.'
      });
    }, timeoutMs);

    document.head.appendChild(script);
  });
}

// ── STAT SCALING ──────────────────────────────────────────────
function getScaledStats(heroId, level = 1) {
  const entity = HEROES[heroId] || STORY_ENEMIES[heroId];
  const base = entity.stats;
  const mult = 1 + (level - 1) * 0.08;
  return {
    hp:   Math.floor(base.hp   * mult),
    atk:  Math.floor(base.atk  * mult),
    def:  Math.floor(base.def  * mult),
    spd:  Math.floor(base.spd  * mult),
    crit: Math.min(base.crit + (level - 1), 50)
  };
}

// ── ELEMENT COLOR MAP ─────────────────────────────────────────
const ELEMENT_COLORS = {
  Fire:      '#ff4500',
  Ice:       '#00cfff',
  Lightning: '#ffe600',
  Earth:     '#a0522d',
  Light:     '#c8a8ff',
  Dark:      '#9932cc',
  Water:     '#00bfff',
  Metal:     '#c0c0c0',
  Arcane:    '#ff88ff',
  Wind:      '#88ffcc'
};

// ── ELEMENT ICONS ─────────────────────────────────────────────
const ELEMENT_ICONS = {
  Fire:'🔥', Ice:'❄️', Lightning:'⚡', Earth:'🌍',
  Light:'✨', Dark:'🌑', Water:'💧', Metal:'⚙️',
  Arcane:'🔮', Wind:'🌪️'
};

// ── UTILITY ───────────────────────────────────────────────────
function formatNumber(n) {
  // TotalScore is an exact integer from Google Sheets.
  // NEVER abbreviate 1850 as 1.9K. Every score UI uses this formatter.
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return String(Math.trunc(v));
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Auto-load user on every page
Game.loadUser();