# Super Pablo Bros — Edición Cripto

**Homenaje original estilo platformer clásico:** el toro con superpoderes contra los osos ladrones. Ahora son **50 niveles** repartidos en cinco tramos, con alas para volar, fuego y balas infinitas, bloques premio y ayudantes desbloqueables. HTML5 Canvas + JavaScript puro: sin dependencias, sin internet y sin instalación.

## Los 50 niveles

| Tramo | Niveles | Novedad |
|---|---|---|
| **Clásicos** | 1-10 | Ladrillos, tuberías, bandera, monedas ₿, osos ladrones y armas iniciales. |
| **Torre de Obras** | 11-19 | Plataformas en construcción, andamios y saltos más verticales. |
| **Torre de Piezas** | 20-29 | Piezas móviles, bloques especiales y más altcoins. |
| **Frente Estelar** | 30-39 | Cielo estelar, vuelo y recorridos largos por las alturas. |
| **Circuito Toro** | 40-50 | **Auto, salto, vuelo y monedas**: el tramo final con alas, fuego ∞ y lluvia de sats. |

## Cómo jugar

1. Abre la carpeta `juego-pipo`.
2. Haz doble clic en **`index.html`**. Se abre en Chrome, Edge, Firefox o Safari.
3. Presiona **Enter** para empezar.
4. Presiona **P** en cualquier momento para abrir el **panel de opciones en pausa**.

Funciona en PC, laptop y celular. En pantallas táctiles aparecen botones para mover, saltar, correr, `W×2`, SUPER, FUEGO, **ALAS**, ARMA, TUBO y OPCI. Desde Opciones puedes elegir la disposición de esos botones.

**Servidor local opcional:** si prefieres servirlo por HTTP, ejecuta `python -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000/`.

**Enlace público (solo para jugar):** https://super-ia30.github.io/super-pablo-bros/

## Controles

| Acción | Tecla | Botón táctil |
|---|---|---|
| Mover | `←` `→` o `A` `D` | `◀` `▶` |
| Saltar | `Espacio`, `W` o `↑` | `SALTO` |
| **Doble `W` (turbo)** | Pulsa `W` dos veces seguidas: corres más rápido y saltas más alto | `W×2` |
| Correr | `Shift` | `RUN` |
| **Super salto al cielo** | `Q` (o `Z`) — infinito, sin barra de recarga | `SUPER` |
| **Disparar** | `E` (o `F`) — fuego y balas infinitos; mantén pulsado para disparar seguido | `FUEGO` |
| **Alas / vuelo** | `V` — activa las alas y mantén pulsado para volar | `ALAS` |
| **Cambiar arma** | `C` (o `X`) | `ARMA` |
| **Entrar en tubería** | `↓` (o `S`) estando sobre una tubería verde | `↓` |
| **Opciones / pausa** | `P` (o `Esc`) | `OPCI` |
| Navegar opciones | `←` `→` cambia de pestaña · `↑` `↓` cambia de opción · `Enter` modifica | — |
| Reiniciar nivel | `R` | — |
| Silenciar | `M` | — |

## Nuevas mecánicas

- **Alas y vuelo:** con `V` o el botón `ALAS` el toro despliega las alas y vuela. Esencial en la Torre de Piezas, el Frente Estelar y el Circuito Toro.
- **Fuego y balas infinitas:** `E` dispara sin consumir munición; las balas **recogen monedas** al pasar por ellas. Hay opción de **fuego automático** en el panel.
- **Bloques premio:** los bloques marcados con **! @ * ^ +** sueltan premios: `!` balas, `@` ropa, `*` flor, `^` orejas y `+` alas.
- **Banderas grandes bicolor:** las banderas de meta son más grandes y llevan el símbolo ₿ en dos colores, fáciles de ver desde lejos.
- **Moneda grande final:** al bajar la bandera del **nivel 50** aparece una moneda ₿ gigante que absorbe todas las monedas entre fuegos artificiales, seguida de tu foto y el resumen final.
- **Ayudantes desbloqueables:** al avanzar por los tramos se desbloquean compañeros que te acompañan y ayudan con las monedas y el fuego.
- **Optimización y pausa automática:** el juego ajusta su renderizado para ir fluido y **se pausa al perder foco** la ventana o la pestaña.

## Panel de opciones en pausa

