# Un jardín para Camila

Vue 3 + Vite: 58 girasoles crecen desde semillas hasta un jardín, con cuatro etapas, pausa, reinicio, audio opcional y soporte para movimiento reducido.

## Desarrollo

```sh
npm install
npm run dev
```

Abrir la dirección que muestra Vite. Esta versión necesita el servidor de desarrollo o una compilación; no se abre directamente el archivo HTML.

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

Las pruebas E2E usan Chrome instalado y arrancan Vite automáticamente. Si falta Chrome: `npx playwright install chrome`.

## DDD: contexto garden

```text
src/modules/garden/
  domain/          Garden: agregado con progreso, etapas e invariantes
  application/     GardenSession: sembrar, seleccionar, pausar, continuar
  infrastructure/  Canvas, reloj del navegador y Web Audio
  presentation/    componentes Vue, composable y textos
```

El dominio no importa Vue ni APIs del navegador. `Garden` controla el progreso y devuelve instantáneas de solo lectura. `GardenSession` coordina los casos de uso y la preferencia de movimiento reducido. `useGarden` conecta estos casos con la interfaz reactiva y los adaptadores; libera animaciones, observadores y audio al desmontarse.

El crecimiento dura 28 segundos de reproducción activa. Seleccionar una etapa la muestra en pausa; continuar retoma desde allí. El reloj se detiene al ocultar la pestaña sin acumular tiempo. Con movimiento reducido, sembrar o continuar muestra directamente el jardín completo.

El estado es efímero y solo existe un contexto: no hacen falta repositorios, backend, persistencia ni un almacén global. Los textos pertenecen a presentación; el dibujo y el audio, a infraestructura.

`tests/unit` verifica reglas y casos de uso. `tests/e2e` reproduce el fallo anterior de los capullos usando Canvas real y comprueba los controles, el crecimiento completo, escritorio, móvil, audio y movimiento reducido.

Google Fonts es opcional: existen fuentes locales de respaldo. El sonido solo se activa con su botón.
