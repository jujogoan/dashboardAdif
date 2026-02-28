import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   GASC Centro · SISTEMA DE GESTIÓN INTEGRAL · ADIF
   v3.0 — Login + RBAC + Guardias + Tareas + Vacaciones + Calendario + Admin
═══════════════════════════════════════════════════════════════════════ */

// ── BRAND ──────────────────────────────────────────────────────────────
const C = {
  verde:"#006338", teal:"#007681", negro:"#00292E",
  gris:"#A3A8A3",  menta:"#C7EEE9", naranja:"#FF9800",
  ink:"#1A2E2E",   smoke:"#F4F6F6", border:"#E2EAEA",
  azul:"#005B9F",  lila:"#6B46C1",  rojo:"#C0392B",
};

// ── ROLES ──────────────────────────────────────────────────────────────
const ROLES = {
  GERENTE:  { level:4, label:"Gerente",       color:"#6B21A8" },
  TECNICO:  { level:3, label:"Técnico",        color:C.teal   },
  CUADRO:   { level:2, label:"Cuadro Técnico", color:C.azul   },
  INSPECTOR:{ level:1, label:"Inspector",      color:C.verde  },
};

// ── SEED USERS ─────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:"U01", mat:"9751942", name:"Muñoz Alonso, David",          short:"Muñoz, D.",      role:"GERENTE",   admin:false, canApproveVac:true,  dni:"50425585V", telC:"960284", telL:"647392002", email:"davmunozal@adif.es",         loc:"Villaverde Bajo (Madrid)", pass:"9751942", retiring:false },
  { id:"U02", mat:"2885911", name:"Gómez Andreu, Juan José",      short:"Gómez, J.J.",    role:"TECNICO",   admin:true,  canApproveVac:true,  dni:"48655406X", telC:"996250", telL:"647341960", email:"jgomezan@adif.es",           loc:"Villaverde Bajo (Madrid)", pass:"2885911", retiring:false },
  { id:"U03", mat:"9736034", name:"Martín Sánchez, Lucas",        short:"Martín, L.",     role:"TECNICO",   admin:false, canApproveVac:true,  dni:"11762526G", telC:"969273", telL:"647990240", email:"lmartinsanchez@adif.es",     loc:"Villaverde Bajo (Madrid)", pass:"9736034", retiring:false },
  { id:"U04", mat:"2821643", name:"Benedicto Bravo, Juan José",   short:"Benedicto, J.",  role:"CUADRO",    admin:true,  canApproveVac:false, dni:"51424302M", telC:"977069", telL:"647821108", email:"jbenedicto@adif.es",         loc:"Villaverde Bajo (Madrid)", pass:"2821643", retiring:false },
  { id:"U05", mat:"9724287", name:"Bellod Jiménez, Miguel Á.",    short:"Bellod, M.Á.",   role:"INSPECTOR", admin:false, canApproveVac:false, dni:"05252259W", telC:"969924", telL:"647345137", email:"mbellod@adif.es",            loc:"Villaverde Bajo (Madrid)", pass:"9724287", retiring:true  },
  { id:"U06", mat:"9752296", name:"Cañaveras Rodero, Reyes",      short:"Cañaveras, R.",  role:"INSPECTOR", admin:false, canApproveVac:false, dni:"70643926R", telC:"993308", telL:"672609899", email:"r.canaveras@adif.es",        loc:"Villaverde Bajo (Madrid)", pass:"9752296", retiring:false },
  { id:"U07", mat:"2838829", name:"Lucas Moya, Javier",           short:"Lucas M., J.",   role:"INSPECTOR", admin:false, canApproveVac:false, dni:"50473475K", telC:"993250", telL:"672609258", email:"jlucas@adif.es",             loc:"Alcázar de San Juan",     pass:"2838829", retiring:false },
  { id:"U08", mat:"2851509", name:"Navarro Sánchez, Ignacio",     short:"Navarro, I.",    role:"INSPECTOR", admin:false, canApproveVac:false, dni:"53581179B", telC:"996519", telL:"647304986", email:"inavarrosanchez@adif.es",    loc:"Villaverde Bajo (Madrid)", pass:"2851509", retiring:false },
  { id:"U09", mat:"9750571", name:"González Jiménez, Victoriano", short:"González, V.",   role:"INSPECTOR", admin:false, canApproveVac:false, dni:"02218255C", telC:"996515", telL:"647304971", email:"vgonzalezjimenez@adif.es",  loc:"Villaverde Bajo (Madrid)", pass:"9750571", retiring:false },
  { id:"U10", mat:"2858405", name:"San Gil Mateos, Alberto",      short:"San Gil, A.",    role:"INSPECTOR", admin:false, canApproveVac:false, dni:"47516312Z", telC:"956298", telL:"647805341", email:"asangil@adif.es",            loc:"Villaverde Bajo (Madrid)", pass:"2858405", retiring:false },
  { id:"U11", mat:"8667016", name:"Sánchez de Prados, Mario",     short:"Sánchez P., M.", role:"INSPECTOR", admin:false, canApproveVac:false, dni:"00414987K", telC:"996028", telL:"647996063", email:"msanchezdeprados@adif.es",  loc:"Villaverde Bajo (Madrid)", pass:"8667016", retiring:false },
  { id:"U12", mat:"9750191", name:"Rodrigo Herranz, Alberto",     short:"Rodrigo, A.",    role:"INSPECTOR", admin:false, canApproveVac:false, dni:"07219233Q", telC:"950671", telL:"610548932", email:"alberto.rodrigo@adif.es",   loc:"Villaverde Bajo (Madrid)", pass:"9750191", retiring:false },
  { id:"U13", mat:"2860484", name:"López Sánchez, Luis M.",       short:"López S., L.",   role:"INSPECTOR", admin:false, canApproveVac:false, dni:"53616371J", telC:"990063", telL:"647970891", email:"luismiguel.lopez@adif.es",  loc:"Villaverde Bajo (Madrid)", pass:"2860484", retiring:false },
];

const TASK_AREAS = [
  { id:"T01", code:"01", title:"Investigación de Incidentes", color:C.verde,   icon:"⚡" },
  { id:"T02", code:"02", title:"Inspecciones en Campo",       color:C.teal,    icon:"🔍" },
  { id:"T03", code:"03", title:"Gestión Administrativa",      color:C.azul,    icon:"📋" },
  { id:"T04", code:"04", title:"Formación y Habilitaciones",  color:C.lila,    icon:"🎓" },
  { id:"T05", code:"05", title:"Actualización SIGCE",         color:C.teal,    icon:"⚙" },
  { id:"T06", code:"06", title:"Reportes Periódicos",         color:C.azul,    icon:"📊" },
  { id:"T07", code:"07", title:"Control de Calidad",          color:C.verde,   icon:"✓" },
  { id:"T08", code:"08", title:"Coordinación Interdept.",     color:C.teal,    icon:"🔗" },
  { id:"T09", code:"09", title:"Estadísticas de Seguridad",   color:C.azul,    icon:"📈" },
];

const EVENT_TYPES = [
  { id:"reunion",    label:"Reunión",       color:"#4B53BC" },
  { id:"inspeccion", label:"Inspección",    color:C.teal   },
  { id:"formacion",  label:"Formación",     color:C.verde  },
  { id:"plazo",      label:"Plazo admin.",  color:C.naranja},
  { id:"incidencia", label:"Incidencia",    color:C.rojo   },
  { id:"otro",       label:"Otro",          color:C.gris   },
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WDAYS  = ["L","M","X","J","V","S","D"];

// ── STORAGE ────────────────────────────────────────────────────────────
async function stLoad(k, fb) {
  try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : fb; } catch { return fb; }
}
async function stSave(k, v) {
  try { await window.storage.set(k, JSON.stringify(v)); } catch {}
}

