import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import { CV } from "@/types/cv";
import { obtenerPlantilla, LayoutId } from "@/lib/templates/catalog";
import { normalizeCV } from "@/lib/cv-engine";

function corregirTexto(texto: string) {
  let t = (texto || "").replace(/\s+/g, " ").trim();
  const reglas: Array<[RegExp, string]> = [
    [/\batencion\b/gi, "atención"], [/\borganizacion\b/gi, "organización"], [/\bcomunicacion\b/gi, "comunicación"],
    [/\badministracion\b/gi, "administración"], [/\bexperiencia\b/gi, "experiencia"], [/\btecnico\b/gi, "técnico"],
    [/\btecnica\b/gi, "técnica"], [/\btecnologia\b/gi, "tecnología"], [/\btecnologias\b/gi, "tecnologías"],
    [/\bgestion\b/gi, "gestión"], [/\bplanificacion\b/gi, "planificación"], [/\bresolucion\b/gi, "resolución"],
    [/\bproyectos\b/gi, "proyectos"], [/\bdiseno\b/gi, "diseño"], [/\bdisenos\b/gi, "diseños"],
    [/\bpublico\b/gi, "público"], [/\bpublicos\b/gi, "públicos"], [/\bpractica\b/gi, "práctica"],
    [/\bpracticas\b/gi, "prácticas"], [/\bcertificacion\b/gi, "certificación"], [/\bcertificaciones\b/gi, "certificaciones"],
    [/\bnumero\b/gi, "número"], [/\btecnologicas\b/gi, "tecnológicas"], [/\btambien\b/gi, "también"], [/\bademas\b/gi, "además"], [/\bmas\b/gi, "más"], [/\butilizacion\b/gi, "utilización"], [/\bparticipacion\b/gi, "participación"], [/\bpreparacion\b/gi, "preparación"], [/\bcapacitacion\b/gi, "capacitación"], [/\bsolucion\b/gi, "solución"],
  ];
  for (const [regex, reemplazo] of reglas) t = t.replace(regex, reemplazo);
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  if (t && !/[.!?]$/.test(t) && t.length > 55) t += ".";
  return t;
}

function prepararCV(cv: CV): CV {
  const skills = Array.from(new Set(cv.skills.map(corregirTexto).filter(Boolean)));
  const techSkills = Array.from(new Set((cv.techSkills ?? []).map(corregirTexto).filter(Boolean)))
    .filter(tool => !skills.some(skill => skill.toLowerCase() === tool.toLowerCase()));
  return normalizeCV({
    ...cv,
    perfil: corregirTexto(cv.perfil),
    skills,
    techSkills,
    experiences: cv.experiences.map(e => ({ ...e, descripcion: corregirTexto(e.descripcion), logros: e.logros.map(corregirTexto).filter(Boolean) })),
    projects: (cv.projects ?? []).map(p => ({ ...p, nombre: corregirTexto(p.nombre), descripcion: corregirTexto(p.descripcion), herramientas: corregirTexto(p.herramientas) })),
    recognitions: (cv.recognitions ?? []).map(r => ({ ...r, nombre: corregirTexto(r.nombre), detalle: corregirTexto(r.detalle ?? "") })),
  });
}

