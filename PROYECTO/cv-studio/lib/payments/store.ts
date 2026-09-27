import fs from "fs";
import path from "path";
import { PlanId, MINUTOS_PARA_PAGAR } from "@/config/payment";

export type EstadoCompra={id:string;plan:Exclude<PlanId,"free">;precio:number|null;creadoEn:string;expiraEn:string;comprobanteSubido:boolean;comprobantePath?:string};
const DATA_DIR=path.join(process.cwd(),".data");
const DATA_FILE=path.join(DATA_DIR,"purchases.json");
function leerTodas():EstadoCompra[]{try{const raw=fs.readFileSync(DATA_FILE,"utf-8");const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed:[]}catch{return []}}
function guardarTodas(compras:EstadoCompra[]){fs.mkdirSync(DATA_DIR,{recursive:true});fs.writeFileSync(DATA_FILE,JSON.stringify(compras,null,2),"utf-8")}
function limpiarArchivo(compra:EstadoCompra){if(compra.comprobantePath){try{fs.unlinkSync(compra.comprobantePath)}catch{}}}
export function crearCompra(data:Omit<EstadoCompra,"creadoEn"|"expiraEn"|"comprobanteSubido">):EstadoCompra{const compras=leerTodas();const creado=new Date();const expira=new Date(creado.getTime()+MINUTOS_PARA_PAGAR*60*1000);const nueva:EstadoCompra={...data,creadoEn:creado.toISOString(),expiraEn:expira.toISOString(),comprobanteSubido:false};compras.push(nueva);guardarTodas(compras);return nueva}
export function obtenerCompra(id:string):EstadoCompra|undefined{const compras=leerTodas();const now=Date.now();const idx=compras.findIndex(c=>c.id===id);if(idx===-1)return undefined;const compra=compras[idx];if(new Date(compra.expiraEn).getTime()<=now){limpiarArchivo(compra);compras.splice(idx,1);guardarTodas(compras);return undefined}return compra}
export function marcarComprobanteSubido(id:string,comprobantePath:string):EstadoCompra|undefined{const compras=leerTodas();const idx=compras.findIndex(c=>c.id===id);if(idx===-1)return undefined;const compra=compras[idx];if(new Date(compra.expiraEn).getTime()<=Date.now()){try{fs.unlinkSync(comprobantePath)}catch{};limpiarArchivo(compra);compras.splice(idx,1);guardarTodas(compras);return undefined}compras[idx]={...compra,comprobanteSubido:true,comprobantePath};guardarTodas(compras);return compras[idx]}
