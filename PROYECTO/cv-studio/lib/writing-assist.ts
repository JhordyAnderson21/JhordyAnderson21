const reglas:Array<[RegExp,string]>=[
 [/\btambien\b/gi,"también"],[/\bademas\b/gi,"además"],[/\bexperiencia\b/gi,"experiencia"],[/\batendia\b/gi,"atendía"],[/\batiendo\b/gi,"atiendo"],[/\bhacia\b/gi,"hacía"],[/\bgestionaba\b/gi,"gestionaba"],[/\borganize\b/gi,"organicé"],[/\borganice\b/gi,"organicé"],[/\bcomunicacion\b/gi,"comunicación"],[/\borganizacion\b/gi,"organización"],[/\bresolucion\b/gi,"resolución"],[/\badministracion\b/gi,"administración"],[/\btecnologia\b/gi,"tecnología"],[/\bdiseno\b/gi,"diseño"],[/\bpracticas\b/gi,"prácticas"]
];
export function corregirTextoUsuario(texto:string){let t=texto.replace(/\s+/g," ").trim();for(const [r,v] of reglas)t=t.replace(r,v);return t;}
export function sugerirRedaccion(texto:string){
 const limpio=corregirTextoUsuario(texto); if(!limpio)return "";
 let s=limpio;
 s=s.replace(/^me encargaba de\s+/i,"Responsable de ");
 s=s.replace(/^hacía\s+/i,"Realización de ");
 s=s.replace(/^ayudaba a\s+/i,"Apoyo en ");
 s=s.replace(/^trabajaba en\s+/i,"Participación en ");
 if(s===limpio && !/\b(gestión|atención|desarrollo|coordinación|organización|análisis|apoyo|responsable|participación)\b/i.test(s)) s=`${s.charAt(0).toUpperCase()}${s.slice(1)}`;
 return s;
}