function buildStyles(acento: string, acentoSuave: string, cv: CV) {
  const chars = cv.perfil.length + cv.experiences.reduce((n, e) => n + e.descripcion.length + e.logros.join(" ").length, 0) + cv.education.length * 100 + cv.skills.join(" ").length + (cv.projects ?? []).reduce((n,p)=>n+p.descripcion.length,0) + (cv.recognitions ?? []).reduce((n,r)=>n+(r.detalle ?? "").length,0);
  const sectionCount = [cv.perfil, cv.experiences.length, cv.education.length, cv.skills.length, cv.languages.length, cv.certifications.length, (cv.projects ?? []).length, (cv.techSkills ?? []).length, (cv.recognitions ?? []).length].filter(Boolean).length;
  const density = chars > 5200 || cv.experiences.length >= 6 || (cv.projects ?? []).length >= 5 ? "alta" : chars < 1050 && sectionCount <= 5 ? "ligera" : "equilibrada";
  const factor = density === "alta" ? 0.87 : density === "ligera" ? 1.045 : 0.98;
  const sectionGap = density === "alta" ? 8 : density === "ligera" ? 16 : 12;
  const entryGap = density === "alta" ? 7 : density === "ligera" ? 12 : 10;
  const pageTop = density === "alta" ? 28 : density === "ligera" ? 42 : 36;
  const pageBottom = density === "alta" ? 30 : density === "ligera" ? 44 : 38;
  const f = (n: number) => Math.round(n * factor * 10) / 10;

  return StyleSheet.create({
    page: {
      paddingTop: pageTop,
      paddingBottom: pageBottom,
      paddingHorizontal: 42,
      borderTopWidth: 4,
      borderTopColor: acento,
      backgroundColor: "#FFFFFF",
      fontSize: f(10.3),
      fontFamily: "Helvetica",
      color: "#1E1E1C",
      lineHeight: density === "alta" ? 1.32 : density === "ligera" ? 1.46 : 1.4,
    },
    pageSidebar: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      fontSize: f(10.5),
      fontFamily: "Helvetica",
      color: "#1E1E1C",
      lineHeight: 1.4,
      flexDirection: "row",
    },
    sidebar: {
      width: "34%",
      backgroundColor: acento,
      color: "#FFFFFF",
      paddingVertical: 36,
      paddingHorizontal: 22,
    },
    sidebarMain: {
      width: "66%",
      paddingVertical: 36,
      paddingHorizontal: 26,
    },
    header: { marginBottom: 16, paddingBottom: 11, borderBottomWidth: 1.5, borderBottomColor: acentoSuave },
    headerBand: {
      backgroundColor: acento,
      marginHorizontal: -42,
      marginTop: -pageTop,
      paddingTop: pageTop + 2,
      paddingBottom: 22,
      paddingHorizontal: 42,
      marginBottom: 16,
    },
    nombre: { fontSize: f(22), fontFamily: "Helvetica-Bold", color: "#102A43", letterSpacing: 0.15 },
    nombreClaro: { fontSize: f(20), fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
    puesto: { fontSize: f(12), color: acento, marginTop: 2, marginBottom: 6 },
    puestoClaro: { fontSize: 12, color: "#FFFFFF", opacity: 0.9, marginTop: 2, marginBottom: 2 },
    contactoRow: { flexDirection: "row", flexWrap: "wrap", fontSize: f(9), color: "#4A4A46", gap: 8 },
    contactoRowClaro: {
      flexDirection: "column",
      fontSize: f(9),
      color: "#FFFFFF",
      opacity: 0.9,
      gap: 3,
      marginTop: 8,
    },
    contactoItem: { marginRight: 10 },
    section: { marginTop: sectionGap },
    sectionTitle: {
      fontSize: f(10.5),
      fontFamily: "Helvetica-Bold",
      color: acento,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E0D9",
      paddingBottom: 4,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sectionTitleClaro: {
      fontSize: f(10),
      fontFamily: "Helvetica-Bold",
      color: "#FFFFFF",
      paddingBottom: 3,
      marginBottom: 6,
      marginTop: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.35)",
    },
    sectionTitleMinimal: {
      fontSize: f(9.5),
      fontFamily: "Helvetica-Bold",
      color: "#6B6B66",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    sectionTitleChip: {
      alignSelf: "flex-start",
      fontSize: f(9.5),
      fontFamily: "Helvetica-Bold",
      color: acento,
      backgroundColor: acentoSuave,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 3,
      marginBottom: 7,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    perfilText: { fontSize: f(10.5), lineHeight: density === "alta" ? 1.34 : 1.42 },
    perfilTextClaro: { fontSize: f(9.5), color: "#FFFFFF", opacity: 0.95 },
    entry: { marginBottom: entryGap },
    entryHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    entryTitle: { fontSize: f(10.6), fontFamily: "Helvetica-Bold", color: "#102A43" },
    entrySubtitle: { fontSize: f(10), color: "#3A3A36" },
    entryDates: { fontSize: f(9), color: "#6B6B66" },
    entryDescription: { fontSize: f(10), marginTop: density === "alta" ? 1 : 2, lineHeight: density === "alta" ? 1.32 : 1.4 },
    bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 4 },
    bulletDot: { width: 10, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10 },
    chipsRow: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
      fontSize: f(9.5),
      backgroundColor: acentoSuave,
      color: "#1E1E1C",
      paddingVertical: 3,
      paddingHorizontal: 7,
      borderRadius: 3,
      marginRight: 5,
      marginBottom: 5,
    },
    textoClaro: { fontSize: f(9.5), color: "#FFFFFF", opacity: 0.95, marginBottom: 3 },
    langRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    columnas: { flexDirection: "row", gap: 20, marginTop: 4 },
    columna: { flex: 1 },
    foto: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
    fotoGrande: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
    fotoCuadrada: { width: 68, height: 68, borderRadius: 6, marginRight: 14 },
    fotoVertical: { width: 62, height: 82, borderRadius: 4, marginRight: 14 },
    fotoHorizontal: { width: 92, height: 58, borderRadius: 5, marginRight: 14 },
    headerWide: { backgroundColor: acento, marginHorizontal: -42, marginTop: -pageTop, paddingVertical: 28, paddingHorizontal: 42, marginBottom: 16 },
    rail: { width: "18%", borderRightWidth: 2, borderRightColor: acento, paddingRight: 10 },
    railMain: { width: "82%", paddingLeft: 14 },
    editorialName: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#1E1E1C" },
    gridBox: { backgroundColor: acentoSuave, padding: 10, borderRadius: 5, flex: 1 },
  });
}

