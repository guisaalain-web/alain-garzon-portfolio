(() => {
  // src/engine.js
  var TYPE_ES = { normal: "Normal", fire: "Fuego", water: "Agua", electric: "El\xE9ctrico", grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Ps\xEDquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Drag\xF3n", dark: "Siniestro", steel: "Acero", fairy: "Hada" };
  var CH = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };
  var typeMult = (atk, defTypes) => defTypes.reduce((m, d) => m * (CH[atk]?.[d] ?? 1), 1);
  var ITEM_ALIAS = { focussash: "focus-sash", lifeorb: "life-orb", assaultvest: "assault-vest", sitrusberry: "sitrus-berry", leftovers: "leftovers", expertbelt: "expert-belt", choiceband: "choice-band", choicespecs: "choice-specs", choicescarf: "choice-scarf" };
  var normItem = (s) => ITEM_ALIAS[(s || "").toLowerCase().replace(/[^a-z]/g, "")] || "none";
  var STAGE_KEYS = ["atk", "def", "spa", "spd", "spe", "acc", "eva"];
  var SID = { 2: "atk", 3: "def", 4: "spa", 5: "spd", 6: "spe", 7: "acc", 8: "eva" };
  var STAT_ES = { atk: "el Ataque", def: "la Defensa", spa: "el Ataque Esp.", spd: "la Defensa Esp.", spe: "la Velocidad", acc: "la Precisi\xF3n", eva: "la Evasi\xF3n" };
  var STATUS_ES = { par: "paralizado", slp: "dormido", frz: "congelado", brn: "quemado", psn: "envenenado", tox: "gravemente envenenado" };
  var AIL = { 1: "par", 2: "slp", 3: "frz", 4: "brn", 5: "psn" };
  var STRUGGLE = { id: 0, k: "struggle", n: "Forcejeo", t: "normal", c: 2, p: 50, a: 0, pp: 1, pr: 0, cat: 0, ail: 0, ac: 0, fl: 0, sch: 0, dr: 0, he: 0, cr: 0, h1: 1, h2: 1, tg: 10, sc: [] };
  function makeMon(sp, mv, o = {}) {
    const b = sp.s;
    const hp = sp.id === 292 ? 1 : 2 * b[0] + 162;
    const st = { hp, atk: 2 * b[1] + 57, def: 2 * b[2] + 57, spa: 2 * b[3] + 57, spd: 2 * b[4] + 57, spe: 2 * b[5] + 57 };
    return {
      sp,
      id: sp.id,
      name: sp.n,
      types: sp.t.slice(),
      stats: st,
      maxhp: hp,
      hp,
      status: null,
      tox: 0,
      sleep: 0,
      stage: Object.fromEntries(STAGE_KEYS.map((k) => [k, 0])),
      vol: {},
      ability: o.ability || sp.ab[0] || "",
      item: o.item || "none",
      itemUsed: false,
      moves: (o.moves || []).map((id) => ({ id, pp: mv[id].pp, maxpp: mv[id].pp })),
      fainted: false,
      isBoss: !!o.boss
    };
  }
  var stageMul = (s) => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
  var accMul = (s) => s >= 0 ? (3 + s) / 3 : 3 / (3 - s);
  var Battle = class {
    constructor(MV2, teamA, teamB, rng = Math.random) {
      this.MV = MV2;
      this.rng = rng;
      this.sides = [{ team: teamA, act: 0 }, { team: teamB, act: 0 }];
      this.weather = null;
      this.wturns = 0;
      this.turn = 0;
      this.ev = [];
      this.over = null;
    }
    mon(s) {
      return this.sides[s].team[this.sides[s].act];
    }
    alive(s) {
      return this.sides[s].team.filter((m) => !m.fainted);
    }
    emit(e) {
      this.ev.push(e);
    }
    say(text2) {
      this.emit({ t: "msg", text: text2 });
    }
    take() {
      const e = this.ev;
      this.ev = [];
      return e;
    }
    moveOf(m, i) {
      return m.moves[i] ? this.MV[m.moves[i].id] : STRUGGLE;
    }
    usable(m) {
      return m.moves.map((x, i) => x.pp > 0 && !(m.vol.lock != null && m.vol.lock !== x.id) ? i : -1).filter((i) => i >= 0);
    }
    speed(m) {
      let s = m.stats.spe * stageMul(m.stage.spe);
      if (m.status === "par") s *= 0.5;
      if (m.item === "choice-scarf") s *= 1.5;
      if (this.weather === "rain" && m.ability === "swift-swim") s *= 2;
      if (this.weather === "sun" && m.ability === "chlorophyll") s *= 2;
      if (this.weather === "sand" && m.ability === "sand-rush") s *= 2;
      return s;
    }
    // ---- entrada al campo
    enter(s) {
      const m = this.mon(s), o = this.mon(1 - s);
      this.emit({ t: "enter", side: s, idx: this.sides[s].act, hp: m.hp, max: m.maxhp, status: m.status });
      const w = { drizzle: "rain", drought: "sun", "sand-stream": "sand", "snow-warning": "hail" }[m.ability];
      if (w) {
        this.weather = w;
        this.wturns = 5;
        this.emit({ t: "weather", w });
        this.say({ rain: "\xA1Empez\xF3 a llover!", sun: "\xA1El sol brilla intensamente!", sand: "\xA1Se levant\xF3 una tormenta de arena!", hail: "\xA1Empez\xF3 a nevar!" }[w]);
      }
      if (m.ability === "intimidate" && o && !o.fainted) {
        this.say(`\xA1${m.name} intimida a ${o.name}!`);
        this.boost(1 - s, "atk", -1, true);
      }
      if (m.ability === "pressure") this.say(`${m.name} ejerce presi\xF3n.`);
    }
    switchTo(s, idx) {
      const old = this.mon(s);
      if (old && !old.fainted) {
        old.stage = Object.fromEntries(STAGE_KEYS.map((k) => [k, 0]));
        old.vol = {};
        if (old.status === "tox") old.tox = 0;
        if (old.ability === "regenerator") old.hp = Math.min(old.maxhp, old.hp + Math.floor(old.maxhp / 3));
      }
      this.sides[s].act = idx;
      this.mon(s).vol = {};
      this.say(`${s === 0 ? "\xA1Adelante" : "\xA1Sale"}, ${this.mon(s).name}!`);
      this.enter(s);
    }
    // ---- daño
    calc(att, def, mv, { crit = false, roll = 1, ignoreAbility = false } = {}) {
      let type = mv.t;
      let p = mv.p;
      if (att.ability === "technician" && p <= 60) p *= 1.5;
      if (att.ability === "sheer-force" && (mv.ac || mv.fl || mv.sch) && mv.cat !== 6 && mv.cat !== 7) p *= 1.3;
      const phys = mv.c === 2;
      const aKey = phys ? "atk" : "spa", dKey = phys ? "def" : "spd";
      let as = att.stage[aKey], ds = def.stage[dKey];
      if (crit) {
        as = Math.max(0, as);
        ds = Math.min(0, ds);
      }
      if (def.ability === "unaware") as = 0;
      let A = att.stats[aKey] * stageMul(as), D2 = def.stats[dKey] * stageMul(ds);
      if (phys && (att.ability === "huge-power" || att.ability === "pure-power")) A *= 2;
      if (phys && att.ability === "guts" && att.status) A *= 1.5;
      if (phys && att.ability === "hustle") A *= 1.5;
      if (phys && att.item === "choice-band") A *= 1.5;
      if (!phys && att.item === "choice-specs") A *= 1.5;
      if (!phys && def.item === "assault-vest") D2 *= 1.5;
      if (!phys && this.weather === "sand" && def.types.includes("rock")) D2 *= 1.5;
      if (phys && this.weather === "hail" && def.types.includes("ice")) D2 *= 1.5;
      if (def.ability === "marvel-scale" && def.status && phys) D2 *= 1.5;
      if (def.ability === "fur-coat" && phys) D2 *= 2;
      if (def.ability === "ice-scales" && !phys) D2 *= 2;
      if (!ignoreAbility && (att.ability === "flare-boost" && att.status === "brn" && !phys)) A *= 1.5;
      let d = Math.floor(Math.floor(Math.floor(2 * 100 / 5 + 2) * p * A / D2) / 50) + 2;
      if (this.weather === "sun") d = Math.floor(d * (type === "fire" ? 1.5 : type === "water" ? 0.5 : 1));
      if (this.weather === "rain") d = Math.floor(d * (type === "water" ? 1.5 : type === "fire" ? 0.5 : 1));
      if (crit) d = Math.floor(d * (att.ability === "sniper" ? 2.25 : 1.5));
      d = Math.floor(d * roll);
      const stab = att.types.includes(type);
      if (stab) d = Math.floor(d * (att.ability === "adaptability" ? 2 : 1.5));
      let eff = typeMult(type, def.types);
      d = Math.floor(d * eff);
      if (att.status === "brn" && phys && att.ability !== "guts") d = Math.floor(d / 2);
      if (def.ability === "thick-fat" && (type === "fire" || type === "ice")) d = Math.floor(d / 2);
      if (def.ability === "multiscale" && def.hp === def.maxhp) d = Math.floor(d / 2);
      if ((def.ability === "solid-rock" || def.ability === "filter") && eff > 1) d = Math.floor(d * 0.75);
      if (att.ability === "tinted-lens" && eff < 1) d *= 2;
      if (att.ability === "iron-fist" && /punch|fist/.test(mv.k)) d = Math.floor(d * 1.2);
      if (att.ability === "tough-claws" && phys) d = Math.floor(d * 1.15);
      if (att.item === "life-orb") d = Math.floor(d * 1.3);
      if (att.item === "expert-belt" && eff > 1) d = Math.floor(d * 1.2);
      return { d: eff === 0 ? 0 : Math.max(1, d), eff, stab };
    }
    // estimación para IA (sin azar)
    estimate(att, def, mv) {
      if (mv.c === 1 || !mv.p) return 0;
      const r = this.calc(att, def, mv, { roll: 0.925 });
      return r.d * ((mv.h1 + mv.h2) / 2);
    }
    immune(def, mv) {
      const t = mv.t, a = def.ability;
      if (t === "ground" && a === "levitate" && def.types.indexOf("flying") < 0) return "levitate";
      if (t === "water" && (a === "water-absorb" || a === "storm-drain" || a === "dry-skin")) return "absorb";
      if (t === "electric" && (a === "volt-absorb" || a === "lightning-rod" || a === "motor-drive")) return "absorb";
      if (t === "fire" && a === "flash-fire") return "flash";
      if (t === "grass" && a === "sap-sipper") return "absorb";
      return null;
    }
    boost(s, key, n, silent) {
      const m = this.mon(s);
      if (m.fainted) return false;
      if (n < 0 && ["clear-body", "white-smoke"].includes(m.ability)) {
        if (!silent) this.say(`${m.name} no se ve afectado.`);
        return false;
      }
      if (n < 0 && m.ability === "hyper-cutter" && key === "atk") return false;
      if (m.ability === "contrary") n = -n;
      const cur = m.stage[key];
      if (n > 0 && cur >= 6 || n < 0 && cur <= -6) {
        this.say(`\xA1${STAT_ES[key][0].toUpperCase() + STAT_ES[key].slice(1)} de ${m.name} no puede ${n > 0 ? "subir" : "bajar"} m\xE1s!`);
        return false;
      }
      m.stage[key] = Math.max(-6, Math.min(6, cur + n));
      this.emit({ t: "stage", side: s, key, n });
      this.say(`\xA1${STAT_ES[key][0].toUpperCase() + STAT_ES[key].slice(1)} de ${m.name} ${n > 0 ? n > 1 ? "sube mucho" : "sube" : n < -1 ? "baja mucho" : "baja"}!`);
      if (n < 0 && m.ability === "defiant") this.boost(s, "atk", 2, true);
      if (n < 0 && m.ability === "competitive") this.boost(s, "spa", 2, true);
      return true;
    }
    setStatus(s, st, src) {
      const m = this.mon(s);
      if (m.fainted || m.status) return false;
      if (st === "brn" && m.types.includes("fire")) return false;
      if ((st === "psn" || st === "tox") && (m.types.includes("poison") || m.types.includes("steel"))) return false;
      if (st === "par" && m.types.includes("electric")) return false;
      if (st === "frz" && (m.types.includes("ice") || this.weather === "sun")) return false;
      if (st === "slp" && ["insomnia", "vital-spirit", "sweet-veil"].includes(m.ability)) return false;
      if (["shield-dust"].includes(m.ability) && src === "sec") return false;
      if (m.ability === "natural-cure" && false) return false;
      m.status = st;
      m.tox = 0;
      m.sleep = st === "slp" ? 1 + Math.floor(this.rng() * 3) : 0;
      this.emit({ t: "status", side: s, st });
      this.say(`\xA1${m.name} est\xE1 ${STATUS_ES[st]}!`);
      return true;
    }
    hurt(s, n, why) {
      const m = this.mon(s);
      n = Math.max(0, Math.floor(n));
      if (!n || m.fainted) return 0;
      n = Math.min(n, m.hp);
      m.hp -= n;
      this.emit({ t: "hp", side: s, hp: m.hp, max: m.maxhp, dmg: n, why });
      if (m.hp <= 0) this.faint(s);
      return n;
    }
    heal(s, n) {
      const m = this.mon(s);
      n = Math.min(Math.floor(n), m.maxhp - m.hp);
      if (n <= 0 || m.fainted) return 0;
      m.hp += n;
      this.emit({ t: "hp", side: s, hp: m.hp, max: m.maxhp, heal: n });
      return n;
    }
    faint(s) {
      const m = this.mon(s);
      m.hp = 0;
      m.fainted = true;
      m.status = null;
      this.emit({ t: "faint", side: s });
      this.say(`\xA1${m.name} se debilit\xF3!`);
      if (!this.alive(s).length) this.over = { winner: 1 - s };
    }
    // ---- ejecutar movimiento
    canAct(s) {
      const m = this.mon(s);
      if (m.vol.flinch) {
        m.vol.flinch = false;
        this.say(`\xA1${m.name} se amedrent\xF3!`);
        return false;
      }
      if (m.status === "slp") {
        if (--m.sleep <= 0) {
          m.status = null;
          this.emit({ t: "status", side: s, st: null });
          this.say(`\xA1${m.name} se despert\xF3!`);
        } else {
          this.emit({ t: "cant", side: s });
          this.say(`${m.name} est\xE1 profundamente dormido.`);
          return false;
        }
      }
      if (m.status === "frz") {
        if (this.rng() < 0.2) {
          m.status = null;
          this.emit({ t: "status", side: s, st: null });
          this.say(`\xA1${m.name} se descongel\xF3!`);
        } else {
          this.emit({ t: "cant", side: s });
          this.say(`\xA1${m.name} est\xE1 congelado!`);
          return false;
        }
      }
      if (m.status === "par" && this.rng() < 0.25) {
        this.emit({ t: "cant", side: s });
        this.say(`\xA1${m.name} est\xE1 paralizado! \xA1No se puede mover!`);
        return false;
      }
      if (m.vol.conf) {
        if (--m.vol.conf <= 0) {
          m.vol.conf = 0;
          this.say(`\xA1${m.name} ya no est\xE1 confuso!`);
        } else {
          this.say(`${m.name} est\xE1 confuso.`);
          if (this.rng() < 1 / 3) {
            this.say("\xA1Se hiri\xF3 a s\xED mismo en su confusi\xF3n!");
            const d = Math.floor(Math.floor(Math.floor(42 * 40 * m.stats.atk * stageMul(m.stage.atk) / (m.stats.def * stageMul(m.stage.def))) / 50) + 2);
            this.hurt(s, d, "conf");
            return false;
          }
        }
      }
      return true;
    }
    useMove(s, idx) {
      const u = this.mon(s), t = this.mon(1 - s);
      let mv, slot = u.moves[idx];
      if (slot && slot.pp > 0) {
        mv = this.MV[slot.id];
        slot.pp--;
      } else mv = STRUGGLE;
      if (u.item.startsWith("choice") && slot) u.vol.lock = slot.id;
      if (u.ability === "protean" || u.ability === "libero") {
        if (u.types.join() !== mv.t) {
          u.types = [mv.t];
          this.emit({ t: "types", side: s, types: u.types });
        }
      }
      this.say(`\xA1${u.name} us\xF3 ${mv.n}!`);
      this.emit({ t: "move", side: s, mv });
      const self = mv.tg === 7;
      if (!self && mv.a) {
        let a = mv.a * accMul(Math.max(-6, Math.min(6, u.stage.acc - t.stage.eva)));
        if (u.ability === "compound-eyes") a *= 1.3;
        if (u.ability === "hustle" && mv.c === 2) a *= 0.8;
        if (u.ability === "no-guard" || t.ability === "no-guard") a = 100;
        if (this.weather === "sand" && t.ability === "sand-veil") a *= 0.8;
        if (this.weather === "hail" && t.ability === "snow-cloak") a *= 0.8;
        if (this.rng() * 100 >= a) {
          this.emit({ t: "miss", side: s });
          this.say(`\xA1${u.name} fall\xF3!`);
          return;
        }
      }
      if (mv.c === 1) return this.statusMove(s, mv, u, t, self);
      const im = this.immune(t, mv);
      if (im) {
        this.emit({ t: "block", side: 1 - s });
        if (im === "flash") this.say(`\xA1${t.name} absorbe el fuego!`);
        else if (im === "levitate") this.say(`\xA1${t.name} flota y evita el ataque!`);
        else {
          this.say(`\xA1${t.name} absorbe el ataque!`);
          this.heal(1 - s, t.maxhp / 4);
        }
        return;
      }
      const hits = mv.h2 > mv.h1 ? u.ability === "skill-link" ? mv.h2 : [2, 2, 3, 3, 4, 5][Math.floor(this.rng() * 6)] : mv.h1;
      let total = 0, n = 0, lastEff = 1, crit = false;
      for (let i = 0; i < hits && !t.fainted && !u.fainted; i++) {
        const cs = Math.min(3, mv.cr + (u.item === "scope-lens" ? 1 : 0) + (u.ability === "super-luck" ? 1 : 0));
        const ccheck = [1 / 24, 1 / 8, 1 / 2, 1][cs];
        crit = this.rng() < ccheck;
        const r = this.calc(u, t, mv, { crit, roll: 0.85 + this.rng() * 0.15 });
        lastEff = r.eff;
        if (r.eff === 0) {
          this.emit({ t: "block", side: 1 - s });
          this.say(`No afecta a ${t.name}...`);
          return;
        }
        let d = r.d;
        if (d >= t.hp) {
          if (t.hp === t.maxhp && (t.item === "focus-sash" && !t.itemUsed)) {
            d = t.hp - 1;
            t.itemUsed = true;
            this.say(`\xA1${t.name} aguant\xF3 con la Banda Focus!`);
          } else if (t.hp === t.maxhp && t.ability === "sturdy") {
            d = t.hp - 1;
            this.say(`\xA1${t.name} aguant\xF3 gracias a Robustez!`);
          }
        }
        const done = this.hurt(1 - s, d, { eff: r.eff, crit });
        total += done;
        n++;
        this.emit({ t: "hit", side: 1 - s, eff: r.eff, crit, mv, n: i + 1 });
        if (t.fainted && u.ability === "moxie") this.boost(s, "atk", 1, true);
        if (t.fainted && u.ability === "beast-boost") this.boost(s, "atk", 1, true);
        if (!t.fainted) this.contact(s, mv, u, t);
      }
      if (lastEff > 1) this.say("\xA1Es muy eficaz!");
      else if (lastEff < 1) this.say("No es muy eficaz...");
      if (crit) this.say("\xA1Un golpe cr\xEDtico!");
      if (n > 1) this.say(`\xA1Golpe\xF3 ${n} veces!`);
      if (!t.fainted) {
        if (mv.ail && mv.cat === 4) {
          const ch = mv.ac || 100;
          const st = AIL[mv.ail];
          if (st && this.rng() * 100 < ch * (u.ability === "serene-grace" ? 2 : 1)) this.setStatus(1 - s, mv.k === "toxic" ? "tox" : st, "sec");
          if (mv.ail === 6 && this.rng() * 100 < ch) this.confuse(1 - s);
        }
        if (mv.fl && !t.fainted && this.rng() * 100 < mv.fl && t.ability !== "inner-focus") t.vol.flinch = true;
      }
      if (mv.sc.length && mv.cat >= 6 && (mv.cat === 7 || !t.fainted)) {
        const ch = mv.sch || 100;
        if (this.rng() * 100 < ch * (u.ability === "serene-grace" ? 2 : 1) && !(mv.cat === 6 && t.ability === "shield-dust")) {
          for (const [st, c] of mv.sc) if (SID[st]) this.boost(mv.cat === 7 ? s : 1 - s, SID[st], c);
        }
      }
      if (total > 0 && !u.fainted) {
        if (mv.dr > 0) {
          this.heal(s, Math.max(1, Math.floor(total * mv.dr / 100)));
          this.say(`\xA1${u.name} absorbi\xF3 energ\xEDa!`);
        } else if (mv.dr < 0 && u.ability !== "magic-guard" && u.ability !== "rock-head") {
          this.hurt(s, Math.max(1, Math.floor(total * -mv.dr / 100)), "recoil");
          this.say(`\xA1${u.name} sufre da\xF1o por el retroceso!`);
        }
        if (mv === STRUGGLE) this.hurt(s, u.maxhp / 4, "recoil");
        if (u.item === "life-orb" && u.ability !== "magic-guard" && !u.fainted) this.hurt(s, u.maxhp / 10, "recoil");
      }
      if (t.item === "sitrus-berry" && !t.fainted && !t.itemUsed && t.hp <= t.maxhp / 2) {
        t.itemUsed = true;
        this.say(`\xA1${t.name} comi\xF3 su Baya Zidra!`);
        this.heal(1 - s, t.maxhp / 4);
      }
    }
    contact(s, mv, u, t) {
      if (mv.c !== 2 || u.fainted) return;
      if (t.ability === "rough-skin" || t.ability === "iron-barbs") this.hurt(s, u.maxhp / 8, "ability");
      else if (this.rng() < 0.3) {
        if (t.ability === "static") this.setStatus(s, "par", "sec");
        else if (t.ability === "flame-body") this.setStatus(s, "brn", "sec");
        else if (t.ability === "poison-point") this.setStatus(s, "psn", "sec");
      }
    }
    confuse(s) {
      const m = this.mon(s);
      if (m.vol.conf || m.fainted || m.ability === "own-tempo") return;
      m.vol.conf = 2 + Math.floor(this.rng() * 4);
      this.emit({ t: "conf", side: s });
      this.say(`\xA1${m.name} est\xE1 confuso!`);
    }
    statusMove(s, mv, u, t, self) {
      let did = false;
      if (mv.ail && !self) {
        if (t.status && AIL[mv.ail]) {
          this.say("\xA1Pero fall\xF3!");
          return;
        }
        if (AIL[mv.ail]) {
          const st = mv.k === "toxic" ? "tox" : AIL[mv.ail];
          if (mv.t === "electric" && st === "par" && t.types.includes("ground")) {
            this.emit({ t: "block", side: 1 - s });
            this.say(`No afecta a ${t.name}...`);
            return;
          }
          if (!this.setStatus(1 - s, st)) this.say("\xA1Pero fall\xF3!");
          else did = true;
        } else if (mv.ail === 6) {
          this.confuse(1 - s);
          did = true;
        }
      }
      if (mv.sc.length && mv.cat === 2) {
        const target = self || [5, 11, 13, 14].includes(mv.tg) ? s : 1 - s;
        for (const [st, c] of mv.sc) if (SID[st]) did = this.boost(target, SID[st], c) || did;
      }
      if (mv.cat === 3 && mv.he > 0) {
        if (u.hp === u.maxhp) {
          this.say("\xA1Pero fall\xF3!");
          return;
        }
        this.heal(s, u.maxhp * mv.he / 100);
        this.say(`\xA1${u.name} recuper\xF3 salud!`);
        did = true;
      }
      if (!did && mv.cat !== 3) this.say("\xA1Pero no tuvo efecto!");
    }
    endTurn() {
      const order = [0, 1].sort((a, b) => this.speed(this.mon(b)) - this.speed(this.mon(a)));
      if (this.weather) {
        this.emit({ t: "weatherTick", w: this.weather });
        for (const s of order) {
          const m = this.mon(s);
          if (m.fainted || m.ability === "magic-guard" || m.ability === "overcoat") continue;
          if (this.weather === "sand" && !m.types.some((x) => ["rock", "ground", "steel"].includes(x)) && !["sand-veil", "sand-force", "sand-rush"].includes(m.ability)) {
            this.say(`\xA1La arena golpea a ${m.name}!`);
            this.hurt(s, m.maxhp / 16, "weather");
          }
          if (this.weather === "hail" && !m.types.includes("ice") && !["ice-body", "snow-cloak", "slush-rush"].includes(m.ability)) {
            this.say(`\xA1El granizo golpea a ${m.name}!`);
            this.hurt(s, m.maxhp / 16, "weather");
          }
          if (this.weather === "rain" && m.ability === "rain-dish") this.heal(s, m.maxhp / 16);
          if (this.weather === "hail" && m.ability === "ice-body") this.heal(s, m.maxhp / 16);
          if (this.weather === "sun" && (m.ability === "solar-power" || m.ability === "dry-skin")) this.hurt(s, m.maxhp / 8, "ability");
        }
        if (this.over) return;
        if (--this.wturns <= 0) {
          this.weather = null;
          this.emit({ t: "weather", w: null });
          this.say("El clima volvi\xF3 a la normalidad.");
        }
      }
      for (const s of order) {
        const m = this.mon(s);
        if (m.fainted) continue;
        if (m.item === "leftovers") this.heal(s, m.maxhp / 16);
        if (m.ability === "poison-heal" && (m.status === "psn" || m.status === "tox")) {
          this.heal(s, m.maxhp / 8);
          continue;
        }
        if (m.ability !== "magic-guard") {
          if (m.status === "brn") {
            this.say(`\xA1${m.name} sufre por la quemadura!`);
            this.hurt(s, m.maxhp / 16, "status");
          } else if (m.status === "psn") {
            this.say(`\xA1${m.name} sufre por el veneno!`);
            this.hurt(s, m.maxhp / 8, "status");
          } else if (m.status === "tox") {
            m.tox++;
            this.say(`\xA1${m.name} sufre por el veneno!`);
            this.hurt(s, m.maxhp * Math.min(m.tox, 15) / 16, "status");
          }
        }
        if (!m.fainted && m.ability === "speed-boost") this.boost(s, "spe", 1, true);
      }
    }
    // acciones: {t:'move', i} | {t:'switch', i}
    runTurn(a0, a1) {
      this.turn++;
      const acts = [a0, a1];
      this.emit({ t: "turn", n: this.turn });
      for (const s of [0, 1]) if (acts[s].t === "switch") this.switchTo(s, acts[s].i);
      const movers = [0, 1].filter((s) => acts[s].t === "move");
      const prio = (s) => {
        const m = this.mon(s), mv = this.moveOf(m, acts[s].i);
        return mv.pr + (m.ability === "prankster" && mv.c === 1 ? 1 : 0);
      };
      movers.sort((a, b) => prio(b) - prio(a) || this.speed(this.mon(b)) - this.speed(this.mon(a)) || (this.rng() < 0.5 ? -1 : 1));
      for (const s of movers) {
        if (this.over) break;
        const m = this.mon(s);
        if (m.fainted) continue;
        if (!this.canAct(s)) continue;
        this.useMove(s, acts[s].i);
        if (this.over) break;
      }
      if (!this.over) this.endTurn();
      return this.take();
    }
    needSwitch() {
      return [0, 1].filter((s) => this.mon(s).fainted && this.alive(s).length);
    }
  };

  // src/logic.js
  var ABIL_PRIO = ["huge-power", "pure-power", "adaptability", "protean", "libero", "multiscale", "speed-boost", "moxie", "intimidate", "magic-guard", "technician", "guts", "drought", "drizzle", "sand-stream", "snow-warning", "thick-fat", "sturdy", "levitate", "regenerator", "beast-boost", "contrary", "prankster", "tinted-lens", "solid-rock", "filter", "skill-link", "sheer-force", "iron-fist", "tough-claws", "sniper"];
  function bestAbility(sp) {
    for (const a of ABIL_PRIO) if (sp.ab.includes(a)) return a;
    return sp.ab[0] || "";
  }
  function score(m, sp, phys) {
    if (m.c === 1 || !m.p) return 0;
    let s = m.p * (m.h1 + m.h2) / 2 * ((m.a || 100) / 100);
    if (sp.t.includes(m.t)) s *= 1.5;
    if (m.c === 2 !== phys) s *= 0.55;
    if (m.dr < 0) s *= 0.85;
    if (m.cat === 7 && m.sc.some(([, c]) => c < 0)) s *= 0.75;
    if (m.cr >= 1) s *= 1.15;
    if (m.pp < 8) s *= 0.85;
    return s;
  }
  function autoSet(sp, MV2) {
    const phys = sp.s[1] >= sp.s[3];
    const c = sp.m.map((id) => MV2[id]).filter(Boolean);
    const atk = c.map((m) => [m, score(m, sp, phys)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const chosen = [];
    for (const [m] of atk) {
      if (chosen.length >= 3) break;
      if (!chosen.some((x) => x.t === m.t)) chosen.push(m);
    }
    for (const [m] of atk) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(m)) chosen.push(m);
    }
    const rec = c.filter((m) => m.cat === 3 && m.he >= 50 && m.tg === 7 && m.k !== "rest")[0];
    const setup = c.filter((m) => m.cat === 2 && m.tg === 7 && m.sc.length && m.sc.every(([, v]) => v > 0) && m.sc.some(([s]) => s === (phys ? 2 : 4)) && m.sc.some(([, v]) => v >= 2))[0];
    const slack = sp.s[0] + sp.s[2] + sp.s[4] >= 280;
    let fourth = slack && rec || setup || rec || null;
    if (!fourth) fourth = atk.map((x) => x[0]).find((m) => !chosen.includes(m)) || null;
    if (fourth) chosen.push(fourth);
    while (chosen.length < 4 && chosen.length < c.length) {
      const m = c.find((x) => !chosen.includes(x));
      chosen.push(m);
    }
    for (const id of [34, 129, 70, 33, 98]) if (chosen.length < 4 && MV2[id] && !chosen.includes(MV2[id])) chosen.push(MV2[id]);
    const bulky = sp.s[0] + sp.s[2] + sp.s[4] >= 300;
    const frail = sp.s[0] + sp.s[2] + sp.s[4] < 200;
    return { moves: [...new Set(chosen.filter(Boolean).map((m) => m.id))], ability: bestAbility(sp), item: bulky ? "leftovers" : frail ? "focus-sash" : "life-orb" };
  }
  function buildFromSpec(spec, SP2, MV2, boss) {
    const sp = SP2[spec.sp];
    if (!sp) return null;
    const base = autoSet(sp, MV2);
    let moves = (spec.mv || []).filter((id) => sp.m.includes(id) || MV2[id]);
    for (const id of base.moves) if (moves.length < 4 && !moves.includes(id)) moves.push(id);
    return { sp: spec.sp, moves: moves.slice(0, 4), ability: spec.ability || base.ability, item: spec.item && normItem(spec.item) !== "none" ? normItem(spec.item) : base.item, boss };
  }
  function aiPick(b, s) {
    const me = b.mon(s), foe = b.mon(1 - s);
    const usable = b.usable(me);
    if (!usable.length) return { t: "move", i: 99 };
    const hpFrac = me.hp / me.maxhp;
    let best = -1, bi = usable[0];
    const scored = [];
    for (const i of usable) {
      const m = b.moveOf(me, i);
      let sc = 0;
      if (m.c !== 1) {
        const im = b.immune(foe, m);
        if (im || typeMult(m.t, foe.types) === 0) sc = 0;
        else {
          const dmg = b.estimate(me, foe, m);
          sc = dmg / foe.hp * 100 * ((m.a || 100) / 100);
          if (dmg >= foe.hp) sc = 130 + m.pr * 10;
          else if (m.pr > 0 && dmg >= foe.hp * 0.8) sc += 15;
          if (me.item?.startsWith("choice") && me.vol.lock) sc += 5;
        }
      } else {
        if (m.ail && !foe.status && [1, 2, 3, 4, 5].includes(m.ail) && typeMult(m.t, foe.types) > 0) sc = m.ail === 2 ? 60 : 45;
        else if (m.ail === 6 && !foe.vol.conf) sc = 25;
        if (m.cat === 2 && m.tg === 7 && m.sc.length) {
          const [st, v] = m.sc[0];
          const key = { 2: "atk", 3: "def", 4: "spa", 5: "spd", 6: "spe" }[st];
          if (key && v > 0 && me.stage[key] < 2 && hpFrac > 0.6) sc = 38 - me.stage[key] * 12;
        }
        if (m.cat === 3 && m.he > 0 && hpFrac < 0.5) sc = 95 - hpFrac * 60;
        if (m.cat === 3 && hpFrac > 0.8) sc = 0;
      }
      sc *= 0.92 + Math.random() * 0.16;
      scored.push([i, sc]);
      if (sc > best) {
        best = sc;
        bi = i;
      }
    }
    if (best < 22 && b.alive(s).length > 1 && Math.random() < 0.55) {
      const alt = pickSwitch(b, s, true);
      if (alt >= 0) return { t: "switch", i: alt };
    }
    return { t: "move", i: bi };
  }
  function pickSwitch(b, s, voluntary) {
    const side = b.sides[s], foe = b.mon(1 - s);
    let best = -Infinity, bi = -1;
    side.team.forEach((m, i) => {
      if (m.fainted || voluntary && i === side.act || !voluntary && i === side.act) return;
      let off = 0;
      for (const sl of m.moves) {
        const mv = b.MV[sl.id];
        off = Math.max(off, b.estimate(m, foe, mv) / (foe.fainted ? foe.maxhp : foe.hp));
      }
      let inc = 0;
      for (const t of foe.types) inc = Math.max(inc, typeMult(t, m.types));
      const sc = off * 100 - inc * 35 + m.hp / m.maxhp * 30;
      if (sc > best) {
        best = sc;
        bi = i;
      }
    });
    if (voluntary && bi >= 0) {
      const cur = b.mon(s);
      let inc = 0;
      for (const t of foe.types) inc = Math.max(inc, typeMult(t, cur.types));
      if (best < 40 || inc < 1) return -1;
    }
    return bi;
  }

  // src/gym.js
  var W = 512;
  var H = 384;
  var T = 32;
  var cv = document.getElementById("c");
  var ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  var fit = () => {
    const s = Math.max(1, Math.min(innerWidth / W, innerHeight / H));
    cv.style.width = W * s + "px";
    cv.style.height = H * s + "px";
  };
  addEventListener("resize", fit);
  fit();
  var IMG = {};
  var img = (src) => new Promise((r) => {
    const i = new Image();
    i.onload = () => r(i);
    i.onerror = () => r(null);
    i.src = src;
  });
  var SND = {};
  var music = null;
  var play = (name, loop = true) => {
    if (music) music.pause();
    music = SND[name] || (SND[name] = new Audio(`assets/audio/${name}.ogg`));
    music.loop = loop;
    music.currentTime = 0;
    music.volume = 0.55;
    music.play().catch(() => {
    });
  };
  var sfx = (name) => {
    const a = new Audio(`assets/audio/${name}.ogg`);
    a.volume = 0.7;
    a.play().catch(() => {
    });
    return a;
  };
  var KEYMAP = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    Enter: "ok",
    Space: "ok",
    KeyZ: "ok",
    KeyE: "ok",
    Escape: "back",
    KeyX: "back",
    Backspace: "back"
  };
  var held = /* @__PURE__ */ new Set();
  var queue = [];
  var waiter = null;
  addEventListener("keydown", (e) => {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") held.add("run");
    const a = KEYMAP[e.code];
    if (!a) return;
    e.preventDefault();
    if (!e.repeat) {
      if (waiter) {
        const w = waiter;
        waiter = null;
        w(a);
      } else queue.push(a);
    }
    held.add(a);
  });
  addEventListener("keyup", (e) => {
    const a = KEYMAP[e.code];
    if (a) held.delete(a);
    if (e.code.startsWith("Shift")) held.delete("run");
  });
  cv.addEventListener("pointerdown", () => {
    if (waiter) {
      const w = waiter;
      waiter = null;
      w("ok");
    } else queue.push("ok");
  });
  var nextKey = () => queue.length ? Promise.resolve(queue.shift()) : new Promise((r) => waiter = r);
  var flushKeys = () => {
    queue = [];
  };
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  var FONT = "16px pkmn";
  function text(s, x, y, col = "#383838", sh = "#d0d0c8", size = 16, align = "left") {
    ctx.font = `${size}px pkmn`;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    if (sh) {
      ctx.fillStyle = sh;
      ctx.fillText(s, x + 1, y + 1);
      ctx.fillText(s, x, y + 1);
      ctx.fillText(s, x + 1, y);
    }
    ctx.fillStyle = col;
    ctx.fillText(s, x, y);
    ctx.textAlign = "left";
  }
  function box(x, y, w, h, fill = "#f8f8f8", border = "#506878") {
    ctx.fillStyle = border;
    ctx.fillRect(x + 2, y, w - 4, h);
    ctx.fillRect(x, y + 2, w, h - 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = fill;
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
  }
  function wrap(s, maxW) {
    ctx.font = FONT;
    const out = [];
    let line = "";
    for (const w of s.split(" ")) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = t;
    }
    if (line) out.push(line);
    return out;
  }
  var clean = (s) => (s || "").replace(/<\/?b>/g, "").replace(/\\PN/g, "ALAIN").replace(/Brock/g, "ROLDAN").replace(/\s+/g, " ").trim();
  var dlg = null;
  async function say(s, name, { auto = 0 } = {}) {
    const lines = wrap(s, 440);
    for (let i = 0; i < lines.length; i += 2) {
      dlg = { lines: lines.slice(i, i + 2), shown: 0, name };
      flushKeys();
      const total = dlg.lines.join("").length;
      while (dlg.shown < total) {
        dlg.shown += held.has("ok") ? 4 : 1.2;
        await sleep(16);
        if (queue.length) {
          queue = [];
          dlg.shown = total;
        }
      }
      dlg.shown = total;
      dlg.arrow = true;
      if (auto) {
        await Promise.race([sleep(auto), nextKey()]);
        waiter = null;
        flushKeys();
      } else await nextKey();
      dlg.arrow = false;
    }
    dlg = null;
  }
  function drawDialog(t) {
    if (!dlg) return;
    box(8, 284, 496, 92, "#f8f8f8", "#3a5070");
    let left = dlg.shown;
    dlg.lines.forEach((l, i) => {
      const s = l.slice(0, Math.max(0, Math.floor(left)));
      left -= l.length;
      text(s, 26, 302 + i * 30);
    });
    if (dlg.name) {
      box(8, 252, 140, 36, "#f8f8f8", "#3a5070");
      text(dlg.name, 24, 262, "#d03030");
    }
    if (dlg.arrow && Math.floor(t / 300) % 2) {
      ctx.fillStyle = "#d03030";
      ctx.beginPath();
      ctx.moveTo(478, 352);
      ctx.lineTo(490, 352);
      ctx.lineTo(484, 360);
      ctx.fill();
    }
  }
  var D;
  var MV;
  var SP;
  var MVK;
  var WORLD;
  var ASH = [
    // equipo de Ash para ALAIN
    { sp: 25, mv: ["thunderbolt", "iron-tail", "quick-attack", "electro-ball"], item: "light-ball" },
    { sp: 6, mv: ["flamethrower", "air-slash", "dragon-claw", "focus-blast"] },
    { sp: 658, mv: ["water-shuriken", "dark-pulse", "ice-beam", "aerial-ace"] },
    { sp: 448, mv: ["aura-sphere", "flash-cannon", "dragon-pulse", "extreme-speed"] },
    { sp: 254, mv: ["leaf-blade", "dragon-claw", "earthquake", "x-scissor"] },
    { sp: 149, mv: ["outrage", "extreme-speed", "thunder-punch", "fire-punch"] }
  ];
  var FAMOUS = [
    // Pokémon famosos para el líder ROLDAN
    { sp: 248, mv: ["stone-edge", "crunch", "earthquake", "ice-punch"] },
    { sp: 94, mv: ["shadow-ball", "sludge-bomb", "thunderbolt", "focus-blast"] },
    { sp: 445, mv: ["earthquake", "outrage", "stone-edge", "swords-dance"] },
    { sp: 249, mv: ["aeroblast", "psychic", "ice-beam", "recover"] },
    { sp: 384, mv: ["dragon-ascent", "extreme-speed", "earthquake", "dragon-dance"] },
    { sp: 150, mv: ["psystrike", "shadow-ball", "aura-sphere", "ice-beam"] }
  ];
  var team = (list, boss) => list.map((s) => buildFromSpec({ ...s, mv: s.mv.map((k) => MVK[k]).filter(Boolean) }, SP, MV, boss)).filter(Boolean).map((b) => makeMon(SP[b.sp], MV, b));
  var map;
  var player;
  var npcs;
  var scene = "title";
  var camX = 0;
  var camY = 0;
  var badge = false;
  function setupMap() {
    const m = WORLD.maps["42"];
    map = { w: m.w, h: m.h, g: m.g, ev: m.ev };
    player = { x: 13, y: 43, dir: 3, px: 13 * T, py: 43 * T, moving: false, anim: 0 };
    npcs = [];
    for (const e of m.ev) {
      const pg = e.pg[0];
      if (!pg.c) continue;
      if (pg.c === "brock") npcs.push({ x: e.x, y: e.y, sheet: "roldan", dir: 0, name: "ROLDAN", boss: true });
      else npcs.push({ x: e.x, y: e.y, sheet: pg.c, dir: pg.d === 2 ? 0 : pg.d === 4 ? 1 : pg.d === 6 ? 2 : 3, name: pg.c === "asistente" ? "GU\xCDA" : "CAMPISTA", tx: pg.tx.map(clean).filter(Boolean), pokemon: pg.c === "095" });
    }
  }
  var walkable = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h && ".,v".includes(map.g[y][x]) && !npcs.some((n) => n.x === x && n.y === y);
  var DIRS = { down: [0, 1, 0], left: [-1, 0, 1], right: [1, 0, 2], up: [0, -1, 3] };
  async function overworld() {
    scene = "map";
    play("Gimnasio");
    for (; ; ) {
      await sleep(16);
      if (dlg) continue;
      if (!player.moving) {
        if (queue.includes("ok")) {
          queue = [];
          const [dx2, dy2] = Object.values(DIRS).find((d) => d[2] === player.dir);
          const n = npcs.find((n2) => n2.x === player.x + dx2 && n2.y === player.y + dy2);
          if (n) {
            const r = await talk(n);
            if (r === "battle") return;
          }
          continue;
        }
        queue = queue.filter((k2) => k2 !== "ok");
        const k = ["up", "down", "left", "right"].find((k2) => held.has(k2));
        if (!k) {
          player.anim = 0;
          continue;
        }
        const [dx, dy, dir] = DIRS[k];
        player.dir = dir;
        if (player.y + dy >= 45) {
          await say("\xA1No puedes irte ahora! ROLDAN te est\xE1 esperando al fondo del gimnasio.");
          continue;
        }
        if (!walkable(player.x + dx, player.y + dy)) continue;
        player.moving = true;
        const sx = player.px, sy = player.py, ms = held.has("run") ? 130 : 230, t0 = performance.now();
        player.x += dx;
        player.y += dy;
        for (; ; ) {
          const p = Math.min(1, (performance.now() - t0) / ms);
          player.px = sx + dx * T * p;
          player.py = sy + dy * T * p;
          player.anim += 1;
          if (p >= 1) break;
          await sleep(16);
        }
        player.moving = false;
        player.step = (player.step || 0) + 1;
      }
    }
  }
  async function talk(n) {
    const face = { 0: 3, 3: 0, 1: 2, 2: 1 };
    if (!n.pokemon && !n.boss) n.dir = face[player.dir];
    if (n.pokemon) {
      await say("\xA1ONIX ruge con fuerza! Es el compa\xF1ero de ROLDAN.");
      return;
    }
    if (!n.boss) {
      for (const t of n.tx) await say(t, n.name);
      return;
    }
    n.dir = 0;
    if (badge) {
      await say("Ya tienes la MEDALLA ROCA. \xA1Nadie hab\xEDa vencido antes a mis Pok\xE9mon legendarios!", "ROLDAN");
      return;
    }
    await say("As\xED que t\xFA eres ALAIN... He o\xEDdo que entrenas con los mism\xEDsimos Pok\xE9mon de Ash.", "ROLDAN");
    await say("Soy ROLDAN, L\xCDDER del Gimnasio de Plateada. Mi voluntad es dura como la roca... y mis Pok\xE9mon, leyendas.", "ROLDAN");
    await say("\xA1Todos al nivel 100! Demu\xE9strame si mereces la MEDALLA ROCA.", "ROLDAN");
    return battleFlow().then(() => "battle");
  }
  function drawSheet(sheet, x, y, dir, frame2) {
    const im = IMG[sheet];
    if (!im) return;
    const fw = im.width / 4, fh = im.height / 4;
    ctx.drawImage(im, frame2 % 4 * fw, dir * fh, fw, fh, Math.round(x + T / 2 - fw / 2 - camX), Math.round(y + T - fh - camY + 2), fw, fh);
  }
  function drawMap(t) {
    camX = Math.max(0, Math.min(map.w * T - W, player.px + T / 2 - W / 2));
    camY = Math.max(0, Math.min(map.h * T - H, player.py + T / 2 - H / 2));
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(IMG.low, -Math.round(camX), -Math.round(camY));
    const ents = [
      ...npcs.map((n) => ({ y: n.y * T, d: () => drawSheet(n.boss ? "roldan" : n.sheet, n.x * T, n.y * T, n.dir, n.pokemon ? Math.floor(t / 250) : 0) })),
      { y: player.py, d: () => drawSheet("alain", player.px, player.py, player.dir, player.moving ? Math.floor(player.anim / 7) % 4 : 0) }
    ];
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.d());
    if (IMG.high) ctx.drawImage(IMG.high, -Math.round(camX), -Math.round(camY));
    box(6, 6, 190, 34, "#f8f8f8", "#3a5070");
    text("GIMNASIO PLATEADA", 18, 14, "#383838", "#d0d0c8", 14);
    if (badge) {
      medal(486, 22, 12);
    }
  }
  function medal(x, y, r) {
    ctx.fillStyle = "#585860";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + Math.PI / 8;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.fill();
    ctx.fillStyle = "#a8a8b0";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + Math.PI / 8;
      ctx.lineTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
    }
    ctx.fill();
    ctx.fillStyle = "#e0e0e8";
    ctx.fillRect(x - r * 0.25, y - r * 0.4, r * 0.3, r * 0.3);
  }
  function pic(im, cx, by, h, flip) {
    if (!im) return;
    const s = Math.max(1, Math.round(h / im.height)), w = im.width * s;
    ctx.save();
    if (flip) {
      ctx.translate(cx * 2, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(im, Math.round(cx - w / 2), Math.round(by - im.height * s), w, im.height * s);
    ctx.restore();
  }
  var B = null;
  var spriteOf = (id, back) => IMG[`s${id}${back ? "b" : ""}`];
  function drawMon(side, t) {
    const v = B.mon[side];
    if (!v || !v.vis) return;
    const im = spriteOf(v.m.id, side === 0);
    if (!im) return;
    const fr = Math.max(1, Math.round(im.width / im.height)), f = Math.floor(t / 90) % fr, fw = im.width / fr, sc = side === 0 ? 2 : 1.6;
    const bx = side === 0 ? 128 : 384, by = side === 0 ? 288 : 176, w = fw * sc, h = im.height * sc;
    ctx.save();
    ctx.globalAlpha = v.alpha ?? 1;
    if (v.blink && Math.floor(t / 60) % 2) ctx.globalAlpha = 0;
    ctx.drawImage(im, f * fw, 0, fw, im.height, Math.round(bx - w / 2 + (v.dx || 0)), Math.round(by - h + (v.dy || 0)), Math.round(w), Math.round(h));
    if (v.flash) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = `rgba(255,255,255,${v.flash})`;
      ctx.fillRect(bx - w / 2, by - h, w, h);
    }
    ctx.restore();
  }
  function hpBox(side) {
    const v = B.mon[side];
    if (!v || !v.vis || !v.box) return;
    const m = v.m, me = side === 0;
    const x = me ? 270 : 14, y = me ? 196 : 22, w = 228, h = me ? 70 : 52;
    box(x, y, w, h, "#f8f8e0", "#506050");
    text(m.name.toUpperCase(), x + 14, y + 10);
    text("Nv100", x + w - 14, y + 10, "#383838", "#d0d0c8", 16, "right");
    if (m.status) {
      const c = { par: "#c8a020", slp: "#8890a8", frz: "#60b8d8", brn: "#e05828", psn: "#a050b0", tox: "#a050b0" }[m.status];
      ctx.fillStyle = c;
      ctx.fillRect(x + 14, y + 32, 34, 12);
      text({ par: "PAR", slp: "DOR", frz: "CON", brn: "QUE", psn: "ENV", tox: "ENV" }[m.status], x + 17, y + 31, "#fff", null, 12);
    }
    const hp = v.hp, frac = Math.max(0, hp / m.maxhp), bx = x + 70, by = y + 33;
    ctx.fillStyle = "#404840";
    ctx.fillRect(bx - 22, by - 3, 146, 12);
    text("PS", bx - 20, by - 5, "#f8d030", null, 12);
    ctx.fillStyle = "#506858";
    ctx.fillRect(bx, by - 1, 120, 8);
    ctx.fillStyle = frac > 0.5 ? "#70f8a8" : frac > 0.2 ? "#f8e038" : "#f85838";
    ctx.fillRect(bx, by - 1, Math.round(120 * frac), 8);
    if (me) text(`${Math.max(0, Math.round(hp))}/${m.maxhp}`, x + w - 16, y + 44, "#383838", "#d0d0c8", 16, "right");
    const tm = B.b.sides[side].team;
    tm.forEach((mm, i) => {
      ctx.fillStyle = mm.fainted ? "#888" : "#e03030";
      ctx.beginPath();
      ctx.arc(me ? x + 20 + i * 14 : x + 20 + i * 14, y + h + 8, 5, 0, 7);
      ctx.fill();
    });
  }
  function drawBattle(t) {
    ctx.drawImage(IMG.bg, 0, 0, W, H);
    if (IMG.ebase) ctx.drawImage(IMG.ebase, 384 - IMG.ebase.width / 2, 176 - IMG.ebase.height / 2 - 6);
    if (IMG.pbase) ctx.drawImage(IMG.pbase, 128 - IMG.pbase.width / 2 + (B.pbx || 0), 288 - IMG.pbase.height / 2 - 4);
    for (const [k, side] of [["foeT", 1], ["meT", 0]]) {
      const p = B[k];
      if (p) pic(IMG[p.img], p.x, p.y, side ? 150 : 190);
    }
    drawMon(1, t);
    drawMon(0, t);
    hpBox(1);
    hpBox(0);
    if (B.menu) B.menu(t);
    else if (!dlg) box(8, 284, 496, 92, "#f8f8f8", "#3a5070");
    if (B.fx) B.fx(t);
  }
  var tween = (ms, fn) => new Promise((r) => {
    const t0 = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      fn(p);
      if (p < 1) requestAnimationFrame(step);
      else r();
    };
    step();
  });
  async function chooseMenu(items, cols, draw) {
    let i = 0;
    flushKeys();
    B.menu = (t) => draw(i, t);
    for (; ; ) {
      const k = await nextKey();
      if (k === "ok" && !items[i].off) {
        B.menu = null;
        return i;
      }
      if (k === "back") {
        B.menu = null;
        return -1;
      }
      if (k === "right" && i % cols < cols - 1 && i + 1 < items.length) i++;
      if (k === "left" && i % cols > 0) i--;
      if (k === "down" && i + cols < items.length) i += cols;
      if (k === "up" && i - cols >= 0) i -= cols;
    }
  }
  var cursor = (x, y) => {
    ctx.fillStyle = "#383838";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8, y + 7);
    ctx.lineTo(x, y + 14);
    ctx.fill();
  };
  async function askAction() {
    const me = B.b.mon(0), cmds = [{ n: "LUCHAR" }, { n: "MOCHILA" }, { n: "POK\xE9MON" }, { n: "HUIR" }];
    for (; ; ) {
      const i = await chooseMenu(cmds, 2, (s, t) => {
        box(8, 284, 250, 92, "#f8f8f8", "#3a5070");
        text("\xBFQu\xE9 deber\xEDa", 26, 302);
        text(`hacer ${me.name}?`, 26, 332);
        box(258, 284, 246, 92, "#f8f8f8", "#685870");
        cmds.forEach((c, k) => {
          text(c.n, 296 + k % 2 * 104, 302 + Math.floor(k / 2) * 32);
          if (k === s) cursor(282 + k % 2 * 104, 304 + Math.floor(k / 2) * 32);
        });
      });
      if (i === 0) {
        const mv = await askMove();
        if (mv >= 0) return { t: "move", i: mv };
      }
      if (i === 1) await say("\xA1No es momento de usar objetos!");
      if (i === 2) {
        const p = await askParty(false);
        if (p >= 0) return { t: "switch", i: p };
      }
      if (i === 3) await say("\xA1No puedes huir de un combate de gimnasio!");
    }
  }
  async function askMove() {
    const me = B.b.mon(0), usable = B.b.usable(me);
    if (!usable.length) return 99;
    const items = me.moves.map((x, i) => ({ n: MV[x.id].n, off: !usable.includes(i), x }));
    return chooseMenu(items, 2, (s, t) => {
      box(8, 284, 330, 92, "#f8f8f8", "#3a5070");
      items.forEach((it2, k) => {
        text(it2.n, 34 + k % 2 * 150, 302 + Math.floor(k / 2) * 32, it2.off ? "#a0a0a0" : "#383838", null, 14);
        if (k === s) cursor(20 + k % 2 * 150, 303 + Math.floor(k / 2) * 32);
      });
      const it = items[s], m = MV[it.x.id];
      box(338, 284, 166, 92, "#f8f8f8", "#685870");
      text(`PP ${it.x.pp}/${it.x.maxpp}`, 356, 300);
      text(`TIPO/${(TYPE_ES[m.t] || m.t).toUpperCase()}`, 356, 330, "#383838", "#d0d0c8", 14);
    });
  }
  async function askParty(forced) {
    const tm = B.b.sides[0].team, act = B.b.sides[0].act;
    for (; ; ) {
      const i = await chooseMenu(tm.map((m) => ({ n: m.name, off: false })), 1, (s, t) => {
        ctx.fillStyle = "rgba(40,80,100,.92)";
        ctx.fillRect(0, 0, W, H);
        tm.forEach((m, k) => {
          const y = 14 + k * 46;
          box(24, y, 464, 42, k === s ? "#f8f0c0" : "#f8f8f8", m.fainted ? "#a05050" : "#3a5070");
          const im = spriteOf(m.id, false);
          if (im) {
            const fw = im.width / Math.max(1, Math.round(im.width / im.height));
            ctx.drawImage(im, 0, 0, fw, im.height, 34, y + 3, 36, 36);
          }
          text(m.name, 80, y + 12);
          text(`${m.hp}/${m.maxhp}`, 470, y + 12, "#383838", "#d0d0c8", 16, "right");
          ctx.fillStyle = "#506858";
          ctx.fillRect(250, y + 18, 120, 6);
          ctx.fillStyle = m.hp / m.maxhp > 0.5 ? "#70f8a8" : m.hp / m.maxhp > 0.2 ? "#f8e038" : "#f85838";
          ctx.fillRect(250, y + 18, 120 * m.hp / m.maxhp, 6);
        });
        text(forced ? "Elige un POK\xE9MON." : "Elige un POK\xE9MON. (X: volver)", 28, 296, "#fff", "#203040");
      });
      if (i < 0) {
        if (forced) continue;
        return -1;
      }
      if (tm[i].fainted) {
        await say(`\xA1${tm[i].name} no puede luchar!`);
        continue;
      }
      if (i === act && !forced) {
        await say(`\xA1${tm[i].name} ya est\xE1 luchando!`);
        continue;
      }
      return i;
    }
  }
  async function playEvents(evs) {
    for (const e of evs) {
      const v = B.mon[e.side];
      if (e.t === "msg") await say(e.text, null, { auto: 900 });
      else if (e.t === "enter") {
        const m = B.b.sides[e.side].team[e.idx];
        B.mon[e.side] = { m, hp: m.hp, vis: true, box: true, alpha: 0, flash: 1 };
        const w = B.mon[e.side];
        await tween(350, (p) => {
          w.alpha = p;
          w.flash = 1 - p;
        });
      } else if (e.t === "move") {
        const d = e.side ? -1 : 1;
        await tween(260, (p) => {
          v.dx = Math.sin(p * Math.PI) * 26 * d;
          v.dy = -Math.sin(p * Math.PI) * 10;
        });
        v.dx = v.dy = 0;
      } else if (e.t === "hp") {
        const from = v.hp;
        await tween(Math.min(900, 250 + Math.abs(from - e.hp) * 2), (p) => {
          v.hp = from + (e.hp - from) * p;
        });
      } else if (e.t === "hit") {
        v.blink = true;
        await sleep(e.crit ? 520 : 380);
        v.blink = false;
      } else if (e.t === "faint") {
        await tween(450, (p) => {
          v.dy = p * 60;
          v.alpha = 1 - p;
        });
        v.vis = false;
      } else if (e.t === "stage") {
        v.flash = 0.7;
        await tween(300, (p) => {
          v.flash = 0.7 * (1 - p);
        });
      }
    }
  }
  async function battleFlow() {
    scene = "battle";
    play("CombateLider");
    const b = new Battle(MV, team(ASH, false), team(FAMOUS, true));
    B = { b, mon: [null, null], meT: { img: "alain_back", x: 128, y: 292 }, foeT: { img: "roldan_front", x: 384, y: 180 } };
    await tween(500, (p) => {
      B.meT.x = -80 + 208 * p;
      B.foeT.x = 600 - 216 * p;
    });
    await say("\xA1El L\xCDDER DE GIMNASIO ROLDAN quiere luchar!", null, { auto: 1200 });
    await tween(300, (p) => {
      B.foeT.x = 384 + 200 * p;
    });
    B.foeT = null;
    b.say(`\xA1El L\xCDDER ROLDAN sac\xF3 a ${b.mon(1).name}!`);
    b.enter(1);
    await playEvents(b.take());
    await tween(300, (p) => {
      B.meT.x = 128 - 220 * p;
    });
    B.meT = null;
    b.say(`\xA1Adelante, ${b.mon(0).name}!`);
    b.enter(0);
    await playEvents(b.take());
    while (!b.over) {
      const act = await askAction();
      await playEvents(b.runTurn(act, aiPick(b, 1)));
      while (!b.over) {
        const need = b.needSwitch();
        if (!need.length) break;
        for (const s of need) {
          const i = s === 0 ? await askParty(true) : pickSwitch(b, 1, false);
          b.switchTo(s, i);
        }
        await playEvents(b.take());
      }
    }
    const won = b.over.winner === 0;
    if (won) {
      play("VictoriaEntrenador");
      B.foeT = { img: "roldan_front", x: 600, y: 180 };
      await tween(400, (p) => {
        B.foeT.x = 600 - 216 * p;
      });
      await say("\xA1Has derrotado al L\xCDDER ROLDAN!");
      await say("Imposible... mis leyendas, vencidas por los Pok\xE9mon de Ash. Te la has ganado, ALAIN.", "ROLDAN");
      if (music) music.pause();
      sfx("Medalla");
      badge = true;
      B.fx = (t) => {
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(0, 0, W, 280);
        medal(256, 130, 44 + Math.sin(t / 200) * 2);
      };
      await say("\xA1ALAIN ha conseguido la MEDALLA ROCA!");
      B.fx = null;
    } else {
      await say("\xA1A ALAIN no le quedan POK\xE9MON!");
      await say("ALAIN se desmay\xF3...");
    }
    scene = "end";
    endWon = won;
    flushKeys();
    await nextKey();
    setupMap();
    if (won) badge = true;
    return overworld();
  }
  var endWon = false;
  function drawEnd(t) {
    ctx.fillStyle = endWon ? "#203858" : "#301818";
    ctx.fillRect(0, 0, W, H);
    text(endWon ? "\xA1CAMPE\xD3N DEL GIMNASIO!" : "FIN DEL COMBATE", 256, 70, "#f8f8f8", "#101020", 24, "center");
    if (endWon) medal(256, 170, 50);
    else pic(IMG.roldan_front, 256, 300, 170);
    text(endWon ? "ALAIN venci\xF3 a ROLDAN con el equipo de Ash" : "ROLDAN y sus leyendas siguen invictos", 256, 250, "#f8f8f8", "#101020", 16, "center");
    if (Math.floor(t / 500) % 2) text("Pulsa ENTER para continuar", 256, 320, "#f8d030", "#101020", 16, "center");
  }
  function drawTitle(t) {
    ctx.drawImage(IMG.bg, 0, 0, W, H);
    ctx.fillStyle = "rgba(10,20,40,.55)";
    ctx.fillRect(0, 0, W, H);
    pic(IMG.alain_front, 96, 372, 200);
    pic(IMG.roldan_front, 420, 372, 200, true);
    text("POK\xE9MON", 256, 34, "#f8d030", "#203078", 40, "center");
    text("BILBAO", 256, 82, "#f8f8f8", "#c03030", 48, "center");
    text("GIMNASIO DE CIUDAD PLATEADA", 256, 148, "#f8f8f8", "#101020", 16, "center");
    text("ALAIN  vs  ROLDAN", 256, 178, "#f8a030", "#101020", 20, "center");
    text("Todos los Pok\xE9mon a nivel 100", 256, 210, "#d0d8e8", "#101020", 14, "center");
    if (Math.floor(t / 500) % 2) text("PULSA ENTER", 256, 330, "#f8f8f8", "#101020", 20, "center");
  }
  function frame(t) {
    ctx.imageSmoothingEnabled = false;
    if (scene === "title") drawTitle(t);
    else if (scene === "map") drawMap(t);
    else if (scene === "battle") drawBattle(t);
    else if (scene === "end") drawEnd(t);
    drawDialog(t);
    requestAnimationFrame(frame);
  }
  (async function boot() {
    const f = new FontFace("pkmn", "url(assets/fonts/pkmnem.ttf)");
    await f.load().then((ff) => document.fonts.add(ff)).catch(() => {
    });
    [D, WORLD] = await Promise.all([fetch("assets/data.json").then((r) => r.json()), fetch("assets/world.json").then((r) => r.json())]);
    MV = Object.fromEntries(D.moves.map((m) => [m.id, m]));
    SP = Object.fromEntries(D.species.map((s) => [s.id, s]));
    MVK = Object.fromEntries(D.moves.map((m) => [m.k, m.id]));
    const list = {
      low: "assets/maps/042_low.png",
      high: "assets/maps/042_high.png",
      bg: "assets/bg/battlebgG1.png",
      ebase: "assets/bg/enemybaseG1.png",
      pbase: "assets/bg/playerbaseG1.png",
      alain: "assets/chars/alain.png",
      roldan: "assets/chars/roldan.png",
      alain_back: "assets/chars/alain_back.png",
      alain_front: "assets/chars/alain_front.png",
      roldan_front: "assets/chars/roldan_front.png",
      campista: "assets/chars/campista.png",
      campistaa: "assets/chars/campistaa.png",
      asistente: "assets/chars/asistente.png",
      "095": "assets/chars/095.png"
    };
    for (const s of [...ASH, ...FAMOUS]) {
      const n = String(s.sp).padStart(3, "0");
      list["s" + s.sp] = `assets/sprites/${n}.png`;
      list["s" + s.sp + "b"] = `assets/sprites/${n}b.png`;
    }
    await Promise.all(Object.entries(list).map(async ([k, v]) => {
      IMG[k] = await img(v);
    }));
    setupMap();
    requestAnimationFrame(frame);
    document.getElementById("load").remove();
    await nextKey();
    if (location.search.includes("battle")) {
      setupMap();
      battleFlow();
    } else overworld();
  })();
})();
