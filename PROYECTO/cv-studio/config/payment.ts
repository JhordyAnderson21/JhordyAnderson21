export type PlanId="free"|"standard"|"premium";
export type PlanConfig={id:PlanId;nombre:string;precio:number|null;resumen:string[];destacado?:string;detalle:string[]};
export const planes:PlanConfig[]=[
 {id:"free",nombre:"Gratis",precio:null,resumen:["CV profesional de 1 página","2 diseños esenciales","Corrección final","Descarga PDF"],detalle:["Motor de composición automática","6–10 habilidades recomendadas","Revisión de información esencial","Asistencia básica durante el proceso"]},
 {id:"standard",nombre:"Standard",precio:3,resumen:["Todo lo de Gratis","13 estructuras profesionales","Asistencia de redacción","Optimización según puesto","Hasta 2 páginas"],detalle:["Proyectos y logros propios","Herramientas tecnológicas","Diseños sin espacio de foto","Recomendación de plantilla","Más ayuda para redactar y organizar tu CV"]},
 {id:"premium",nombre:"Premium",precio:5,destacado:"Asegura tu lugar laboral con una presentación más completa",resumen:["Todo lo de Standard","Colección Premium ampliada","Foto integrada en múltiples estilos","Asistencia avanzada de escritura","Composición visual premium"],detalle:["Arquitecturas ejecutivas, editoriales, creativas y tecnológicas","Corrección ortográfica + sugerencias de redacción","Recomendaciones por categoría profesional","Ayuda asistida avanzada campo por campo","Distribución adaptativa según cantidad de contenido","Más ejemplos y recomendaciones para fortalecer tu CV"]}
];
export function obtenerPlan(id:PlanId){return planes.find(p=>p.id===id)??planes[0];}
export const yapeConfig={qrImageUrl:"/yape-qr.png"};
export const MINUTOS_PARA_PAGAR=5;
export const SEGUNDOS_VERIFICACION=15;