function formatFecha(inicio: string, fin: string, actual: boolean) {
  const ini = inicio || "—";
  const finTexto = actual ? "Actualidad" : fin || "—";
  return `${ini} – ${finTexto}`;
}

type S = ReturnType<typeof buildStyles>;

function Contacto({ cv, styles, claro }: { cv: CV; styles: S; claro?: boolean }) {
  const d = cv.personalData;
  const items = [
    d.correo,
    d.telefono,
    [d.ciudad, d.pais].filter(Boolean).join(", "),
    d.linkedin,
    d.portafolio,
  ].filter(Boolean);
  return (
    <View style={claro ? styles.contactoRowClaro : styles.contactoRow}>
      {items.map((item, i) => (
        <Text key={i} style={styles.contactoItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

function SeccionPerfil({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  if (!cv.perfil) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles[tipoTitulo] as any}>Perfil profesional</Text>
      <Text style={claro ? styles.perfilTextClaro : styles.perfilText}>{cv.perfil}</Text>
    </View>
  );
}

function SeccionExperiencia({ cv, styles, tipoTitulo }: { cv: CV; styles: S; tipoTitulo: keyof S }) {
  if (cv.experiences.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles[tipoTitulo] as any}>Experiencia laboral</Text>
      {cv.experiences.map((exp) => (
        <View key={exp.id} style={styles.entry} wrap={false}>
          <View style={styles.entryHeaderRow}>
            <Text style={styles.entryTitle}>
              {exp.puesto || "Puesto"}
              {exp.empresa ? ` · ${exp.empresa}` : ""}
            </Text>
            <Text style={styles.entryDates}>{formatFecha(exp.fechaInicio, exp.fechaFin, exp.actual)}</Text>
          </View>
          {exp.descripcion ? <Text style={styles.entryDescription}>{exp.descripcion}</Text> : null}
          {exp.logros
            .filter((l) => l.trim())
            .map((logro, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{logro}</Text>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}

function SeccionEducacion({ cv, styles, tipoTitulo }: { cv: CV; styles: S; tipoTitulo: keyof S }) {
  if (cv.education.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles[tipoTitulo] as any}>Educación</Text>
      {cv.education.map((edu) => (
        <View key={edu.id} style={styles.entry} wrap={false}>
          <View style={styles.entryHeaderRow}>
            <Text style={styles.entryTitle}>
              {edu.programa || "Programa"}
              {edu.grado ? ` (${edu.grado})` : ""}
            </Text>
            <Text style={styles.entryDates}>{formatFecha(edu.fechaInicio, edu.fechaFin, edu.actual)}</Text>
          </View>
          {edu.institucion ? <Text style={styles.entrySubtitle}>{edu.institucion}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function SeccionHabilidades({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  if (cv.skills.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles[tipoTitulo] as any}>Habilidades</Text>
      {claro ? (
        cv.skills.map((s, i) => (
          <Text key={i} style={styles.textoClaro}>
            {s}
          </Text>
        ))
      ) : (
        <View style={styles.chipsRow}>
          {cv.skills.map((s, i) => (
            <Text key={i} style={styles.chip}>
              {s}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function SeccionIdiomas({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  if (cv.languages.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles[tipoTitulo] as any}>Idiomas</Text>
      {cv.languages.map((l) =>
        claro ? (
          <Text key={l.id} style={styles.textoClaro}>
            {l.idioma} — {l.nivel}
          </Text>
        ) : (
          <View key={l.id} style={styles.langRow}>
            <Text>{l.idioma}</Text>
            <Text style={styles.entryDates}>{l.nivel}</Text>
          </View>
        )
      )}
    </View>
  );
}

function SeccionCertificaciones({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  if (cv.certifications.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles[tipoTitulo] as any}>Cursos y certificaciones</Text>
      {cv.certifications.map((c) =>
        claro ? (
          <Text key={c.id} style={styles.textoClaro}>
            {c.nombre} {c.anio ? `(${c.anio})` : ""}
          </Text>
        ) : (
          <View key={c.id} style={styles.entry} wrap={false}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryTitle}>{c.nombre || "Curso"}</Text>
              <Text style={styles.entryDates}>{c.anio}</Text>
            </View>
            {c.institucion ? <Text style={styles.entrySubtitle}>{c.institucion}</Text> : null}
          </View>
        )
      )}
    </View>
  );
}

function SeccionProyectos({ cv, styles, tipoTitulo }: { cv: CV; styles: S; tipoTitulo: keyof S }) {
  const proyectos = cv.projects ?? [];
  if (!proyectos.length) return null;
  return <View style={styles.section}>
    <Text style={styles[tipoTitulo] as any}>Proyectos</Text>
    {proyectos.map(p => <View key={p.id} style={styles.entry} wrap={false}>
      <Text style={styles.entryTitle}>{corregirTexto(p.nombre)}</Text>
      {p.herramientas ? <Text style={styles.entrySubtitle}>{corregirTexto(p.herramientas)}</Text> : null}
      {p.descripcion ? <Text style={styles.entryDescription}>{corregirTexto(p.descripcion)}</Text> : null}
      {p.enlace ? <Link src={p.enlace} style={styles.entryDates}>{p.enlace}</Link> : null}
    </View>)}
  </View>;
}

function SeccionHerramientas({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  const items = cv.techSkills ?? [];
  if (!items.length) return null;
  return <View style={styles.section} wrap={false}>
    <Text style={styles[tipoTitulo] as any}>Herramientas tecnológicas</Text>
    {claro ? items.map((s,i)=><Text key={i} style={styles.textoClaro}>{corregirTexto(s)}</Text>) : <View style={styles.chipsRow}>{items.map((s,i)=><Text key={i} style={styles.chip}>{corregirTexto(s)}</Text>)}</View>}
  </View>;
}

function SeccionReconocimientos({ cv, styles, tipoTitulo, claro }: { cv: CV; styles: S; tipoTitulo: keyof S; claro?: boolean }) {
  const items = cv.recognitions ?? [];
  if (!items.length) return null;
  return <View style={styles.section}>
    <Text style={styles[tipoTitulo] as any}>Reconocimientos</Text>
    {items.map(r=> <View key={r.id} style={styles.entry} wrap={false}>
      <View style={styles.entryHeaderRow}><Text style={styles.entryTitle}>{corregirTexto(r.nombre)}</Text><Text style={styles.entryDates}>{r.anio}</Text></View>
      {r.institucion ? <Text style={styles.entrySubtitle}>{r.institucion}</Text> : null}
      {r.detalle ? <Text style={styles.entryDescription}>{corregirTexto(r.detalle)}</Text> : null}
    </View>)}
  </View>;
}

function LayoutUnaColumna({
  cv,
  styles,
  bandaColor,
  tituloEstilo,
}: {
  cv: CV;
  styles: S;
  bandaColor?: boolean;
  tituloEstilo: keyof S;
}) {
  const d = cv.personalData;
  const nombreCompleto = `${d.nombres} ${d.apellidos}`.trim();
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={bandaColor ? styles.headerBand : styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {cv.fotoDataUrl ? <Image src={cv.fotoDataUrl} style={styles.foto} /> : null}
          <View>
            <Text style={bandaColor ? styles.nombreClaro : styles.nombre}>
              {nombreCompleto || "Nombre Apellido"}
            </Text>
            {d.puestoObjetivo ? (
              <Text style={bandaColor ? styles.puestoClaro : styles.puesto}>{d.puestoObjetivo}</Text>
            ) : null}
          </View>
        </View>
        <Contacto cv={cv} styles={styles} claro={bandaColor} />
      </View>

      <SeccionPerfil cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionExperiencia cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionEducacion cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionHabilidades cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionIdiomas cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionCertificaciones cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionProyectos cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionHerramientas cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
      <SeccionReconocimientos cv={cv} styles={styles} tipoTitulo={tituloEstilo} />
    </Page>
  );
}

function LayoutDosColumnas({ cv, styles }: { cv: CV; styles: S }) {
  const d = cv.personalData;
  const nombreCompleto = `${d.nombres} ${d.apellidos}`.trim();
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        {cv.fotoDataUrl ? <Image src={cv.fotoDataUrl} style={styles.foto} /> : null}
        <View>
          <Text style={styles.nombre}>{nombreCompleto || "Nombre Apellido"}</Text>
          {d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}
        </View>
      </View>
      <Contacto cv={cv} styles={styles} />

      <View style={styles.columnas}>
        <View style={styles.columna}>
          <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        </View>
        <View style={styles.columna}>
          <SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle" />
          <SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        </View>
      </View>
    </Page>
  );
}

function LayoutEjecutiva({ cv, styles }: { cv: CV; styles: S }) {
  const d = cv.personalData;
  const nombreCompleto = `${d.nombres} ${d.apellidos}`.trim();
  return (
    <Page size="A4" style={styles.pageSidebar} wrap>
      <View style={styles.sidebar}>
        {cv.fotoDataUrl ? <Image src={cv.fotoDataUrl} style={styles.fotoGrande} /> : null}
        <Text style={styles.nombreClaro}>{nombreCompleto || "Nombre Apellido"}</Text>
        {d.puestoObjetivo ? <Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text> : null}
        <Contacto cv={cv} styles={styles} claro />
        <SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro />
        <SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro />
        <SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro />
      </View>
      <View style={styles.sidebarMain}>
        <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        <SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        <SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        <SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        <SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle" />
        <SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
      </View>
    </Page>
  );
}

function LayoutCreativa({ cv, styles, acento }: { cv: CV; styles: S; acento: string }) {
  const d = cv.personalData;
  const nombreCompleto = `${d.nombres} ${d.apellidos}`.trim();
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        {cv.fotoDataUrl ? <Image src={cv.fotoDataUrl} style={styles.fotoGrande} /> : null}
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.nombre}>{nombreCompleto || "Nombre Apellido"}</Text>
          {d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}
          <Contacto cv={cv} styles={styles} />
        </View>
      </View>

      <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
      <SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitleChip" />
    </Page>
  );
}


function LayoutCorporateLine({ cv, styles }: { cv: CV; styles: S }) {
  const d = cv.personalData;
  const nombre = `${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={styles.page} wrap>
    <View style={{ borderBottomWidth: 2, borderBottomColor: styles.sectionTitle.color, paddingBottom: 12, marginBottom: 14 }}>
      <Text style={styles.nombre}>{nombre || "Nombre Apellido"}</Text>
      {d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}
      <Contacto cv={cv} styles={styles} />
    </View>
    <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle" />
    <SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle" />
    <SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle" />
    <View style={styles.columnas}><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View><View style={styles.columna}><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View></View>
    <SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
  </Page>;
}

function LayoutStructuredSplit({ cv, styles }: { cv: CV; styles: S }) {
  const d = cv.personalData;
  const nombre = `${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={styles.page} wrap>
    <View style={{ marginBottom: 12 }}><Text style={styles.nombre}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}<Contacto cv={cv} styles={styles} /></View>
    <View style={{ flexDirection: "row", gap: 18 }}>
      <View style={{ width: "31%", borderRightWidth: 1, borderRightColor: "#E2E0D9", paddingRight: 14 }}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View>
      <View style={{ width: "69%", paddingLeft: 2 }}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View>
    </View>
  </Page>;
}

function LayoutExecutiveTimeline({ cv, styles }: { cv: CV; styles: S }) {
  const d = cv.personalData;
  const nombre = `${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={styles.page} wrap>
    <View style={{ marginBottom: 12 }}><Text style={styles.nombre}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}<Contacto cv={cv} styles={styles} /></View>
    <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle" />
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      <View style={styles.rail}>
        {cv.experiences.map((e) => <Text key={e.id} style={styles.entryDates}>{formatFecha(e.fechaInicio, e.fechaFin, e.actual)}</Text>)}
        {cv.education.map((e) => <Text key={e.id} style={{ ...styles.entryDates, marginTop: 18 }}>{formatFecha(e.fechaInicio, e.fechaFin, e.actual)}</Text>)}
      </View>
      <View style={styles.railMain}><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View>
    </View>
    <View style={styles.columnas}><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View><View style={styles.columna}><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle" /></View></View>
    <SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle" /><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle" />
  </Page>;
}


function LayoutBasicClean({ cv, styles }: { cv: CV; styles: S }) {
  const d=cv.personalData; const nombre=`${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={{...styles.page,borderTopWidth:0,paddingTop:44}} wrap>
    <View style={{marginBottom:18}}><Text style={{...styles.nombre,fontSize:24}}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={{...styles.puesto,color:"#59636D",marginTop:4}}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>
    <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/>
  </Page>;
}

function LayoutCorporateBalance({ cv, styles }: { cv: CV; styles: S }) {
  const d=cv.personalData; const nombre=`${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={styles.page} wrap>
    <View style={{backgroundColor:"#F3F6F9",marginHorizontal:-42,marginTop:-36,padding:30,paddingHorizontal:42,marginBottom:16,borderBottomWidth:3,borderBottomColor:styles.sectionTitle.color}}><Text style={styles.nombre}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>
    <View style={{flexDirection:"row",gap:20}}><View style={{width:"35%",borderRightWidth:1,borderRightColor:"#DCE4EC",paddingRight:14}}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={{width:"65%"}}><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View>
  </Page>;
}

function LayoutModernBlocks({ cv, styles }: { cv: CV; styles: S }) {
  const d=cv.personalData; const nombre=`${d.nombres} ${d.apellidos}`.trim();
  const block={backgroundColor:"#F5F7FA",padding:11,borderRadius:6,marginBottom:10};
  return <Page size="A4" style={styles.page} wrap>
    <View style={{marginBottom:14}}><Text style={styles.nombre}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>
    <View style={block}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={block}><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View>
    <View style={{flexDirection:"row",gap:10}}><View style={{flex:1,...block}}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={{flex:1,...block}}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View>
    <View style={block}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View>
  </Page>;
}

function LayoutVerticalLine({ cv, styles, acento }: { cv: CV; styles: S; acento:string }) {
  const d=cv.personalData; const nombre=`${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={styles.page} wrap>
    <View style={{marginBottom:14}}><Text style={styles.nombre}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>
    <SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/>
    <View style={{marginTop:10,paddingLeft:18,borderLeftWidth:2,borderLeftColor:acento}}><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View>
    <View style={{flexDirection:"row",gap:20,marginTop:4}}><View style={{flex:1}}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={{flex:1}}><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View>
  </Page>;
}

function LayoutEditorialClean({ cv, styles, acento }: { cv: CV; styles: S; acento:string }) {
  const d=cv.personalData; const nombre=`${d.nombres} ${d.apellidos}`.trim();
  return <Page size="A4" style={{...styles.page,paddingTop:42}} wrap>
    <View style={{borderBottomWidth:2,borderBottomColor:acento,paddingBottom:14,marginBottom:18}}><Text style={{fontSize:27,fontFamily:"Helvetica-Bold",color:"#102A43",letterSpacing:-.2}}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={{fontSize:11,color:acento,marginTop:5}}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>
    <View style={{flexDirection:"row",gap:24}}><View style={{width:"22%"}}><Text style={{fontSize:8,fontFamily:"Helvetica-Bold",color:acento,letterSpacing:1.3,textTransform:"uppercase"}}>Contenido</Text><View style={{marginTop:10,borderLeftWidth:1,borderLeftColor:acento,paddingLeft:8}}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitleMinimal"/></View></View><View style={{width:"78%"}}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View>
  </Page>;
}

function LayoutPremiumVariant({ cv, styles, acento, tipo }: { cv: CV; styles: S; acento: string; tipo: string }) {
  const d = cv.personalData;
  const nombre = `${d.nombres} ${d.apellidos}`.trim();
  const foto = cv.fotoDataUrl;
  const header = (fotoStyle: any, fondo = false) => <View style={fondo ? styles.headerWide : { flexDirection: "row", alignItems: "center", marginBottom: 12 }}>{foto ? <Image src={foto} style={fotoStyle} /> : <View style={{ ...fotoStyle, backgroundColor: "#E5E7EB" }} />}{<View><Text style={fondo ? styles.nombreClaro : styles.nombre}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={fondo ? styles.puestoClaro : styles.puesto}>{d.puestoObjetivo}</Text> : null}{!fondo ? <Contacto cv={cv} styles={styles} /> : null}</View>}</View>;

  if (tipo === "executive-portrait") return <Page size="A4" style={styles.page} wrap>{header(styles.fotoGrande)}<SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "executive-frame") return <Page size="A4" style={styles.page} wrap>{header(styles.fotoCuadrada, true)}<Contacto cv={cv} styles={styles}/><View style={styles.columnas}><View style={styles.columna}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "corporate-side") return <Page size="A4" style={styles.pageSidebar} wrap><View style={styles.sidebar}>{foto ? <Image src={foto} style={styles.fotoVertical}/> : null}<Text style={styles.nombreClaro}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text> : null}<Contacto cv={cv} styles={styles} claro/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro/></View><View style={styles.sidebarMain}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></Page>;
  if (tipo === "leadership-banner") return <Page size="A4" style={styles.page} wrap>{header(styles.fotoGrande, true)}<View style={{ backgroundColor: styles.gridBox.backgroundColor, padding: 10, borderRadius: 5 }}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "editorial-executive") return <Page size="A4" style={styles.page} wrap><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1.5, borderBottomColor: acento, paddingBottom: 12, marginBottom: 16 }}><View style={{ flex: 1 }}><Text style={styles.editorialName}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}<Contacto cv={cv} styles={styles}/></View>{foto ? <Image src={foto} style={styles.fotoVertical}/> : null}</View><View style={{ flexDirection: "row", gap: 18 }}><View style={{ width: "30%" }}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={{ width: "70%" }}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "career-rail") return <Page size="A4" style={styles.page} wrap>{header(styles.fotoCuadrada)}<View style={{ flexDirection: "row" }}><View style={styles.rail}>{cv.experiences.map(e => <Text key={e.id} style={styles.entryDates}>{formatFecha(e.fechaInicio,e.fechaFin,e.actual)}</Text>)}</View><View style={styles.railMain}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><View style={styles.columnas}><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "prestige") return <Page size="A4" style={styles.page} wrap><View style={{ alignItems: "center", borderBottomWidth: 1.5, borderBottomColor: acento, paddingBottom: 12, marginBottom: 14 }}>{foto ? <Image src={foto} style={styles.fotoGrande}/> : null}<Text style={styles.editorialName}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text> : null}<Contacto cv={cv} styles={styles}/></View><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "asymmetric-editorial") return <Page size="A4" style={styles.page} wrap><View style={{ flexDirection:"row", gap:18, marginBottom:18 }}><View style={{width:"68%"}}><Text style={styles.editorialName}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View><View style={{width:"32%", alignItems:"flex-end"}}>{foto ? <Image src={foto} style={styles.fotoVertical}/> : null}</View></View><View style={{borderLeftWidth:4,borderLeftColor:acento,paddingLeft:12,marginBottom:12}}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></Page>;
  if (tipo === "photo-split") return <Page size="A4" style={styles.pageSidebar} wrap><View style={{width:"38%",backgroundColor:acento,padding:24}}>{foto ? <Image src={foto} style={{width:100,height:130,borderRadius:8,marginBottom:14}}/>:null}<Text style={styles.nombreClaro}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles} claro/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitleClaro" claro/></View><View style={{width:"62%",padding:28}}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></Page>;
  if (tipo === "dark-command") return <Page size="A4" style={styles.page} wrap><View style={{backgroundColor:"#101820",marginHorizontal:-42,marginTop:-36,padding:28,marginBottom:18,flexDirection:"row",alignItems:"center"}}>{foto?<Image src={foto} style={{width:76,height:76,borderRadius:38,marginRight:16}}/>:null}<View><Text style={{fontSize:25,fontFamily:"Helvetica-Bold",color:"#FFFFFF"}}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={{fontSize:11,color:"#D7E4F0",marginTop:4}}>{d.puestoObjetivo}</Text>:null}</View></View><Contacto cv={cv} styles={styles}/><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></Page>;
  if (tipo === "monogram-luxe") return <Page size="A4" style={styles.page} wrap><View style={{alignItems:"center",marginBottom:18}}>{foto?<Image src={foto} style={{width:82,height:82,borderRadius:41,marginBottom:10}}/>:null}<Text style={{fontSize:34,fontFamily:"Helvetica-Bold",color:acento,letterSpacing:2}}>{`${(d.nombres||"N")[0]}${(d.apellidos||"A")[0]}`.toUpperCase()}</Text><Text style={styles.editorialName}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={{borderTopWidth:1,borderTopColor:acento,paddingTop:10,marginTop:4}}><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></View></Page>;
  if (tipo === "diagonal-impact") return <Page size="A4" style={styles.page} wrap><View style={{marginHorizontal:-42,marginTop:-36,marginBottom:20,padding:30,backgroundColor:acento,transform:[{skewX:"-6deg"}]}}><View style={{transform:[{skewX:"6deg"}]}}><View style={{flexDirection:"row",alignItems:"center"}}>{foto?<Image src={foto} style={styles.fotoCuadrada}/>:null}<View><Text style={styles.nombreClaro}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text>:null}</View></View></View></View><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/><View style={styles.columnas}><View style={styles.columna}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/></View><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitleChip"/></View></View></Page>;
  if (tipo === "modular-portfolio") return <Page size="A4" style={styles.page} wrap><View style={{flexDirection:"row",gap:12,marginBottom:14}}><View style={{flex:1}}><Text style={styles.nombre}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}<Contacto cv={cv} styles={styles}/></View>{foto?<Image src={foto} style={styles.fotoCuadrada}/>:null}</View><View style={{flexDirection:"row",gap:10}}><View style={styles.gridBox}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.gridBox}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "signature-frame") return <Page size="A4" style={styles.page} wrap><View style={{borderWidth:1.5,borderColor:acento,padding:16,marginBottom:16}}><View style={{flexDirection:"row",alignItems:"center"}}>{foto?<Image src={foto} style={styles.fotoHorizontal}/>:null}<View><Text style={styles.nombre}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puesto}>{d.puestoObjetivo}</Text>:null}</View></View><Contacto cv={cv} styles={styles}/></View><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  if (tipo === "tech-grid") return <Page size="A4" style={styles.page} wrap><View style={{backgroundColor:acento,padding:16,borderRadius:6,marginBottom:14}}><View style={{flexDirection:"row",alignItems:"center"}}>{foto?<Image src={foto} style={styles.foto}/>:null}<View><Text style={styles.nombreClaro}>{nombre||"Nombre Apellido"}</Text>{d.puestoObjetivo?<Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text>:null}</View></View></View><View style={{flexDirection:"row",gap:10}}><View style={styles.gridBox}><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.gridBox}><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><View style={styles.columnas}><View style={styles.columna}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.columna}><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View></Page>;
  return <Page size="A4" style={styles.page} wrap><View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}><View style={{ flex: 1, backgroundColor: acento, padding: 12, borderRadius: 5 }}><Text style={styles.nombreClaro}>{nombre || "Nombre Apellido"}</Text>{d.puestoObjetivo ? <Text style={styles.puestoClaro}>{d.puestoObjetivo}</Text> : null}</View>{foto ? <Image src={foto} style={styles.fotoHorizontal}/> : null}</View><View style={styles.columnas}><View style={styles.gridBox}><SeccionPerfil cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHabilidades cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View><View style={styles.gridBox}><SeccionEducacion cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionIdiomas cv={cv} styles={styles} tipoTitulo="sectionTitle"/></View></View><SeccionExperiencia cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionCertificaciones cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionProyectos cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionHerramientas cv={cv} styles={styles} tipoTitulo="sectionTitle"/><SeccionReconocimientos cv={cv} styles={styles} tipoTitulo="sectionTitle"/></Page>;
}

