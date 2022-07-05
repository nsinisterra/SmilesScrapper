# Smiles Scrapper
El objetivo de este proyecto es simplificar la búsqueda de buenos vuelos en la web de Smiles.

Alguans veces, encontrar el mejor vuelo disponible puede ser tedioso y complejo, ya que el buscador de Smiles no permite flexibilizar las búsuqedas.

Para simplificar el acceso a la información, el bot tiene una integración con Telegram. Podés utilizar nuestro bot [@SmileSearcherBot](https://telegram.me/SmileSearcherBot), o levantar el tuyo propio.

## Features actuales
- Busqueda de vuelos en clase ejecutiva con fechas flexibles
- Busqueda de los "mejores vuelos" en fechas flexibles (Más rápidos, más económicos, menos paradas)
- Automatización de búsuqedas (Solo configurable desde el archivo interno, no disponible mediante comandos (Aún))

## Requerimientos
- NODE 16
- Cuenta de telegram

## Instalación
- Clonar el repositorio
- Ejecutar `npm ci`
- Ejecutar `cp .env.examplle .env`
- Crear un bot de telegram hablando con [@BotFather](https://t.me/botfather)
- Configurar la key de telegram en el archivo .env TELEGRAM_KEY
- Iniciar el bot `npm run start`

El bot puede enviar alertas cuando por alguna razón fallan las búsquedas, para eso debe configurarse el chat id a donde se quieren recibir dichas alertas.

Una vez iniciado el bot, puede enviarse el comando `/chatid` y configurar dicho número en el archivo .env (Bajo la key `TELEGRAM_CHAT_ID`).

## Arquitectura
En la creación del BOT se trató de separar el mismo en 3 partes básicas

### Browser
Para evitar problemas de incompatibillidad o un mal uso accidental de los sistemas de smiles, el sistema realiza una búsuqeda tradicional, como lo haría cualquier cliente.

Utilizando [Playwright](https://playwright.dev/), el bot ingresa al sitio, realiza la búsqueda y recopila los resultados.

### Bot
Centraliza creación de comandos, el envío de las notificaciones y la respuesta de los pedidos.

### Searcher
Centraliza lla búsuqeda de vuelos según los parámetros brindados.

## Reporte de errores 
Los PRs serán muy agradecidos, así como el reporte de errores o las sugerencias de mejoras.

Para una gestión organizada, utilizaremos las [incidencias de github](https://github.com/nsinisterra/SmilesScrapper/issues) para gestionarlos.
