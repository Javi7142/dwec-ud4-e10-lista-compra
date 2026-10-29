# E10 · Lista de la compra (integrador)

**Tipo:** corrección por IA

Programa una lista de la compra que funciona en una sola página: se guarda en el navegador, se sincroniza entre pestañas, se comparte por un enlace, pide confirmación con diálogos y muestra los textos con el formato del español. Junta todo lo visto en la unidad, con módulos documentados y probados.

**CE:** RA3 a, b, c, d, e, f, g, h

## Entorno de trabajo

Este ejercicio trae su Dev Container en `.devcontainer/`. Como los ejercicios de la UD2 con dependencias de npm, **construye su imagen** con el `Dockerfile` de esa carpeta, a partir de la imagen oficial de Node.js de **Docker Hub**, `node:24-bookworm` (UD2, tema 9, apartado 9.3.2). Abre en VS Code **la carpeta del ejercicio**, la que contiene `.devcontainer/` (no una carpeta superior, como la del repositorio del curso: VS Code solo busca el Dev Container en la carpeta que abres), y ejecuta **Dev Containers: Reopen in Container**. Si VS Code te ofrece crear una configuración nueva, es que has abierto otra carpeta. La primera vez tarda algo más, porque descarga la imagen y la construye. Al crearse, el contenedor ejecuta `npm install`: cuando se abre, las dependencias ya están instaladas.

La página usa módulos, así que necesita un servidor: no la abras con doble clic. Al abrir el contenedor, VS Code arranca solo el servidor de la página (`serve`, en el puerto 3410) y abre <http://localhost:3410> en el navegador de tu equipo. Si no se abre, búscala en el panel **Puertos** de VS Code: la columna **Dirección reenviada** da la dirección exacta (si el 3410 de tu equipo ya está ocupado, VS Code usa otro número). Si paras el servidor, vuelve a lanzarlo en la terminal del contenedor con `npx --yes serve@14.2.6 --listen 3410 .`.

Ejecuta los tests, ESLint y Prettier en la terminal de VS Code, que ya es la del contenedor.

## Punto de partida

```text
├── package.json          ← scripts test, lint, format y format:check
├── index.html            ← la página: formulario, lista, botones, <dialog> y zona de avisos (no hace falta cambiarla)
├── estilos.css           ← tema claro y oscuro con variables CSS, clase comprado
├── src/
│   ├── lista.js          ← seis funciones puras, sin programar
│   ├── almacen.js        ← cargar y guardar, sin programar
│   ├── vista.js          ← cuatro funciones puras, sin programar
│   ├── compartir.js      ← dos funciones puras, sin programar
│   ├── sincronizar.js    ← vacío
│   ├── dialogos.js       ← vacío
│   └── main.js           ← vacío
├── tests/
│   ├── AlmacenFalso.js   ← doble de prueba de localStorage
│   └── lista.test.js     ← un primer test
└── README.md             ← plantilla de entrega
```

No hay `npm start`: es una página web, y el Dev Container la sirve en el puerto 3410.

## Requisitos

**Módulos puros** (sin DOM; los que dependen de la fecha o del almacenamiento los reciben como parámetros con valor por defecto):

1. **`lista.js`**: según su JSDoc y el contrato. Ninguna función modifica la lista recibida. Las comparaciones de nombres y la ordenación usan `Intl.Collator` en español (sin distinguir mayúsculas ni tildes); `resumen` elige singular o plural con `Intl.PluralRules`.
2. **`almacen.js`**: guarda `{ version: 1, articulos }` como JSON en la clave `lista-compra`. Al cargar, convierte las fechas en `Date`, descarta los artículos con datos incorrectos y devuelve `[]` si no hay nada, el JSON está roto o es de otra versión. `guardar` devuelve `false` si falla.
3. **`vista.js`**: `escaparHTML`, `haceCuanto` (con `Intl.RelativeTimeFormat`), `htmlLista` (un `<li data-id>` por artículo con la casilla `.marcar`, el nombre **escapado**, la cantidad, cuándo se añadió y el botón `.quitar`) y `tituloPestana`.
4. **`compartir.js`**: `enlaceCompartir` construye con `URL` el enlace con los artículos **pendientes** en el parámetro `compartir` (`nombre*cantidad`, separados por comas); `leerCompartidos` lo interpreta con `URLSearchParams`.

**Módulos de la página**:

