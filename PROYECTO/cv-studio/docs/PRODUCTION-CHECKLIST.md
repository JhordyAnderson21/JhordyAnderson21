# Checklist antes de producción

- [ ] `npm install` sin errores.
- [ ] `npm run build` sin errores.
- [ ] Migrar `.data` a una base de datos persistente.
- [ ] Migrar comprobantes a almacenamiento persistente privado.
- [ ] Verificar límites de tamaño y tipo de archivos en producción.
- [ ] Configurar HTTPS.
- [ ] Revisar política de privacidad y tratamiento de datos.
- [ ] Probar Free, Standard y Premium desde cero.
- [ ] Probar downgrade Premium → Standard y Standard → Free.
- [ ] Probar foto Premium en todas las arquitecturas Premium.
- [ ] Probar PDF de 1 página y de 2 páginas.
- [ ] Probar contenido muy corto y muy largo.
- [ ] Probar móvil 320 px, 375 px, 430 px y desktop.
- [ ] Probar subida de comprobante de 5 minutos.
- [ ] Revisar manualmente cada plantilla antes de venderla.
- [ ] Sustituir el desbloqueo automático de demostración por verificación real del pago.