export function CVDocument({ cv }: { cv: CV }) {
  const cvPreparado = prepararCV(cv);
  const plantilla = obtenerPlantilla(cvPreparado.template);
  const styles = buildStyles(plantilla.acento, plantilla.acentoSuave, cvPreparado);
  const nombreCompleto = `${cvPreparado.personalData.nombres} ${cvPreparado.personalData.apellidos}`.trim();
  const layout: LayoutId = plantilla.layout;
  // Standard y Free nunca pueden sacar una fotografía al PDF, incluso si existiera
  // un borrador antiguo que contuviera una imagen.
  const cvSeguro: CV = plantilla.admiteFoto ? cvPreparado : { ...cvPreparado, fotoDataUrl: null };

  return (
    <Document title={nombreCompleto || "Curriculum Vitae"}>
      {layout === "moderna" && <LayoutUnaColumna cv={cvSeguro} styles={styles} bandaColor tituloEstilo="sectionTitle" />}
      {layout === "clasica" && <LayoutUnaColumna cv={cvSeguro} styles={styles} tituloEstilo="sectionTitle" />}
      {layout === "basica-clean" && <LayoutBasicClean cv={cvSeguro} styles={styles} />}
      {layout === "corporate-balance" && <LayoutCorporateBalance cv={cvSeguro} styles={styles} />}
      {layout === "modern-blocks" && <LayoutModernBlocks cv={cvSeguro} styles={styles} />}
      {layout === "vertical-line" && <LayoutVerticalLine cv={cvSeguro} styles={styles} acento={plantilla.acento} />}
      {layout === "editorial-clean" && <LayoutEditorialClean cv={cvSeguro} styles={styles} acento={plantilla.acento} />}
      {layout === "minimalista" && <LayoutUnaColumna cv={cvSeguro} styles={styles} tituloEstilo="sectionTitleMinimal" />}
      {layout === "dos-columnas" && <LayoutDosColumnas cv={cvSeguro} styles={styles} />}
      {layout === "ejecutiva" && <LayoutEjecutiva cv={cvSeguro} styles={styles} />}
      {layout === "creativa" && <LayoutCreativa cv={cvSeguro} styles={styles} acento={plantilla.acento} />}
      {layout === "corporate-line" && <LayoutCorporateLine cv={cvSeguro} styles={styles} />}
      {layout === "structured-split" && <LayoutStructuredSplit cv={cvSeguro} styles={styles} />}
      {layout === "executive-timeline" && <LayoutExecutiveTimeline cv={cvSeguro} styles={styles} />}
      {["executive-portrait", "executive-frame", "corporate-side", "leadership-banner", "editorial-executive", "career-rail", "prestige", "modern-executive-grid", "asymmetric-editorial", "photo-split", "dark-command", "monogram-luxe", "diagonal-impact", "modular-portfolio", "signature-frame", "tech-grid"].includes(layout) && <LayoutPremiumVariant cv={cvSeguro} styles={styles} acento={plantilla.acento} tipo={layout} />}
    </Document>
  );
}