// ── HELPERS ────────────────────────────────────────────────────────────
let _idctr = 100;
function uid() { return `x${Date.now()}_${_idctr++}`; }
function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5) + 1);
}
// Format ISO date string "2026-03-15" → "15/03"
function fmtDate(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  return `${parts[2]}/${parts[1]}`;
}
// Format ISO date string → "15/03/2026"
function fmtDateFull(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function weekLabel(w) {
  const s = new Date(2026, 0, 1 + (w - 1) * 7);
  const e = new Date(2026, 0, 7 + (w - 1) * 7);
  const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${s.getDate()} ${M[s.getMonth()]} – ${e.getDate()} ${M[e.getMonth()]}`;
}
// Returns the Monday of week w for a given year (ISO-ish: week 1 = week containing Jan 1)
function weekMonday(year, w) {
  const jan1 = new Date(year, 0, 1);
  // Find first Monday of the year
  const dow = jan1.getDay(); // 0=Sun,1=Mon...
  const offsetToMon = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  const firstMon = new Date(year, 0, 1 + offsetToMon);
  return new Date(firstMon.getTime() + (w - 1) * 7 * 86400000);
}
function weekSunday(year, w) {
  const mon = weekMonday(year, w);
  return new Date(mon.getTime() + 6 * 86400000);
}
function weekLabelYear(year, w) {
  const s = weekMonday(year, w);
  const e = weekSunday(year, w);
  const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${s.getDate()} ${M[s.getMonth()]} – ${e.getDate()} ${M[e.getMonth()]}`;
}
function weeksInYear(year) {
  // Use ISO 8601: a year has 53 weeks only if Jan 1 or Dec 31 is Thursday
  // For our purposes cap 2026 at 52 since the "53rd" week belongs to 2027
  if (year === 2026) return 52;
  const jan1 = new Date(year, 0, 1).getDay(); // 0=Sun
  const dec31 = new Date(year, 11, 31).getDay();
  return (jan1 === 4 || dec31 === 4) ? 53 : 52;
}
// Returns array of {month, weeks:[w,...]} groupings for a year
function weeksByMonth(year) {
  const total = weeksInYear(year);
  const groups = {};
  for (let w = 1; w <= total; w++) {
    const mon = weekMonday(year, w);
    const m = mon.getMonth();
    if (!groups[m]) groups[m] = [];
    groups[m].push(w);
  }
  return Object.entries(groups).map(([m, weeks]) => ({ month: Number(m), weeks }));
}
// Get current guard for today (or nearest week)
function currentGuardWeek(guards, year) {
  const today = new Date();
  const total = weeksInYear(year);
  for (let w = 1; w <= total; w++) {
    const mon = weekMonday(year, w);
    const sun = weekSunday(year, w);
    if (today >= mon && today <= sun) return w;
  }
  return 1;
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function buildDefaultGuards(users, year) {
  const yr = year || 2026;
  const insp = users.filter(u => u.role === "INSPECTOR").map(u => u.id);
  const mgrs = users.filter(u => u.role !== "INSPECTOR").map(u => u.id);
  const w = {};
  const total = weeksInYear(yr);
  for (let i = 1; i <= total; i++) {
    w[i] = {
      inspector: insp[(i - 1) % insp.length] || insp[0],
      manager:   mgrs[(i - 1) % mgrs.length] || mgrs[0],
    };
  }
  return w;
}
function vacConflictsGuards(vac, guards, year) {
  if (!vac?.from || !vac?.to) return [];
  const yr = year || 2026;
  const vs = new Date(vac.from), ve = new Date(vac.to);
  const hits = [];
  Object.keys(guards).forEach(w => {
    const wn = Number(w), row = guards[wn];
    const s = weekMonday(yr, wn);
    const e = weekSunday(yr, wn);
    if (vs <= e && ve >= s && (row.inspector === vac.userId || row.manager === vac.userId)) hits.push(wn);
  });
  return hits;
}
function defaultTasks() {
  return {
    T01:[
      { id:"t1",  title:"Investigar incidente Km 45 LAV",         assignee:"U05", priority:"alta",  status:"doing", desc:"Análisis de causas y elaboración de informe en 72h." },
      { id:"t2",  title:"Revisar metodología análisis causal",     assignee:"U02", priority:"media", status:"todo",  desc:"Actualizar procedimiento según nueva normativa." },
      { id:"t3",  title:"Archivo incidentes Q1 2026",              assignee:"U06", priority:"baja",  status:"done",  desc:"Cierre y archivo de expedientes del primer trimestre." },
    ],
    T02:[
      { id:"t4",  title:"Inspección depósito Atocha",              assignee:"U06", priority:"alta",  status:"todo",  desc:"Revisión material rodante Cercanías C3." },
      { id:"t5",  title:"Inspección subestaciones ZAR",            assignee:"U07", priority:"media", status:"doing", desc:"Revisión trimestral infraestructura energía." },
      { id:"t6",  title:"Planificación inspecciones Q2",           assignee:"U02", priority:"alta",  status:"todo",  desc:"Definir calendario abril-junio." },
    ],
    T03:[
      { id:"t7",  title:"Actualizar fichas de personal",           assignee:"U02", priority:"baja",  status:"doing", desc:"Actualizar datos y roles en el sistema." },
      { id:"t8",  title:"Reunión mensual coordinación OPE",        assignee:"U01", priority:"media", status:"todo",  desc:"Preparar orden del día y acta." },
    ],
    T04:[
      { id:"t9",  title:"Renovar habilitación Bellod",             assignee:"U05", priority:"alta",  status:"todo",  desc:"Caducidad mar 2026. Tramitar con RRHH." },
      { id:"t10", title:"Sesión formación normativa 2025",         assignee:"U02", priority:"media", status:"doing", desc:"Impartir sesión a todo el equipo — sala B." },
    ],
    T05:[
      { id:"t11", title:"Actualizar parámetros LAV Mad-BCN",       assignee:"U09", priority:"alta",  status:"done",  desc:"Carga de parámetros revisados en SIGCE." },
      { id:"t12", title:"Formación SIGCE v3.2 al equipo",          assignee:"U08", priority:"media", status:"todo",  desc:"Nueva versión con cambios en módulo de incidentes." },
    ],
    T06:[
      { id:"t13", title:"Informe mensual febrero 2026",            assignee:"U02", priority:"alta",  status:"doing", desc:"Cierre y envío antes del 5 de marzo." },
      { id:"t14", title:"Estadísticas anuales 2025",               assignee:"U11", priority:"media", status:"done",  desc:"Memoria anual de actividad del GASC Centro." },
    ],
    T07:[
      { id:"t15", title:"Auditoría procedimiento PO-23",           assignee:"U06", priority:"media", status:"todo",  desc:"Verificar cumplimiento del procedimiento de emergencia." },
      { id:"t16", title:"Revisión check-list inspecciones campo",  assignee:"U10", priority:"baja",  status:"doing", desc:"Actualizar formulario con nuevos ítems reglamentarios." },
    ],
    T08:[
      { id:"t17", title:"Reunión coordinación Mantenimiento",      assignee:"U01", priority:"media", status:"todo",  desc:"Agenda: incidencias material y plan correctivo." },
      { id:"t18", title:"Protocolo sustitución Bellod",            assignee:"U02", priority:"alta",  status:"todo",  desc:"URGENTE: definir cobertura antes de la jubilación." },
    ],
    T09:[
      { id:"t19", title:"Dashboard KPIs febrero 2026",             assignee:"U02", priority:"alta",  status:"doing", desc:"Actualizar indicadores en el panel de Teams." },
      { id:"t20", title:"Análisis tendencia incidentes LAV",       assignee:"U09", priority:"media", status:"todo",  desc:"Comparativa últimos 3 años por tipo de incidente." },
    ],
  };
}
function defaultEvents() {
  return [
    { id:"e1", title:"Reunión mensual GASC Centro",    date:"2026-03-02", type:"reunion",    users:[], global:true,  desc:"Revisión KPIs y estado del plan de implantación." },
    { id:"e2", title:"Inspección LAV Sevilla",   date:"2026-03-10", type:"inspeccion", users:["U06","U12"], global:false, desc:"" },
    { id:"e3", title:"Formación normativa 2025", date:"2026-03-15", type:"formacion",  users:[], global:true,  desc:"Sala B, 9:00h." },
    { id:"e4", title:"Plazo informe anual",      date:"2026-03-31", type:"plazo",      users:["U02"], global:false, desc:"" },
  ];
}

// ══════════════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;height:100%}
.app{font-family:'DM Sans',sans-serif;color:#1A2E2E;min-height:100vh}
.login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#00292E;position:relative;overflow:hidden}
.login-bg::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,118,129,.04) 0,rgba(0,118,129,.04) 1px,transparent 1px,transparent 60px),repeating-linear-gradient(0deg,rgba(0,118,129,.04) 0,rgba(0,118,129,.04) 1px,transparent 1px,transparent 60px)}
.lcard{background:#fff;border-radius:14px;padding:44px 40px 36px;width:100%;max-width:420px;box-shadow:0 32px 80px rgba(0,0,0,.35);position:relative;z-index:1}
.lerr{background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.25);border-radius:6px;padding:10px 14px;font-size:11.5px;color:#C0392B;margin-bottom:14px;text-align:center}
.lhint{background:rgba(0,118,129,.06);border:1px solid rgba(0,118,129,.2);border-radius:6px;padding:10px 14px;font-size:11.5px;color:#007681;margin-bottom:18px;line-height:1.7}
.ldemos{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:18px}
.ldemo{padding:5px 10px;border-radius:5px;border:1px solid #E2EAEA;font-size:10px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;background:#fff;color:#1A2E2E;font-weight:600}
.ldemo:hover{border-color:#007681;color:#007681;background:rgba(0,118,129,.06)}
.layout{display:flex;min-height:100vh}
.sb{position:fixed;top:0;left:0;width:220px;height:100vh;background:#00292E;display:flex;flex-direction:column;z-index:200;overflow-y:auto}
.sb::-webkit-scrollbar{width:3px}.sb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1)}
.sb-top{padding:20px 18px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-user{display:flex;align-items:center;gap:10px;margin-top:14px}
.sb-uname{font-size:11.5px;font-weight:600;color:#fff;line-height:1.3}
.sb-urole{font-size:9.5px;color:rgba(255,255,255,.4)}
.sb-uadm{font-size:7.5px;background:#FF9800;color:#fff;padding:1px 5px;border-radius:3px;font-weight:700;margin-left:4px;vertical-align:middle}
.sb-sec{font-size:8.5px;color:rgba(255,255,255,.28);letter-spacing:1.8px;text-transform:uppercase;padding:14px 18px 5px;font-weight:600}
.ni{display:flex;align-items:center;gap:9px;padding:8px 18px;cursor:pointer;font-size:12px;font-weight:400;color:rgba(255,255,255,.5);transition:all .14s;border-left:2px solid transparent}
.ni:hover{color:#fff;background:rgba(255,255,255,.04)}
.ni.on{color:#fff;background:rgba(0,118,129,.2);border-left-color:#007681;font-weight:600}
.ni-icon{font-size:13px;width:16px;text-align:center;flex-shrink:0}
.sb-ft{margin-top:auto;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08)}
.sb-out{display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.4);font-size:11.5px;cursor:pointer;padding:5px 0;transition:color .14s;border:none;background:transparent;font-family:'DM Sans',sans-serif;width:100%}
.sb-out:hover{color:rgba(255,255,255,.85)}
.b-dot{width:5px;height:5px;border-radius:50%;background:#FF9800;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.15}}
.main{margin-left:220px;flex:1;min-height:100vh}
.ph{padding:22px 40px 18px;border-bottom:1px solid #E2EAEA;display:flex;align-items:flex-start;justify-content:space-between;background:#fff;position:sticky;top:0;z-index:100}
.ph-eye{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#007681;margin-bottom:4px}
.ph-title{font-size:22px;font-weight:700;color:#1A2E2E;letter-spacing:-.5px;line-height:1.2}
.ph-sub{font-size:12px;color:#A3A8A3;margin-top:2px}
.ph-meta{text-align:right;font-size:10px;color:#A3A8A3;line-height:1.8}
.ct{padding:26px 40px 56px}
.sl{font-size:9.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#007681;margin-bottom:16px;display:flex;align-items:center;gap:10px}
.sl::after{content:'';flex:1;height:1px;background:#E2EAEA}
.card{background:#fff;border:1px solid #E2EAEA;border-radius:8px;padding:20px;transition:box-shadow .18s}
.card:hover{box-shadow:0 4px 16px rgba(0,41,46,.06)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;transition:all .14s;border:1px solid transparent;font-family:'DM Sans',sans-serif;line-height:1}
.btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
.btn-primary{background:#007681;color:#fff}.btn-primary:hover{background:#006570}
.btn-green{background:#006338;color:#fff}.btn-green:hover{filter:brightness(.9)}
.btn-red{background:#C0392B;color:#fff}.btn-red:hover{filter:brightness(.9)}
.btn-orange{background:#FF9800;color:#fff}.btn-orange:hover{filter:brightness(.9)}
.btn-ghost{background:transparent;color:#1A2E2E;border-color:#E2EAEA}.btn-ghost:hover{background:#F4F6F6}
.btn-sm{padding:4px 10px;font-size:10.5px}
input,select,textarea{font-family:'DM Sans',sans-serif;font-size:12px;border:1px solid #E2EAEA;border-radius:6px;padding:7px 10px;outline:none;transition:border .14s;background:#fff;color:#1A2E2E;width:100%}
input:focus,select:focus,textarea:focus{border-color:#007681;box-shadow:0 0 0 3px rgba(0,118,129,.11)}
label{font-size:10.5px;font-weight:600;color:#A3A8A3;letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:4px}
.frow{margin-bottom:12px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:12px}
.kpi{background:#fff;border:1px solid #E2EAEA;border-radius:8px;padding:16px 18px;position:relative;overflow:hidden;transition:box-shadow .18s}
.kpi:hover{box-shadow:0 4px 16px rgba(0,41,46,.06)}
.kpi::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--ac)}
.kv{font-size:26px;font-weight:700;color:#1A2E2E;letter-spacing:-1px;line-height:1}
.kl{font-size:10px;color:#A3A8A3;margin-top:5px;font-weight:500}
.ks{font-size:10px;color:var(--ac);margin-top:6px;font-weight:600}
.alert-box{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:6px;border-left:3px solid var(--ac);background:var(--bg);margin-bottom:12px}
.alert-box .at{font-size:12px;font-weight:600;color:var(--ac)}
.alert-box .ab{font-size:11px;color:#1A2E2E;margin-top:1px;line-height:1.5}
.pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.p-alta{color:#B91C1C;background:rgba(185,28,28,.08)}
.p-media{color:#D67E00;background:rgba(255,152,0,.1)}
.p-baja{color:#007681;background:rgba(0,118,129,.08)}
.p-approved{color:#006338;background:rgba(0,99,56,.08)}
.p-rejected{color:#C0392B;background:rgba(192,57,43,.08)}
.p-pending{color:#A3A8A3;background:rgba(163,168,163,.12)}
.badge{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:4px}
.badge-warn{background:rgba(255,152,0,.12);color:#FF9800;border:1px solid rgba(255,152,0,.3)}
.badge-ok{background:rgba(0,99,56,.08);color:#006338;border:1px solid rgba(0,99,56,.2)}
.badge-err{background:rgba(192,57,43,.08);color:#C0392B;border:1px solid rgba(192,57,43,.2)}
.tbl{width:100%;border-collapse:collapse}
.tbl th{text-align:left;font-size:9.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#A3A8A3;padding:9px 12px;border-bottom:2px solid #E2EAEA}
.tbl td{font-size:12px;padding:10px 12px;border-bottom:1px solid #E2EAEA;color:#1A2E2E;vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:#F4F6F6}
.tab-bar{display:flex;border-bottom:1px solid #E2EAEA;margin-bottom:20px;flex-wrap:wrap}
.tab{padding:9px 16px;font-size:11.5px;font-weight:500;color:#A3A8A3;cursor:pointer;border-bottom:2px solid transparent;transition:all .14s;margin-bottom:-1px}
.tab.on{color:#007681;font-weight:700;border-bottom-color:#007681}
.tab:hover:not(.on){color:#1A2E2E}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:10px;padding:26px;width:100%;max-width:500px;box-shadow:0 20px 56px rgba(0,0,0,.22);max-height:90vh;overflow-y:auto}
.modal-lg{max-width:700px}
.modal-title{font-size:15px;font-weight:700;color:#1A2E2E;margin-bottom:18px}
.cbar-wrap{background:#F4F6F6;border-radius:3px;overflow:hidden;height:5px;margin-top:3px}
.cbar{height:5px;border-radius:3px;transition:width .35s ease}
.toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.toggle-track{width:36px;height:20px;border-radius:10px;transition:background .2s;flex-shrink:0;position:relative}
.toggle-thumb{position:absolute;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
/* GUARD */
.gm-layout{display:grid;grid-template-columns:1fr 340px;gap:18px}
.week-row{display:grid;grid-template-columns:44px 106px 1fr 1fr;border-bottom:1px solid #E2EAEA;align-items:center;min-height:39px}
.week-row.curr{background:rgba(0,118,129,.04)}
.week-row.ghdr{background:#F4F6F6;min-height:32px;border-bottom:2px solid #E2EAEA}
.wc{padding:6px 8px;font-size:11px}
.wc.sem{font-family:'DM Mono',monospace;font-size:10.5px;color:#A3A8A3;padding-left:12px}
.wc.dates{font-size:10.5px;color:#A3A8A3}
.isel{background:transparent;border:none;font-size:11.5px;color:#1A2E2E;font-family:'DM Sans',sans-serif;cursor:pointer;padding:3px 5px;border-radius:4px;outline:none;-webkit-appearance:none;font-weight:500;width:100%}
.isel:hover:not(:disabled){background:rgba(0,118,129,.08)}
.isel:disabled{cursor:default;opacity:.7}
.fc-card{border:1px solid #E2EAEA;border-radius:8px;overflow:hidden;margin-bottom:14px}
.fc-hdr{background:#00292E;color:#fff;padding:10px 14px;font-size:11px;font-weight:700}
.fc-row{display:flex;align-items:center;gap:9px;padding:8px 14px;border-bottom:1px solid #E2EAEA;transition:background .12s}
.fc-row:last-child{border-bottom:none}
.fc-row:hover{background:#F4F6F6}
.fc-name{font-size:11.5px;font-weight:500;flex:1}
.spark{display:flex;align-items:flex-end;gap:2px;height:26px}
.spark-b{flex:1;border-radius:2px 2px 0 0;min-height:2px}
/* KANBAN */
.achips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.achip{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;border:1px solid #E2EAEA;cursor:pointer;font-size:11px;font-weight:500;color:#1A2E2E;transition:all .14s;white-space:nowrap}
.achip.on{font-weight:700;border-color:var(--ac);background:var(--bg);color:var(--ac)}
.achip:hover:not(.on){background:#F4F6F6}
.kb-board{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.kbcol{background:#F4F6F6;border-radius:8px;padding:12px;min-height:220px}
.kbch{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.kbcl{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--col)}
.kbcc{font-size:9px;font-weight:700;background:var(--col-bg);color:var(--col);padding:2px 7px;border-radius:10px}
.kcard{background:#fff;border:1px solid #E2EAEA;border-radius:6px;padding:11px;margin-bottom:7px;position:relative;overflow:hidden;transition:box-shadow .15s}
.kcard:hover{box-shadow:0 3px 10px rgba(0,41,46,.09)}
.kstrip{position:absolute;top:0;left:0;right:0;height:2.5px}
.ktitle{font-size:12px;font-weight:600;line-height:1.4;margin-bottom:5px;padding-top:5px}
.kdesc{font-size:10.5px;color:#A3A8A3;margin-bottom:7px;line-height:1.5}
.kfoot{display:flex;align-items:center;justify-content:space-between}
.kwho{font-size:10.5px;color:#A3A8A3;display:flex;align-items:center;gap:4px}
.kacts{display:flex;gap:3px;margin-top:7px;flex-wrap:wrap}
.kbtn{font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;border:1px solid #E2EAEA;background:#F4F6F6;color:#1A2E2E;font-family:'DM Sans',sans-serif;transition:all .12s}
.kbtn:hover{border-color:#007681;color:#007681}
.kbtn.del:hover{border-color:#C0392B;color:#C0392B}
.kadd{display:flex;align-items:center;justify-content:center;gap:5px;padding:7px;border-radius:6px;border:1.5px dashed #E2EAEA;color:#A3A8A3;font-size:11px;cursor:pointer;transition:all .14s;width:100%;font-family:'DM Sans',sans-serif;background:transparent}
.kadd:hover{border-color:#007681;color:#007681;background:rgba(0,118,129,.04)}
/* CALENDAR */
.cal-grid{display:grid;grid-template-columns:1fr 300px;gap:20px}
.cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cal-month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:#E2EAEA;border-radius:8px;overflow:hidden}
.cdhdr{background:#F4F6F6;text-align:center;padding:8px 4px;font-size:10px;font-weight:700;color:#A3A8A3;letter-spacing:.5px}
.cday{background:#fff;min-height:78px;padding:5px 6px;cursor:pointer;transition:background .12s}
.cday:hover{background:rgba(0,118,129,.03)}
.cday.today{background:rgba(0,118,129,.05)}
.cday.otherM{background:#F4F6F6}
.cday.otherM .cdn{color:#A3A8A3}
.cdn{font-size:11.5px;font-weight:600;margin-bottom:2px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.cday.today .cdn{background:#007681;color:#fff;font-weight:700}
.cev{font-size:9px;font-weight:600;padding:1px 5px;border-radius:2px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* VACATION */
.vac-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #E2EAEA;transition:background .12s}
.vac-row:hover{background:#F4F6F6}
/* DIRECTORY */
.dir-card{border:1px solid #E2EAEA;border-radius:8px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px;transition:box-shadow .18s}
.dir-card:hover{box-shadow:0 4px 16px rgba(0,41,46,.07)}
/* ADMIN */
.ua-card{border:1px solid #E2EAEA;border-radius:8px;padding:14px;transition:box-shadow .18s}
.ua-card:hover{box-shadow:0 4px 16px rgba(0,41,46,.07)}
.confirm-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:700;display:flex;align-items:center;justify-content:center}
.confirm-box{background:#fff;border-radius:10px;padding:24px;max-width:380px;width:100%;box-shadow:0 20px 56px rgba(0,0,0,.25)}
`;

// ══════════════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════
function initials(name) {
  const p = name.split(",");
  const last = (p[0] || "").trim();
  const first = (p[1] || "").trim();
  return (last[0] || "").toUpperCase() + (first[0] || "").toUpperCase();
}
// "Gómez Andreu, Juan José" → "Juan José Gómez Andreu"
function fullName(u) {
  if (!u?.name) return u?.short || "";
  const p = u.name.split(",");
  const last = (p[0] || "").trim();
  const first = (p[1] || "").trim();
  return first ? `${first} ${last}` : last;
}
// "Gómez Andreu, Juan José" → "Juan José G.A."
function shortName(u) {
  if (!u?.name) return u?.short || "";
  const p = u.name.split(",");
  const last = (p[0] || "").trim();
  const first = (p[1] || "").trim();
  // initials of each last name word
  const lastInits = last.split(" ").filter(Boolean).map(w => w[0].toUpperCase() + ".").join("");
  return first ? `${first} ${lastInits}` : last;
}

function Av({ user, size = 32 }) {
  const bg = user.retiring ? C.naranja : (ROLES[user.role]?.color || C.gris);
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*.28), background:bg,
      color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*.32, fontWeight:700, flexShrink:0, fontFamily:"'DM Mono',monospace" }}>
      {initials(user.name)}
    </div>
  );
}

function RBadge({ role }) {
  const r = ROLES[role] || { label:role, color:C.gris };
  return <span className="badge" style={{ background:`${r.color}18`, color:r.color, border:`1px solid ${r.color}30` }}>{r.label}</span>;
}

function Toggle({ on, onChange }) {
  return (
    <div className="toggle" onClick={() => onChange(!on)}>
      <div className="toggle-track" style={{ background: on ? C.teal : "#E2EAEA" }}>
        <div className="toggle-thumb" style={{ left: on ? 19 : 3 }} />
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, lg }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${lg ? " modal-lg" : ""}`}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div className="modal-title" style={{ margin:0 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Confirm({ message, onYes, onNo, dangerous }) {
  return (
    <div className="confirm-bg">
      <div className="confirm-box">
        <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>¿Confirmar acción?</div>
        <div style={{ fontSize:13, lineHeight:1.65, marginBottom:20, color:C.ink }}>{message}</div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button className="btn btn-ghost btn-sm" onClick={onNo}>Cancelar</button>
          <button className={`btn btn-sm ${dangerous ? "btn-red" : "btn-primary"}`} onClick={onYes}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function KPI({ v, l, s, ac }) {
  return (
    <div className="kpi" style={{ "--ac": ac }}>
      <div className="kv">{v}</div>
      <div className="kl">{l}</div>
      {s && <div className="ks">{s}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ADIF LOGO SVG
// ══════════════════════════════════════════════════════════════════════
function AdifLogoColor({ height = 40 }) {
  const w = Math.round(height * 3.247);
  return (
    <div style={{ height, width:w, display:"inline-flex", alignItems:"center", flexShrink:0 }}
      dangerouslySetInnerHTML={{ __html: `<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 684.5204 210.7495" height="100%" width="100%" style="display:block">
  <defs>
    <style>
      .adif-c1 {
        fill: #006935;
      }

      .adif-c2 {
        fill: #00303e;
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <g id="LOGO">
    <g>
      <path class="adif-c2" d="M632.6063,91.567h35.7783c3.127,0,5.7168,2.5908,5.7168,5.7617v6.374c0,3.7452-3.0635,5.7461-5.7168,5.7461h-35.748v35.0616c0,3.3183-2.667,5.7793-5.8408,5.7793h-21.4258c-3.17,0-5.7188-2.6055-5.7188-5.793v-72.7305c0-15.4585,13.041-31.3408,31.7227-37.1987,9.0732-2.8355,16.5635-2.877,22.3437-2.877l30.8028-.0068v9.0332l-18.6221.0073c-5.5869,0-11.7832,2.1602-15.3057,3.8194-13.4609,6.3505-17.9863,14.6259-17.9863,27.8681v19.1553h0Z"/>
      <path class="adif-c2" d="M544.4305,150.2897h32.6289v-74.8028c0-3.0722-2.5078-5.7861-5.8271-5.7861h-21.0459c-2.3565,0-5.7559,1.8467-5.7559,5.7695v74.8194h0Z"/>
      <path class="adif-c2" d="M560.9618,39.1456c-4.6729,0-8.7051,1.0942-12.1241,3.2866-3.2558,2.1963-4.874,4.857-4.874,7.9688,0,3.1181,1.6182,5.7749,4.874,7.9687,3.2676,2.125,7.2334,3.1846,11.917,3.1846,4.669,0,8.6358-1.0957,11.8965-3.2905,3.2598-2.1949,4.8916-4.815,4.8916-7.8628,0-3.1831-1.6318-5.8394-4.8916-7.9688-3.2607-2.1924-7.1572-3.2866-11.6894-3.2866h0Z"/>
      <path class="adif-c2" d="M517.1668,26.4181h-22.3877c-3.6152,0-5.7138,2.912-5.7138,5.7119v42.1422c-9.9336-3.3867-20.627-5.0822-31.9961-5.0822-18.3203,0-33.9766,4.1046-46.9795,12.3038-12.8906,8.0781-19.334,17.8388-19.334,29.3007s6.4942,21.295,19.4971,29.501c12.998,8.0703,28.707,12.0977,47.125,12.0977,18.2178,0,33.6806-4.0274,46.3672-12.0977,12.7968-8.0791,19.1816-17.9062,19.1816-29.501V32.13c0-2.5995-1.9971-5.7119-5.7598-5.7119ZM481.6345,132.6754c-6.6494,5.8613-14.6855,8.7861-24.1025,8.7861-9.4112,0-17.4893-2.9248-24.2539-8.7861-6.6436-5.9883-9.9727-13.1494-9.9727-21.4815,0-8.3388,3.3291-15.4394,9.9727-21.2949,6.6484-5.9912,14.6884-8.9892,24.0996-8.9892s17.4551,2.998,24.1094,8.9892c6.7509,5.8555,10.1279,12.9561,10.1279,21.2949,0,8.3321-3.3213,15.4932-9.9805,21.4815Z"/>
      <g>
        <path class="adif-c2" d="M310.8001,142.065c-8.2597,0-15.708-2.5107-22.5014-7.5527-8.0059-5.6484-12.0069-13.206-12.0069-22.668,0-8.2285,3.3916-15.292,10.1895-21.1904,6.7881-5.8945,14.9434-8.8447,24.4658-8.8447,9.6279,0,17.7832,2.9502,24.4732,8.8447,6.7876,5.8984,10.1801,12.9619,10.1801,21.1904,0,8.3545-3.3925,15.4834-10.1801,21.375-6.7891,5.8985-14.9981,8.8457-24.6202,8.8457h0ZM376.0086,110.191c-.1025-11.4258-6.6474-21.1328-19.6152-29.123-12.8643-8.1016-28.3647-12.1543-46.5098-12.1543-18.3359,0-33.9956,4.1093-46.9609,12.3388-12.979,8.1123-19.4692,17.876-19.4692,29.3057,0,11.5488,6.4423,21.4356,19.3134,29.669,12.9673,8.1103,28.5713,12.1513,46.8096,12.1513,12.0581,0,23.2647-1.8965,33.6011-5.6982v3.5654h32.831v-40.0547h0Z"/>
        <path class="adif-c1" d="M101.7435,5.1256c2.9717,2.1797,40.0757,32.2705,94.2471,100.0537,7.2573,9.0713,14.1948,19.9814,14.7168,26.5977.8574,11.1064-10.5381,20.4326-30.4234,27.621-13.1499,4.7452-65.3183,24.2178-101.8974,37.375,10.1655-13.6494,20.5478-29.1035,30.0908-45.9785,33.6733-59.5547,37.1182-77.1416,32.4277-90.8037-4.414-12.8808-13.7881-12.354-16.8593-11.811,2.894-.4956,12.3188.8833,14.1582,13.9741,2.289,16.3047-7.3082,30.7852-55.7891,93.2149-15.8399,20.4013-31.8838,39.0048-46.981,54.8339-15.7851,1.9629-48.3925,1.3086-29.9306-49.5654,1.2109-3.3086,2.4668-6.6904,3.7563-10.1133,19.5567-12.8486,55.1485-37.9453,85.3799-63.5771,30.9668-26.2617,30.9653-34.8843,27.9346-37.7071-1.375-1.2836-3.3726-1.3696-3.3726-1.3696,0,0,1.4341.2808,2.3858,1.4497,2.3876,2.94,1.6665,11.4981-32.98,35.3106-24.0283,16.5224-49.8472,30.9853-69.7613,41.3662C40.0433,73.4264,66.1322,18.7394,70.2416,12.1002c7.2094-11.6538,18.2802-16.6616,31.5019-6.9746h0Z"/>
      </g>
    </g>
  </g>
</svg>` }}
    />
  );
}

function AdifLogoWhite({ height = 40 }) {
  const w = Math.round(height * 3.247);
  return (
    <div style={{ height, width:w, display:"inline-flex", alignItems:"center", flexShrink:0 }}
      dangerouslySetInnerHTML={{ __html: `<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 684.5204 210.7495" height="100%" width="100%" style="display:block">
  <defs>
    <style>
      .adif-w1, .adif-w2 {
        fill: #fff;
      }

      .adif-w2 {
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <g id="LOGO">
    <g>
      <path class="adif-w2" d="M632.6063,91.567h35.7783c3.127,0,5.7168,2.5908,5.7168,5.7617v6.374c0,3.7452-3.0635,5.7461-5.7168,5.7461h-35.748v35.0616c0,3.3183-2.667,5.7793-5.8408,5.7793h-21.4258c-3.17,0-5.7188-2.6055-5.7188-5.793v-72.7305c0-15.4585,13.041-31.3408,31.7227-37.1987,9.0732-2.8355,16.5635-2.877,22.3437-2.877l30.8028-.0068v9.0332l-18.6221.0073c-5.5869,0-11.7832,2.1602-15.3057,3.8194-13.4609,6.3505-17.9863,14.6259-17.9863,27.8681v19.1553h0Z"/>
      <path class="adif-w2" d="M544.4305,150.2897h32.6289v-74.8028c0-3.0722-2.5078-5.7861-5.8271-5.7861h-21.0459c-2.3565,0-5.7559,1.8467-5.7559,5.7695v74.8194h0Z"/>
      <path class="adif-w2" d="M560.9618,39.1456c-4.6729,0-8.7051,1.0942-12.1241,3.2866-3.2558,2.1963-4.874,4.857-4.874,7.9688,0,3.1181,1.6182,5.7749,4.874,7.9687,3.2676,2.125,7.2334,3.1846,11.917,3.1846,4.669,0,8.6358-1.0957,11.8965-3.2905,3.2598-2.1949,4.8916-4.815,4.8916-7.8628,0-3.1831-1.6318-5.8394-4.8916-7.9688-3.2607-2.1924-7.1572-3.2866-11.6894-3.2866h0Z"/>
      <path class="adif-w2" d="M517.1668,26.4181h-22.3877c-3.6152,0-5.7138,2.912-5.7138,5.7119v42.1422c-9.9336-3.3867-20.627-5.0822-31.9961-5.0822-18.3203,0-33.9766,4.1046-46.9795,12.3038-12.8906,8.0781-19.334,17.8388-19.334,29.3007s6.4942,21.295,19.4971,29.501c12.998,8.0703,28.707,12.0977,47.125,12.0977,18.2178,0,33.6806-4.0274,46.3672-12.0977,12.7968-8.0791,19.1816-17.9062,19.1816-29.501V32.13c0-2.5995-1.9971-5.7119-5.7598-5.7119ZM481.6345,132.6754c-6.6494,5.8613-14.6855,8.7861-24.1025,8.7861-9.4112,0-17.4893-2.9248-24.2539-8.7861-6.6436-5.9883-9.9727-13.1494-9.9727-21.4815,0-8.3388,3.3291-15.4394,9.9727-21.2949,6.6484-5.9912,14.6884-8.9892,24.0996-8.9892s17.4551,2.998,24.1094,8.9892c6.7509,5.8555,10.1279,12.9561,10.1279,21.2949,0,8.3321-3.3213,15.4932-9.9805,21.4815Z"/>
      <g>
        <path class="adif-w2" d="M310.8001,142.065c-8.2597,0-15.708-2.5107-22.5014-7.5527-8.0059-5.6484-12.0069-13.206-12.0069-22.668,0-8.2285,3.3916-15.292,10.1895-21.1904,6.7881-5.8945,14.9434-8.8447,24.4658-8.8447,9.6279,0,17.7832,2.9502,24.4732,8.8447,6.7876,5.8984,10.1801,12.9619,10.1801,21.1904,0,8.3545-3.3925,15.4834-10.1801,21.375-6.7891,5.8985-14.9981,8.8457-24.6202,8.8457h0ZM376.0086,110.191c-.1025-11.4258-6.6474-21.1328-19.6152-29.123-12.8643-8.1016-28.3647-12.1543-46.5098-12.1543-18.3359,0-33.9956,4.1093-46.9609,12.3388-12.979,8.1123-19.4692,17.876-19.4692,29.3057,0,11.5488,6.4423,21.4356,19.3134,29.669,12.9673,8.1103,28.5713,12.1513,46.8096,12.1513,12.0581,0,23.2647-1.8965,33.6011-5.6982v3.5654h32.831v-40.0547h0Z"/>
        <path class="adif-w1" d="M101.7435,5.1256c2.9717,2.1797,40.0757,32.2705,94.2471,100.0537,7.2573,9.0713,14.1948,19.9814,14.7168,26.5977.8574,11.1064-10.5381,20.4326-30.4234,27.621-13.1499,4.7452-65.3183,24.2178-101.8974,37.375,10.1655-13.6494,20.5478-29.1035,30.0908-45.9785,33.6733-59.5547,37.1182-77.1416,32.4277-90.8037-4.414-12.8808-13.7881-12.354-16.8593-11.811,2.894-.4956,12.3188.8833,14.1582,13.9741,2.289,16.3047-7.3082,30.7852-55.7891,93.2149-15.8399,20.4013-31.8838,39.0048-46.981,54.8339-15.7851,1.9629-48.3925,1.3086-29.9306-49.5654,1.2109-3.3086,2.4668-6.6904,3.7563-10.1133,19.5567-12.8486,55.1485-37.9453,85.3799-63.5771,30.9668-26.2617,30.9653-34.8843,27.9346-37.7071-1.375-1.2836-3.3726-1.3696-3.3726-1.3696,0,0,1.4341.2808,2.3858,1.4497,2.3876,2.94,1.6665,11.4981-32.98,35.3106-24.0283,16.5224-49.8472,30.9853-69.7613,41.3662C40.0433,73.4264,66.1322,18.7394,70.2416,12.1002c7.2094-11.6538,18.2802-16.6616,31.5019-6.9746h0Z"/>
      </g>
    </g>
  </g>
</svg>` }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════════════
function Login({ users, onLogin }) {
  const [mat, setMat] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function doLogin(m, p) {
    const u = users.find(x => x.mat === String(m).trim());
    if (!u) { setErr("Matrícula no encontrada."); return; }
    if (u.pass !== String(p).trim()) { setErr("Contraseña incorrecta."); return; }
    onLogin(u);
  }

  const DEMOS = [
    { label:"⚙ Admin (Gómez)", mat:"2885911" },
    { label:"👔 Gerente (Muñoz)", mat:"9751942" },
    { label:"🔧 Cuadro (Benedicto)", mat:"2821643" },
    { label:"🔍 Inspector (Bellod)", mat:"9724287" },
  ];

  return (
    <div className="login-bg">
      <div className="lcard">
        <div style={{ marginBottom:28 }}><AdifLogoColor height={40}/></div>
        <div style={{ fontSize:18, fontWeight:700, color:C.ink, marginBottom:4 }}>GASC Centro · Gestión Integral</div>
        <div style={{ fontSize:12, color:C.gris, marginBottom:22 }}>Sistema de gestión departamental — Acceso restringido</div>
        <div className="lhint">
          <strong>Acceso:</strong> Usuario = matrícula · Contraseña = matrícula<br/>
          <span style={{ fontSize:10.5, opacity:.8 }}>Ej: usuario <code>2885911</code> → contraseña <code>2885911</code></span>
        </div>
        <div style={{ marginBottom:8 }}><label>Acceso rápido (demo)</label></div>
        <div className="ldemos">
          {DEMOS.map(d => (
            <button key={d.mat} className="ldemo" onClick={() => doLogin(d.mat, d.mat)}>{d.label}</button>
          ))}
        </div>
        {err && <div className="lerr">⚠ {err}</div>}
        <div className="frow">
          <label>Matrícula</label>
          <input value={mat} onChange={e => { setMat(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && doLogin(mat, pass)}
            placeholder="Ej: 2885911" autoFocus/>
        </div>
        <div className="frow">
          <label>Contraseña</label>
          <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && doLogin(mat, pass)}
            placeholder="Tu contraseña"/>
        </div>
        <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:4 }}
          onClick={() => doLogin(mat, pass)}>Acceder →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  OVERVIEW
// ══════════════════════════════════════════════════════════════════════
function Overview({ me, users, tasks, vacations, events, guards }) {
  const myTasks = Object.values(tasks).flat().filter(t => t.assignee === me.id);
  const pendingVac = vacations.filter(v => v.status === "pending").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter(e => e.date >= todayStr).slice(0, 4);
  const totalDone = Object.values(tasks).flat().filter(t => t.status === "done").length;
  const totalTasks = Object.values(tasks).flat().length;
  const inspectors = users.filter(u => u.role === "INSPECTOR");
  const inRetiring = users.filter(u => u.retiring);

  // Current guard
  const guardYear = 2026;
  const curWeek = currentGuardWeek(guards, guardYear);
  const curRow = guards[curWeek] || {};
  const guardInspector = users.find(u => u.id === curRow.inspector);
  const guardManager   = users.find(u => u.id === curRow.manager);
  const monDate = weekMonday(guardYear, curWeek);
  const sunDate = weekSunday(guardYear, curWeek);
  const fmtD = d => `${d.getDate()}/${String(d.getMonth()+1).padStart(2,"0")}`;

  return (
    <div>
      {/* ── Guardia actual ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {[
          { label:"Guardia Inspector", user:guardInspector, color:C.verde,   icon:"🔍" },
          { label:"Guardia Gerente",   user:guardManager,   color:C.azul,    icon:"👔" },
        ].map(({ label, user:u, color, icon }) => (
          <div key={label} style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:color }}/>
            <div style={{ width:40, height:40, borderRadius:8, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:color, marginBottom:2 }}>{label}</div>
              {u
                ? <><div style={{ fontSize:14, fontWeight:700, color:C.ink }}>{fullName(u)}</div>
                    <div style={{ fontSize:10, color:C.gris, marginTop:1 }}>Semana {curWeek} · {fmtD(monDate)}–{fmtD(sunDate)}</div></>
                : <div style={{ fontSize:12, color:C.gris }}>No asignado</div>}
            </div>
            {u?.retiring && <span className="badge badge-warn" style={{ fontSize:8 }}>JUB</span>}
          </div>
        ))}
      </div>

      {inRetiring.length > 0 && (
        <div className="alert-box" style={{ "--ac":C.naranja, "--bg":"rgba(255,152,0,.06)", marginBottom:20 }}>
          <div style={{ fontSize:13, flexShrink:0 }}>⚠</div>
          <div>
            <div className="at">Alerta crítica de planificación</div>
            <div className="ab">{inRetiring.map(u => u.name).join(", ")} — prevé jubilarse en 2026. Requiere plan de cobertura urgente.</div>
          </div>
        </div>
      )}
      <div className="g4" style={{ marginBottom:20 }}>
        <KPI v={users.length} l="Miembros del equipo" s={`${inspectors.length} inspectores`} ac={C.verde}/>
        <KPI v={myTasks.filter(t => t.status !== "done").length} l="Mis tareas activas" s="asignadas a mí" ac={C.teal}/>
        <KPI v={`${totalDone}/${totalTasks}`} l="Tareas completadas" s="todas las áreas" ac={C.azul}/>
        <KPI v={pendingVac} l="Vacaciones pendientes" s="esperando aprobación" ac={pendingVac > 0 ? C.naranja : C.gris}/>
      </div>
      <div className="g2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="sl">Mis tareas ({myTasks.length})</div>
          {myTasks.length === 0
            ? <div style={{ fontSize:12, color:C.gris }}>No tienes tareas asignadas.</div>
            : myTasks.slice(0, 6).map(t => {
              const area = TASK_AREAS.find(a => Object.keys(tasks).find(k => tasks[k].find(x => x.id === t.id) && k === a.id));
              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:3, height:28, borderRadius:2, background:area?.color || C.gris, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500 }}>{t.title}</div>
                    <div style={{ fontSize:10, color:C.gris, marginTop:1 }}>{area?.title}</div>
                  </div>
                  <span className={`pill p-${t.priority}`}>{t.priority}</span>
                </div>
              );
            })}
        </div>
        <div className="card">
          <div className="sl">Próximos eventos ({upcomingEvents.length})</div>
          {upcomingEvents.length === 0
            ? <div style={{ fontSize:12, color:C.gris }}>No hay eventos próximos.</div>
            : upcomingEvents.map(ev => {
              const et = EVENT_TYPES.find(t => t.id === ev.type);
              return (
                <div key={ev.id} style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:32, flexShrink:0, textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:et?.color || C.gris }}>{fmtDate(ev.date)} </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500 }}>{ev.title}</div>
                    <span className="badge" style={{ background:`${et?.color}18`, color:et?.color, border:`1px solid ${et?.color}25`, marginTop:2 }}>{et?.label}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="card">
        <div className="sl">Equipo GASC Centro — {users.length} personas</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {users.map(u => (
            <div key={u.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", border:`1px solid ${C.border}`, borderRadius:7, minWidth:180 }}>
              <Av user={u} size={28}/>
              <div>
                <div style={{ fontSize:11.5, fontWeight:600 }}>{fullName(u)}</div>
                <RBadge role={u.role}/>
              </div>
              {u.retiring && <span className="badge badge-warn" style={{ marginLeft:"auto", fontSize:8 }}>JUB</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  GUARDIAS MODULE
// ══════════════════════════════════════════════════════════════════════
function GuardiasModule({ me, users, guards, setGuards, vacations }) {
  const [tab, setTab] = useState("cuadrante");
  const [filterInsp, setFilterInsp] = useState("all");
  const [guardYear, setGuardYear] = useState(2026);
  const canEdit = me.admin || me.role === "GERENTE" || me.role === "TECNICO";
  const inspectors = users.filter(u => u.role === "INSPECTOR");
  const managers = users.filter(u => u.role !== "INSPECTOR");
  const totalWeeks = weeksInYear(guardYear);
  const todayWeek = currentGuardWeek(guards, guardYear);

  // Ensure guards exist for selected year
  const yearGuards = guards[guardYear] || {};

  function setGuard(w, field, val) {
    const yg = { ...(guards[guardYear] || {}) };
    yg[w] = { ...(yg[w] || {}), [field]: val };
    const ng = { ...guards, [guardYear]: yg };
    setGuards(ng);
    stSave("guards", ng);
  }

  function ensureYear(yr) {
    if (!guards[yr]) {
      const ng = { ...guards, [yr]: buildDefaultGuards(users, yr) };
      setGuards(ng);
      stSave("guards", ng);
    }
    setGuardYear(yr);
  }

  const approvedVacs = vacations.filter(v => v.status === "approved");
  function isVacWeek(w, userId) {
    return approvedVacs.some(v => {
      if (v.userId !== userId) return false;
      const vs = new Date(v.from), ve = new Date(v.to);
      const ws = weekMonday(guardYear, w), we = weekSunday(guardYear, w);
      return vs <= we && ve >= ws;
    });
  }

  function countGuardsYear(uid) {
    let n = 0;
    const yg = guards[guardYear] || {};
    for (let w = 1; w <= totalWeeks; w++) {
      const row = yg[w] || {};
      if (row.inspector === uid || row.manager === uid) n++;
    }
    return n;
  }

  const monthGroups = weeksByMonth(guardYear);
  const visibleWeeks = Array.from({length:totalWeeks},(_,i)=>i+1).filter(w => {
    if (filterInsp === "all") return true;
    const row = yearGuards[w] || {};
    return row.inspector === filterInsp || row.manager === filterInsp;
  });

  return (
    <div>
      <div className="tab-bar">
        {[["cuadrante","📅 Cuadrante semanal"],["equidad","📊 Contadores de equidad"]].map(([id,label]) => (
          <div key={id} className={`tab${tab===id?" on":""}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === "cuadrante" && (
        <div className="gm-layout">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <label style={{ margin:0 }}>Año:</label>
                <select value={guardYear} onChange={e => ensureYear(Number(e.target.value))} style={{ width:"auto" }}>
                  {[2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <label style={{ margin:0 }}>Filtrar:</label>
                <select value={filterInsp} onChange={e => setFilterInsp(e.target.value)} style={{ width:"auto", minWidth:160 }}>
                  <option value="all">Todos</option>
                  {inspectors.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
                  {managers.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
              <div className="week-row ghdr">
                {["Sem","Lunes – Domingo","Guardia Inspector","Guardia Gerente"].map((h,i) => (
                  <div key={i} className="wc" style={{ fontSize:"9px", fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", color:C.gris }}>{h}</div>
                ))}
              </div>
              <div style={{ maxHeight:580, overflowY:"auto" }}>
                {monthGroups.map(({ month, weeks }) => {
                  const groupWeeks = weeks.filter(w => visibleWeeks.includes(w));
                  if (groupWeeks.length === 0) return null;
                  return (
                    <div key={month}>
                      <div style={{ background:`${C.teal}10`, borderBottom:`1px solid ${C.border}`, padding:"5px 12px", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.teal }}>
                        {MONTHS[month]} {guardYear}
                      </div>
                      {groupWeeks.map(w => {
                        const row = yearGuards[w] || {};
                        const isCurr = w === todayWeek && guardYear === 2026;
                        const inspVac = row.inspector && isVacWeek(w, row.inspector);
                        const mgrVac  = row.manager   && isVacWeek(w, row.manager);
                        const retU = users.find(u => u.id === row.inspector && u.retiring);
                        const mon = weekMonday(guardYear, w);
                        const sun = weekSunday(guardYear, w);
                        const MN = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
                        const dateStr = `${mon.getDate()} ${MN[mon.getMonth()]} – ${sun.getDate()} ${MN[sun.getMonth()]}`;
                        return (
                          <div key={w} className={`week-row${isCurr?" curr":""}`}>
                            <div className="wc sem">
                              S{String(w).padStart(2,"0")}
                              {isCurr && <span style={{ marginLeft:4, fontSize:8, background:C.teal, color:"#fff", padding:"1px 4px", borderRadius:2 }}>HOY</span>}
                            </div>
                            <div className="wc dates">{dateStr}</div>
                            <div className="wc" style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <select className="isel" disabled={!canEdit} value={row.inspector||""} onChange={e => setGuard(w,"inspector",e.target.value)}>
                                <option value="">—</option>
                                {inspectors.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
                              </select>
                              {inspVac && <span className="badge badge-err" style={{ fontSize:8, flexShrink:0 }}>VAC</span>}
                              {retU && <span className="badge badge-warn" style={{ fontSize:8, flexShrink:0 }}>JUB</span>}
                            </div>
                            <div className="wc" style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <select className="isel" disabled={!canEdit} value={row.manager||""} onChange={e => setGuard(w,"manager",e.target.value)}>
                                <option value="">—</option>
                                {managers.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
                              </select>
                              {mgrVac && <span className="badge badge-err" style={{ fontSize:8, flexShrink:0 }}>VAC</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <div className="fc-card">
              <div className="fc-hdr">Resumen — inspectores</div>
              {inspectors.map(u => {
                const cnt = countGuardsYear(u.id);
                const ideal = Math.round(totalWeeks / Math.max(1, inspectors.length));
                const pct = Math.min(100, Math.round(cnt / Math.max(1, ideal) * 100));
                return (
                  <div key={u.id} className="fc-row">
                    <Av user={u} size={24}/>
                    <div style={{ flex:1 }}>
                      <div className="fc-name">{shortName(u)}{u.retiring && <span className="badge badge-warn" style={{ marginLeft:5, fontSize:8 }}>JUB</span>}</div>
                      <div className="cbar-wrap">
                        <div className="cbar" style={{ width:`${pct}%`, background: cnt > ideal + 2 ? C.rojo : cnt < ideal - 2 ? C.naranja : C.verde }}/>
                      </div>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, minWidth:22, textAlign:"right", color: cnt > ideal + 2 ? C.rojo : cnt < ideal - 2 ? C.naranja : C.verde }}>{cnt}</div>
                  </div>
                );
              })}
            </div>
            <div className="fc-card">
              <div className="fc-hdr">Resumen — gestores</div>
              {managers.map(u => {
                const cnt = countGuardsYear(u.id);
                const ideal = Math.round(totalWeeks / Math.max(1, managers.length));
                const pct = Math.min(100, Math.round(cnt / Math.max(1, ideal) * 100));
                return (
                  <div key={u.id} className="fc-row">
                    <Av user={u} size={24}/>
                    <div style={{ flex:1 }}>
                      <div className="fc-name">{shortName(u)}</div>
                      <div className="cbar-wrap">
                        <div className="cbar" style={{ width:`${pct}%`, background: cnt > ideal + 3 ? C.rojo : cnt < ideal - 3 ? C.naranja : C.verde }}/>
                      </div>
                    </div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700, minWidth:22, textAlign:"right" }}>{cnt}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "equidad" && (
        <div>
          <div className="g2">
            {inspectors.map(u => {
              const weekData = Array.from({length:totalWeeks},(_,i) => i+1).map(w => {
                const row = yearGuards[w] || {};
                return row.inspector === u.id || row.manager === u.id ? 1 : 0;
              });
              const total = weekData.reduce((a,b) => a+b, 0);
              const ideal = Math.round(52 / Math.max(1, inspectors.length));
              const pct = Math.min(100, Math.round(total / Math.max(1, ideal) * 100));
              const chunkSize = Math.ceil(totalWeeks / 5);
              const blocks = [0,1,2,3,4].map(i => weekData.slice(i*chunkSize,(i+1)*chunkSize).reduce((a,b)=>a+b,0));
              return (
                <div key={u.id} className="card" style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <Av user={u} size={30}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12.5, fontWeight:700 }}>{shortName(u)}{u.retiring&&<span className="badge badge-warn" style={{ marginLeft:6, fontSize:8 }}>JUB</span>}</div>
                      <div style={{ fontSize:10.5, color:C.gris }}>{total} guardias · ideal {ideal}</div>
                    </div>
                    <div style={{ fontSize:20, fontWeight:800, color: pct >= 110 ? C.rojo : pct <= 75 ? C.naranja : C.verde }}>{total}</div>
                  </div>
                  <div className="cbar-wrap" style={{ height:7 }}>
                    <div className="cbar" style={{ width:`${pct}%`, height:7, background: pct >= 110 ? C.rojo : pct <= 75 ? C.naranja : C.verde }}/>
                  </div>
                  <div style={{ display:"flex", gap:4, marginTop:10, fontSize:10, color:C.gris }}>
                    {blocks.map((b,i) => (
                      <div key={i} style={{ flex:1, textAlign:"center" }}>
                        <div style={{ height:24, background:`${C.teal}${Math.round(b/10*255).toString(16).padStart(2,"0")}`, borderRadius:3, marginBottom:3 }}/>
                        <span>S{i*chunkSize+1}-{Math.min((i+1)*chunkSize,totalWeeks)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  KANBAN TASKS
// ══════════════════════════════════════════════════════════════════════
const STATUSES = [
  { id:"todo",  label:"Pendiente",  color:C.gris,    bg:"rgba(163,168,163,.12)" },
  { id:"doing", label:"En curso",   color:C.naranja, bg:"rgba(255,152,0,.1)"    },
  { id:"done",  label:"Completada", color:C.verde,   bg:"rgba(0,99,56,.1)"      },
];

function CardModal({ card, users, areaColor, onSave, onClose }) {
  const [form, setForm] = useState(card || { title:"", desc:"", assignee:users[0]?.id||"", priority:"media", status:"todo" });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const isNew = !card?.id;
  return (
    <Modal title={isNew ? "Nueva tarea" : "Editar tarea"} onClose={onClose}>
      {isNew && (
        <div className="frow"><label>Área *</label>
          <select value={form._area||"T01"} onChange={e=>set("_area",e.target.value)}>
            {TASK_AREAS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.title}</option>)}
          </select>
        </div>
      )}
      <div className="frow"><label>Título *</label>
        <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Descripción breve"/>
      </div>
      <div className="frow"><label>Descripción</label>
        <textarea rows={3} value={form.desc} onChange={e=>set("desc",e.target.value)} style={{ resize:"vertical" }}/>
      </div>
      <div className="fg2">
        <div><label>Responsable</label>
          <select value={form.assignee} onChange={e=>set("assignee",e.target.value)}>
            {users.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
          </select>
        </div>
        <div><label>Prioridad</label>
          <select value={form.priority} onChange={e=>set("priority",e.target.value)}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>
      <div className="frow"><label>Estado</label>
        <select value={form.status} onChange={e=>set("status",e.target.value)}>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary btn-sm" disabled={!form.title.trim()} onClick={() => onSave({ ...form, id: card?.id || uid() })}>
          {isNew ? "Crear" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

function KanbanModule({ me, users, tasks, setTasks }) {
  const [areaId, setAreaId] = useState("ALL");
  const [filterUser, setFilterUser] = useState("all");
  const [editing, setEditing] = useState(null);
  const [addStatus, setAddStatus] = useState(null);
  const [progressView, setProgressView] = useState("agente"); // "agente" | "tipo"

  const canEdit = me.admin || me.role !== "INSPECTOR";
  const area = areaId === "ALL" ? null : TASK_AREAS.find(a => a.id === areaId);
  const sourceCards = areaId === "ALL"
    ? Object.values(tasks).flat()
    : (tasks[areaId] || []);
  const cards = sourceCards.filter(c => filterUser === "all" || c.assignee === filterUser);

  function findCardArea(id) {
    return Object.keys(tasks).find(k => tasks[k].some(c => c.id === id)) || areaId;
  }
  function saveCard(card) {
    const targetArea = card._area || areaId;
    const arr = [...(tasks[targetArea] || [])];
    const idx = arr.findIndex(c => c.id === card.id);
    const { _area, ...cleanCard } = card;
    if (idx >= 0) arr[idx] = cleanCard; else arr.push(cleanCard);
    const nt = { ...tasks, [targetArea]: arr };
    setTasks(nt); stSave("tasks", nt);
    setEditing(null); setAddStatus(null);
  }
  function moveCard(id, newStatus) {
    const target = findCardArea(id);
    const arr = (tasks[target] || []).map(c => c.id === id ? { ...c, status: newStatus } : c);
    const nt = { ...tasks, [target]: arr };
    setTasks(nt); stSave("tasks", nt);
  }
  function deleteCard(id) {
    const target = findCardArea(id);
    const arr = (tasks[target] || []).filter(c => c.id !== id);
    const nt = { ...tasks, [target]: arr };
    setTasks(nt); stSave("tasks", nt);
  }

  // Progress per agent (all areas)
  const allCards = Object.values(tasks).flat();
  const agentProgress = users.map(u => {
    const mine = allCards.filter(c => c.assignee === u.id);
    const done = mine.filter(c => c.status === "done").length;
    return { user:u, total:mine.length, done };
  }).filter(x => x.total > 0).sort((a,b) => b.total - a.total);

  return (
    <div>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ flex:1 }}>
          <div className="achips">
            <div className={`achip${areaId==="ALL"?" on":""}`}
              style={{ "--ac":C.ink, "--bg":"rgba(26,46,46,.08)" }}
              onClick={() => setAreaId("ALL")}>
              <span>📋</span> Todas las áreas
            </div>
            {TASK_AREAS.map(a => (
              <div key={a.id} className={`achip${areaId===a.id?" on":""}`}
                style={{ "--ac":a.color, "--bg":`${a.color}12` }}
                onClick={() => setAreaId(a.id)}>
                <span>{a.icon}</span> {a.code} · {a.title}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <label style={{ margin:0, whiteSpace:"nowrap" }}>Ver agente:</label>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ width:"auto", minWidth:180 }}>
          <option value="all">Todos</option>
          {users.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
        </select>
        {canEdit && areaId !== "ALL" && (
          <button className="btn btn-primary btn-sm" style={{ marginLeft:"auto" }}
            onClick={() => setAddStatus("todo")}>+ Nueva tarea</button>
        )}
      </div>
      <div className="kb-board">
        {STATUSES.map(st => {
          const cols = cards.filter(c => c.status === st.id);
          return (
            <div key={st.id} className="kbcol" style={{ "--col":st.color, "--col-bg":st.bg }}>
              <div className="kbch">
                <div className="kbcl">{st.label}</div>
                <div className="kbcc">{cols.length}</div>
              </div>
              {cols.map(card => {
                const assignee = users.find(u => u.id === card.assignee);
                const prevSt = STATUSES[STATUSES.findIndex(s => s.id === st.id) - 1];
                const nextSt = STATUSES[STATUSES.findIndex(s => s.id === st.id) + 1];
                const cardArea = areaId === "ALL" ? TASK_AREAS.find(a => (tasks[a.id]||[]).some(c => c.id === card.id)) : area;
                return (
                  <div key={card.id} className="kcard" style={{ "--areaC":cardArea?.color }}>
                    <div className="kstrip" style={{ background:cardArea?.color }}/>
                    {areaId === "ALL" && cardArea && <div style={{ fontSize:9, color:cardArea.color, fontWeight:700, padding:"3px 0 0 0", letterSpacing:.5 }}>{cardArea.icon} {cardArea.title}</div>}
                    <div className="ktitle">{card.title}</div>
                    {card.desc && <div className="kdesc">{card.desc}</div>}
                    <div className="kfoot">
                      <div className="kwho">
                        {assignee && <Av user={assignee} size={18}/>}
                        <span>{assignee ? shortName(assignee) : "—"}</span>
                      </div>
                      <span className={`pill p-${card.priority}`}>{card.priority}</span>
                    </div>
                    {canEdit && (
                      <div className="kacts">
                        {prevSt && <button className="kbtn" onClick={() => moveCard(card.id, prevSt.id)}>← {prevSt.label}</button>}
                        {nextSt && <button className="kbtn" onClick={() => moveCard(card.id, nextSt.id)}>{nextSt.label} →</button>}
                        <button className="kbtn" onClick={() => setEditing(card)}>✏</button>
                        <button className="kbtn del" onClick={() => deleteCard(card.id)}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {canEdit && st.id === "todo" && areaId !== "ALL" && (
                <button className="kadd" onClick={() => setAddStatus("todo")}>+ Añadir</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:24, marginBottom:16 }}>
        <div className="sl" style={{ margin:0, flex:1 }}>Progreso</div>
        <div style={{ display:"flex", gap:4 }}>
          {[["agente","Por agente"],["tipo","Por tipo de tarea"]].map(([v,l]) => (
            <button key={v} className={`btn btn-sm ${progressView===v?"btn-primary":"btn-ghost"}`}
              onClick={() => setProgressView(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Progress by task type */}
      {progressView === "tipo" && (
        <div className="g3">
          {TASK_AREAS.map(a => {
            const aCards = Object.values(tasks).flat().filter(c => {
              const inArea = (tasks[a.id]||[]).some(x => x.id === c.id);
              return inArea && (filterUser === "all" || c.assignee === filterUser);
            });
            const aAll = (tasks[a.id]||[]).filter(c => filterUser === "all" || c.assignee === filterUser);
            const total = aAll.length;
            const done  = aAll.filter(c => c.status === "done").length;
            const doing = aAll.filter(c => c.status === "doing").length;
            if (total === 0) return null;
            const pct = Math.round(done / total * 100);
            return (
              <div key={a.id} className="card" style={{ padding:"12px 14px", borderTop:`3px solid ${a.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ fontSize:18 }}>{a.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:a.color }}>{a.code} · {a.title}</div>
                    <div style={{ fontSize:10, color:C.gris, marginTop:1 }}>{done}/{total} completadas · {doing} en curso</div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color: pct >= 75 ? C.verde : pct >= 40 ? C.naranja : C.gris }}>{pct}%</div>
                </div>
                <div className="cbar-wrap">
                  <div className="cbar" style={{ width:`${pct}%`, background:a.color }}/>
                </div>
                <div style={{ display:"flex", gap:4, marginTop:8 }}>
                  {STATUSES.map(s => {
                    const n = aAll.filter(c => c.status === s.id).length;
                    return n > 0 ? <span key={s.id} className="badge" style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}25` }}>{s.label}: {n}</span> : null;
                  })}
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      )}

      {/* Progress per agent */}
      {progressView === "agente" && agentProgress.length > 0 && (
        <div>
          <div className="sl" style={{ marginBottom:14 }}>Progreso global por agente</div>
          <div className="g3">
            {agentProgress.map(({ user:u, total, done }) => {
              const pct = Math.round(done / Math.max(1, total) * 100);
              return (
                <div key={u.id} className="card" style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <Av user={u} size={26}/>
                    <div>
                      <div style={{ fontSize:11.5, fontWeight:600 }}>{fullName(u)}</div>
                      <div style={{ fontSize:10, color:C.gris }}>{done}/{total} completadas</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color: pct >= 75 ? C.verde : pct >= 40 ? C.naranja : C.gris }}>{pct}%</div>
                  </div>
                  <div className="cbar-wrap">
                    <div className="cbar" style={{ width:`${pct}%`, background: pct >= 75 ? C.verde : pct >= 40 ? C.naranja : C.gris }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(editing || addStatus) && (
        <CardModal
          card={editing ? { ...editing, _area: findCardArea(editing.id) } : { status: addStatus || "todo", _area: areaId }}
          users={users}
          areaColor={area?.color}
          onSave={saveCard}
          onClose={() => { setEditing(null); setAddStatus(null); }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  VACATIONS MODULE
// ══════════════════════════════════════════════════════════════════════
function VacModule({ me, users, vacations, setVacations, guards }) {
  const [tab, setTab] = useState("solicitar");
  const [form, setForm] = useState({ from:"", to:"", note:"" });
  const [confirm, setConfirm] = useState(null);
  const canApprove = me.canApproveVac || me.admin || me.role === "GERENTE";
  const myVacs = vacations.filter(v => v.userId === me.id);
  const usedDays = myVacs.filter(v => v.status !== "rejected").reduce((s,v) => s + daysBetween(v.from,v.to), 0);
  const totalDays = 22;
  const remaining = Math.max(0, totalDays - usedDays);

  function submitVac() {
    if (!form.from || !form.to) return;
    const days = daysBetween(form.from, form.to);
    const guardsFlat = guards[2026] || guards;
    const conflicts = vacConflictsGuards({ userId:me.id, from:form.from, to:form.to }, guardsFlat, 2026);
    const newVac = { id:uid(), userId:me.id, from:form.from, to:form.to, days, note:form.note, status:"pending", conflicts };
    const nv = [...vacations, newVac];
    setVacations(nv); stSave("vacations", nv);
    setForm({ from:"", to:"", note:"" });
  }

  function approveVac(vac, approve) {
    if (!canApprove) return;
    if (vac.conflicts?.length > 0 && approve) {
      setConfirm({ vac, approve });
      return;
    }
    doApprove(vac, approve);
  }

  function doApprove(vac, approve) {
    const nv = vacations.map(v => v.id === vac.id ? { ...v, status: approve ? "approved" : "rejected" } : v);
    setVacations(nv); stSave("vacations", nv);
    setConfirm(null);
  }

  function deleteVac(id) {
    const nv = vacations.filter(v => v.id !== id);
    setVacations(nv); stSave("vacations", nv);
  }

  const days = form.from && form.to ? daysBetween(form.from, form.to) : 0;

  return (
    <div>
      {confirm && (
        <Confirm
          message={`Esta solicitud solapa con las semanas de guardia ${confirm.vac.conflicts.join(", ")}. ¿Deseas ${confirm.approve ? "aprobar" : "rechazar"} igualmente?`}
          dangerous={confirm.approve}
          onYes={() => doApprove(confirm.vac, confirm.approve)}
          onNo={() => setConfirm(null)}
        />
      )}
      <div className="tab-bar">
        {[["solicitar","✉ Mi solicitud"],["mis","📋 Mis vacaciones"],
          ...(canApprove ? [["todas","👔 Gestión equipo"]] : []),
          ["calendario","📅 Calendario equipo"]
        ].map(([id,label]) => (
          <div key={id} className={`tab${tab===id?" on":""}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === "solicitar" && (
        <div className="g2">
          <div className="card">
            <div className="sl">Nueva solicitud de vacaciones</div>
            <div className="fg2">
              <div><label>Fecha inicio</label><input type="date" value={form.from} onChange={e => setForm(f=>({...f,from:e.target.value}))}/></div>
              <div><label>Fecha fin</label><input type="date" value={form.to} min={form.from} onChange={e => setForm(f=>({...f,to:e.target.value}))}/></div>
            </div>
            {days > 0 && (
              <div style={{ background:"rgba(0,118,129,.06)", border:`1px solid ${C.teal}30`, borderRadius:6, padding:"8px 12px", marginBottom:12, fontSize:12, color:C.teal, fontWeight:600 }}>
                {days} días hábiles · {remaining - days >= 0 ? `Quedarán ${remaining - days} días` : `⚠ Excede tu saldo`}
              </div>
            )}
            <div className="frow"><label>Nota (opcional)</label>
              <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} placeholder="Motivo o comentario"/>
            </div>
            <button className="btn btn-primary" disabled={!form.from||!form.to||days<=0} onClick={submitVac}>Enviar solicitud</button>
          </div>
          <div className="card">
            <div className="sl">Saldo de vacaciones — {fullName(me)}</div>
            <div style={{ fontSize:32, fontWeight:800, color:remaining > 10 ? C.verde : remaining > 5 ? C.naranja : C.rojo }}>{remaining}</div>
            <div style={{ fontSize:12, color:C.gris, marginBottom:12 }}>días disponibles de {totalDays}</div>
            <div className="cbar-wrap" style={{ height:8 }}>
              <div className="cbar" style={{ width:`${Math.round(usedDays/totalDays*100)}%`, height:8, background: remaining > 10 ? C.verde : remaining > 5 ? C.naranja : C.rojo }}/>
            </div>
            <div style={{ fontSize:11, color:C.gris, marginTop:6 }}>{usedDays} días usados</div>
          </div>
        </div>
      )}

      {tab === "mis" && (
        <div className="card">
          <div className="sl">Mis solicitudes de vacaciones</div>
          {myVacs.length === 0
            ? <div style={{ fontSize:12, color:C.gris }}>No has solicitado vacaciones aún.</div>
            : myVacs.map(v => (
              <div key={v.id} className="vac-row">
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{fmtDate(v.from)} → {fmtDate(v.to)}</div>
                  <div style={{ fontSize:10.5, color:C.gris }}>{v.days} días{v.note ? ` · ${v.note}` : ""}</div>
                  {v.conflicts?.length > 0 && <div style={{ fontSize:10, color:C.naranja, marginTop:1 }}>⚠ Conflicto guardia semanas: {v.conflicts.join(", ")}</div>}
                </div>
                <span className={`pill p-${v.status}`}>{v.status === "pending" ? "Pendiente" : v.status === "approved" ? "Aprobada" : "Rechazada"}</span>
                {v.status === "pending" && (
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteVac(v.id)}>✕ Cancelar</button>
                )}
              </div>
            ))}
        </div>
      )}

      {tab === "todas" && canApprove && (
        <div className="card">
          <div className="sl">Solicitudes pendientes de aprobación</div>
          {vacations.filter(v => v.status === "pending").length === 0
            ? <div style={{ fontSize:12, color:C.gris }}>No hay solicitudes pendientes.</div>
            : vacations.filter(v => v.status === "pending").map(v => {
              const u = users.find(x => x.id === v.userId);
              return (
                <div key={v.id} className="vac-row">
                  <Av user={u || { role:"INSPECTOR", retiring:false, name:"?" }} size={28}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600 }}>{u ? fullName(u) : v.userId} — {fmtDate(v.from)} → {fmtDate(v.to)}</div>
                    <div style={{ fontSize:10.5, color:C.gris }}>{v.days} días{v.note ? ` · ${v.note}` : ""}</div>
                    {v.conflicts?.length > 0 && <div style={{ fontSize:10, color:C.naranja, marginTop:1 }}>⚠ Conflicto semanas: {v.conflicts.join(", ")}</div>}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn btn-green btn-sm" onClick={() => approveVac(v, true)}>✓ Aprobar</button>
                    <button className="btn btn-red btn-sm" onClick={() => approveVac(v, false)}>✕ Rechazar</button>
                  </div>
                </div>
              );
            })}
          <div className="sl" style={{ marginTop:20 }}>Historial</div>
          {vacations.filter(v => v.status !== "pending").map(v => {
            const u = users.find(x => x.id === v.userId);
            return (
              <div key={v.id} className="vac-row">
                <Av user={u || { role:"INSPECTOR", retiring:false, name:"?" }} size={26}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{u ? fullName(u) : ""} — {fmtDate(v.from)} → {fmtDate(v.to)}</div>
                  <div style={{ fontSize:10, color:C.gris }}>{v.days} días</div>
                </div>
                <span className={`pill p-${v.status}`}>{v.status === "approved" ? "Aprobada" : "Rechazada"}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "calendario" && (
        <VacCalendar users={users} vacations={vacations.filter(v => v.status === "approved")}/>
      )}
    </div>
  );
}

function VacCalendar({ users, vacations }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth());
  const totalDays = daysInMonth(year, month);
  const fd = firstDay(year, month);
  const todayStr = `${year}-${String(month+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`;

  function userOnDay(uid, d) {
    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return vacations.some(v => v.userId === uid && v.from <= ds && v.to >= ds);
  }

  return (
    <div className="card">
      <div className="cal-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => { if (month === 0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); }}>←</button>
        <div style={{ fontSize:15, fontWeight:700 }}>{MONTHS[month]} {year}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (month === 11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); }}>→</button>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", fontSize:11 }}>
          <thead>
            <tr>
              <th style={{ padding:"5px 8px", textAlign:"left", fontSize:10, color:C.gris, fontWeight:700, background:C.smoke, minWidth:130 }}>Agente</th>
              {Array.from({length:totalDays},(_,i)=>i+1).map(d => {
                const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                return <th key={d} style={{ padding:"3px 2px", fontSize:9, color: ds===todayStr?C.teal:C.gris, fontWeight:700, minWidth:18, textAlign:"center", background:C.smoke }}>{d}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding:"5px 8px", fontSize:11, fontWeight:500, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{shortName(u)}</td>
                {Array.from({length:totalDays},(_,i)=>i+1).map(d => (
                  <td key={d} style={{ padding:"3px 2px", textAlign:"center", borderBottom:`1px solid ${C.border}`, background: userOnDay(u.id, d) ? `${C.verde}30` : "" }}>
                    {userOnDay(u.id, d) ? <div style={{ width:12, height:12, borderRadius:2, background:C.verde, margin:"0 auto" }}/> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  CALENDAR (EVENTS)
// ══════════════════════════════════════════════════════════════════════
function CalendarModule({ me, users, events, setEvents, vacations }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const canEdit = me.admin || me.role === "GERENTE" || me.role === "TECNICO";
  const approvedVacs = vacations.filter(v => v.status === "approved");

  const totalDays = daysInMonth(year, month);
  const fd = firstDay(year, month);
  const todayStr = new Date().toISOString().split("T")[0];
  const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;

  function eventsOnDay(d) {
    const ds = `${monthStr}-${String(d).padStart(2,"0")}`;
    return events.filter(e => e.date === ds && (e.global || e.users.includes(me.id)));
  }
  function vacsOnDay(d) {
    const ds = `${monthStr}-${String(d).padStart(2,"0")}`;
    return approvedVacs.filter(v => v.from <= ds && v.to >= ds);
  }
  function saveEvent(ev) {
    const ne = ev.id ? events.map(e => e.id === ev.id ? ev : e) : [...events, { ...ev, id:uid() }];
    setEvents(ne); stSave("events", ne);
    setEditing(null);
  }
  function deleteEvent(id) {
    const ne = events.filter(e => e.id !== id);
    setEvents(ne); stSave("events", ne);
    setSelected(null);
  }

  const cells = [];
  for (let i = 0; i < fd; i++) cells.push({ day:0, prev:true });
  for (let d = 1; d <= totalDays; d++) cells.push({ day:d });
  while (cells.length % 7 !== 0) cells.push({ day:0, next:true });

  const selectedDs = selected ? `${monthStr}-${String(selected).padStart(2,"0")}` : null;
  const selEvents = selectedDs ? events.filter(e => e.date === selectedDs) : [];
  const selVacs   = selectedDs ? approvedVacs.filter(v => v.from <= selectedDs && v.to >= selectedDs) : [];

  return (
    <div className="cal-grid">
      <div>
        <div className="cal-nav">
          <button className="btn btn-ghost btn-sm" onClick={() => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }}>←</button>
          <div style={{ fontSize:16, fontWeight:700 }}>{MONTHS[month]} {year}</div>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }}>→</button>
        </div>
        <div className="cal-month-grid">
          {WDAYS.map(d => <div key={d} className="cdhdr">{d}</div>)}
          {cells.map((c,i) => {
            if (c.day === 0) return <div key={i} className="cday otherM"/>;
            const isToday = `${monthStr}-${String(c.day).padStart(2,"0")}` === todayStr;
            const dayEvs = eventsOnDay(c.day);
            const dayVacs = vacsOnDay(c.day);
            return (
              <div key={i} className={`cday${isToday?" today":""}${selected===c.day?" on":""}`}
                style={{ cursor:"pointer", background: selected===c.day?"rgba(0,118,129,.08)":"" }}
                onClick={() => setSelected(c.day)}>
                <div className="cdn">{c.day}</div>
                {dayVacs.length > 0 && <div className="cev" style={{ background:`${C.verde}25`, color:C.verde }}>🌴 {dayVacs.length} vac</div>}
                {dayEvs.map(ev => {
                  const et = EVENT_TYPES.find(t => t.id === ev.type);
                  return <div key={ev.id} className="cev" style={{ background:`${et?.color}20`, color:et?.color }}>{ev.title}</div>;
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        {canEdit && (
          <button className="btn btn-primary btn-sm" style={{ marginBottom:14, width:"100%", justifyContent:"center" }}
            onClick={() => setEditing({ title:"", date:`${monthStr}-${String(selected||1).padStart(2,"0")}`, type:"reunion", users:[], global:true, desc:"" })}>
            + Nuevo evento
          </button>
        )}
        {/* Próximos eventos */}
        {(() => {
          const upcoming = events
            .filter(e => e.date >= todayStr && (e.global || e.users.includes(me.id)))
            .sort((a,b) => a.date.localeCompare(b.date))
            .slice(0, 6);
          if (upcoming.length === 0) return null;
          return (
            <div style={{ marginBottom:16 }}>
              <div className="sl">Próximos eventos</div>
              {upcoming.map(ev => {
                const et = EVENT_TYPES.find(t => t.id === ev.type);
                return (
                  <div key={ev.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ minWidth:32, textAlign:"center", flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:et?.color, lineHeight:1 }}>{ev.date.split("-")[2]}</div>
                      <div style={{ fontSize:9, color:C.gris, textTransform:"uppercase", letterSpacing:.5 }}>{["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][Number(ev.date.split("-")[1])-1]}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11.5, fontWeight:600, lineHeight:1.3 }}>{ev.title}</div>
                      <span className="badge" style={{ background:`${et?.color}15`, color:et?.color, border:`1px solid ${et?.color}25`, marginTop:2 }}>{et?.label}</span>
                    </div>
                    {canEdit && <button className="btn btn-ghost btn-sm" style={{ flexShrink:0 }} onClick={() => setEditing(ev)}>✏</button>}
                  </div>
                );
              })}
            </div>
          );
        })()}
        {selected ? (
          <div>
            <div className="sl">Día {selected} de {MONTHS[month]}</div>
            {selVacs.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.verde, marginBottom:5, letterSpacing:1 }}>VACACIONES</div>
                {selVacs.map(v => {
                  const u = users.find(x => x.id === v.userId);
                  return <div key={v.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 0", borderBottom:`1px solid ${C.border}`, fontSize:11.5 }}>
                    {u && <Av user={u} size={22}/>} {u ? fullName(u) : ""}
                  </div>;
                })}
              </div>
            )}
            {selEvents.length === 0 && selVacs.length === 0 && <div style={{ fontSize:12, color:C.gris }}>Sin eventos este día.</div>}
            {selEvents.map(ev => {
              const et = EVENT_TYPES.find(t => t.id === ev.type);
              return (
                <div key={ev.id} className="card" style={{ marginBottom:8, padding:"11px 13px", borderLeft:`3px solid ${et?.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:700, marginBottom:3 }}>{ev.title}</div>
                      <span className="badge" style={{ background:`${et?.color}15`, color:et?.color, border:`1px solid ${et?.color}25` }}>{et?.label}</span>
                    </div>
                    {canEdit && (
                      <div style={{ display:"flex", gap:4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(ev)}>✏</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:C.rojo }} onClick={() => deleteEvent(ev.id)}>✕</button>
                      </div>
                    )}
                  </div>
                  {ev.desc && <div style={{ fontSize:11, color:C.gris, marginTop:6 }}>{ev.desc}</div>}
                  {ev.global ? <div style={{ fontSize:10, color:C.teal, marginTop:4 }}>● Todo el equipo</div>
                    : ev.users.length > 0 ? <div style={{ fontSize:10, color:C.gris, marginTop:4 }}>Asignado: {ev.users.map(id => { const u = users.find(x=>x.id===id); return u ? shortName(u) : id; }).join(", ")}</div>
                    : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize:12, color:C.gris }}>Selecciona un día del calendario.</div>
        )}
        <div style={{ marginTop:16 }}>
          <div className="sl">Leyenda</div>
          {EVENT_TYPES.map(et => (
            <div key={et.id} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, fontSize:11.5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:et.color, flexShrink:0 }}/>
              {et.label}
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <EventModal ev={editing} users={users} onSave={saveEvent} onClose={() => setEditing(null)}/>
      )}
    </div>
  );
}

function EventModal({ ev, users, onSave, onClose }) {
  const [form, setForm] = useState(ev);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <Modal title={ev.id ? "Editar evento" : "Nuevo evento"} onClose={onClose}>
      <div className="frow"><label>Título *</label>
        <input value={form.title} onChange={e=>set("title",e.target.value)}/>
      </div>
      <div className="fg2">
        <div><label>Fecha</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
        <div><label>Tipo</label>
          <select value={form.type} onChange={e=>set("type",e.target.value)}>
            {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="frow"><label>Descripción</label>
        <textarea rows={2} value={form.desc||""} onChange={e=>set("desc",e.target.value)} style={{ resize:"vertical" }}/>
      </div>
      <div className="frow" style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Toggle on={form.global} onChange={v=>set("global",v)}/>
        <span style={{ fontSize:12 }}>Todo el equipo</span>
      </div>
      {!form.global && (
        <div className="frow"><label>Asignar a</label>
          <select multiple value={form.users} onChange={e=>set("users",Array.from(e.target.selectedOptions,o=>o.value))} style={{ height:100 }}>
            {users.map(u => <option key={u.id} value={u.id}>{shortName(u)}</option>)}
          </select>
        </div>
      )}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary btn-sm" disabled={!form.title.trim()||!form.date} onClick={() => onSave(form)}>
          {ev.id ? "Guardar" : "Crear"}
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  DIRECTORY
// ══════════════════════════════════════════════════════════════════════
function DirectoryModule({ me, users }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const canSeeSensitive = ROLES[me.role]?.level >= 2;

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.mat.includes(search) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input placeholder="Buscar por nombre, matrícula o email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} style={{ width:"auto" }}>
          <option value="all">Todos los roles</option>
          {Object.entries(ROLES).map(([k,r]) => <option key={k} value={k}>{r.label}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:12 }}>
        {filtered.map(u => (
          <div key={u.id} className="dir-card">
            <Av user={u} size={40}/>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{u.name}</div>
                {u.retiring && <span className="badge badge-warn" style={{ fontSize:8 }}>JUB</span>}
                {u.admin && <span className="badge" style={{ background:`${C.naranja}15`, color:C.naranja, border:`1px solid ${C.naranja}30`, fontSize:8 }}>ADMIN</span>}
              </div>
              <RBadge role={u.role}/>
              <div style={{ marginTop:7, display:"flex", flexDirection:"column", gap:3 }}>
                <div style={{ fontSize:11, color:C.gris }}>📧 {u.email}</div>
                <div style={{ fontSize:11, color:C.gris }}>📍 {u.loc}</div>
                {canSeeSensitive && <>
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.ink }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:C.teal, flexShrink:0 }}>
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="2" y1="17" x2="22" y2="17"/><circle cx="7" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>
                    </svg>
                    Matrícula: {u.mat}
                  </div>
                  <div style={{ fontSize:11, color:C.ink }}>📞 {u.telL} · Ext. {u.telC}</div>
                  <div style={{ fontSize:11, color:C.ink }}>DNI: {u.dni}</div>
                </>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ADMIN MODULE
// ══════════════════════════════════════════════════════════════════════
function AdminModule({ me, users, setUsers }) {
  const [tab, setTab] = useState("usuarios");
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState(false);
  const [pwForm, setPwForm] = useState({ old:"", new1:"", new2:"", err:"" });
  const [pwOk, setPwOk] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  const canManage = me.admin || me.role === "GERENTE";

  function saveUser(u) {
    let nu;
    if (u.id) nu = users.map(x => x.id === u.id ? u : x);
    else nu = [...users, { ...u, id:`U${Date.now()}`, pass:u.mat }];
    setUsers(nu); stSave("users", nu);
    setEditUser(null); setNewUser(false);
  }
  function deleteUser(id) {
    const nu = users.filter(u => u.id !== id);
    setUsers(nu); stSave("users", nu);
    setDelConfirm(null);
  }

  function changeMyPw() {
    if (me.pass !== pwForm.old) { setPwForm(f=>({...f,err:"Contraseña actual incorrecta"})); return; }
    if (pwForm.new1 !== pwForm.new2) { setPwForm(f=>({...f,err:"Las contraseñas nuevas no coinciden"})); return; }
    if (pwForm.new1.length < 4) { setPwForm(f=>({...f,err:"Mínimo 4 caracteres"})); return; }
    const nu = users.map(u => u.id === me.id ? { ...u, pass:pwForm.new1 } : u);
    setUsers(nu); stSave("users", nu);
    setPwOk(true); setPwForm({ old:"", new1:"", new2:"", err:"" });
  }

  return (
    <div>
      {delConfirm && (
        <Confirm message={`¿Eliminar a ${users.find(u=>u.id===delConfirm)?.name}?`} dangerous
          onYes={() => deleteUser(delConfirm)} onNo={() => setDelConfirm(null)}/>
      )}
      <div className="tab-bar">
        {[["usuarios","👤 Gestión usuarios"],["roles","🔑 Roles y permisos"],["password","🔒 Mi contraseña"]].map(([id,label]) => (
          <div key={id} className={`tab${tab===id?" on":""}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === "usuarios" && (
        <div>
          {canManage && (
            <button className="btn btn-primary btn-sm" style={{ marginBottom:16 }} onClick={() => setNewUser(true)}>+ Nuevo agente</button>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
            {users.map(u => (
              <div key={u.id} className="ua-card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <Av user={u} size={34}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{u.name}</div>
                    <div style={{ display:"flex", gap:5, marginTop:2, flexWrap:"wrap" }}>
                      <RBadge role={u.role}/>
                      {u.admin && <span className="badge" style={{ background:`${C.naranja}15`, color:C.naranja, border:`1px solid ${C.naranja}30` }}>Admin</span>}
                      {u.canApproveVac && <span className="badge badge-ok">Aprueba Vac.</span>}
                      {u.retiring && <span className="badge badge-warn">Jub.</span>}
                    </div>
                  </div>
                  {canManage && (
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditUser({...u})}>✏</button>
                      {u.id !== me.id && <button className="btn btn-ghost btn-sm" style={{ color:C.rojo }} onClick={() => setDelConfirm(u.id)}>✕</button>}
                    </div>
                  )}
                </div>
                <div style={{ fontSize:10.5, color:C.gris, display:"flex", flexDirection:"column", gap:2 }}>
                  <span>Mat. {u.mat} · {u.email}</span>
                  <span>{u.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "roles" && canManage && (
        <div>
          <div className="sl">Permisos por rol</div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Agente</th><th>Rol</th><th>Admin</th><th>Aprueba vacaciones</th><th>En jubilación</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div style={{ display:"flex", alignItems:"center", gap:8 }}><Av user={u} size={24}/>{shortName(u)}</div></td>
                  <td>
                    <select value={u.role} onChange={e => saveUser({...u, role:e.target.value})} style={{ width:"auto", minWidth:120 }}>
                      {Object.keys(ROLES).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
                    </select>
                  </td>
                  <td>
                    {u.id !== me.id
                      ? <Toggle on={u.admin} onChange={v => saveUser({...u, admin:v})}/>
                      : <span style={{ fontSize:11, color:C.gris }}>—</span>}
                  </td>
                  <td><Toggle on={u.canApproveVac} onChange={v => saveUser({...u, canApproveVac:v})}/></td>
                  <td><Toggle on={u.retiring||false} onChange={v => saveUser({...u, retiring:v})}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "password" && (
        <div className="card" style={{ maxWidth:400 }}>
          <div className="sl">Cambiar mi contraseña</div>
          {pwOk && <div style={{ background:"rgba(0,99,56,.08)", border:`1px solid ${C.verde}30`, borderRadius:6, padding:"10px 14px", fontSize:12, color:C.verde, marginBottom:12 }}>✓ Contraseña actualizada correctamente.</div>}
          {pwForm.err && <div className="lerr">{pwForm.err}</div>}
          <div className="frow"><label>Contraseña actual</label>
            <input type="password" value={pwForm.old} onChange={e=>setPwForm(f=>({...f,old:e.target.value,err:""}))}/>
          </div>
          <div className="frow"><label>Nueva contraseña</label>
            <input type="password" value={pwForm.new1} onChange={e=>setPwForm(f=>({...f,new1:e.target.value,err:""}))}/>
          </div>
          <div className="frow"><label>Confirmar nueva contraseña</label>
            <input type="password" value={pwForm.new2} onChange={e=>setPwForm(f=>({...f,new2:e.target.value,err:""}))}/>
          </div>
          <button className="btn btn-primary" onClick={changeMyPw}>Cambiar contraseña</button>
        </div>
      )}

      {(editUser || newUser) && canManage && (
        <UserModal
          user={editUser || { name:"", short:"", mat:"", role:"INSPECTOR", admin:false, canApproveVac:false, retiring:false, dni:"", telC:"", telL:"", email:"", loc:"Villaverde Bajo (Madrid)", pass:"" }}
          isNew={!editUser}
          onSave={saveUser}
          onClose={() => { setEditUser(null); setNewUser(false); }}
        />
      )}
    </div>
  );
}

function UserModal({ user, isNew, onSave, onClose }) {
  const [form, setForm] = useState(user);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <Modal title={isNew ? "Nuevo agente" : `Editar — ${user.name}`} onClose={onClose} lg>
      <div className="fg2">
        <div><label>Nombre completo *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Apellidos, Nombre"/></div>
        <div><label>Nombre corto</label><input value={form.short||""} onChange={e=>set("short",e.target.value)} placeholder="Apellido, N."/></div>
      </div>
      <div className="fg2">
        <div><label>Matrícula *</label><input value={form.mat} onChange={e=>set("mat",e.target.value)}/></div>
        <div><label>Rol</label>
          <select value={form.role} onChange={e=>set("role",e.target.value)}>
            {Object.keys(ROLES).map(r=><option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
        </div>
      </div>
      <div className="fg2">
        <div><label>Email</label><input value={form.email||""} onChange={e=>set("email",e.target.value)}/></div>
        <div><label>Localidad</label><input value={form.loc||""} onChange={e=>set("loc",e.target.value)}/></div>
      </div>
      <div className="fg2">
        <div><label>Tel. laboral</label><input value={form.telL||""} onChange={e=>set("telL",e.target.value)}/></div>
        <div><label>Extensión</label><input value={form.telC||""} onChange={e=>set("telC",e.target.value)}/></div>
      </div>
      <div className="fg2">
        <div><label>DNI</label><input value={form.dni||""} onChange={e=>set("dni",e.target.value)}/></div>
        {isNew && <div><label>Contraseña inicial</label><input value={form.pass||form.mat} onChange={e=>set("pass",e.target.value)}/></div>}
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:12 }}>
        <label className="toggle" style={{ textTransform:"none", letterSpacing:0, fontWeight:400, cursor:"pointer" }}>
          <Toggle on={form.admin||false} onChange={v=>set("admin",v)}/> Administrador
        </label>
        <label className="toggle" style={{ textTransform:"none", letterSpacing:0, fontWeight:400, cursor:"pointer" }}>
          <Toggle on={form.canApproveVac||false} onChange={v=>set("canApproveVac",v)}/> Aprueba vacaciones
        </label>
        <label className="toggle" style={{ textTransform:"none", letterSpacing:0, fontWeight:400, cursor:"pointer" }}>
          <Toggle on={form.retiring||false} onChange={v=>set("retiring",v)}/> En jubilación
        </label>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary btn-sm" disabled={!form.name.trim()||!form.mat.trim()} onClick={() => onSave({ ...form, pass:form.pass||form.mat, short:form.short||form.name.split(",")[0] })}>{isNew?"Crear agente":"Guardar cambios"}</button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SIDEBAR + LAYOUT
// ══════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:"overview",   label:"Visión General",      icon:"⊞", section:"Principal"     },
  { id:"guardias",   label:"Gestión de Guardias", icon:"📅", section:"Operativo"     },
  { id:"tareas",     label:"Reparto de Tareas",   icon:"✓",  section:"Operativo"     },
  { id:"vacaciones", label:"Vacaciones",           icon:"🌴", section:"Operativo"     },
  { id:"calendario", label:"Calendario Eventos",  icon:"📆", section:"Operativo"     },
  { id:"directorio", label:"Directorio",           icon:"👥", section:"Organización"  },
  { id:"admin",      label:"Administración",       icon:"⚙",  section:"Sistema", adminOnly:true },
];

function Sidebar({ me, active, setActive, onLogout, pendingVac }) {
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const canSeeAdmin = me.admin || me.role === "GERENTE";
  return (
    <aside className="sb">
      <div className="sb-top">
        <AdifLogoWhite height={32}/>
        <div style={{ fontSize:8.5, color:`${C.menta}90`, letterSpacing:1.4, textTransform:"uppercase", marginTop:5 }}>GASC Centro · Gestión Integral</div>
        <div className="sb-user">
          <Av user={me} size={30}/>
          <div>
            <div className="sb-uname">{shortName(me)}{me.admin && <span className="sb-uadm">ADM</span>}</div>
            <div className="sb-urole">{ROLES[me.role]?.label} · {me.mat}</div>
          </div>
        </div>
      </div>
      {sections.map(sec => {
        const items = NAV_ITEMS.filter(n => n.section === sec && (!n.adminOnly || canSeeAdmin));
        if (items.length === 0) return null;
        return (
          <div key={sec}>
            <div className="sb-sec">{sec}</div>
            {items.map(n => {
              const badge = n.id === "vacaciones" && pendingVac > 0 && (me.canApproveVac || me.admin || me.role==="GERENTE");
              return (
                <div key={n.id} className={`ni${active===n.id?" on":""}`} onClick={() => setActive(n.id)}>
                  <span className="ni-icon">{n.icon}</span>
                  {n.label}
                  {badge && <span style={{ marginLeft:"auto", fontSize:9, background:C.naranja, color:"#fff", padding:"2px 6px", borderRadius:10, fontWeight:700 }}>{pendingVac}</span>}
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="sb-ft">
        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><div className="b-dot"/><span style={{ fontSize:9, color:"rgba(255,255,255,.35)" }}>Bellod · Jubilación 2026</span></div>
        </div>
        <button className="sb-out" onClick={onLogout}>⏏ Cerrar sesión</button>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState(SEED_USERS);
  const [guards, setGuards] = useState({});
  const [tasks, setTasks] = useState({});
  const [vacations, setVacations] = useState([]);
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState("overview");

  // Load from storage in background
  useEffect(() => {
    (async () => {
      const [su, sg, st, sv, se] = await Promise.all([
        stLoad("users", SEED_USERS),
        stLoad("guards", null),
        stLoad("tasks", defaultTasks()),
        stLoad("vacations", []),
        stLoad("events", defaultEvents()),
      ]);
      setUsers(su);
      // Migrate: if guards is flat {1:{...},2:{...}} → wrap in year key
      let guardsData = sg;
      if (guardsData && !guardsData[2026] && guardsData[1]) {
        guardsData = { 2026: guardsData };
      }
      setGuards(guardsData || { 2026: buildDefaultGuards(su, 2026) });
      setTasks(st);
      setVacations(sv);
      setEvents(se);
    })();
  }, []);

  function handleLogin(u) {
    // get latest user data
    setMe(u);
    stSave("lastUser", u.id);
  }
  function handleLogout() {
    setMe(null);
    setActive("overview");
  }
  // Sync me when users changes (password change etc)
  useEffect(() => {
    if (me) {
      const updated = users.find(u => u.id === me.id);
      if (updated) setMe(updated);
    }
  }, [users]);

  const pendingVac = vacations.filter(v => v.status === "pending").length;

  const PAGE_PROPS = { me, users, setUsers, guards, setGuards, tasks, setTasks, vacations, setVacations, events, setEvents };

  function renderPage() {
    if (!me) return null;
    switch(active) {
      case "overview":   return <Overview {...PAGE_PROPS} guards={guards}/>;
      case "guardias":   return <GuardiasModule {...PAGE_PROPS}/>;
      case "tareas":     return <KanbanModule {...PAGE_PROPS}/>;
      case "vacaciones": return <VacModule {...PAGE_PROPS}/>;
      case "calendario": return <CalendarModule {...PAGE_PROPS}/>;
      case "directorio": return <DirectoryModule {...PAGE_PROPS}/>;
      case "admin":      return (me.admin || me.role==="GERENTE") ? <AdminModule {...PAGE_PROPS}/> : <div style={{ padding:40, color:C.gris }}>Acceso restringido.</div>;
      default:           return <Overview {...PAGE_PROPS} guards={guards}/>;
    }
  }

  const navMeta = NAV_ITEMS.find(n => n.id === active) || NAV_ITEMS[0];

  if (!me) return (
    <div className="app">
      <style>{CSS}</style>
      <Login users={users} onLogin={handleLogin}/>
    </div>
  );

  return (
    <div className="app layout">
      <style>{CSS}</style>
      <Sidebar me={me} active={active} setActive={setActive} onLogout={handleLogout} pendingVac={pendingVac}/>
      <main className="main">
        <div className="ph">
          <div>
            <div className="ph-eye">GASC Centro · 2026 · {ROLES[me.role]?.label}</div>
            <div className="ph-title">{navMeta.label}</div>
          </div>
          <div className="ph-meta" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <AdifLogoColor height={28}/>
            <div style={{ fontSize:10, color:C.gris }}>D. Seguridad Circulación</div>
            <div style={{ fontSize:10, color:C.gris }}>GASC Centro · {new Date().toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</div>
          </div>
        </div>
        <div className="ct">{renderPage()}</div>
      </main>
    </div>
  );
}
