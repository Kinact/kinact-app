# KINACT — Vías de continuidad

Estado actual: **prototipo funcional v0.1** (React + Vite, mock data, SPA con navegación por contexto). Build limpio: 338 kB (95 kB gzip). 10 vistas organizadas en 5 dominios (auth/facilitator/dashboards/clinical/family).

A continuación, cuatro vías de continuidad no excluyentes. Se pueden combinar o secuenciar según prioridad de negocio.

---

## Vía A — Producto / UX (pulido de demo vendible)

**Objetivo:** convertir el prototipo en una demo presentable a centros, familias y prescriptores clínicos.

**Esfuerzo estimado:** 2–3 semanas (1 persona).

**Pros**
- Máximo retorno en credibilidad con mínima inversión técnica.
- Permite abrir conversaciones comerciales sin backend.
- Los flujos clave (sesión + survey + resumen + portal familia) ya existen.

**Contras**
- No resuelve persistencia ni multiusuario — sigue siendo "teatro".
- El techo se alcanza rápido: tras el pulido hay que invertir en backend sí o sí.

**Próximos 3 pasos concretos**
1. **Empty states y microcopys**: cuando un residente no tiene historial, cuando la sesión no se ha iniciado, cuando faltan escalas. Hoy el Summary y los dashboards asumen datos.
2. **Responsive tablet-first**: la app se usará en tablet durante la sesión. Auditar breakpoints en SessionActive (grid del tablero), Survey (grid 2×2) y FamilyPortal.
3. **Onboarding guiado**: añadir un mini-tour en la primera ejecución por rol (auxiliar / familia / gestión) con 3–4 tooltips secuenciales.

---

## Vía B — Técnica / arquitectura (preparar para producción)

**Objetivo:** refactor estructural que habilite escalar sin reescribir.

**Esfuerzo estimado:** 3–4 semanas.

**Pros**
- Paga deuda antes de que duela: routing real, tipado, testing.
- Permite onboardar más gente sin que cada cambio rompa tres vistas.

**Contras**
- Inversión sin feature visible para el cliente.
- Riesgo de "refactor infinito" si no se acota.

**Próximos 3 pasos concretos**
1. **Router real (TanStack Router o React Router)**: sustituir el `switch` de App.jsx. Habilita deep-linking a dashboards de residente, URLs compartibles para familia, back/forward nativos.
2. **TypeScript + Zod**: migrar `mockData.js` a esquemas validados. El patrón `CAMPO_KEY_HIST` de Summary.jsx es síntoma de que falta un contrato de datos.
3. **Testing mínimo**: Vitest para utilidades (`formatters`, `calcTendencia`) + Playwright para un happy path (login → sesión → survey → resumen). 20 tests bien elegidos cubren el 80 %.

---

## Vía C — Backend / persistencia (de demo a piloto real)

**Objetivo:** datos reales, multiusuario, despliegue en 1–2 centros piloto.

**Esfuerzo estimado:** 6–10 semanas.

**Pros**
- Sin esto, KINACT no es un producto, es un pitch deck interactivo.
- Desbloquea validación clínica con datos longitudinales reales.

**Contras**
- Requiere decisiones irreversibles (stack, hosting, RGPD, historial clínico).
- LOPDGDD + Reglamento MDR si se posiciona como herramienta clínica → asesoría legal obligatoria.

**Próximos 3 pasos concretos**
1. **Stack mínimo viable**: Supabase (Postgres + Auth + Row-Level Security) o NestJS + Prisma + Postgres. El `AppContext` actual ya modela el dominio — portarlo a tablas es directo: `residents`, `sessions`, `evaluations`, `scale_scores`, `centers`, `users` (con rol).
2. **Capa de datos desacoplada**: hoy las vistas importan `MOCK_*` directamente. Introducir `src/api/` con funciones async (`getResidents()`, `saveEvaluation()`) y migrar vistas una a una. Los mocks siguen sirviendo en dev.
3. **Cumplimiento desde día 1**: cifrado en reposo, logs de acceso a historia clínica, consentimientos de familia explícitos, export de datos por residente (RGPD art. 20).

---

## Vía D — Validación de negocio / clínica

**Objetivo:** antes de invertir más en código, validar que el producto **resuelve un problema que alguien paga**.

**Esfuerzo estimado:** 4–6 semanas (en paralelo con A o B).

**Pros**
- Evita construir 6 meses algo que nadie compra.
- Datos de validación → palanca para ronda de financiación o subvención (CDTI, Horizon).
- Gratis comparado con desarrollo.

**Contras**
- Requiere perfil comercial/clínico que quizá no está en el equipo.
- Feedback puede forzar pivote doloroso.

**Próximos 3 pasos concretos**
1. **5 entrevistas con directoras de residencia** y 5 con terapeutas ocupacionales. Mostrar la demo (vía A), preguntar: ¿qué reemplaza? ¿cuánto pagarías por residente/mes? ¿qué te falta para usarlo mañana?
2. **Piloto gratuito de 8 semanas** en 1 centro con ≤10 residentes. Objetivo: medir adherencia (¿los auxiliares rellenan el survey?), no eficacia clínica aún.
3. **Dossier clínico preliminar**: revisión bibliográfica de escalas ya integradas (MEC, GDS, Barthel, TUG) y diseño de un estudio observacional prospectivo N=30 con un hospital universitario. Útil para financiación pública y para publicar.

---

## Recomendación de secuencia

Si hay que elegir una sola ruta, el orden recomendado es **D → A → C → B**:

1. **D** (4 semanas) valida que hay mercado → decide si seguir.
2. **A** (2–3 semanas) arma la demo para cerrar el piloto.
3. **C** (6–10 semanas) backend para el piloto real.
4. **B** (continuo) refactor técnico según crezca el producto.

Saltarse D es el error clásico: construir backend sofisticado para un producto que nadie ha validado.
