# ONErpm | Apple Music Command Center MVP

Este es el MVP del Command Center de Apple Music para ONErpm, desarrollado con Next.js (App Router), Tailwind CSS y visualización de datos avanzada.

## Características
- **Artist Hub**: Panel principal con KPIs (Streams, Listeners, Shazams) y filtrado por tiempo.
- **Geo Map**: Distribución global de streams por país y ciudad.
- **Audience Overlap**: Análisis de afinidad de audiencia con otros artistas del sello.
- **Release Tracker**: Comparativa de curvas de crecimiento (Día 1-14) de los últimos lanzamientos.
- **Demo Breakdown**: Segmentación demográfica por Edad y Género.
- **Backend Seguro**: Generación de Developer Tokens de Apple Music (JWT ES256) realizado únicamente en el servidor.
- **Modo Fallback**: El sistema detecta automáticamente si las llaves de Apple están configuradas; de lo contrario, muestra Mock Data realista para demostraciones.

## Despliegue en Vercel

Para desplegar este proyecto directamente a Vercel, sigue estos pasos:

1. **Subir a GitHub**: Sube esta carpeta a un nuevo repositorio en tu cuenta de GitHub.
2. **Importar en Vercel**: Ve a [Vercel](https://vercel.com) e importa el repositorio.
3. **Configurar Variables de Entorno**:
   En la pestaña "Environment Variables" de tu proyecto en Vercel, agrega las siguientes:
   - `APPLE_KEY_ID`: Tu Key ID de Apple Music (ej. `U4FN7L3PL7`).
   - `APPLE_TEAM_ID`: Tu Team ID (ej. `293764`).
   - `APPLE_PRIVATE_KEY`: El contenido COMPLETO de tu archivo `.p8` (incluyendo los tags BEGIN y END PRIVATE KEY).

4. **Deploy**: Haz clic en "Deploy". Vercel instalará las dependencias y construirá el proyecto automáticamente.

## Desarrollo Local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el resultado.
