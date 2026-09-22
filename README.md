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
  domain/          Garden y GardenAge: crecimiento y edad por calendario
  application/     GardenSession y GardenHistory: reproducción y primera siembra
  infrastructure/  Canvas, reloj, Web Audio y repositorio local de la fecha
  presentation/    componentes Vue, composable y textos
```

El dominio no importa Vue ni APIs del navegador. `Garden` controla el progreso y devuelve instantáneas de solo lectura. `GardenSession` coordina los casos de uso y la preferencia de movimiento reducido. `useGarden` conecta estos casos con la interfaz reactiva y los adaptadores; libera animaciones, observadores y audio al desmontarse.

El crecimiento dura 28 segundos de reproducción activa. Seleccionar una etapa la muestra en pausa; continuar retoma desde allí. El reloj se detiene al ocultar la pestaña sin acumular tiempo. Con movimiento reducido, sembrar o continuar muestra directamente el jardín completo.

La reproducción es efímera. La fecha de la primera siembra se conserva mediante `LocalGardenHistoryRepository`, inyectado en `GardenHistory`. Los textos pertenecen a presentación; el dibujo, audio y almacenamiento, a infraestructura. No se necesita backend ni almacén global.

## Tiempo del jardín

El contador comienza al sembrar, reanudar por primera vez o mostrar el jardín completo. Muestra años, meses, días y horas, más minutos y segundos. Pausar o repetir la animación no reinicia la fecha; el tiempo transcurrido incluye los periodos con la página cerrada.

Se almacena una fecha ISO en `localStorage`, con la clave `camila.garden.first-planted-at.v1`. Se comparte entre pestañas del mismo origen, pero no entre dispositivos o navegadores. Borrar los datos del sitio borra esa fecha. Si el navegador bloquea el almacenamiento, funciona durante la visita actual.

`GardenAge` calcula años y meses reales de calendario en UTC, ajustando aniversarios al último día del mes cuando corresponde. La fecha visible se presenta en la zona horaria del visitante. El contador se actualiza cada segundo y al regresar a la pestaña. Sus pruebas cubren años bisiestos, fin de mes, recarga, pausa, reinicio y almacenamiento bloqueado.

`tests/unit` verifica reglas y casos de uso. `tests/e2e` reproduce el fallo anterior de los capullos usando Canvas real y comprueba los controles, el crecimiento completo, escritorio, móvil, audio y movimiento reducido.

Google Fonts es opcional: existen fuentes locales de respaldo. Se conservan Playfair Display y DM Sans, con una paleta botánica de verdes, ilustraciones SVG, colinas y mariposas en Canvas. La tarjeta final permite abrir y cerrar una nota para Camila.

## Música y ambiente

El reproductor interpreta una melodía original, «Donde floreces», a 72 BPM: notas suaves con armónicos, arpegios, reverberación estéreo, brisa y cantos de pájaros sintetizados. No descarga pistas ni necesita servicios externos. Solo se inicia con su botón; permite pausar y ajustar el volumen, y suspende el audio al ocultar la pestaña.

Las pruebas del reproductor comprueban la señal de audio real, la aparición de nuevas notas, el silencio a volumen cero y la pausa/reanudación del reloj de audio. También se verifican la nota desplegable y el control de volumen con teclado.
