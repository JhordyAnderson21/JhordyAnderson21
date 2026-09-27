export type LayoutId="clasica"|"basica-clean"|"moderna"|"ejecutiva"|"minimalista"|"dos-columnas"|"creativa"|"corporate-line"|"structured-split"|"executive-timeline"|"corporate-balance"|"modern-blocks"|"vertical-line"|"editorial-clean"|"executive-portrait"|"executive-frame"|"corporate-side"|"leadership-banner"|"editorial-executive"|"career-rail"|"prestige"|"modern-executive-grid"|"asymmetric-editorial"|"photo-split"|"dark-command"|"monogram-luxe"|"diagonal-impact"|"modular-portfolio"|"signature-frame"|"tech-grid";
export type PaletaId="navy"|"cobalt"|"graphite"|"burgundy"|"forest"|"plum"|"sand";
export type PlanRequerido="free"|"standard"|"premium";
export type Plantilla={id:string;layout:LayoutId;paleta:PaletaId;nombre:string;descripcion:string;acento:string;acentoSuave:string;requiere:PlanRequerido;admiteFoto:boolean;categoria:"Corporativo"|"Ejecutivo"|"Profesional"|"Moderno"|"Minimalista"|"Cronológico"|"Tecnología"|"Creativo"};

export const PALETAS:Record<PaletaId,{acento:string;acentoSuave:string;nombre:string}>= {
 navy:{acento:"#102A43",acentoSuave:"#EAF1F8",nombre:"Azul marino"},
 cobalt:{acento:"#1D4ED8",acentoSuave:"#EAF0FF",nombre:"Cobalto"},
 graphite:{acento:"#263238",acentoSuave:"#EEF2F4",nombre:"Grafito"},
 burgundy:{acento:"#70263D",acentoSuave:"#F7EBEF",nombre:"Borgoña"},
 forest:{acento:"#155E55",acentoSuave:"#E9F5F2",nombre:"Verde profundo"},
 plum:{acento:"#56306E",acentoSuave:"#F2EAF7",nombre:"Ciruela"},
 sand:{acento:"#76583F",acentoSuave:"#F5EFE9",nombre:"Arena"}
};