Al pulsar `P` se abre un panel con pestañas. También se puede tocar directamente en la pantalla. **Todas las opciones se guardan en `localStorage` de tu dispositivo.**

- **JUEGO:** fuego infinito, fuego automático, super salto infinito, doble `W` turbo, imán de monedas, cielo infinito y monedas ocultas.
- **SONIDO:** música `CLÁSICA`, `ARCADE`, `ESPACIAL` o silenciada; efectos `RETRO`, `SUAVE` o `POTENTE`; tema distinto por tramo; volumen.
- **ECONOMÍA:** valor de cada moneda en satoshis (1.000 a 50.000) y precio **ficticio** del BTC en USD.
- **EXTRAS:** altcoins, fuegos artificiales, conversión actual y restaurar opciones.
- **PANTALLA:** escalado `auto` (el de siempre), `pixel` (píxeles bien definidos), `suave` (interpolación), `ancho` (hasta 1400 px en escritorio) y `vertical` (cabe mejor en el móvil en vertical). También permite los modos táctiles `auto`, `izquierda`, `derecha` y `compacto`. El lienzo lógico sigue siendo **800×450, 16:9**.

## Monedas, satoshis y precio ficticio

- Cada moneda ₿ vale sats configurables (por defecto **10.000 sats**).
- El HUD muestra monedas, total de sats y valor estimado en USD.
- Al recoger una moneda aparece un texto con los sats ganados; el imán las atrae cuando saltas, y las balas también pueden recogerlas.
- El precio del BTC es **ficticio y ajustable** en Opciones. El juego **nunca usa internet**.
- Al terminar el nivel 50 se muestra: total de sats, BTC equivalente (`sats / 100.000.000`), precio ficticio y valor estimado.

## Cielo infinito y altcoins

- Desde el nivel 2, el cielo se genera mientras subes con plataformas, bloques y **BTC dorados** (valen 5 monedas).
- 8 altcoins salen de los bloques especiales: **ETH (Ξ), BNB (B), SOL (S), HYPE (H), DOGE (Ð), OP (O), USDT (T) y GRAM (G)**.
- BTC siempre aparece en todos los niveles, incluso en la bandera final (₿).
- Las billeteras de las 9 monedas se muestran en el HUD.

## Armas

| Arma | Descripción |
|---|---|
| **RAYO** | Disparo rápido de los cuernos. Rompe ladrillos. |
| **LLAMA** | Tres lenguas de fuego cortas. |
| **FUEGO** | Bola de fuego con arco. Rompe bloques de altcoin. |
| **INFIERNO** | Gran explosión que quema osos, destruye bloques y revela monedas ocultas. |

Cambia con `C`. Las tres primeras están siempre disponibles; el INFIERNO se desbloquea al avanzar en el juego.

## Reglas

- Eres un **toro**; los **osos** te roban hasta 3 BTC al tocarte, pero **no te matan**.
- Si pisas, electrocutas, quemas o alcanzas con tus alas a un oso, recuperas lo robado **más BTC extra**.
- Si caes a un hueco, reapareces en el último punto seguro **sin perder nada**.
- **No hay vidas ni game over: siempre avanzas y siempre ganas.**
- Cada nivel completado da **+1.000 monedas ₿** con sus sats correspondientes.
- Al bajar la bandera del nivel 50, la moneda grande final reúne todas las ganancias entre fuegos artificiales; después aparece un bono de **1.000.000 sats**, tu foto y el resumen en sats, BTC y USD ficticio.

> La wallet (`bc1qdemo0pablo0bros0toro0x7h4k9m2v`), los precios, los sats, las billeteras y la transferencia final son **simulados**. No es dinero real ni se conecta a ninguna red.

## Archivos

- `index.html` — entrada del juego, ayuda y controles táctiles.
- `style.css` — escalado responsive, modos de pantalla y botones táctiles.
- `levels.js` — definiciones de los 50 niveles y sus cinco tramos.
- `game.js` — motor, opciones, física, alas, armas, ayudantes, música, sats y render.
- `gracias.jpeg` — tu foto del final.
- `README.md` — documentación completa.
- `LEEME.txt` — resumen rápido para jugar.

Para cambiar la foto del final, reemplaza `gracias.jpeg` por otra imagen con ese mismo nombre.
