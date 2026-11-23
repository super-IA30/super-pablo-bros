# Super Pablo Bros — Edición Cripto

**Homenaje original estilo platformer clásico:** el toro con superpoderes contra los osos ladrones. 10 niveles, cielo infinito, ladrillos, tuberías, bandera, monedas con valor en sats, armas de fuego y un final con tu foto. HTML5 Canvas + JavaScript puro: sin dependencias, sin internet y sin instalación.

## Cómo jugar

1. Abre la carpeta `juego-pipo`.
2. Haz doble clic en **`index.html`**. Se abre en Chrome, Edge, Firefox o Safari.
3. Presiona **Enter**.
4. Presiona **P** en cualquier momento para abrir el **panel de opciones en pausa**.

Funciona en PC, laptop y celular. En pantallas táctiles aparecen botones para mover, saltar, correr, `W×2`, SUPER, FUEGO, ARMA, OPCIÓN y TUBO.

## Controles

| Acción | Tecla |
|---|---|
| Mover | `←` `→` o `A` `D` |
| Saltar | `Espacio`, `W` o `↑` |
| **Doble `W` (turbo)** | Pulsa `W` dos veces seguidas: corres más rápido y saltas más alto |
| Correr | `Shift` |
| **Super salto al cielo** | `Q` (o `Z`) — infinito, sin barra de recarga |
| **Disparar** | `E` (o `F`) — fuego infinito, sin barra de recarga; mantén pulsado para disparar seguido |
| **Cambiar arma** | `C` (o `X`) |
| **Entrar en tubería** | `↓` (o `S`) estando sobre una tubería verde |
| **Opciones / pausa** | `P` (o `Esc`) |
| Navegar opciones | `←` `→` cambia de pestaña · `↑` `↓` cambia de opción · `Enter` modifica |
| Reiniciar nivel | `R` |
| Silenciar | `M` |

## Panel de opciones en pausa

Al pulsar `P` se abre un panel con cuatro pestañas. También se puede tocar directamente en la pantalla. Las opciones se guardan en el dispositivo.

- **JUEGO:** fuego infinito, super salto infinito, doble `W` turbo, imán de monedas, cielo infinito y monedas ocultas.
- **SONIDO:** música `CLÁSICA`, `ARCADE`, `ESPACIAL` o silenciada; efectos `RETRO`, `SUAVE` o `POTENTE`; tema distinto por nivel; volumen.
- **ECONOMÍA:** valor de cada moneda en satoshis (1.000 a 50.000) y precio **ficticio** del BTC en USD.
- **EXTRAS:** altcoins, fuegos artificiales, conversión actual y restaurar opciones.

## Monedas, satoshis y precio ficticio

- Cada moneda ₿ vale sats configurables (por defecto **10.000 sats**).
- El HUD muestra monedas, total de sats y valor estimado en USD.
- Al recoger una moneda aparece un texto con los sats ganados; el imán las atrae cuando saltas.
- El precio del BTC es **ficticio y ajustable** en Opciones. El juego **nunca usa internet**.
- Al terminar se muestra: total de sats, BTC equivalente (`sats / 100.000.000`), precio ficticio y valor estimado.

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
| **INFIERNO** | Niveles 8-10. Gran explosión que quema osos, destruye bloques y revela monedas ocultas. |

Cambia con `C`. Las tres primeras están siempre disponibles; el INFIERNO se desbloquea en los niveles 8-10.

## Reglas

- Eres un **toro**; los **osos** te roban hasta 3 BTC al tocarte, pero **no te matan**.
- Si pisas, electrocutas o quemas un oso, recuperas lo robado **más BTC extra**.
- Si caes a un hueco, reapareces en el último punto seguro **sin perder nada**.
- **No hay vidas ni game over: siempre avanzas y siempre ganas.**
- Cada nivel completado da **+1.000 monedas ₿** con sus sats correspondientes.
- Al bajar la bandera del nivel 10, todas las monedas vuelan entre **fuegos artificiales** a su billetera. Después aparece un bono de **1.000.000 sats**, tu foto y el resumen en sats, BTC y USD ficticio.

> La wallet (`bc1qdemo0pablo0bros0toro0x7h4k9m2v`), los precios, las billeteras y la transferencia final son **simulados**. No es dinero real ni se conecta a ninguna red.

## Archivos

- `index.html` — entrada del juego y controles táctiles.
- `style.css` — escalado responsive y botones táctiles.
- `game.js` — motor, opciones, generador infinito, física, armas, música, sats y render.
- `gracias.jpeg` — tu foto del final.
- `README.md` — este archivo.

Para cambiar la foto del final, reemplaza `gracias.jpeg` por otra imagen con ese mismo nombre.
