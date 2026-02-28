import { useState, useEffect, useCallback } from "react";

// ─── BRAND ────────────────────────────────────────────────────────────
const C = {
  verde:   "#006338", teal:    "#007681", negro:   "#00292E",
  gris:    "#A3A8A3", menta:   "#C7EEE9", naranja: "#FF9800",
  ink:     "#1A2E2E", smoke:   "#F4F6F6", border:  "#E2EAEA",
  azul:    "#005B9F", lila:    "#6B46C1", rojo:    "#C0392B",
};

// ─── INSPECTOR / MANAGER DATA ──────────────────────────────────────────
const INSPECTORS = [
  { id:"GL", name:"García López",   color:"#006338" },
  { id:"MR", name:"Martínez Ruiz",  color:"#007681" },
  { id:"SP", name:"Sánchez Pérez",  color:"#005B9F" },
  { id:"LG", name:"López García",   color:"#006338" },
  { id:"FA", name:"Fernández Alba", color:"#007681" },
  { id:"RD", name:"Rodríguez Díaz", color:"#005B9F" },
  { id:"GM", name:"González Mora",  color:"#006338" },
  { id:"PC", name:"Pérez Castro",   color:"#007681" },
  { id:"JR", name:"Jiménez Roca",   color:"#005B9F" },
  { id:"MB", name:"Miguel Bellod",  color:C.naranja, warning:true },
];
const MANAGERS = [
  { id:"DM", name:"David Muñoz",   color:"#005B9F" },
  { id:"JG", name:"Juanjo Gómez",  color:C.teal },
  { id:"LM", name:"Lucas Martín",  color:C.verde },
];
const ALL_MEMBERS = [
  ...INSPECTORS.map(i => ({...i, role:"Inspector"})),
  ...MANAGERS.map(m => ({...m, role:"Gestor"})),
  { id:"JGC", name:"Juanjo Gómez (Coord.)", color:C.teal, role:"Coordinador" },
];

// ─── TASK AREAS ───────────────────────────────────────────────────────
const TASK_AREAS = [
  { id:"T01", code:"01", title:"Investigación de Incidentes", color:C.verde,   icon:"⚡" },
  { id:"T02", code:"02", title:"Inspecciones en Campo",       color:C.teal,    icon:"🔍" },
  { id:"T03", code:"03", title:"Gestión Administrativa",      color:C.azul,    icon:"📋" },
  { id:"T04", code:"04", title:"Formación y Habilitaciones",  color:C.verde,   icon:"🎓" },
  { id:"T05", code:"05", title:"Actualización SIGCE",         color:C.teal,    icon:"⚙" },
  { id:"T06", code:"06", title:"Reportes Periódicos",         color:C.azul,    icon:"📊" },
  { id:"T07", code:"07", title:"Control de Calidad",          color:C.verde,   icon:"✓" },
  { id:"T08", code:"08", title:"Coordinación Interdept.",     color:C.teal,    icon:"🔗" },
  { id:"T09", code:"09", title:"Estadísticas de Seguridad",   color:C.azul,    icon:"📈" },
];

// ─── DEFAULT GUARD SCHEDULE (52 weeks) ────────────────────────────────
function buildDefaultSchedule() {
  const weeks = {};
  const insp = INSPECTORS.map(i => i.id);
  const mgr  = MANAGERS.map(m => m.id);
  for (let w = 1; w <= 52; w++) {
    weeks[w] = {
      inspector: insp[(w - 1) % insp.length],
      manager:   mgr[(w - 1)  % mgr.length],
    };
  }
  return weeks;
}

// ─── DEFAULT KANBAN CARDS ─────────────────────────────────────────────
function buildDefaultCards() {
  return {
    T01: [
      { id:"c1",  title:"Investigar incidente Km 45 LAV",         assignee:"GL",  priority:"alta",  status:"doing",  desc:"Análisis de causas y elaboración de informe." },
      { id:"c2",  title:"Revisar metodología de análisis causal",  assignee:"JGC", priority:"media", status:"todo",   desc:"Actualizar procedimiento según nueva normativa." },
      { id:"c3",  title:"Archivo incidentes Q1 2026",              assignee:"SP",  priority:"baja",  status:"done",   desc:"Cierre y archivo de expedientes del primer trimestre." },
    ],
    T02: [
      { id:"c4",  title:"Inspección depósito Atocha",              assignee:"MR",  priority:"alta",  status:"todo",   desc:"Revisión material rodante Cercanías C3." },
      { id:"c5",  title:"Inspección subestaciones ZAR",            assignee:"FA",  priority:"media", status:"doing",  desc:"Revisión trimestral infraestructura energía." },
      { id:"c6",  title:"Informe inspección LAV Sur",              assignee:"RD",  priority:"media", status:"done",   desc:"Redacción y envío a la Dirección." },
      { id:"c7",  title:"Planificación inspecciones Q2",           assignee:"JGC", priority:"alta",  status:"todo",   desc:"Definir calendario abril-junio." },
    ],
    T03: [
      { id:"c8",  title:"Actualizar fichas de personal",           assignee:"JGC", priority:"baja",  status:"doing",  desc:"Actualizar datos y roles en el sistema." },
      { id:"c9",  title:"Reunión mensual coordinación OPE",        assignee:"DM",  priority:"media", status:"todo",   desc:"Preparar orden del día y acta." },
    ],
    T04: [
      { id:"c10", title:"Renovar habilitación Martínez Ruiz",      assignee:"MR",  priority:"alta",  status:"todo",   desc:"Caducidad: 15 mar 2026. Tramitar con RRHH." },
      { id:"c11", title:"Sesión formación normativa 2025",         assignee:"JGC", priority:"media", status:"doing",  desc:"Impartir sesión a todo el equipo — sala B." },
      { id:"c12", title:"Renovar habilitación Pérez Castro",       assignee:"PC",  priority:"alta",  status:"todo",   desc:"Caducidad: 20 abr 2026." },
    ],
    T05: [
      { id:"c13", title:"Actualizar parámetros ruta LAV Mad-BCN",  assignee:"GM",  priority:"alta",  status:"done",   desc:"Carga de parámetros revisados en SIGCE." },
      { id:"c14", title:"Formación SIGCE v3.2 al equipo",          assignee:"JR",  priority:"media", status:"todo",   desc:"Nueva versión con cambios en módulo de incidentes." },
    ],
    T06: [
      { id:"c15", title:"Informe mensual febrero 2026",            assignee:"JGC", priority:"alta",  status:"doing",  desc:"Cierre y envío antes del 5 de marzo." },
      { id:"c16", title:"Estadísticas anuales 2025",               assignee:"LG",  priority:"media", status:"done",   desc:"Memoria anual de actividad del GASCC." },
    ],
    T07: [
      { id:"c17", title:"Auditoría procedimiento PO-23",           assignee:"SP",  priority:"media", status:"todo",   desc:"Verificar cumplimiento del procedimiento de emergencia." },
      { id:"c18", title:"Revisión check-list inspecciones campo",  assignee:"FA",  priority:"baja",  status:"doing",  desc:"Actualizar formulario con nuevos ítems reglamentarios." },
    ],
    T08: [
      { id:"c19", title:"Reunión coordinación Mantenimiento",      assignee:"DM",  priority:"media", status:"todo",   desc:"Agenda: incidencias material y plan correctivo." },
      { id:"c20", title:"Protocolo sustitución Bellod",            assignee:"JGC", priority:"alta",  status:"todo",   desc:"URGENTE: definir cobertura antes de la jubilación." },
    ],
    T09: [
      { id:"c21", title:"Dashboard KPIs febrero 2026",             assignee:"JGC", priority:"alta",  status:"doing",  desc:"Actualizar indicadores en el panel de Teams." },
      { id:"c22", title:"Análisis tendencia incidentes LAV",       assignee:"GL",  priority:"media", status:"todo",   desc:"Comparativa últimos 3 años por tipo de incidente." },
    ],
  };
}

