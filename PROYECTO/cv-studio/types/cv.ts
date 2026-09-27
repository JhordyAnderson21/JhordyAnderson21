import { PlanId } from "@/config/payment";

export type PersonalData={nombres:string;apellidos:string;telefono:string;correo:string;ciudad:string;pais:string;puestoObjetivo:string;linkedin?:string;portafolio?:string};
export type Experience={id:string;empresa:string;puesto:string;fechaInicio:string;fechaFin:string;actual:boolean;descripcion:string;logros:string[]};
export type Education={id:string;institucion:string;programa:string;grado:string;fechaInicio:string;fechaFin:string;actual:boolean};
export type NivelIdioma="Básico"|"Intermedio"|"Avanzado"|"Nativo";
export type Language={id:string;idioma:string;nivel:NivelIdioma};
export type Certification={id:string;nombre:string;institucion:string;anio:string};
export type Project={id:string;nombre:string;descripcion:string;herramientas:string;enlace?:string};
export type Recognition={id:string;nombre:string;institucion:string;anio:string;detalle?:string};

export type CV={
 version:6; planSeleccionado:PlanId|null; personalData:PersonalData; fotoDataUrl:string|null; perfil:string;
 experiences:Experience[]; education:Education[]; skills:string[]; techSkills:string[]; languages:Language[];
 certifications:Certification[]; projects:Project[]; recognitions:Recognition[]; designId:string; template:string;
 autoDesign:boolean; targetRole:string; industry:string; paymentUnlocked:boolean; paymentPurchaseId:string|null;
};

export const emptyPersonalData:PersonalData={nombres:"",apellidos:"",telefono:"",correo:"",ciudad:"",pais:"Perú",puestoObjetivo:"",linkedin:"",portafolio:""};
export const emptyCV:CV={version:6,planSeleccionado:null,personalData:emptyPersonalData,fotoDataUrl:null,perfil:"",experiences:[],education:[],skills:[],techSkills:[],languages:[],certifications:[],projects:[],recognitions:[],designId:"",template:"",autoDesign:true,targetRole:"",industry:"",paymentUnlocked:false,paymentPurchaseId:null};

export const ALL_STEPS=[
 {id:"plan",label:"Elige tu plan"},{id:"plantilla",label:"Diseño"},{id:"personal",label:"Información personal"},{id:"perfil",label:"Perfil profesional"},
 {id:"experiencia",label:"Experiencia laboral"},{id:"educacion",label:"Educación"},{id:"habilidades",label:"Habilidades"},{id:"idiomas",label:"Idiomas"},
 {id:"cursos",label:"Certificaciones"},{id:"proyectos",label:"Proyectos y logros"},{id:"revision",label:"Revisión inteligente"},{id:"pago",label:"Finalizar"}
] as const;
export type StepId=typeof ALL_STEPS[number]["id"];
export function pasosVisibles(plan:PlanId|null){if(!plan)return ALL_STEPS.slice(0,1);return plan==="free"?ALL_STEPS.filter(s=>s.id!=="pago"):ALL_STEPS;}
