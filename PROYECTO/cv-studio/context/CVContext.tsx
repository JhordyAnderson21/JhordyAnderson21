"use client";
import React,{createContext,useCallback,useContext,useEffect,useState} from "react";
import {v4 as uuid} from "uuid";
import {CV,Experience,Education,Language,Certification,Project,Recognition,PersonalData,emptyCV,emptyPersonalData} from "@/types/cv";
import {PlanId} from "@/config/payment";
import {plantillasParaPlan} from "@/lib/templates/catalog";
import {enforcePlanEntitlements,normalizeCV} from "@/lib/cv-engine";

const KEY="cv-studio:draft:v6";
type Ctx={cv:CV;setPlanSeleccionado:(p:PlanId)=>void;setTemplate:(id:string)=>void;setPersonalData:(d:Partial<PersonalData>)=>void;setFoto:(x:string|null)=>void;setPerfil:(x:string)=>void;setTarget:(role:string,industry:string)=>void;addExperience:()=>void;updateExperience:(id:string,d:Partial<Experience>)=>void;removeExperience:(id:string)=>void;addEducation:()=>void;updateEducation:(id:string,d:Partial<Education>)=>void;removeEducation:(id:string)=>void;setSkills:(x:string[])=>void;setTechSkills:(x:string[])=>void;addLanguage:()=>void;updateLanguage:(id:string,d:Partial<Language>)=>void;removeLanguage:(id:string)=>void;setCertifications:(x:Certification[])=>void;addCertification:()=>void;updateCertification:(id:string,d:Partial<Certification>)=>void;removeCertification:(id:string)=>void;setProjects:(x:Project[])=>void;setRecognitions:(x:Recognition[])=>void;setPaymentUnlocked:(x:boolean)=>void;setPaymentPurchaseId:(x:string|null)=>void;setDesign:(id:string,auto?:boolean)=>void;resetCV:()=>void};
const Context=createContext<Ctx|null>(null);
export function CVProvider({children}:{children:React.ReactNode}){
 const [cv,setCV]=useState<CV>(emptyCV);const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);setCV(normalizeCV({...emptyCV,...s,version:6,paymentUnlocked:Boolean(s.paymentUnlocked) && Boolean(s.paymentPurchaseId),paymentPurchaseId:typeof s.paymentPurchaseId === "string" ? s.paymentPurchaseId : null,personalData:{...emptyPersonalData,...s.personalData}}));}}catch{}finally{setReady(true)}},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(cv))}catch{}},[cv,ready]);
 const setPlanSeleccionado=useCallback((plan:PlanId)=>setCV(prev=>{
   if(prev.planSeleccionado===plan){return prev;}
   const available=plantillasParaPlan(plan); const fallback=available[0]?.id||"";
   // El plan define los permisos desde el inicio. Si el usuario cambia de plan
   // durante una sesión ya iniciada, la confirmación se gestiona en PlanStep y
   // aquí se reinicia el borrador para no arrastrar contenido exclusivo.
   return {...emptyCV,version:6,planSeleccionado:plan,designId:fallback,template:fallback,autoDesign:true,paymentUnlocked:false,paymentPurchaseId:null};
 }),[]);
 const setPersonalData=useCallback((d:Partial<PersonalData>)=>setCV(p=>({...p,personalData:{...p.personalData,...d}})),[]);
 const setFoto=useCallback((x:string|null)=>setCV(p=>({...p,fotoDataUrl:x})),[]);const setPerfil=useCallback((x:string)=>setCV(p=>({...p,perfil:x})),[]);
 const setTarget=useCallback((role:string,industry:string)=>setCV(p=>({...p,targetRole:role,industry,personalData:{...p.personalData,puestoObjetivo:p.personalData.puestoObjetivo||role}})),[]);
 const addExperience=useCallback(()=>setCV(p=>({...p,experiences:[...p.experiences,{id:uuid(),empresa:"",puesto:"",fechaInicio:"",fechaFin:"",actual:false,descripcion:"",logros:[""]}]})),[]);
 const updateExperience=useCallback((id:string,d:Partial<Experience>)=>setCV(p=>({...p,experiences:p.experiences.map(x=>x.id===id?{...x,...d}:x)})),[]);const removeExperience=useCallback((id:string)=>setCV(p=>({...p,experiences:p.experiences.filter(x=>x.id!==id)})),[]);
 const addEducation=useCallback(()=>setCV(p=>({...p,education:[...p.education,{id:uuid(),institucion:"",programa:"",grado:"",fechaInicio:"",fechaFin:"",actual:false}]})),[]);const updateEducation=useCallback((id:string,d:Partial<Education>)=>setCV(p=>({...p,education:p.education.map(x=>x.id===id?{...x,...d}:x)})),[]);const removeEducation=useCallback((id:string)=>setCV(p=>({...p,education:p.education.filter(x=>x.id!==id)})),[]);
 const setSkills=useCallback((x:string[])=>setCV(p=>({...p,skills:x})),[]);const setTechSkills=useCallback((x:string[])=>setCV(p=>({...p,techSkills:x})),[]);
 const addLanguage=useCallback(()=>setCV(p=>({...p,languages:[...p.languages,{id:uuid(),idioma:"",nivel:"Intermedio"}]})),[]);const updateLanguage=useCallback((id:string,d:Partial<Language>)=>setCV(p=>({...p,languages:p.languages.map(x=>x.id===id?{...x,...d}:x)})),[]);const removeLanguage=useCallback((id:string)=>setCV(p=>({...p,languages:p.languages.filter(x=>x.id!==id)})),[]);
 const setCertifications=useCallback((x:Certification[])=>setCV(p=>({...p,certifications:x})),[]);const addCertification=useCallback(()=>setCV(p=>({...p,certifications:[...p.certifications,{id:uuid(),nombre:"",institucion:"",anio:""}]})),[]);const updateCertification=useCallback((id:string,d:Partial<Certification>)=>setCV(p=>({...p,certifications:p.certifications.map(x=>x.id===id?{...x,...d}:x)})),[]);const removeCertification=useCallback((id:string)=>setCV(p=>({...p,certifications:p.certifications.filter(x=>x.id!==id)})),[]);
 const setProjects=useCallback((x:Project[])=>setCV(p=>({...p,projects:x})),[]);const setRecognitions=useCallback((x:Recognition[])=>setCV(p=>({...p,recognitions:x})),[]);
 const setPaymentUnlocked=useCallback((x:boolean)=>setCV(p=>({...p,paymentUnlocked:x})),[]);const setPaymentPurchaseId=useCallback((x:string|null)=>setCV(p=>({...p,paymentPurchaseId:x})),[]);
 const setDesign=useCallback((id:string,auto=false)=>setCV(p=>({...p,designId:id,template:id,autoDesign:auto})),[]);const setTemplate=useCallback((id:string)=>setCV(p=>({...p,designId:id,template:id,autoDesign:false})),[]);
 const resetCV=useCallback(()=>{setCV(emptyCV);try{localStorage.removeItem(KEY)}catch{}},[]);
 return <Context.Provider value={{cv,setPlanSeleccionado,setTemplate,setPersonalData,setFoto,setPerfil,setTarget,addExperience,updateExperience,removeExperience,addEducation,updateEducation,removeEducation,setSkills,setTechSkills,addLanguage,updateLanguage,removeLanguage,setCertifications,addCertification,updateCertification,removeCertification,setProjects,setRecognitions,setPaymentUnlocked,setPaymentPurchaseId,setDesign,resetCV}}>{children}</Context.Provider>
}
export function useCV(){const c=useContext(Context);if(!c)throw new Error("useCV debe usarse dentro de CVProvider");return c;}