5. **`dialogos.js`**: `confirmar(pregunta, alResponder)` con el `<dialog>` de la página, y `avisar(texto, duracion = 3000)` en la zona de avisos.
6. **`sincronizar.js`**: `avisarCambio()` y `escucharCambios(alCambiar)` con un `BroadcastChannel` llamado `lista-compra` y, si no existe, el evento `storage`.
7. **`main.js`**:
   - Carga la lista y la pinta con **una sola** asignación a `innerHTML`, ordenada; actualiza el resumen y el **título de la pestaña**.
   - Cada cambio: actualiza el estado, lo guarda (avisando si no se puede), avisa a las otras pestañas y repinta.
   - El formulario añade (con `preventDefault`); los errores de `anadir` se muestran como aviso.
   - **Un solo oyente** en la lista para las casillas y los botones de quitar. Quitar pide confirmación. «Quitar los comprados» pide confirmación indicando cuántos son.
   - «Copiar enlace para compartir» copia el enlace con `navigator.clipboard` (detectando la capacidad) o lo muestra en un aviso.
   - Si la URL trae `?compartir=…`, añade esos artículos, lo avisa y limpia la URL con `history.replaceState` (para que recargar no los añada otra vez).
   - Cuando otra pestaña cambia la lista, la vuelve a cargar y repintar.
   - Tema claro u oscuro según el sistema, con botón para cambiarlo (con `data-tema`).
   - Los textos «hace X minutos» se actualizan cada minuto.
   - Ningún `alert`, `confirm` ni `prompt`.

> 📝 **Nota del Profesor**: El oyente único de la lista es una **delegación de eventos** (UD6), como en el E08. Aquí cada `<li>` tiene dos elementos que se pueden pulsar, así que busca primero el artículo y después mira qué se ha pulsado:
>
> ```js
> lista.addEventListener('click', (evento) => {
>   const id = evento.target.closest('li')?.dataset.id; // el artículo donde se ha pulsado
>   if (!id) return;
>   if (evento.target.matches('.marcar')) { /* … */ }
>   if (evento.target.matches('.quitar')) { /* … */ }
> });
> ```

**Pruebas y documentación**:

8. Un fichero de tests por módulo puro, con casos normales, límite y erróneos: que no se modifica la lista recibida, la fusión de nombres con tildes y mayúsculas, el máximo de 99, cantidades no válidas, singular y plural, ida y vuelta de `guardar` y `cargar` con fechas, JSON roto y otra versión, artículos incorrectos descartados, nombre con etiquetas escapado, ida y vuelta del enlace compartido. Al menos un test con `vi.useFakeTimers`/`vi.setSystemTime` y uno con `vi.fn()`, deshaciendo los mocks.
9. JSDoc con `@module` en cada fichero, `@typedef` para `Articulo` y qué guarda cada módulo y con qué clave.
10. `npm test`, `npm run lint` y `npm run format:check` sin errores.
11. Completa el `README.md` y haz commits frecuentes (al menos uno por módulo y sus tests).

## Contrato de entrega

| Función | Contrato |
|---------|----------|
| `anadir(articulos, nombre, cantidad = 1, ahora = new Date())` | Nuevo artículo `{ id, nombre, cantidad, comprado: false, creado: ahora }` con el nombre sin espacios. Si ya existe (sin distinguir mayúsculas ni tildes: `Café` = `CAFE`), suma la cantidad (máximo 99) y lo deja pendiente. `Error('El nombre no puede estar vacío')`; `RangeError('Cantidad no válida: …')` si no es un entero entre 1 y 99 |
| `alternarComprado(articulos, id)`, `quitar(articulos, id)`, `quitarComprados(articulos)` | Listas nuevas |
| `ordenar(articulos)` | Pendientes primero; dentro de cada grupo, por nombre en español |
| `resumen(articulos)` | `'La lista está vacía'`, `'1 artículo · 0 comprados'`, `'2 artículos · 1 comprado'` |
| `cargar(almacen)` / `guardar(articulos, almacen)` | Clave `lista-compra`, JSON `{ version: 1, articulos }`, fechas como `Date` al cargar |
| `escaparHTML(texto)` | Escapa `& < > " '` |
| `haceCuanto(fecha, ahora = new Date())` | `'ahora'` (menos de un minuto), `'hace 5 minutos'`, `'hace 2 horas'`, `'ayer'` |
| `htmlLista(articulos, ahora)` | Un `<li data-id="…">` por artículo, con clase `comprado` si lo está, la casilla `.marcar` (marcada si está comprado) y el botón `.quitar` |
| `tituloPestana(articulos)` | `'(2) Lista de la compra'` con dos pendientes; `'✅ Lista de la compra'` sin pendientes |
| `enlaceCompartir(base, articulos)` / `leerCompartidos(busqueda)` | `?compartir=Caf%C3%A9+%26+t%C3%A9*2` para «Café & té» × 2 pendiente. `leerCompartidos('?compartir=pan,leche*3,,agua*0')` → `[{ nombre: 'pan', cantidad: 1 }, { nombre: 'leche', cantidad: 3 }]` |
| `confirmar`, `avisar` (`dialogos.js`); `avisarCambio`, `escucharCambios` (`sincronizar.js`) | Como en los requisitos 5 y 6 |
| Secciones del README | `## Cómo ejecutarlo`, `## Módulos`, `## Objetos predefinidos`, `## Qué se guarda y dónde`, `## Varias pestañas`, `## Seguridad`, `## Pruebas`, `## Depuración`, `## Herramientas` |
| Integración continua | **Opcional**: `.github/workflows/ci.yml`, `package-lock.json` y la sección `## Integración continua (opcional)` del README. No se corrige |

