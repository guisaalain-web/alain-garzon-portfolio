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

  // src/lumier.js
  var W = 512;
  var H = 384;
  var T = 32;
  var cv = document.getElementById("c");
  var ctx = cv.getContext("2d");
  var touch = matchMedia("(pointer: coarse)").matches;
  var fit = () => {
    const s = Math.min(innerWidth / W, innerHeight * (touch ? 0.6 : 1) / H);
    const k = touch ? s : Math.max(1, s);
    cv.style.width = W * k + "px";
    cv.style.height = H * k + "px";
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
  var music = null;
  var musicName = "";
  var play = (name, loop = true) => {
    if (musicName === name && music && !music.paused) return;
    if (music) music.pause();
    musicName = name;
    music = new Audio(`assets/audio/${name}.ogg`);
    music.loop = loop;
    music.volume = 0.5;
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
    Backspace: "back",
    KeyM: "back"
  };
  var held = /* @__PURE__ */ new Set();
  var queue = [];
  var waiter = null;
  addEventListener("keydown", (e) => {
    if (e.key === "Shift") held.add("run");
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
    if (e.key === "Shift") held.delete("run");
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
  function box(x, y, w, h, fill = "#f8f8f8", border = "#3a5070") {
    ctx.fillStyle = border;
    ctx.fillRect(x + 2, y, w - 4, h);
    ctx.fillRect(x, y + 2, w, h - 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = fill;
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
  }
  function wrap(s, maxW) {
    ctx.font = "16px pkmn";
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
  var clean = (s) => (s || "").replace(/<\/?b>/g, "").replace(/\\PN/g, "ALAIN").replace(/Aspirante/g, "ALAIN").replace(/Brock/g, "ROLDAN").replace(/\\[a-z]\[\d+\]/gi, "").replace(/\s+/g, " ").trim();
  var cursor = (x, y) => {
    ctx.fillStyle = "#383838";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8, y + 7);
    ctx.lineTo(x, y + 14);
    ctx.fill();
  };
  var dlg = null;
  async function say(s, name, { auto = 0 } = {}) {
    const lines = wrap(s, 440);
    for (let i = 0; i < lines.length; i += 2) {
      dlg = { lines: lines.slice(i, i + 2), shown: 0, name };
      flushKeys();
      const total = dlg.lines.join("").length;
      while (dlg.shown < total) {
        dlg.shown += held.has("ok") ? 4 : 1.3;
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
    box(8, 284, 496, 92);
    let left = dlg.shown;
    dlg.lines.forEach((l, i) => {
      text(l.slice(0, Math.max(0, Math.floor(left))), 26, 302 + i * 30);
      left -= l.length;
    });
    if (dlg.name) {
      box(8, 252, 150, 36);
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
  var overlay = null;
  async function menu(items, { x = 300, y = 40, w = 200, title, info } = {}) {
    let i = 0;
    flushKeys();
    const VIS = 8;
    overlay = () => {
      const o = Math.max(0, Math.min(i - VIS + 1, items.length - VIS)), shown = items.slice(o, o + VIS);
      const h = 24 + shown.length * 30;
      box(x, y, w, h);
      shown.forEach((it, j) => {
        const k = j + o;
        text(it.n, x + 30, y + 14 + j * 30, it.off ? "#a0a0a0" : "#383838");
        if (it.r) text(it.r, x + w - 16, y + 14 + j * 30, "#383838", "#d0d0c8", 16, "right");
        if (k === i) cursor(x + 14, y + 16 + j * 30);
      });
      if (items.length > VIS) text(`${i + 1}/${items.length}`, x + w - 12, y + h - 18, "#808080", null, 12, "right");
      if (title) {
        box(x, y - 40, w, 38);
        text(title, x + 16, y - 30, "#d03030");
      }
      if (info) info(i);
    };
    for (; ; ) {
      const k = await nextKey();
      if (k === "up") i = (i + items.length - 1) % items.length;
      if (k === "down") i = (i + 1) % items.length;
      if (k === "ok" && !items[i].off) {
        overlay = null;
        return i;
      }
      if (k === "back") {
        overlay = null;
        return -1;
      }
    }
  }
  var D;
  var MV;
  var SP;
  var MVK;
  var WORLD;
  var ASH = [
    { sp: 145, mv: ["thunderbolt", "drill-peck", "heat-wave", "roost"] },
    // Zapdos en lugar de Pikachu
    { sp: 6, mv: ["flamethrower", "air-slash", "dragon-claw", "focus-blast"] },
    { sp: 658, mv: ["water-shuriken", "dark-pulse", "ice-beam", "aerial-ace"] },
    { sp: 448, mv: ["aura-sphere", "flash-cannon", "dragon-pulse", "extreme-speed"] },
    { sp: 254, mv: ["leaf-blade", "dragon-claw", "earthquake", "x-scissor"] },
    { sp: 149, mv: ["outrage", "extreme-speed", "thunder-punch", "fire-punch"] }
  ];
  var BOSSES = {
    lete: {
      name: "LETE",
      title: "ADMINISTRADOR ROCKET",
      pic: "lete_front",
      money: 6e3,
      bg: "Ciudad",
      music: "BatallaLiga",
      // equipo de Gary en el anime
      team: [
        { sp: 9, mv: ["hydro-pump", "ice-beam", "flash-cannon", "focus-blast"] },
        { sp: 197, mv: ["foul-play", "moonlight", "toxic", "dark-pulse"] },
        { sp: 466, mv: ["thunder-punch", "cross-chop", "ice-punch", "earthquake"] },
        { sp: 59, mv: ["flare-blitz", "extreme-speed", "wild-charge", "crunch"] },
        { sp: 212, mv: ["bullet-punch", "x-scissor", "swords-dance", "aerial-ace"] },
        { sp: 34, mv: ["earthquake", "sludge-wave", "ice-beam", "thunderbolt"] }
      ]
    },
    giovanni: {
      name: "GIOVANNI",
      title: "JEFE DEL TEAM ROCKET",
      pic: "giovanni_front",
      money: 15e3,
      bg: "Bosque",
      music: "CombateGiovanni",
      team: [
        { sp: 53, mv: ["night-slash", "play-rough", "u-turn", "fake-out"] },
        { sp: 34, mv: ["earthquake", "sludge-wave", "ice-beam", "thunderbolt"] },
        { sp: 464, mv: ["stone-edge", "earthquake", "megahorn", "ice-punch"] },
        { sp: 31, mv: ["earth-power", "sludge-wave", "ice-beam", "superpower"] },
        { sp: 51, mv: ["earthquake", "stone-edge", "sucker-punch", "night-slash"] },
        { sp: 115, mv: ["return", "earthquake", "sucker-punch", "power-up-punch"] }
      ]
    },
    unai: {
      name: "UNAI",
      title: "DOMADRAGONES",
      pic: "unai_front",
      money: 5e3,
      bg: "Interior",
      music: "BatallaLiga",
      team: [
        { sp: 373, mv: ["outrage", "earthquake", "fire-blast", "dragon-dance"] },
        { sp: 612, mv: ["outrage", "earthquake", "poison-jab", "dragon-dance"] },
        { sp: 149, mv: ["dragon-claw", "extreme-speed", "fire-punch", "roost"] },
        { sp: 445, mv: ["earthquake", "outrage", "stone-edge", "swords-dance"] },
        { sp: 230, mv: ["hydro-pump", "draco-meteor", "ice-beam", "rain-dance"] },
        { sp: 330, mv: ["earthquake", "dragon-claw", "u-turn", "fire-punch"] }
      ]
    },
    roldan: {
      name: "ROLDAN",
      title: "L\xCDDER DE GIMNASIO",
      pic: "roldan_front",
      money: 1e4,
      bg: "G1",
      music: "CombateLider",
      team: [
        { sp: 248, mv: ["stone-edge", "crunch", "earthquake", "ice-punch"] },
        { sp: 384, mv: ["dragon-ascent", "extreme-speed", "earthquake", "dragon-dance"] },
        { sp: 150, mv: ["psystrike", "shadow-ball", "aura-sphere", "ice-beam"] },
        { sp: 249, mv: ["aeroblast", "psychic", "ice-beam", "recover"] },
        { sp: 94, mv: ["shadow-ball", "sludge-bomb", "thunderbolt", "focus-blast"] },
        { sp: 143, mv: ["body-slam", "earthquake", "crunch", "rest"] }
      ]
    }
  };
  var JOKIN = [3, 9, 65, 68, 94, 130, 131, 143, 196, 197, 212, 248, 257, 260, 282, 376, 392, 445, 468, 700];
  var MAXIT = 3;
  var ITEMS = {
    pocion: { n: "Poci\xF3n", p: 300, d: "Restaura 60 PS a un Pok\xE9mon.", heal: 60 },
    superpocion: { n: "Superpoci\xF3n", p: 700, d: "Restaura 120 PS.", heal: 120 },
    hiperpocion: { n: "Hiperpoci\xF3n", p: 1200, d: "Restaura 200 PS.", heal: 200 },
    maxpocion: { n: "Poci\xF3n M\xE1xima", p: 2500, d: "Restaura todos los PS.", heal: 9999 },
    revivir: { n: "Revivir", p: 1500, d: "Reanima a un Pok\xE9mon debilitado con la mitad de PS.", revive: 0.5 },
    restaurar: { n: "Restaurar Todo", p: 3e3, d: "Todos los PS y cura el estado.", heal: 9999, cure: true },
    pastel: { n: "Pastel Bilba\xEDno", p: 6e3, d: "\xA1ESPECIAL de la tienda! Cura y reanima a TODO el equipo.", team: true }
  };
  var team = (list, boss) => list.map((s) => {
    const b = buildFromSpec({ ...s, mv: (s.mv || []).map((k) => MVK[k]).filter(Boolean) }, SP, MV, boss);
    if (!b) return null;
    const m = makeMon(SP[b.sp], MV, b);
    m.src = s;
    return m;
  }).filter(Boolean);
  var SAVE = "pokemonlumier.save.v2";
  var G;
  function newGame() {
    return { map: 9, x: 24, y: 46, dir: 0, party: team(ASH, false), money: 8e3, bag: { pocion: 3, revivir: 1, restaurar: 3 }, flags: {}, time: 0 };
  }
  function saveGame() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({ ...G, party: G.party.map((m) => ({ src: m.src, hp: m.hp, status: m.status, fainted: m.fainted, pp: m.moves.map((x) => x.pp) })) }));
    } catch {
    }
  }
  function loadGame() {
    const g = newGame();
    try {
      const s = JSON.parse(localStorage.getItem(SAVE));
      if (!s) return g;
      Object.assign(g, { ...s, party: s.party.every((p) => p.src) ? team(s.party.map((p) => p.src)) : g.party });
      s.party.forEach((p, i) => {
        const m = g.party[i];
        if (!m) return;
        m.hp = p.hp;
        m.status = p.status;
        m.fainted = p.fainted;
        p.pp.forEach((v, k) => m.moves[k] && (m.moves[k].pp = v));
      });
    } catch {
    }
    for (const k in g.bag) g.bag[k] = Math.min(MAXIT, g.bag[k]);
    return g;
  }
  var healAll = () => G.party.forEach((m) => {
    m.hp = m.maxhp;
    m.status = null;
    m.tox = 0;
    m.sleep = 0;
    m.fainted = false;
    m.moves.forEach((x) => x.pp = x.maxpp);
  });
  var map;
  var npcs;
  var scene = "intro";
  var camX = 0;
  var camY = 0;
  var moving = false;
  var pxy = [0, 0];
  var anim = 0;
  function nearest(m, x, y, avoid = []) {
    for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const X = x + dx, Y = y + dy;
      if (".,v".includes(m.g[Y]?.[X] ?? "#") && !avoid.some(([a, b]) => a === X && b === Y)) return [X, Y];
    }
    return [x, y];
  }
  function loadMap(id, x, y, dir, fix) {
    const m = WORLD.maps[id];
    if (fix) [x, y] = nearest(m, x, y);
    map = { id, ...m };
    G.map = id;
    G.x = x;
    G.y = y;
    if (dir != null) G.dir = dir;
    pxy = [x * T, y * T];
    mapBanner = { n: m.name, t: performance.now() };
    npcs = [];
    for (const e of m.ev) {
      const pg = e.pg[0], sz = /size\((\d+),(\d+)\)/.exec(e.n), key = `${id}:${e.id}`;
      const n = {
        id: e.id,
        key,
        x: e.x,
        y: e.y,
        w: sz ? +sz[1] : 1,
        h: sz ? +sz[2] : 1,
        sheet: pg.c,
        dir: { 2: 0, 4: 1, 6: 2, 8: 3 }[pg.d] ?? 0,
        frame: pg.p || 0,
        tx: pg.tx.map(clean).filter(Boolean),
        tr: pg.tr[0],
        trig: pg.t,
        thr: pg.thr,
        name: ""
      };
      if (pg.c === "brock2" || id === 9 && e.id === 26) continue;
      if (pg.c === "brock") Object.assign(n, { sheet: "rival", boss: "roldan", name: "ROLDAN" });
      if (pg.c === "cerebrito" && id === 37) Object.assign(n, { boss: "unai", name: "UNAI" });
      if (pg.c === "enfermera") Object.assign(n, { nurse: true, name: "ENFERMERA" });
      if (pg.c === "tendero") Object.assign(n, { shop: true, name: "TENDERO" });
      if (pg.c === "objeto") {
        if (G.flags["item:" + key]) continue;
        n.item = true;
      }
      if (/^\d{3}$/.test(pg.c)) n.mon = +pg.c;
      if (pg.c === "251" && (!G.flags.roldan || G.flags.celebi || npcs.some((o) => o.mon === 251))) continue;
      if (/^rocket/.test(pg.c) && !n.tx.length) n.tx = ["\xA1Este museo tiene f\xF3siles valios\xEDsimos! ...\xA1Ejem! Digo... \xA1qu\xE9 bonito todo!"];
      if (!pg.c && !n.tr) continue;
      npcs.push(n);
    }
    if (id === 36) {
      const [jx, jy] = nearest(m, 5, 9);
      npcs.push({ id: "jokin", key: "36:jokin", x: jx, y: jy, w: 1, h: 1, sheet: "oak", dir: 0, tx: [], jokin: true, name: "JOKIN" });
    }
    play(m.bgm || "CiudadVerde");
    saveGame();
  }
  var tileOf = (x, y) => map.g[y]?.[x] ?? "#";
  function overCounter(dx, dy) {
    for (let k = 2; k <= 4; k++) {
      if (tileOf(G.x + (k - 1) * dx, G.y + (k - 1) * dy) !== "#") return null;
      const n = solidNpc(G.x + k * dx, G.y + k * dy);
      if (n) return n.nurse || n.shop || n.jokin ? n : null;
    }
    return null;
  }
  var solidNpc = (x, y) => npcs.find((n) => n.sheet && !n.thr && x >= n.x && x < n.x + n.w && y >= n.y && y < n.y + n.h);
  var warpAt = (x, y) => npcs.find((n) => n.tr && x >= n.x && x < n.x + n.w && y >= n.y && y < n.y + n.h);
  var DIRS = { down: [0, 1, 0], left: [-1, 0, 1], right: [1, 0, 2], up: [0, -1, 3] };
  async function warp(n) {
    const t = n.tr;
    if (!WORLD.maps[t.map]) {
      await say("Esa ruta todav\xEDa no est\xE1 abierta. \xA1Primero explora Ciudad Plateada!");
      return false;
    }
    await tween(200, (p) => fade = p);
    loadMap(t.map, t.x, t.y, { 2: 0, 4: 1, 6: 2, 8: 3 }[t.dir] ?? G.dir);
    await tween(200, (p) => fade = 1 - p);
    fade = 0;
    return true;
  }
  var fade = 0;
  async function overworld() {
    scene = "map";
    for (; ; ) {
      await sleep(16);
      G.time += 16;
      if (dlg || overlay) continue;
      if (moving) continue;
      if (queue.includes("back")) {
        queue = [];
        await pauseMenu();
        continue;
      }
      if (queue.includes("ok")) {
        queue = [];
        const [dx2, dy2] = Object.values(DIRS).find((d) => d[2] === G.dir);
        const n = solidNpc(G.x + dx2, G.y + dy2) || npcs.find((n2) => n2.item && n2.x === G.x + dx2 && n2.y === G.y + dy2) || overCounter(dx2, dy2);
        if (n) await interact(n);
        continue;
      }
      queue = [];
      const k = ["up", "down", "left", "right"].find((k2) => held.has(k2));
      if (!k) {
        anim = 0;
        continue;
      }
      const [dx, dy, dir] = DIRS[k];
      G.dir = dir;
      const nx = G.x + dx, ny = G.y + dy;
      const w = warpAt(nx, ny);
      if (!w && (!".,v".includes(tileOf(nx, ny)) || solidNpc(nx, ny) || npcs.some((n) => n.item && n.x === nx && n.y === ny))) continue;
      moving = true;
      const sx = pxy[0], sy = pxy[1], ms = held.has("run") ? 130 : 220, t0 = performance.now();
      G.x = nx;
      G.y = ny;
      for (; ; ) {
        const p = Math.min(1, (performance.now() - t0) / ms);
        pxy = [sx + dx * T * p, sy + dy * T * p];
        anim++;
        if (p >= 1) break;
        await sleep(16);
      }
      moving = false;
      if (w) {
        if (!await warp(w)) {
          G.x -= dx;
          G.y -= dy;
          pxy = [G.x * T, G.y * T];
        } else await afterWarp();
        continue;
      }
    }
  }
  async function interact(n) {
    const face = { 0: 3, 3: 0, 1: 2, 2: 1 };
    if (!n.mon && !n.item) n.dir = face[G.dir];
    if (n.item) {
      const pool = ["pocion", "superpocion", "hiperpocion", "revivir", "restaurar"];
      const it = pool[(n.x * 7 + n.y * 3) % pool.length];
      if ((G.bag[it] || 0) >= MAXIT) {
        await say(`Hay ${ITEMS[it].n} aqu\xED, pero ya llevas ${MAXIT}.`);
        return;
      }
      G.bag[it] = (G.bag[it] || 0) + 1;
      G.flags["item:" + n.key] = 1;
      npcs.splice(npcs.indexOf(n), 1);
      sfx("Medalla").volume = 0.3;
      await say(`\xA1ALAIN encontr\xF3 ${ITEMS[it].n}!`);
      saveGame();
      return;
    }
    if (n.mon) {
      const sp = SP[n.mon];
      await say(n.mon === 251 ? "Celebi te observa en silencio... y desaparece entre los \xE1rboles por un instante." : `\xA1${sp ? sp.n : "El Pok\xE9mon"}! Parece muy contento.`);
      return;
    }
    if (n.nurse) {
      await say("\xA1Hola! Bienvenido al Centro Pok\xE9mon. \xBFQuieres que cure a tus Pok\xE9mon?", "ENFERMERA");
      if (await menu([{ n: "S\xCD" }, { n: "NO" }], { x: 380, y: 170, w: 120 }) === 0) {
        if (music) music.pause();
        sfx("Pokemon Healing");
        healAll();
        await sleep(1800);
        play(map.bgm);
        await say("\xA1Tus Pok\xE9mon est\xE1n como nuevos! \xA1Vuelve cuando quieras!", "ENFERMERA");
        saveGame();
      }
      return;
    }
    if (n.shop) return shop();
    if (n.jokin) return jokin();
    if (n.boss) return bossTalk(n);
    if (n.tx.length) for (const t of n.tx) await say(t);
    else await say("...");
  }
  async function ambush(id) {
    const sheet = { lete: "lete", giovanni: "giovanni" }[id], free = (X, Y) => ".,v".includes(tileOf(X, Y)) && !(X === G.x && Y === Y0 && 0) && !solidNpc(X, Y) && !warpAt(X, Y), Y0 = G.y;
    const [x, y] = [[G.x, G.y - 1], [G.x, G.y + 1], [G.x - 1, G.y], [G.x + 1, G.y]].find(([X, Y]) => free(X, Y)) || nearest(map, G.x + 1, G.y, [[G.x, G.y]]);
    const n = { id, key: "9:" + id, x, y, w: 1, h: 1, sheet, dir: x > G.x ? 1 : x < G.x ? 2 : y > G.y ? 3 : 0, tx: [], boss: id, name: BOSSES[id].name };
    G.dir = x > G.x ? 2 : x < G.x ? 1 : y > G.y ? 0 : 3;
    npcs.push(n);
    excl = { x: n.x, y: n.y, t: performance.now() };
    const crew = [];
    if (id === "lete") for (const [sh, ox] of [["rocketo", -1], ["rocketa", 1]]) {
      const [cx, cy] = spot(n.x + ox, n.y);
      const g = { id: sh, key: "9:" + sh, x: cx, y: cy, w: 1, h: 1, sheet: sh, dir: 0, tx: [], name: "" };
      faceTo(g);
      npcs.push(g);
      crew.push(g);
    }
    await sleep(600);
    if (crew.length) await say("\xA1Prep\xE1rate para los problemas! \xA1Y m\xE1s vale que temas!", "SOLDADOS ROCKET");
    await bossTalk(n);
    if (G.flags[id] && npcs.includes(n)) {
      if (id === "lete") await runOff([n, ...crew], 0, 1);
      else npcs.splice(npcs.indexOf(n), 1);
    }
  }
  async function afterWarp() {
    if (map.id === 9 && G.flags.roldan && !G.flags.lete) await ambush("lete");
    if (map.id === 178 && G.flags.lete && !G.flags.giovanni) await celebiEvent();
  }
  async function celebiEvent() {
    const cel = npcs.find((n) => n.mon === 251);
    if (!cel) return;
    const [gx, gy] = nearest(map, cel.x, cel.y + 2, [[cel.x, cel.y], [G.x, G.y]]);
    const gio = { id: "giovanni", key: "178:giovanni", x: gx, y: gy, w: 1, h: 1, sheet: "giovanni", dir: 3, tx: [], boss: "giovanni", name: "GIOVANNI" };
    npcs.push(gio);
    play("CombateGiovanni");
    await sleep(300);
    const from = [...pxy], to = [cel.x * T, (cel.y + 1) * T];
    await tween(1200, (p) => {
      camFocus = [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p];
    });
    await say("Por fin te encuentro, Celebi... el Pok\xE9mon que viaja a trav\xE9s del tiempo.", "GIOVANNI");
    await say("Con tu poder, el Team Rocket dominar\xE1 el pasado y el futuro. \xA1Vas a venir conmigo!", "GIOVANNI");
    await say("\xA1Ce... CELEBI!", "CELEBI");
    gio.dir = 0;
    excl = { x: gio.x, y: gio.y, t: performance.now() };
    await sleep(700);
    const [px, py] = nearest(map, gio.x, gio.y + 2, [[gio.x, gio.y], [cel.x, cel.y]]), sp = [...pxy];
    G.dir = 3;
    moving = true;
    await tween(900, (p) => {
      pxy = [sp[0] + (px * T - sp[0]) * p, sp[1] + (py * T - sp[1]) * p];
      anim++;
      camFocus = null;
    });
    moving = false;
    G.x = px;
    G.y = py;
    await bossTalk(gio);
    if (!G.flags.giovanni) return;
    const lance = { id: "lance", key: "178:lance", x: 16, y: 28, w: 1, h: 1, sheet: "lance", dir: 3, tx: [], name: "LANCE" };
    npcs.push(lance);
    await say("\xA1ALTO AH\xCD, GIOVANNI!", "LANCE");
    const [lx, ly] = spot(gio.x + 1, gio.y + 1);
    await walkTo(lance, lx, ly, 90);
    lance.dir = gio.x < lance.x ? 1 : gio.x > lance.x ? 2 : 3;
    gio.dir = gio.x < lance.x ? 2 : gio.x > lance.x ? 1 : 0;
    await say("Soy LANCE, de la Liga Pok\xE9mon. GIOVANNI, quedas detenido por intentar capturar a Celebi.", "LANCE");
    await say("\xA1Maldici\xF3n! \xA1Esto no quedar\xE1 as\xED!", "GIOVANNI");
    faceTo(lance);
    await say("Gracias, ALAIN. Sin ti, el Team Rocket habr\xEDa controlado el tiempo. Me lo llevo a la c\xE1rcel.", "LANCE");
    await runOff([gio, lance], 0, 1, 14);
    play(map.bgm);
    await say("Celebi revolotea a tu alrededor... \xA1Parece que quiere que lo atrapes!");
    if (await menu([{ n: "LANZAR POK\xE9 BALL" }, { n: "DEJARLO LIBRE" }], { x: 270, y: 160, w: 230 }) === 0) {
      const a = [G.x * T + 16, G.y * T], b = [cel.x * T + 16, cel.y * T + 8];
      const ball = (x, y) => {
        const X = Math.round(x - camX), Y = Math.round(y - camY);
        ctx.fillStyle = "#202020";
        ctx.beginPath();
        ctx.arc(X, Y, 8, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#e03030";
        ctx.beginPath();
        ctx.arc(X, Y, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = "#f8f8f8";
        ctx.beginPath();
        ctx.arc(X, Y, 7, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#202020";
        ctx.fillRect(X - 7, Y - 1, 14, 2);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(X, Y, 2.5, 0, 7);
        ctx.fill();
      };
      let bp = a;
      mapFx = () => ball(...bp);
      await tween(600, (p2) => {
        bp = [a[0] + (b[0] - a[0]) * p2, a[1] + (b[1] - a[1]) * p2 - Math.sin(p2 * Math.PI) * 50];
      });
      cel.hide = true;
      for (let i = 0; i < 3; i++) {
        await tween(380, (p2) => {
          bp = [b[0] + Math.sin(p2 * Math.PI * 2) * 5, b[1]];
        });
        await sleep(250);
      }
      sfx("Medalla").volume = 0.4;
      await say("\xA1Ya est\xE1! \xA1Celebi ha sido atrapado!");
      mapFx = null;
      let p;
      do
        p = await partyMenu("\xBFQu\xE9 Pok\xE9mon deja su sitio a Celebi?", true);
      while (p < 0);
      const old = G.party[p].name;
      G.party[p] = team([{ sp: 251, mv: ["psychic", "leaf-storm", "earth-power", "recover"] }])[0];
      G.flags.celebi = 1;
      npcs.splice(npcs.indexOf(cel), 1);
      await say(`\xA1Celebi se ha unido a tu equipo! ${old} se va a descansar con JOKIN.`);
      saveGame();
      return;
    }
    await say("Celebi da una vuelta en el aire y se esconde entre los \xE1rboles. Seguir\xE1 en el Claro cuando vuelvas.");
  }
  var excl = null;
  async function walkTo(n, tx, ty, ms = 120, follow = false) {
    const ok = (X, Y) => X === tx && Y === ty || (".,v".includes(tileOf(X, Y)) || warpAt(X, Y)) && !(X === G.x && Y === G.y) && !npcs.some((o) => o !== n && o.sheet && !o.hide && o.x === X && o.y === Y);
    const prev = /* @__PURE__ */ new Map([[n.x + "," + n.y, null]]), q = [[n.x, n.y]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) break;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const k = x + dx + "," + (y + dy);
        if (!prev.has(k) && ok(x + dx, y + dy)) {
          prev.set(k, [x, y]);
          q.push([x + dx, y + dy]);
        }
      }
    }
    const path = [];
    let c = [tx, ty];
    if (!prev.has(c.join(","))) return;
    while (c) {
      path.unshift(c);
      c = prev.get(c.join(","));
    }
    n.walk = true;
    for (const [x, y] of path.slice(1)) {
      const sx = n.x * T, sy = n.y * T;
      n.dir = y > n.y ? 0 : y < n.y ? 3 : x < n.x ? 1 : 2;
      await tween(ms, (p) => {
        n.px = sx + (x * T - sx) * p;
        n.py = sy + (y * T - sy) * p;
        if (follow) camFocus = [n.px, n.py];
      });
      n.x = x;
      n.y = y;
    }
    n.walk = false;
    n.px = n.py = void 0;
  }
  async function runOff(list, dx, dy, steps = 8) {
    list.forEach((n) => {
      n.walk = true;
      n.dir = dy > 0 ? 0 : dy < 0 ? 3 : dx < 0 ? 1 : 2;
      n.sx = n.x * T;
      n.sy = n.y * T;
    });
    await tween(steps * 75, (p) => list.forEach((n) => {
      n.px = n.sx + dx * steps * T * p;
      n.py = n.sy + dy * steps * T * p;
    }));
    list.forEach((n) => npcs.includes(n) && npcs.splice(npcs.indexOf(n), 1));
  }
  var faceTo = (n) => {
    n.dir = G.y > n.y ? 0 : G.y < n.y ? 3 : G.x < n.x ? 1 : 2;
  };
  var spot = (x, y, avoid = []) => nearest(map, x, y, [[G.x, G.y], ...avoid, ...npcs.filter((o) => o.sheet).map((o) => [o.x, o.y])]);
  async function mistyEvent() {
    const n = { id: "misty", key: "42:misty", x: 13, y: 44, w: 1, h: 1, sheet: "misty", dir: 3, tx: [], name: "MISTY" };
    npcs.push(n);
    excl = { x: 13, y: 44, t: performance.now() };
    camFocus = [13 * T, 44 * T];
    await sleep(900);
    const [mx, my] = spot(G.x, G.y + 1);
    await walkTo(n, mx, my, 95, true);
    camFocus = null;
    faceTo(n);
    G.dir = n.y > G.y ? 0 : n.y < G.y ? 3 : n.x > G.x ? 2 : 1;
    excl = { x: G.x, y: G.y, t: performance.now() };
    await sleep(600);
    await say("\xA1ALAIN! \xA1Por fin te encuentro! Soy MISTY, l\xEDder del gimnasio de Ciudad Celeste.", "MISTY");
    await say("Ven\xEDa a ver a ROLDAN y he o\xEDdo GRITOS en el Claro Secreto... \xA1justo donde vive Celebi!", "MISTY");
    await say("Toma, ll\xE9vate esto: mi Starmie de nivel 100. Te ayudar\xE1 contra el Team Rocket.", "MISTY");
    if (await menu([{ n: "ACEPTAR STARMIE" }, { n: "NO, GRACIAS" }], { x: 270, y: 160, w: 230 }) === 0) {
      const p = await partyMenu("\xBFQu\xE9 Pok\xE9mon deja su sitio a Starmie?", true);
      if (p >= 0) {
        const old = G.party[p].name;
        G.party[p] = team([{ sp: 121, mv: ["hydro-pump", "psychic", "thunderbolt", "ice-beam"] }])[0];
        sfx("Medalla").volume = 0.3;
        await say(`\xA1ALAIN recibi\xF3 a Starmie! ${old} se queda con JOKIN en el Centro Pok\xE9mon.`);
      }
    }
    G.flags.misty = 1;
    await say("Pasa antes por el Centro Pok\xE9mon a curar a tu equipo... \xA1y corre al Claro Secreto, al noroeste! \xA1Salva a Celebi!", "MISTY");
    await walkTo(n, 13, 44, 80);
    npcs.splice(npcs.indexOf(n), 1);
    saveGame();
  }
  async function jokin() {
    await say("\xA1Hola, ALAIN! Soy el profesor JOKIN, aunque todos me llaman Don Prodigio.", "JOKIN");
    await say("En mi laboratorio tengo Pok\xE9mon de nivel 100. Si quieres, cambio uno de tu equipo por uno de los m\xEDos.", "JOKIN");
    for (; ; ) {
      if (await menu([{ n: "CAMBIAR" }, { n: "NO, GRACIAS" }], { x: 330, y: 160, w: 170 }) !== 0) break;
      const p = await partyMenu("\xBFQu\xE9 Pok\xE9mon quieres cambiar?", true);
      if (p < 0) continue;
      const opts = JOKIN.filter((id) => !G.party.some((m) => m.id === id));
      const i = await menu(opts.map((id) => ({ n: SP[id].n })), { x: 290, y: 50, w: 210, title: "LABORATORIO", info: (k) => {
        const im = IMG["s" + opts[k]];
        if (im) {
          const fw = im.width / Math.max(1, Math.round(im.width / im.height));
          box(20, 60, 200, 200);
          ctx.drawImage(im, 0, 0, fw, im.height, 40, 80, 160, 160);
        }
      } });
      if (i < 0) continue;
      const old = G.party[p].name, nw = team([{ sp: opts[i] }])[0];
      G.party[p] = nw;
      await say(`\xA1${old} se queda con JOKIN y ${nw.name} se une a tu equipo!`, "JOKIN");
      saveGame();
    }
    await say("\xA1Vuelve cuando quieras probar otros Pok\xE9mon!", "JOKIN");
  }
  async function shop() {
    await say("\xA1Bienvenido a la tienda de Plateada! Hoy tenemos un ESPECIAL: el Pastel Bilba\xEDno.", "TENDERO");
    const keys = Object.keys(ITEMS);
    for (; ; ) {
      const i = await menu(keys.map((k) => ({ n: ITEMS[k].n, r: ITEMS[k].p + "\u20BD" })), {
        x: 230,
        y: 50,
        w: 270,
        title: `Dinero: ${G.money}\u20BD`,
        info: (i2) => {
          box(8, 284, 496, 92);
          wrap(ITEMS[keys[i2]].d, 440).slice(0, 2).forEach((l, k) => text(l, 26, 302 + k * 30));
        }
      });
      if (i < 0) break;
      const it = ITEMS[keys[i]];
      if ((G.bag[keys[i]] || 0) >= MAXIT) {
        await say(`Ya llevas ${MAXIT} de ${it.n}. \xA1No caben m\xE1s en la mochila!`, "TENDERO");
        continue;
      }
      if (G.money < it.p) {
        await say("Lo siento, no te llega el dinero.", "TENDERO");
        continue;
      }
      G.money -= it.p;
      G.bag[keys[i]] = (G.bag[keys[i]] || 0) + 1;
      await say(`Aqu\xED tienes: ${it.n}. \xA1Gracias!`, "TENDERO");
      saveGame();
    }
    await say("\xA1Vuelve pronto!", "TENDERO");
  }
  function useItem(k, m) {
    const it = ITEMS[k];
    if (it.team) {
      G.party.forEach((x) => {
        x.fainted = false;
        x.hp = x.maxhp;
        x.status = null;
      });
      return "\xA1Todo el equipo se ha recuperado por completo!";
    }
    if (it.revive) {
      if (!m.fainted) return null;
      m.fainted = false;
      m.hp = Math.floor(m.maxhp * it.revive);
      return `\xA1${m.name} se ha reanimado!`;
    }
    if (m.fainted || m.hp >= m.maxhp && !(it.cure && m.status)) return null;
    const before = m.hp;
    m.hp = Math.min(m.maxhp, m.hp + it.heal);
    if (it.cure) m.status = null;
    return `${m.name} recuper\xF3 ${m.hp - before} PS.`;
  }
  async function bagMenu(inBattle) {
    const keys = () => Object.keys(G.bag).filter((k) => G.bag[k] > 0);
    for (; ; ) {
      const ks = keys();
      if (!ks.length) {
        await say("La MOCHILA est\xE1 vac\xEDa.");
        return null;
      }
      const i = await menu(ks.map((k2) => ({ n: ITEMS[k2].n, r: "\xD7" + G.bag[k2] })), { x: 230, y: 50, w: 270, title: "MOCHILA", info: (i2) => {
        box(8, 284, 496, 92);
        wrap(ITEMS[ks[i2]].d, 440).slice(0, 2).forEach((l, k2) => text(l, 26, 302 + k2 * 30));
      } });
      if (i < 0) return null;
      const k = ks[i];
      let msg;
      if (ITEMS[k].team) msg = useItem(k);
      else {
        const p = await partyMenu("\xBFEn qu\xE9 Pok\xE9mon?", true);
        if (p < 0) continue;
        msg = useItem(k, G.party[p]);
      }
      if (!msg) {
        await say("No tendr\xEDa ning\xFAn efecto.");
        continue;
      }
      G.bag[k]--;
      await say(msg);
      saveGame();
      return k;
    }
  }
  async function partyMenu(title, allowFainted) {
    let i = 0;
    flushKeys();
    for (; ; ) {
      overlay = () => {
        ctx.fillStyle = "rgba(40,80,100,.94)";
        ctx.fillRect(0, 0, W, H);
        G.party.forEach((m, k2) => {
          const y = 14 + k2 * 46;
          box(24, y, 464, 42, k2 === i ? "#f8f0c0" : "#f8f8f8", m.fainted ? "#a05050" : "#3a5070");
          const im = IMG["s" + m.id];
          if (im) {
            const fw = im.width / Math.max(1, Math.round(im.width / im.height));
            ctx.drawImage(im, 0, 0, fw, im.height, 34, y + 3, 36, 36);
          }
          text(m.name, 80, y + 12);
          text(`${m.hp}/${m.maxhp}`, 470, y + 12, "#383838", "#d0d0c8", 16, "right");
          ctx.fillStyle = "#506858";
          ctx.fillRect(250, y + 18, 120, 6);
          const f = m.hp / m.maxhp;
          ctx.fillStyle = f > 0.5 ? "#70f8a8" : f > 0.2 ? "#f8e038" : "#f85838";
          ctx.fillRect(250, y + 18, 120 * f, 6);
        });
        text(title, 28, 296, "#fff", "#203040");
      };
      const k = await nextKey();
      if (k === "up") i = (i + 5) % 6;
      if (k === "down") i = (i + 1) % 6;
      if (k === "back") {
        overlay = null;
        return -1;
      }
      if (k === "ok") {
        overlay = null;
        return i;
      }
    }
  }
  async function pauseMenu() {
    for (; ; ) {
      const i = await menu([{ n: "POK\xE9MON" }, { n: "MOCHILA" }, { n: "GUARDAR" }, { n: "CERRAR" }], { x: 340, y: 50, w: 160, title: `${G.money}\u20BD` });
      if (i === 0) await partyMenu("Tu equipo \xB7 X para volver", true);
      else if (i === 1) await bagMenu(false);
      else if (i === 2) {
        saveGame();
        await say("\xA1Partida guardada!");
      } else return;
    }
  }
  async function bossTalk(n) {
    const id = n.boss, bs = BOSSES[id], won = G.flags[id];
    const lines = {
      lete: won ? ["Ya te he dicho todo lo que s\xE9... \xA1d\xE9jame en paz!"] : ["Jejeje... as\xED que has vencido a ROLDAN. El jefe no estar\xE1 contento.", "Soy LETE, ADMINISTRADOR del Team Rocket. \xA1Esa MEDALLA ROCA ahora es nuestra!"],
      giovanni: won ? ["..."] : ["\xBFT\xFA otra vez? El chico que venci\xF3 a ROLDAN...", "Soy GIOVANNI, jefe del Team Rocket. \xA1Nadie se interpone entre Celebi y yo!"],
      unai: won ? ["Sigo repasando mis gu\xEDas... la pr\xF3xima vez mis dragones no fallar\xE1n."] : ["\xA1Eh! Soy UNAI. Me paso el d\xEDa estudiando gu\xEDas Pok\xE9mon detr\xE1s de estas gafas.", "Y lo que m\xE1s estudio son los DRAGONES. \xBFTe atreves con ellos?"],
      roldan: won ? ["Ya tienes la MEDALLA ROCA. \xA1Vuelve cuando quieras la revancha!"] : ["As\xED que t\xFA eres ALAIN... dicen que entrenas con los Pok\xE9mon de Ash.", "Soy ROLDAN, L\xCDDER del Gimnasio de Plateada. Mis tres Pok\xE9mon son leyendas, \xA1todos al nivel 100!"]
    }[id];
    for (const l of lines) await say(l, bs.name);
    if (won && await menu([{ n: "REVANCHA" }, { n: "NO" }], { x: 360, y: 170, w: 140 }) !== 0) return;
    if (!G.party.some((m) => !m.fainted)) {
      await say("\xA1Tus Pok\xE9mon est\xE1n debilitados! C\xFAralos antes en el Centro Pok\xE9mon.");
      return;
    }
    const res = await battle(id);
    if (res === "won") {
      if (!G.flags[id]) {
        G.money += bs.money;
        await say(`\xA1ALAIN gan\xF3 ${bs.money}\u20BD!`);
      }
      G.flags[id] = 1;
      if (id === "lete") {
        await say("\xA1Vale, vale! \xA1Hablar\xE9! GIOVANNI est\xE1 en el Claro Secreto, al noroeste de la ciudad...", "LETE");
        await say("\xA1Quiere capturar a Celebi para controlar el tiempo! ...\xA1Uy! No le digas que te lo he contado.", "LETE");
        await say("\xA1Retirada! \xA1Nos vemos de nuevo, frijolito!", "LETE");
      }
      if (id === "giovanni") await say("Hmph... Esto no acaba aqu\xED, ALAIN. El Team Rocket volver\xE1.", "GIOVANNI");
      if (id === "unai") await say("Incre\xEDble... has dominado a mis dragones. Toma, te lo has ganado.", "UNAI");
      if (id === "roldan") {
        G.flags.medal = 1;
        play(map.bgm);
        if (!G.flags.misty) await mistyEvent();
      }
    } else {
      await say("ALAIN corre al Centro Pok\xE9mon...");
      G.money = Math.floor(G.money / 2);
      healAll();
      loadMap(36, 10, 9, 0, true);
    }
    play(map.bgm);
    saveGame();
  }
  var B = null;
  var spriteOf = (id, back) => IMG[`s${id}${back ? "b" : ""}`];
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
    ctx.restore();
  }
  function hpBox(side) {
    const v = B.mon[side];
    if (!v || !v.vis) return;
    const m = v.m, me = side === 0;
    const x = me ? 270 : 14, y = me ? 196 : 22, w = 228, h = me ? 70 : 52;
    box(x, y, w, h, "#f8f8e0", "#506050");
    text(m.name.toUpperCase(), x + 14, y + 10);
    text("Nv100", x + w - 14, y + 10, "#383838", "#d0d0c8", 16, "right");
    if (m.status) {
      ctx.fillStyle = { par: "#c8a020", slp: "#8890a8", frz: "#60b8d8", brn: "#e05828", psn: "#a050b0", tox: "#a050b0" }[m.status];
      ctx.fillRect(x + 14, y + 32, 34, 12);
      text({ par: "PAR", slp: "DOR", frz: "CON", brn: "QUE", psn: "ENV", tox: "ENV" }[m.status], x + 17, y + 31, "#fff", null, 12);
    }
    const frac = Math.max(0, v.hp / m.maxhp), bx = x + 70, by = y + 33;
    ctx.fillStyle = "#404840";
    ctx.fillRect(bx - 22, by - 3, 146, 12);
    text("PS", bx - 20, by - 5, "#f8d030", null, 12);
    ctx.fillStyle = "#506858";
    ctx.fillRect(bx, by - 1, 120, 8);
    ctx.fillStyle = frac > 0.5 ? "#70f8a8" : frac > 0.2 ? "#f8e038" : "#f85838";
    ctx.fillRect(bx, by - 1, Math.round(120 * frac), 8);
    if (me) text(`${Math.max(0, Math.round(v.hp))}/${m.maxhp}`, x + w - 16, y + 44, "#383838", "#d0d0c8", 16, "right");
    B.b.sides[side].team.forEach((mm, i) => {
      ctx.fillStyle = mm.fainted ? "#888" : "#e03030";
      ctx.beginPath();
      ctx.arc(x + 20 + i * 14, y + h + 8, 5, 0, 7);
      ctx.fill();
    });
  }
  function drawBattle(t) {
    const bg = B.bg;
    ctx.drawImage(IMG["bg" + bg] || IMG.bgG1, 0, 0, W, H);
    const eb = IMG["eb" + bg], pb = IMG["pb" + bg];
    if (eb) ctx.drawImage(eb, 384 - eb.width / 2, 176 - eb.height / 2 - 6);
    if (pb) ctx.drawImage(pb, 128 - pb.width / 2, 288 - pb.height / 2 - 4);
    for (const [k, side] of [["foeT", 1], ["meT", 0]]) {
      const p = B[k];
      if (p) pic(IMG[p.img], p.x, p.y, side ? 150 : 190);
    }
    drawMon(1, t);
    drawMon(0, t);
    hpBox(1);
    hpBox(0);
    if (B.menu) B.menu(t);
    else if (!dlg) box(8, 284, 496, 92);
    if (B.fx) B.fx(t);
  }
  async function chooseGrid(items, cols, draw) {
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
  async function askAction() {
    const me = B.b.mon(0), cmds = [{ n: "LUCHAR" }, { n: "MOCHILA" }, { n: "POK\xE9MON" }, { n: "HUIR" }];
    for (; ; ) {
      const i = await chooseGrid(cmds, 2, (s) => {
        box(8, 284, 250, 92);
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
      if (i === 1) {
        const used = await bagMenu(true);
        if (used) {
          const v = B.mon[0];
          v.hp = v.m.hp;
          return { t: "item" };
        }
      }
      if (i === 2) {
        const p = await askParty(false);
        if (p >= 0) return { t: "switch", i: p };
      }
      if (i === 3) await say("\xA1No puedes huir de un combate contra un entrenador!");
    }
  }
  async function askMove() {
    const me = B.b.mon(0), usable = B.b.usable(me);
    if (!usable.length) return 99;
    const items = me.moves.map((x, i) => ({ n: MV[x.id].n, off: !usable.includes(i), x }));
    return chooseGrid(items, 2, (s) => {
      box(8, 284, 330, 92);
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
    const tm = B.b.sides[0].team;
    for (; ; ) {
      const i = await partyMenu(forced ? "Elige un POK\xE9MON." : "Elige un POK\xE9MON. (X: volver)");
      if (i < 0) {
        if (forced) continue;
        return -1;
      }
      if (tm[i].fainted) {
        await say(`\xA1${tm[i].name} no puede luchar!`);
        continue;
      }
      if (i === B.b.sides[0].act && !forced) {
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
        B.mon[e.side] = { m, hp: m.hp, vis: true, alpha: 0 };
        const w = B.mon[e.side];
        await tween(350, (p) => {
          w.alpha = p;
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
      }
    }
  }
  async function battle(id) {
    const bs = BOSSES[id], prevScene = scene;
    scene = "battle";
    play(bs.music);
    const party = G.party;
    for (const m of party) {
      for (const k in m.stage) m.stage[k] = 0;
      m.vol = {};
    }
    const b = new Battle(MV, party, team(bs.team, true));
    b.sides[0].act = Math.max(0, party.findIndex((m) => !m.fainted));
    B = { b, bg: bs.bg, mon: [null, null], meT: { img: "alain_back", x: -80, y: 292 }, foeT: { img: bs.pic, x: 600, y: 180 } };
    await tween(500, (p) => {
      B.meT.x = -80 + 208 * p;
      B.foeT.x = 600 - 216 * p;
    });
    await say(`\xA1${bs.title} ${bs.name} quiere luchar!`, null, { auto: 1200 });
    await tween(300, (p) => {
      B.foeT.x = 384 + 200 * p;
    });
    B.foeT = null;
    b.say(`\xA1${bs.name} sac\xF3 a ${b.mon(1).name}!`);
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
    for (const m of party) {
      for (const k in m.stage) m.stage[k] = 0;
      m.vol = {};
    }
    const won = b.over.winner === 0;
    if (won) {
      play("VictoriaEntrenador");
      B.foeT = { img: bs.pic, x: 600, y: 180 };
      await tween(400, (p) => {
        B.foeT.x = 600 - 216 * p;
      });
      await say(`\xA1Has derrotado a ${bs.name}!`);
      if (id === "roldan" && !G.flags.roldan) {
        await say("Imposible... mis leyendas, vencidas por los Pok\xE9mon de Ash. Te la has ganado, ALAIN.", "ROLDAN");
        if (music) music.pause();
        sfx("Medalla");
        B.fx = (t) => {
          ctx.fillStyle = "rgba(0,0,0,.35)";
          ctx.fillRect(0, 0, W, 280);
          medal(256, 130, 44 + Math.sin(t / 200) * 2);
        };
        await say("\xA1ALAIN ha conseguido la MEDALLA ROCA!");
        B.fx = null;
      }
    } else {
      await say("\xA1A ALAIN no le quedan POK\xE9MON!");
      await say("ALAIN se desmay\xF3...");
    }
    await tween(250, (p) => fade = p);
    scene = prevScene;
    B = null;
    await tween(250, (p) => fade = 1 - p);
    fade = 0;
    return won ? "won" : "lost";
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
  function drawSheet(sheet, x, y, dir, frame2) {
    const im = IMG["c_" + sheet];
    if (!im) return;
    const fw = im.width / 4, fh = im.height / 4;
    ctx.drawImage(im, (frame2 || 0) % 4 * fw, (dir || 0) * fh, fw, fh, Math.round(x + T / 2 - fw / 2 - camX), Math.round(y + T - fh - camY + 2), fw, fh);
  }
  function drawMap(t) {
    const mw = map.w * T, mh = map.h * T;
    const fc = camFocus || pxy;
    camX = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, fc[0] + T / 2 - W / 2));
    camY = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, fc[1] + T / 2 - H / 2));
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const low = IMG["low" + map.id], high = IMG["high" + map.id];
    if (low) ctx.drawImage(low, -Math.round(camX), -Math.round(camY));
    const ents = npcs.filter((n) => n.sheet && !n.hide).map((n) => ({ y: n.py ?? n.y * T, d: () => drawSheet(n.sheet, n.px ?? n.x * T, n.py ?? n.y * T, n.dir, n.walk ? Math.floor(t / 110) % 4 : n.mon ? Math.floor(t / 250) : n.frame) }));
    ents.push({ y: pxy[1], d: () => drawSheet("alain", pxy[0], pxy[1], G.dir, moving ? Math.floor(anim / 7) % 4 : 0) });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.d());
    if (high) ctx.drawImage(high, -Math.round(camX), -Math.round(camY));
    if (excl && t - excl.t < 900) {
      box(Math.round(excl.x * T + 5 - camX), Math.round(excl.y * T - 64 - camY), 24, 26, "#f8f8f8", "#d03030");
      text("!", Math.round(excl.x * T + 17 - camX), Math.round(excl.y * T - 59 - camY), "#d03030", null, 16, "center");
    }
    for (const n of npcs) if (n.boss || n.jokin) text(n.name, Math.round(n.x * T + 16 - camX), Math.round(n.y * T - 40 - camY), "#f8f8f8", "#203040", 12, "center");
    if (mapBanner && t - mapBanner.t < 2500) {
      box(6, 6, 220, 34);
      text(mapBanner.n, 18, 14, "#383838", "#d0d0c8", 14);
    }
    if (mapFx) mapFx(t);
    if (G.flags.medal) medal(490, 22, 12);
  }
  var mapBanner = null;
  var camFocus = null;
  var mapFx = null;
  async function showFor(ms) {
    flushKeys();
    await Promise.race([sleep(ms), nextKey()]);
    waiter = null;
    flushKeys();
  }
  var introDraw = null;
  async function intro() {
    scene = "intro";
    introDraw = () => ctx.drawImage(IMG.t_splash, 0, 0);
    await fadeIn();
    await showFor(2500);
    await fadeOut();
    introDraw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ["Pok\xE9mon Lumier", "por ALAIN", "", "Basado en Pok\xE9mon A\xF1il de EricLostie", "", "Pok\xE9mon Essentials", "2011-2014 Maruno", "2007-2010 Peter O.", "Based on work by Flameguru"].forEach((l, i) => text(l, 256, 70 + i * 28, "#f8f8f8", null, 16, "center"));
    };
    await fadeIn();
    await showFor(3e3);
    await fadeOut();
    introDraw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ["ESTE ES UN FANGAME HECHO POR FANS", "PARA FANS.", "", "\xA1RECUERDA APOYAR SIEMPRE", "LOS JUEGOS OFICIALES!"].forEach((l, i) => text(l, 256, 120 + i * 28, "#f8f8f8", null, 16, "center"));
    };
    await fadeIn();
    await showFor(2500);
    await fadeOut();
    play("Titulo");
    introDraw = drawTitle;
    await fadeIn();
    for (; ; ) {
      const k = await nextKey();
      if (k === "ok") break;
    }
    sfx("Medalla").volume = 0.2;
    const sv = localStorage.getItem(SAVE);
    let info = "Nueva aventura en Ciudad Plateada";
    try {
      const s = JSON.parse(sv);
      if (s) info = `Medallas: ${s.flags?.medal ? 1 : 0}   \xB7   ${s.money}\u20BD   \xB7   ${Math.floor(s.time / 6e4)} min`;
    } catch {
    }
    introDraw = (t) => {
      drawTitle(t, true);
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, W, H);
      box(56, 120, 400, 110, "#f8f8f8", "#3a5070");
      cursor(76, 142);
      text("CONTINUAR", 96, 140, "#383838");
      text("ALAIN", 96, 172, "#3060c0");
      text(info, 96, 198, "#606060", "#d0d0c8", 12);
    };
    for (; ; ) {
      const k = await nextKey();
      if (k === "ok") break;
    }
    await fadeOut();
    introDraw = null;
  }
  var introFade = 0;
  var fadeIn = () => tween(400, (p) => introFade = 1 - p);
  var fadeOut = () => tween(400, (p) => introFade = p);
  function drawTitle(t, still) {
    const tt = still ? 0 : t;
    ctx.drawImage(IMG.t_custom_background, 0, 0);
    const fx = IMG.t_custom_effect;
    if (fx) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.translate(256, 170);
      ctx.rotate(t / 4e3);
      ctx.drawImage(fx, -fx.width / 2, -fx.height / 2);
      ctx.restore();
    }
    const cl = IMG.t_custom_clouds_1;
    if (cl) {
      const x = -(t / 30 % cl.width);
      ctx.drawImage(cl, x, 0);
      ctx.drawImage(cl, x + cl.width, 0);
    }
    if (IMG.t_custom_bars) ctx.drawImage(IMG.t_custom_bars, 0, 0);
    const lg = IMG.t_logo;
    if (lg) {
      const s = 1 + Math.sin(t / 600) * 0.015;
      ctx.save();
      ctx.translate(256, 150);
      ctx.scale(s, s);
      ctx.drawImage(lg, -lg.width / 2, -lg.height / 2);
      ctx.restore();
    }
    if (!still && Math.floor(t / 600) % 2 && IMG.t_pokestart) ctx.drawImage(IMG.t_pokestart, 256 - IMG.t_pokestart.width / 2, 320);
  }
  function frame(t) {
    ctx.imageSmoothingEnabled = false;
    if (introDraw) introDraw(t);
    else if (scene === "map") drawMap(t);
    else if (scene === "battle" && B) drawBattle(t);
    drawDialog(t);
    if (overlay) overlay(t);
    const f = Math.max(fade, introDraw ? introFade : 0);
    if (f > 0) {
      ctx.fillStyle = `rgba(0,0,0,${f})`;
      ctx.fillRect(0, 0, W, H);
    }
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
      t_splash: "assets/titles/splash.png",
      t_custom_background: "assets/titles/custom_background.png",
      t_custom_bars: "assets/titles/custom_bars.png",
      t_custom_clouds_1: "assets/titles/custom_clouds_1.png",
      t_custom_effect: "assets/titles/custom_effect.png",
      t_pokestart: "assets/titles/pokestart.png",
      t_logo: "assets/titles/logo_lumier.png",
      alain_back: "assets/chars/alain_back.png",
      roldan_front: "assets/chars/roldan_front.png",
      unai_front: "assets/chars/unai_front.png",
      lete_front: "assets/chars/lete_front.png",
      giovanni_front: "assets/chars/giovanni_front.png"
    };
    for (const b of ["G1", "Ciudad", "Interior", "Bosque"]) {
      list["bg" + b] = `assets/bg/battlebg${b}.${b === "Ciudad" ? "jpg" : "png"}`;
      list["eb" + b] = `assets/bg/enemybase${b}.png`;
      list["pb" + b] = `assets/bg/playerbase${b}.png`;
    }
    for (const id of Object.keys(WORLD.maps)) {
      const n = String(id).padStart(3, "0");
      list["low" + id] = `assets/maps/${n}_low.png`;
      if (WORLD.maps[id].high) list["high" + id] = `assets/maps/${n}_high.png`;
    }
    const sheets = /* @__PURE__ */ new Set(["alain", "rival", "lete", "oak", "giovanni", "cerebrito", "misty", "lance", "rocketo", "rocketa"]);
    for (const m of Object.values(WORLD.maps)) for (const e of m.ev) for (const p of e.pg) if (p.c) sheets.add(p.c);
    for (const s of sheets) list["c_" + s] = `assets/chars/${s}.png`;
    const mons = /* @__PURE__ */ new Set([...ASH.map((s) => s.sp), ...JOKIN, 251, 121, ...Object.values(BOSSES).flatMap((b) => b.team.map((s) => s.sp))]);
    for (const id of mons) {
      const n = String(id).padStart(3, "0");
      list["s" + id] = `assets/sprites/${n}.png`;
      list["s" + id + "b"] = `assets/sprites/${n}b.png`;
    }
    await Promise.all(Object.entries(list).map(async ([k, v]) => {
      IMG[k] = await img(v);
    }));
    document.getElementById("load").remove();
    requestAnimationFrame(frame);
    introDraw = (t) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      if (Math.floor(t / 500) % 2) text("Pulsa ENTER para empezar", 256, 180, "#f8f8f8", null, 16, "center");
    };
    await nextKey();
    introDraw = null;
    if (!location.search.includes("skip")) await intro();
    G = loadGame();
    loadMap(G.map, G.x, G.y, G.dir, true);
    window.__dbg = { get G() {
      return G;
    }, get npcs() {
      return npcs;
    }, tp: (m, x, y) => loadMap(m, x, y, 0, true), misty: () => mistyEvent() };
    overworld();
  })();
})();