const STANDARD:{id:LayoutId;nombre:string;categoria:Plantilla["categoria"];desc:string}[]=[
 {id:"clasica",nombre:"Clásica",categoria:"Profesional",desc:"Jerarquía tradicional, limpia y muy legible."},
 {id:"basica-clean",nombre:"Basic Clean",categoria:"Minimalista",desc:"Una composición esencial, aireada y directa para un CV sencillo."},
 {id:"moderna",nombre:"Moderna",categoria:"Moderno",desc:"Encabezado fuerte y bloques contemporáneos."},
 {id:"ejecutiva",nombre:"Ejecutiva",categoria:"Ejecutivo",desc:"Estructura sobria para perfiles profesionales."},
 {id:"minimalista",nombre:"Minimal",categoria:"Minimalista",desc:"Mucho aire, tipografía limpia y máxima claridad."},
 {id:"dos-columnas",nombre:"Split",categoria:"Corporativo",desc:"Dos columnas equilibradas para más información."},
 {id:"creativa",nombre:"Creative",categoria:"Moderno",desc:"Acentos visuales para perfiles creativos."},
 {id:"corporate-line",nombre:"Corporate Line",categoria:"Corporativo",desc:"Líneas y bloques para una presencia corporativa."},
 {id:"structured-split",nombre:"Structured Split",categoria:"Tecnología",desc:"Contenido técnico organizado por prioridades."},
 {id:"executive-timeline",nombre:"Executive Timeline",categoria:"Cronológico",desc:"Experiencia y formación con lectura temporal."},
 {id:"corporate-balance",nombre:"Corporate Balance",categoria:"Corporativo",desc:"Cabecera sobria y distribución 35/65 para equilibrar información."},
 {id:"modern-blocks",nombre:"Modern Blocks",categoria:"Moderno",desc:"Módulos horizontales que separan el contenido con ritmo visual."},
 {id:"vertical-line",nombre:"Vertical Line",categoria:"Cronológico",desc:"Una línea de recorrido organiza experiencia y formación."},
 {id:"editorial-clean",nombre:"Editorial Clean",categoria:"Profesional",desc:"Tipografía protagonista, fechas destacadas y estructura editorial limpia."}
];
const PREMIUM:{id:LayoutId;nombre:string;categoria:Plantilla["categoria"];desc:string;photo:boolean}[]=[
 {id:"executive-portrait",nombre:"Executive Portrait",categoria:"Ejecutivo",desc:"Retrato protagonista con jerarquía directiva y aire editorial.",photo:true},
 {id:"executive-frame",nombre:"Executive Frame",categoria:"Ejecutivo",desc:"Marco fotográfico estructurado para una presencia sobria y premium.",photo:true},
 {id:"corporate-side",nombre:"Corporate Side",categoria:"Corporativo",desc:"Barra lateral de alto contraste y lectura profesional.",photo:true},
 {id:"leadership-banner",nombre:"Leadership Banner",categoria:"Ejecutivo",desc:"Cabecera panorámica con impacto visual para perfiles senior.",photo:true},
 {id:"editorial-executive",nombre:"Editorial Executive",categoria:"Ejecutivo",desc:"Composición editorial con columna de información y foco visual.",photo:true},
 {id:"career-rail",nombre:"Career Rail",categoria:"Cronológico",desc:"Línea temporal vertical para trayectorias extensas.",photo:true},
 {id:"prestige",nombre:"Prestige",categoria:"Ejecutivo",desc:"Composición de lujo sobria con fotografía central.",photo:true},
 {id:"modern-executive-grid",nombre:"Executive Grid",categoria:"Moderno",desc:"Retícula modular para información abundante.",photo:true},
 {id:"asymmetric-editorial",nombre:"Asymmetric Editorial",categoria:"Moderno",desc:"Composición asimétrica inspirada en portadas editoriales.",photo:true},
 {id:"photo-split",nombre:"Photo Split",categoria:"Moderno",desc:"Fotografía vertical integrada como eje de la composición.",photo:true},
 {id:"dark-command",nombre:"Dark Command",categoria:"Ejecutivo",desc:"Cabecera oscura de alto contraste para liderazgo y dirección.",photo:true},
 {id:"monogram-luxe",nombre:"Monogram Luxe",categoria:"Ejecutivo",desc:"Iniciales protagonistas y detalles finos de identidad personal.",photo:true},
 {id:"diagonal-impact",nombre:"Diagonal Impact",categoria:"Creativo",desc:"Bloque diagonal de color para un CV memorable sin perder legibilidad.",photo:true},
 {id:"modular-portfolio",nombre:"Modular Portfolio",categoria:"Tecnología",desc:"Módulos visuales para proyectos, herramientas y experiencia.",photo:true},
 {id:"signature-frame",nombre:"Signature Frame",categoria:"Profesional",desc:"Marco elegante con fotografía y contenido jerarquizado.",photo:true},
 {id:"tech-grid",nombre:"Tech Grid",categoria:"Tecnología",desc:"Retícula técnica con paneles para skills, herramientas y proyectos.",photo:true}
];
const DEFAULT:Record<LayoutId,PaletaId>={
 clasica:"navy","basica-clean":"graphite",moderna:"cobalt",ejecutiva:"navy",minimalista:"graphite","dos-columnas":"navy",creativa:"plum","corporate-line":"navy","structured-split":"graphite","executive-timeline":"cobalt",
 "corporate-balance":"navy","modern-blocks":"cobalt","vertical-line":"forest","editorial-clean":"burgundy",
 "executive-portrait":"navy","executive-frame":"graphite","corporate-side":"cobalt","leadership-banner":"forest","editorial-executive":"burgundy","career-rail":"navy",prestige:"plum","modern-executive-grid":"sand", "asymmetric-editorial":"burgundy", "photo-split":"navy", "dark-command":"graphite", "monogram-luxe":"plum", "diagonal-impact":"cobalt", "modular-portfolio":"forest", "signature-frame":"sand", "tech-grid":"navy"
};
function item(l:{id:LayoutId;nombre:string;categoria:Plantilla["categoria"];desc:string;photo?:boolean},paleta:PaletaId,requiere:PlanRequerido):Plantilla{const p=PALETAS[paleta];return {id:`${l.id}-${paleta}`,layout:l.id,paleta,nombre:`${l.nombre} · ${p.nombre}`,descripcion:l.desc,acento:p.acento,acentoSuave:p.acentoSuave,requiere,admiteFoto:Boolean(l.photo),categoria:l.categoria};}
export const CATALOGO_PLANTILLAS:Plantilla[]=[
 ...STANDARD.map(x=>item(x,DEFAULT[x.id],x.id==="clasica"||x.id==="basica-clean"?"free": "standard")),
 ...PREMIUM.flatMap(x=>(Object.keys(PALETAS) as PaletaId[]).filter(p=>["navy","cobalt","graphite","burgundy","forest","plum"].includes(p)).map(p=>item(x,p,"premium")))
];
export const PLANTILLA_GRATIS_ID="clasica-navy";
export function plantillasParaPlan(plan:PlanRequerido){return CATALOGO_PLANTILLAS.filter(p=>plan==="premium"?true:plan==="standard"?(p.requiere!=="premium"&&p.layout!=="basica-clean"):p.requiere==="free");}
export function obtenerPlantilla(id:string){return CATALOGO_PLANTILLAS.find(p=>p.id===id)||CATALOGO_PLANTILLAS.find(p=>p.id===PLANTILLA_GRATIS_ID)!;}
export function recommendedTemplate(role:string,industry:string,plan:PlanRequerido){const opts=plantillasParaPlan(plan);const t=`${role} ${industry}`.toLowerCase();if(plan==="premium"&&/ejecut|geren|director|manager/.test(t))return opts.find(x=>x.layout==="prestige"&&x.paleta==="navy")||opts[0];if(plan==="premium"&&/creativ|marketing|disen/.test(t))return opts.find(x=>x.layout==="editorial-executive"||x.layout==="modern-executive-grid")||opts[0];if(/tecn|software|program|data|ingenier/.test(t))return opts.find(x=>x.layout==="structured-split"||x.layout==="modern-executive-grid")||opts[0];if(/ejecut|geren|director/.test(t))return opts.find(x=>x.layout==="ejecutiva"||x.layout==="prestige")||opts[0];return opts.find(x=>x.layout==="moderna"||x.layout==="corporate-line")||opts[0];}