## Criterios de evaluación

- ✅ Objetos nativos (`Intl`, `Date`, `JSON`, `String`) bien elegidos
- ✅ `location`, `history`, `URL` y `URLSearchParams` para compartir la lista
- ✅ Título de la pestaña y tema cambiados desde el código
- ✅ HTML generado de forma segura y eficiente
- ✅ Diálogos y avisos en lugar de los diálogos del navegador
- ✅ Pestañas sincronizadas
- ✅ Almacenamiento con versión y lectura tolerante a errores
- ✅ Tests con dobles de prueba y mocks
- ✅ JSDoc, sesión de depuración, ESLint y Prettier
- ✅ Historial de commits progresivo y con mensajes descriptivos

## Integración continua (opcional)

> 📝 Este apartado es **opcional** y no cuenta para la corrección. Hazlo si en clase habéis visto GitHub Actions; si no, sáltatelo.

Tu repositorio de la tarea ya está en GitHub. Escribe un *workflow* de GitHub Actions que pase **todas las comprobaciones del proyecto** cada vez que subas cambios. Es como el de la UD2, con una mejora: las dependencias se instalan con **`npm ci`** a partir de `package-lock.json`, el fichero que anota la versión exacta de cada paquete instalado. Así la integración continua usa las mismas versiones que tu contenedor, y con la caché de npm la instalación es más rápida. Escríbelo tú, en `.github/workflows/ci.yml`, con estas orientaciones:

- Se ejecuta con cada `push` y cada *pull request* a la rama `main`.
- Tiene un único trabajo (*job*) que se ejecuta en `ubuntu-latest`.
- Sus pasos, en este orden, cada uno con un nombre (`name`) en español que diga qué hace:
  1. Descargar el código, con la acción `actions/checkout@v7`.
  2. Instalar Node.js 24 con la caché de npm, con la acción `actions/setup-node@v7`, `node-version: 24` y `cache: npm`.
  3. Instalar las dependencias con `npm ci`.
  4. Revisar el código con ESLint: `npm run lint`.
  5. Comprobar el formato con Prettier: `npm run format:check`.
  6. Ejecutar los tests: `npm test`.
- Sube también `package-lock.json`: lo creó `npm install` al abrir el contenedor. Sin él, `npm ci` falla. Si añades o actualizas una dependencia, vuelve a subirlo.
- Prettier también revisa el formato de `ci.yml`: ejecuta `npm run format` antes de subirlo.

Compruébalo:

1. Sube los cambios y abre la pestaña **Actions** del repositorio: la ejecución debe salir en verde, con los seis pasos.
2. Rompe algo a propósito (por ejemplo, cambia el máximo esperado en el test de las 99 unidades), sube el cambio y comprueba que la ejecución sale en rojo en el paso que corresponde. Después, deshaz el cambio y comprueba que vuelve a verde.

Deja constancia en la sección «Integración continua (opcional)» del `README.md`: el enlace a la ejecución en verde y dos capturas en `img/`, una de la ejecución en verde con sus pasos y otra de la ejecución en rojo con el paso que falla.

## Al terminar

Cuando acabes la práctica, **borra su contenedor**. Si no, sigue en marcha ocupando memoria, y se acumula uno por cada ejercicio (UD1, tema 5, apartado 5.4.7). Tu trabajo no se borra: está en la carpeta del ejercicio.

1. Cierra la ventana de VS Code del ejercicio.
2. En una terminal de tu equipo (en Windows, PowerShell), borra todos los contenedores de Dev Containers. La orden solo toca los que ha creado VS Code, no otros contenedores que tengas:

   ```bash
   docker rm -f $(docker ps -aq --filter label=devcontainer.local_folder)
   ```

   Si no queda ninguno, Docker avisa de que le falta un argumento: puedes ignorarlo. También puedes borrarlos desde Docker Desktop, en la pestaña **Containers**.

La imagen que ha construido el `Dockerfile` tampoco se borra (se llama `vsc-` seguido del nombre de la carpeta), así que la próxima vez no hace falta construirla de nuevo. Si necesitas espacio, bórrala desde la pestaña **Images** de Docker Desktop o con `docker image rm <nombre>`.