// ─── STORAGE ──────────────────────────────────────────────────────────
async function load(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function save(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

// ─── HELPERS ──────────────────────────────────────────────────────────
function weekLabel(w) {
  const s = new Date(2026, 0, 1 + (w - 1) * 7);
  const e = new Date(2026, 0, 7 + (w - 1) * 7);
  const M = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${s.getDate()} ${M[s.getMonth()]} – ${e.getDate()} ${M[e.getMonth()]}`;
}
const TODAY_WEEK = Math.min(52, Math.max(1, Math.ceil((new Date() - new Date(2026,0,1)) / 604800000) + 1));
let _uid = 1000;
function uid() { return `u${Date.now()}_${_uid++}`; }

// ─── STYLES ───────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#fff}
.gr{font-family:'DM Sans',sans-serif;color:${C.ink};background:#fff;min-height:100vh;display:flex}

.sb{position:fixed;top:0;left:0;width:214px;height:100vh;background:${C.negro};display:flex;flex-direction:column;z-index:200;overflow-y:auto}
.sb::-webkit-scrollbar{width:3px}.sb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1)}
.sb-logo{padding:22px 18px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-mark{width:26px;height:26px;background:${C.verde};clip-path:polygon(0 100%,50% 0,100% 100%,75% 100%,50% 42%,25% 100%)}
.sb-adif{display:flex;align-items:center;gap:8px}
.sb-adif span{font-size:17px;font-weight:700;color:#fff;letter-spacing:-.5px}
.sb-dept{font-size:8.5px;color:${C.menta};letter-spacing:1.4px;text-transform:uppercase;margin-top:3px;font-weight:600}
.sb-sec{font-size:8.5px;color:rgba(255,255,255,.28);letter-spacing:1.8px;text-transform:uppercase;padding:16px 18px 6px;font-weight:600}
.ni{display:flex;align-items:center;gap:8px;padding:8px 18px;cursor:pointer;font-size:11.5px;font-weight:400;color:rgba(255,255,255,.5);transition:all .14s;border-left:2px solid transparent}
.ni:hover{color:#fff;background:rgba(255,255,255,.04)}
.ni.on{color:#fff;background:rgba(0,118,129,.2);border-left-color:${C.teal};font-weight:600}
.ni-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0;opacity:.6}
.ni.on .ni-dot{background:${C.teal};opacity:1}
.feat-badge{font-size:7.5px;background:${C.teal};color:#fff;padding:1px 5px;border-radius:3px;font-weight:700;margin-left:auto;letter-spacing:.3px}
.ni.on .feat-badge{background:rgba(255,255,255,.18)}
.sb-ft{margin-top:auto;padding:12px 18px;border-top:1px solid rgba(255,255,255,.08)}
.sb-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,152,0,.12);border:1px solid rgba(255,152,0,.3);border-radius:4px;padding:4px 9px;font-size:9px;color:${C.naranja};font-weight:600;letter-spacing:.3px}
.b-dot{width:5px;height:5px;border-radius:50%;background:${C.naranja};animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.15}}

.main{margin-left:214px;flex:1;min-height:100vh}
.ph{padding:26px 40px 22px;border-bottom:1px solid ${C.border};display:flex;align-items:flex-start;justify-content:space-between}
.ph-eye{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.teal};margin-bottom:4px}
.ph-title{font-size:22px;font-weight:700;color:${C.ink};letter-spacing:-.5px;line-height:1.2}
.ph-sub{font-size:12px;color:${C.gris};margin-top:3px}
.ph-meta{text-align:right;font-size:10px;color:${C.gris};line-height:1.8}
.ct{padding:28px 40px 56px}

.sl{font-size:9.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.teal};margin-bottom:16px;display:flex;align-items:center;gap:10px}
.sl::after{content:'';flex:1;height:1px;background:${C.border}}
.card{background:#fff;border:1px solid ${C.border};border-radius:8px;padding:20px;transition:box-shadow .18s}
.card:hover{box-shadow:0 4px 16px rgba(0,41,46,.06)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.mono{font-family:'DM Mono',monospace}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;transition:all .14s;border:1px solid transparent;font-family:'DM Sans',sans-serif}
.btn-primary{background:${C.teal};color:#fff;border-color:${C.teal}}
.btn-primary:hover{background:#006570}
.btn-ghost{background:transparent;color:${C.ink};border-color:${C.border}}
.btn-ghost:hover{background:${C.smoke}}
.btn-sm{padding:4px 10px;font-size:10.5px}
input,select,textarea{font-family:'DM Sans',sans-serif;font-size:12px;border:1px solid ${C.border};border-radius:6px;padding:7px 10px;outline:none;transition:border .14s;background:#fff;color:${C.ink};width:100%}
input:focus,select:focus,textarea:focus{border-color:${C.teal};box-shadow:0 0 0 3px rgba(0,118,129,.11)}
label{font-size:10.5px;font-weight:600;color:${C.gris};letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:4px}
.alert{display:flex;align-items:flex-start;gap:9px;padding:11px 14px;border-radius:6px;border-left:3px solid var(--ac);background:var(--bg);margin-bottom:12px}
.alert .at{font-size:12px;font-weight:600;color:var(--ac)}
.alert .ab{font-size:11px;color:${C.ink};margin-top:1px;line-height:1.5}

.kpi{background:#fff;border:1px solid ${C.border};border-radius:8px;padding:16px 18px;position:relative;overflow:hidden;transition:box-shadow .18s}
.kpi:hover{box-shadow:0 4px 16px rgba(0,41,46,.06)}
.kpi::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--ac)}
.kv{font-size:26px;font-weight:700;color:${C.ink};letter-spacing:-1px;line-height:1}
.kl{font-size:10px;color:${C.gris};margin-top:5px;font-weight:500}
.ks{font-size:10px;color:var(--ac);margin-top:6px;font-weight:600}

/* TABS */
.tab-bar{display:flex;gap:0;border-bottom:1px solid ${C.border};margin-bottom:20px}
.tab{padding:9px 16px;font-size:11.5px;font-weight:500;color:${C.gris};cursor:pointer;border-bottom:2px solid transparent;transition:all .14s;margin-bottom:-1px}
.tab.on{color:${C.teal};font-weight:700;border-bottom-color:${C.teal}}
.tab:hover:not(.on){color:${C.ink}}

/* GUARD MODULE */
.gm-layout{display:grid;grid-template-columns:1fr 360px;gap:18px}
.week-row{display:grid;grid-template-columns:46px 108px 1fr 1fr;gap:0;border-bottom:1px solid ${C.border};align-items:center;min-height:40px}
.week-row.curr{background:rgba(0,118,129,.04)}
.week-row.hdr-row{background:${C.smoke};min-height:32px;border-radius:6px 6px 0 0;border-bottom:2px solid ${C.border}}
.wc{padding:7px 9px;font-size:11px;color:${C.ink}}
.wc.hdr{font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${C.gris}}
.wc.sem{font-family:'DM Mono',monospace;font-size:10.5px;color:${C.gris};padding-left:12px}
.wc.dates{font-size:10.5px;color:${C.gris}}
.insp-sel{background:transparent;border:none;font-size:11.5px;color:${C.ink};font-family:'DM Sans',sans-serif;cursor:pointer;padding:3px 5px;border-radius:4px;outline:none;-webkit-appearance:none;font-weight:500}
.insp-sel:hover{background:rgba(0,118,129,.08)}
.cbar-wrap{background:${C.smoke};border-radius:3px;overflow:hidden;height:5px;margin-top:3px}
.cbar{height:5px;border-radius:3px;transition:width .35s ease}
.fc-card{border:1px solid ${C.border};border-radius:8px;overflow:hidden;margin-bottom:14px}
.fc-hdr{background:${C.negro};color:#fff;padding:10px 14px;font-size:11px;font-weight:700}
.fc-row{display:flex;align-items:center;gap:9px;padding:9px 14px;border-bottom:1px solid ${C.border};transition:background .12s}
.fc-row:last-child{border-bottom:none}
.fc-row:hover{background:${C.smoke}}
.fc-name{font-size:12px;font-weight:500;flex:1;color:${C.ink}}
.fc-cnt{font-family:'DM Mono',monospace;font-size:14px;font-weight:700;min-width:26px;text-align:right}
.spark{display:flex;align-items:flex-end;gap:2px;height:28px}
.spark-b{flex:1;border-radius:2px 2px 0 0;min-height:2px;transition:height .3s}

/* KANBAN */
.area-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.achip{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;border:1px solid ${C.border};cursor:pointer;font-size:11px;font-weight:500;color:${C.ink};transition:all .14s;white-space:nowrap}
.achip.on{font-weight:700;border-color:var(--ac);background:var(--bg);color:var(--ac)}
.achip:hover:not(.on){background:${C.smoke}}
.kb-board{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.kb-col{background:${C.smoke};border-radius:8px;padding:12px;min-height:280px}
.kb-col-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.kb-col-label{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--col)}
.kb-cnt{font-size:9px;font-weight:700;background:var(--col-bg);color:var(--col);padding:2px 7px;border-radius:10px}
.kcard{background:#fff;border:1px solid ${C.border};border-radius:6px;padding:11px;margin-bottom:7px;transition:all .18s;position:relative;overflow:hidden}
.kcard:hover{box-shadow:0 3px 10px rgba(0,41,46,.09);border-color:var(--areaC)}
.kcard-strip{position:absolute;top:0;left:0;right:0;height:2.5px}
.kcard-title{font-size:12px;font-weight:600;color:${C.ink};line-height:1.4;margin-bottom:7px}
.kcard-desc{font-size:10.5px;color:${C.gris};margin-bottom:8px;line-height:1.5}
.kcard-footer{display:flex;align-items:center;justify-content:space-between;gap:5px}
.kcard-who{display:flex;align-items:center;gap:4px;font-size:10.5px;color:${C.gris};max-width:55%}
.kcard-who span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kpri{font-size:8.5px;font-weight:700;padding:2px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:.4px}
.pri-alta{background:rgba(185,28,28,.09);color:#B91C1C}
.pri-media{background:rgba(255,152,0,.1);color:#D67E00}
.pri-baja{background:rgba(0,118,129,.08);color:${C.teal}}
.kcard-acts{display:flex;gap:3px;margin-top:8px;flex-wrap:wrap}
.kbtn{font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;border:1px solid ${C.border};background:${C.smoke};color:${C.ink};font-family:'DM Sans',sans-serif;transition:all .12s;font-weight:500}
.kbtn:hover{border-color:${C.teal};color:${C.teal}}
.kbtn.del:hover{border-color:${C.rojo};color:${C.rojo}}
.add-btn{display:flex;align-items:center;justify-content:center;gap:5px;padding:7px;border-radius:6px;border:1.5px dashed ${C.border};color:${C.gris};font-size:11px;cursor:pointer;transition:all .14s;width:100%;font-family:'DM Sans',sans-serif;background:transparent}
.add-btn:hover{border-color:${C.teal};color:${C.teal};background:rgba(0,118,129,.04)}

/* MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:10px;padding:26px;width:100%;max-width:460px;box-shadow:0 20px 56px rgba(0,0,0,.16)}
.modal-title{font-size:15px;font-weight:700;color:${C.ink};margin-bottom:18px}
.frow{margin-bottom:12px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.sm-btns{display:flex;gap:5px;margin-top:6px}
.sm-btn{flex:1;padding:6px;border-radius:5px;border:1px solid ${C.border};font-size:10.5px;cursor:pointer;text-align:center;font-family:'DM Sans',sans-serif;transition:all .13s;background:#fff;color:${C.ink};font-weight:500}
.sm-btn.on{font-weight:700;border-color:var(--ac);background:var(--bg);color:var(--ac)}

/* OVERVIEW */
.ov-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px}
.phase-row{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid ${C.border}}
.phase-row:last-child{border-bottom:none}
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────
function MemberDot({ id, size = 22 }) {
  const m = ALL_MEMBERS.find(x => x.id === id) || { color:C.gris };
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*.3), background:m.warning?C.naranja:m.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.42, fontWeight:700, flexShrink:0, fontFamily:"'DM Mono',monospace" }}>
      {id}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div className="modal-title" style={{ margin:0 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── GUARD MODULE ─────────────────────────────────────────────────────
function GuardiasModule() {
  const defSched = buildDefaultSchedule();
  const [schedule, setSchedule] = useState(defSched);
  const [filterInsp, setFilterInsp] = useState("all");
  const [tab, setTab] = useState("schedule");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load("gascc-guard-v4", buildDefaultSchedule()).then(s => { setSchedule(s); setLoaded(true); });
  }, []);

  const updateGuard = useCallback((week, field, val) => {
    setSchedule(prev => {
      const next = { ...prev, [week]: { ...prev[week], [field]: val } };
      save("gascc-guard-v4", next);
      return next;
    });
  }, []);

  // Counters
  const iCnt = {}, mCnt = {};
  INSPECTORS.forEach(i => { iCnt[i.id] = 0; });
  MANAGERS.forEach(m => { mCnt[m.id] = 0; });
  Object.values(schedule).forEach(w => {
    if (iCnt[w.inspector] !== undefined) iCnt[w.inspector]++;
    if (mCnt[w.manager]   !== undefined) mCnt[w.manager]++;
  });
  const maxI = Math.max(...Object.values(iCnt), 1);
  const maxM = Math.max(...Object.values(mCnt), 1);
  const idealI = Math.round(52 / INSPECTORS.length);
  const idealM = Math.round(52 / MANAGERS.length);

  const weeks = Object.keys(schedule).map(Number).sort((a,b)=>a-b);
  const vis = filterInsp==="all" ? weeks : weeks.filter(w => schedule[w]?.inspector===filterInsp);

  function sparkData(id) {
    const b = [0,0,0,0,0];
    weeks.forEach(w => { if (schedule[w]?.inspector===id) b[Math.min(4,Math.floor((w-1)/10))]++; });
    return b;
  }

  if (!loaded) return <div style={{ padding:40, color:C.gris, fontSize:13 }}>Cargando cuadrante…</div>;

  return (
    <div>
      <div className="g4" style={{ marginBottom:20 }}>
        {[
          { v:"52",  l:"Semanas 2026",         s:"Cuadrante completo",                   ac:C.teal },
          { v:iCnt["MB"]||0, l:"Guardias Bellod", s:"⚠ Jubilación pendiente 2026",       ac:C.naranja },
          { v:maxI-Math.min(...Object.values(iCnt)), l:"Desbalance máx.", s:"diferencia semanas inspectores", ac:C.rojo },
          { v:Object.values(iCnt).reduce((a,b)=>a+b,0), l:"Guardias asignadas", s:"de 52 semanas",         ac:C.verde },
        ].map((k,i) => (
          <div className="kpi" key={i} style={{"--ac":k.ac}}>
            <div className="kv">{k.v}</div><div className="kl">{k.l}</div><div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        <div className={`tab ${tab==="schedule"?"on":""}`} onClick={()=>setTab("schedule")}>Cuadrante semanal</div>
        <div className={`tab ${tab==="counters"?"on":""}`} onClick={()=>setTab("counters")}>Contadores de equidad</div>
      </div>

      {tab==="schedule" && (
        <div className="gm-layout">
          {/* Left: editable table */}
          <div>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
              <label style={{ margin:0, textTransform:"none", fontSize:11.5, fontWeight:500, color:C.gris, letterSpacing:0 }}>Filtrar inspector:</label>
              <select style={{ width:180 }} value={filterInsp} onChange={e=>setFilterInsp(e.target.value)}>
                <option value="all">Todos</option>
                {INSPECTORS.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <span style={{ fontSize:11, color:C.gris }}>{vis.length} semanas</span>
            </div>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div className="week-row hdr-row">
                <div className="wc hdr" style={{ paddingLeft:12 }}>Sem</div>
                <div className="wc hdr">Período</div>
                <div className="wc hdr">Inspector guardia</div>
                <div className="wc hdr">Gestor guardia</div>
              </div>
              <div style={{ maxHeight:460, overflowY:"auto" }}>
                {vis.map(w => {
                  const row  = schedule[w];
                  const curr = w===TODAY_WEEK;
                  const insp = INSPECTORS.find(i=>i.id===row?.inspector);
                  const mgr  = MANAGERS.find(m=>m.id===row?.manager);
                  const warn = insp?.warning;
                  return (
                    <div key={w} className={`week-row ${curr?"curr":""}`}>
                      <div className="wc sem">
                        W{String(w).padStart(2,"0")}
                        {curr && <span style={{ display:"block", fontSize:7.5, fontWeight:700, color:C.teal, letterSpacing:.5 }}>HOY</span>}
                      </div>
                      <div className="wc dates">{weekLabel(w)}</div>
                      <div className="wc" style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:warn?C.naranja:(insp?.color||C.gris), flexShrink:0 }}/>
                        <select className="insp-sel" value={row?.inspector||""}
                          style={{ color:warn?C.naranja:C.ink, fontWeight:warn?700:500 }}
                          onChange={e=>updateGuard(w,"inspector",e.target.value)}>
                          {INSPECTORS.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        {warn && <span style={{ fontSize:8, background:"rgba(255,152,0,.15)", color:C.naranja, padding:"1px 4px", borderRadius:3, fontWeight:700, flexShrink:0 }}>JUB</span>}
                      </div>
                      <div className="wc" style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:mgr?.color||C.gris, flexShrink:0 }}/>
                        <select className="insp-sel" value={row?.manager||""}
                          onChange={e=>updateGuard(w,"manager",e.target.value)}>
                          {MANAGERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop:8, fontSize:10.5, color:C.gris }}>Cambios guardados automáticamente.</div>
          </div>

          {/* Right: fairness summary */}
          <div>
            <div className="fc-card">
              <div className="fc-hdr">Contadores — Inspectores</div>
              {INSPECTORS.map(i => {
                const cnt=iCnt[i.id]||0, pct=cnt/maxI, diff=cnt-idealI;
                return (
                  <div key={i.id} className="fc-row">
                    <div style={{ width:7, height:7, borderRadius:"50%", background:i.warning?C.naranja:i.color, flexShrink:0 }}/>
                    <div className="fc-name" style={{ color:i.warning?C.naranja:C.ink, fontWeight:i.warning?600:400 }}>
                      {i.name}
                      {i.warning&&<span style={{ marginLeft:5, fontSize:8, background:"rgba(255,152,0,.15)", color:C.naranja, padding:"1px 4px", borderRadius:3, fontWeight:700 }}>JUB</span>}
                    </div>
                    <div style={{ flex:1.2 }}>
                      <div className="cbar-wrap"><div className="cbar" style={{ width:`${pct*100}%`, background:i.warning?C.naranja:i.color }}/></div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div className="mono" style={{ fontSize:14, fontWeight:700, color:i.warning?C.naranja:C.teal }}>{cnt}</div>
                      <div style={{ fontSize:9, color:diff>1?C.rojo:diff<-1?C.verde:C.gris }}>{diff>0?`+${diff}`:diff} ideal</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="fc-card">
              <div className="fc-hdr">Contadores — Gestores</div>
              {MANAGERS.map(m => {
                const cnt=mCnt[m.id]||0, pct=cnt/maxM, diff=cnt-idealM;
                return (
                  <div key={m.id} className="fc-row">
                    <div style={{ width:7, height:7, borderRadius:"50%", background:m.color, flexShrink:0 }}/>
                    <div className="fc-name">{m.name}</div>
                    <div style={{ flex:1.2 }}><div className="cbar-wrap"><div className="cbar" style={{ width:`${pct*100}%`, background:m.color }}/></div></div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div className="mono" style={{ fontSize:14, fontWeight:700, color:m.color }}>{cnt}</div>
                      <div style={{ fontSize:9, color:diff>0?C.rojo:diff<0?C.verde:C.gris }}>{diff>0?`+${diff}`:diff} ideal</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab==="counters" && (
        <div>
          <div className="g2" style={{ marginBottom:20 }}>
            <div className="card">
              <div className="sl">Análisis inspector · semanas asignadas</div>
              {INSPECTORS.map(i => {
                const cnt=iCnt[i.id]||0, pct=cnt/maxI, diff=cnt-idealI;
                const spark=sparkData(i.id);
                return (
                  <div key={i.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:i.warning?C.naranja:i.color, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:i.warning?700:500, color:i.warning?C.naranja:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{i.name}</div>
                      <div className="cbar-wrap" style={{ marginTop:4 }}><div className="cbar" style={{ width:`${pct*100}%`, background:i.warning?C.naranja:i.color }}/></div>
                    </div>
                    <div className="spark">
                      {spark.map((v,si) => (
                        <div key={si} className="spark-b" style={{ height:Math.max(2,(v/Math.max(...spark,1))*28), background:i.warning?C.naranja:i.color, opacity:.65+si*.07 }}/>
                      ))}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div className="mono" style={{ fontSize:16, fontWeight:700, color:i.warning?C.naranja:C.ink }}>{cnt}</div>
                      <div style={{ fontSize:9.5, color:diff>1?C.rojo:diff<-1?C.verde:C.gris }}>{diff>0?`+${diff}`:diff} (ideal {idealI})</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="card" style={{ marginBottom:14 }}>
                <div className="sl">Gestores · distribución</div>
                {MANAGERS.map(m => {
                  const cnt=mCnt[m.id]||0, pct=cnt/maxM, diff=cnt-idealM;
                  return (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:m.color, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:500, color:C.ink }}>{m.name}</div>
                        <div className="cbar-wrap" style={{ marginTop:4 }}><div className="cbar" style={{ width:`${pct*100}%`, background:m.color }}/></div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div className="mono" style={{ fontSize:15, fontWeight:700, color:m.color }}>{cnt}</div>
                        <div style={{ fontSize:9.5, color:diff>0?C.rojo:diff<0?C.verde:C.gris }}>{diff>0?`+${diff}`:diff} ideal</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card">
                <div className="sl">Resumen de equidad</div>
                {[
                  { l:"Inspector con más guardias", v:INSPECTORS.reduce((a,b)=>(iCnt[a.id]||0)>(iCnt[b.id]||0)?a:b).name, c:C.rojo },
                  { l:"Inspector con menos guardias", v:INSPECTORS.reduce((a,b)=>(iCnt[a.id]||0)<(iCnt[b.id]||0)?a:b).name, c:C.verde },
                  { l:"Rango de variación", v:`${maxI-Math.min(...Object.values(iCnt))} sem`, c:C.teal },
                  { l:"Ideal por inspector", v:`${idealI} sem`, c:C.azul },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:C.ink }}>{r.l}</span>
                    <span className="mono" style={{ fontSize:11.5, fontWeight:700, color:r.c }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KANBAN MODULE ────────────────────────────────────────────────────
const STATUSES = [
  { id:"todo",  label:"Pendiente",  color:C.gris,    bg:"rgba(163,168,163,.12)" },
  { id:"doing", label:"En curso",   color:C.naranja, bg:"rgba(255,152,0,.1)"   },
  { id:"done",  label:"Completada", color:C.verde,   bg:"rgba(0,99,56,.1)"     },
];

function KanbanModule() {
  const [activeArea, setActiveArea] = useState("T01");
  const [boards, setBoards]         = useState(null);
  const [modal, setModal]           = useState(null);
  const [filterMember, setFilter]   = useState("all");

  useEffect(() => {
    load("gascc-boards-v4", buildDefaultCards()).then(b => setBoards(b));
  }, []);

  const saveBoards = b => { setBoards(b); save("gascc-boards-v4", b); };

  const addCard = c => saveBoards({ ...boards, [activeArea]: [...(boards[activeArea]||[]), { ...c, id:uid() }] });
  const editCard = c => saveBoards({ ...boards, [activeArea]: boards[activeArea].map(x => x.id===c.id?c:x) });
  const delCard  = id => saveBoards({ ...boards, [activeArea]: boards[activeArea].filter(c => c.id!==id) });
  const moveCard = (id, st) => saveBoards({ ...boards, [activeArea]: boards[activeArea].map(c => c.id===id?{...c,status:st}:c) });

  if (!boards) return <div style={{ padding:40, color:C.gris, fontSize:13 }}>Cargando tableros…</div>;

  const area     = TASK_AREAS.find(a=>a.id===activeArea);
  const allCards = boards[activeArea]||[];
  const cards    = filterMember==="all" ? allCards : allCards.filter(c=>c.assignee===filterMember);

  const totalDone  = Object.values(boards).flat().filter(c=>c.status==="done").length;
  const totalDoing = Object.values(boards).flat().filter(c=>c.status==="doing").length;
  const totalTodo  = Object.values(boards).flat().filter(c=>c.status==="todo").length;

  return (
    <div>
      <div className="g4" style={{ marginBottom:20 }}>
        {[
          { v:totalTodo,  l:"Pendientes",  s:"todas las áreas", ac:C.gris },
          { v:totalDoing, l:"En curso",    s:"activas ahora",   ac:C.naranja },
          { v:totalDone,  l:"Completadas", s:"cerradas",        ac:C.verde },
          { v:Object.values(boards).flat().length, l:"Total tarjetas", s:"9 áreas", ac:C.teal },
        ].map((k,i)=>(
          <div className="kpi" key={i} style={{"--ac":k.ac}}>
            <div className="kv">{k.v}</div><div className="kl">{k.l}</div><div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      {/* Area chips */}
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:C.gris, marginBottom:8 }}>Área de actividad</div>
      <div className="area-chips">
        {TASK_AREAS.map(a => {
          const cnt   = (boards[a.id]||[]).length;
          const doing = (boards[a.id]||[]).filter(c=>c.status==="doing").length;
          return (
            <div key={a.id} className={`achip ${activeArea===a.id?"on":""}`}
              style={{"--ac":a.color,"--bg":`${a.color}12`}}
              onClick={()=>setActiveArea(a.id)}>
              <span style={{ fontSize:12 }}>{a.icon}</span>
              <span>{a.code} {a.title}</span>
              <span style={{ marginLeft:2, fontSize:9.5, fontWeight:700, background:doing>0?`${a.color}20`:C.smoke, color:doing>0?a.color:C.gris, padding:"1px 6px", borderRadius:8 }}>{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Board header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:3, height:20, borderRadius:2, background:area.color }}/>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>{area.title}</div>
            <div style={{ fontSize:10.5, color:C.gris }}>{allCards.length} tarjetas · {allCards.filter(c=>c.status==="done").length} completadas</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center" }}>
          <select style={{ width:165 }} value={filterMember} onChange={e=>setFilter(e.target.value)}>
            <option value="all">Todos los miembros</option>
            {ALL_MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button className="btn btn-primary" style={{ background:area.color, borderColor:area.color }}
            onClick={()=>setModal({mode:"add",status:"todo"})}>
            + Nueva tarea
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="kb-board">
        {STATUSES.map(col => {
          const colCards = cards.filter(c=>c.status===col.id);
          return (
            <div key={col.id} className="kb-col">
              <div className="kb-col-hdr" style={{"--col":col.color,"--col-bg":col.bg}}>
                <span className="kb-col-label">{col.label}</span>
                <span className="kb-cnt">{colCards.length}</span>
              </div>
              {colCards.map(card => {
                const mem = ALL_MEMBERS.find(m=>m.id===card.assignee);
                const priColor = card.priority==="alta"?"#B91C1C":card.priority==="media"?C.naranja:C.teal;
                return (
                  <div key={card.id} className="kcard" style={{"--areaC":area.color}}>
                    <div className="kcard-strip" style={{ background:priColor }}/>
                    <div className="kcard-title" style={{ paddingTop:6 }}>{card.title}</div>
                    {card.desc && <div className="kcard-desc">{card.desc}</div>}
                    <div className="kcard-footer">
                      <div className="kcard-who">
                        <MemberDot id={card.assignee} size={18}/>
                        <span>{mem?.name||card.assignee}</span>
                      </div>
                      <span className={`kpri pri-${card.priority}`}>{card.priority}</span>
                    </div>
                    <div className="kcard-acts">
                      {STATUSES.filter(s=>s.id!==col.id).map(s=>(
                        <button key={s.id} className="kbtn"
                          style={{ color:s.color, borderColor:`${s.color}40` }}
                          onClick={()=>moveCard(card.id,s.id)}>
                          → {s.label}
                        </button>
                      ))}
                      <button className="kbtn" onClick={()=>setModal({mode:"edit",card})}>Editar</button>
                      <button className="kbtn del" onClick={()=>delCard(card.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
              <button className="add-btn" onClick={()=>setModal({mode:"add",status:col.id})}>
                + Añadir en {col.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress by area */}
      <div style={{ marginTop:26 }}>
        <div className="sl">Progreso global por área</div>
        <div className="g2">
          {TASK_AREAS.map(a => {
            const aCards=(boards[a.id]||[]);
            const done=aCards.filter(c=>c.status==="done").length;
            const doing=aCards.filter(c=>c.status==="doing").length;
            const total=aCards.length||1;
            return (
              <div key={a.id} style={{ display:"flex", gap:9, alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:13, width:22, textAlign:"center" }}>{a.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:500, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:3 }}>{a.code} {a.title}</div>
                  <div style={{ height:5, background:C.smoke, borderRadius:3, overflow:"hidden", display:"flex" }}>
                    <div style={{ width:`${(done/total)*100}%`, background:a.color, borderRadius:3 }}/>
                    <div style={{ width:`${(doing/total)*100}%`, background:C.naranja, opacity:.65 }}/>
                  </div>
                </div>
                <div style={{ fontSize:10.5, color:C.gris, flexShrink:0, fontFamily:"'DM Mono',monospace", width:48, textAlign:"right" }}>{done}/{aCards.length}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Modal */}
      {modal && (
        <CardModal
          mode={modal.mode} card={modal.card}
          defaultStatus={modal.status||"todo"}
          areaColor={area.color}
          onSave={c => { modal.mode==="add"?addCard(c):editCard(c); setModal(null); }}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}

function CardModal({ mode, card, defaultStatus, areaColor, onSave, onClose }) {
  const [form, setForm] = useState({
    id:       card?.id       || uid(),
    title:    card?.title    || "",
    desc:     card?.desc     || "",
    assignee: card?.assignee || ALL_MEMBERS[0].id,
    priority: card?.priority || "media",
    status:   card?.status   || defaultStatus,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <Modal title={mode==="add"?"Nueva tarea":"Editar tarea"} onClose={onClose}>
      <div className="frow"><label>Título</label>
        <input placeholder="Descripción breve…" value={form.title} onChange={e=>set("title",e.target.value)}/>
      </div>
      <div className="frow"><label>Descripción</label>
        <textarea rows={2} placeholder="Detalle adicional…" value={form.desc} onChange={e=>set("desc",e.target.value)} style={{ resize:"vertical" }}/>
      </div>
      <div className="fgrid frow">
        <div><label>Responsable</label>
          <select value={form.assignee} onChange={e=>set("assignee",e.target.value)}>
            {ALL_MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
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
        <div className="sm-btns">
          {STATUSES.map(s=>(
            <div key={s.id} className={`sm-btn ${form.status===s.id?"on":""}`}
              style={{"--ac":s.color,"--bg":s.bg}} onClick={()=>set("status",s.id)}>{s.label}</div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:7, marginTop:18, justifyContent:"flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ background:areaColor, borderColor:areaColor }}
          disabled={!form.title.trim()}
          onClick={()=>form.title.trim()&&onSave(form)}>
          {mode==="add"?"Crear tarea":"Guardar cambios"}
        </button>
      </div>
    </Modal>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────
function Overview() {
  return (
    <div>
      <div className="g4" style={{ marginBottom:20 }}>
        {[
          { v:"14",  l:"Personas en el equipo", s:"1 coord · 10 insp · 3 gest",   ac:C.teal },
          { v:"9",   l:"Áreas de actividad",    s:"Seguridad · Gestión · Admin",  ac:C.verde },
          { v:"24h", l:"Disponibilidad reactiva",s:"365 días al año",              ac:C.rojo },
          { v:"52",  l:"Semanas cuadrante",      s:"2026 — planificado completo",  ac:C.azul },
        ].map((k,i)=>(
          <div className="kpi" key={i} style={{"--ac":k.ac}}>
            <div className="kv">{k.v}</div><div className="kl">{k.l}</div><div className="ks">{k.s}</div>
          </div>
        ))}
      </div>
      <div className="ov-grid">
        <div className="card">
          <div className="sl">Misión del GASCC</div>
          <p style={{ fontSize:13, lineHeight:1.85, color:C.ink, marginBottom:14 }}>
            El <strong>Grupo de Apoyo a la Seguridad y Coordinación en Circulación</strong> actúa como pilar técnico de la seguridad ferroviaria de Adif, gestionando la respuesta inmediata ante incidentes y las actividades de supervisión planificada dentro del ecosistema <strong>Microsoft 365</strong>.
          </p>
          <div className="alert" style={{"--ac":C.naranja,"--bg":"rgba(255,152,0,.06)"}}>
            <div style={{ fontSize:13, flexShrink:0, marginTop:1 }}>⚠</div>
            <div><div className="at">Alerta crítica de planificación</div>
              <div className="ab">Miguel Bellod prevé jubilarse en 2026. Requiere plan de cobertura urgente antes del 30 de abril.</div>
            </div>
          </div>
          <div style={{ height:1, background:C.border, margin:"14px 0" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:"rgba(192,57,43,.05)", border:"1px solid rgba(192,57,43,.18)", borderRadius:6, padding:"12px 13px" }}>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.rojo, marginBottom:4 }}>Reactivo · 24h</div>
              <div style={{ fontSize:12, color:C.ink, lineHeight:1.7 }}>Inspector + Gestor de guardia · respuesta &lt;2h · informe 72h</div>
            </div>
            <div style={{ background:"rgba(0,99,56,.05)", border:"1px solid rgba(0,99,56,.18)", borderRadius:6, padding:"12px 13px" }}>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.verde, marginBottom:4 }}>Planificado · Continuo</div>
              <div style={{ fontSize:12, color:C.ink, lineHeight:1.7 }}>Inspecciones · formación · reportes · KPIs · auditorías</div>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom:14 }}>
            <div className="sl">Equipo directivo</div>
            {[{id:"JGC",n:"Juanjo Gómez",r:"Coordinador GASCC",c:C.teal},{id:"DM",n:"David Muñoz",r:"Gestor Zona Norte",c:C.azul},{id:"JG",n:"Juanjo Gómez",r:"Gestor Zona Centro",c:C.teal},{id:"LM",n:"Lucas Martín",r:"Gestor Zona Sur",c:C.verde}].map((p,i)=>(
              <div key={i} style={{ display:"flex", gap:9, alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <MemberDot id={p.id} size={28}/>
                <div><div style={{ fontSize:12.5, fontWeight:600, color:C.ink }}>{p.n}</div><div style={{ fontSize:10.5, color:C.gris }}>{p.r}</div></div>
              </div>
            ))}
            <div style={{ fontSize:10.5, color:C.gris, marginTop:8 }}>+ 10 inspectores de campo</div>
          </div>
          <div className="card">
            <div className="sl">Implantación 2026</div>
            {[["Feb","Configuración",C.teal],["Mar","Adopción",C.verde],["Abr","Optimización",C.azul],["May","Consolidación",C.lila],["Jun","Mejora continua",C.naranja]].map(([m,t,c],i)=>(
              <div key={i} className="phase-row">
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }}/>
                <span style={{ fontSize:10, fontWeight:700, color:c, width:26 }}>{m}</span>
                <span style={{ fontSize:12, color:C.ink }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────
const NAV = [
  { id:"overview",  label:"Visión General",      eye:"GASCC · 2026",  title:"Visión General GASCC",      sub:"Plan de gestión integral del departamento",                   feat:false },
  { id:"guardias",  label:"Gestión de Guardias", eye:"05 · Guardias", title:"Gestión de Guardias 2026",  sub:"Cuadrante editable · Contadores de equidad · 52 semanas",     feat:true  },
  { id:"tareas",    label:"Reparto de Tareas",   eye:"02 · Tableros", title:"Reparto de Tareas",         sub:"Tableros Kanban por área · Asignaciones · Seguimiento global", feat:true  },
];
const PAGES = { overview:Overview, guardias:GuardiasModule, tareas:KanbanModule };

// ─── APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("overview");
  const Page = PAGES[active]||Overview;
  const meta = NAV.find(n=>n.id===active)||NAV[0];

  return (
    <div className="gr">
      <style>{CSS}</style>
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-adif">
            <div className="sb-mark"/>
            <span>adif</span>
          </div>
          <div className="sb-dept">GASCC · Gestión Integral</div>
        </div>
        <div className="sb-sec">Módulos</div>
        {NAV.map(n=>(
          <div key={n.id} className={`ni ${active===n.id?"on":""}`} onClick={()=>setActive(n.id)}>
            <div className="ni-dot"/>
            {n.label}
            {n.feat && <span className="feat-badge">NUEVO</span>}
          </div>
        ))}
        <div className="sb-sec" style={{ marginTop:8 }}>Gestores</div>
        {MANAGERS.map(m=>(
          <div key={m.id} className="ni" style={{ cursor:"default" }}>
            <MemberDot id={m.id} size={16}/>
            {m.name}
          </div>
        ))}
        <div className="sb-ft">
          <div className="sb-badge"><div className="b-dot"/>Bellod · Jub. 2026</div>
          <div style={{ marginTop:9, fontSize:9.5, color:"rgba(255,255,255,.2)", lineHeight:1.6 }}>
            Feb 2026 · Uso interno<br/>Coord: Juanjo Gómez
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="ph">
          <div>
            <div className="ph-eye">{meta.eye}</div>
            <div className="ph-title">{meta.title}</div>
            <div className="ph-sub">{meta.sub}</div>
          </div>
          <div className="ph-meta">
            <div style={{ fontWeight:700, color:C.ink }}>GASCC</div>
            <div>D. Coordinación Seguridad Circulación</div>
            <div>Adif · Uso interno · Febrero 2026</div>
          </div>
        </div>
        <div className="ct"><Page/></div>
      </main>
    </div>
  );
}
