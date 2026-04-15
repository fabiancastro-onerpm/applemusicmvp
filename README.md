# Apple Music Intelligence Hub (MVP)

Herramienta profesional de análisis de datos para artistas y tracks con alta granularidad, diseñada específicamente para múltiples stakeholders dentro de la industria musical (A&R, Project Managers, Marketing y Data Analysts).

Este MVP permite una visualización profunda de métricas en tiempo real directamente desde la API de Apple Music Analytics, facilitando la toma de decisiones estratégicas basadas en el comportamiento real de la audiencia.

## 🚀 Beneficios Clave

- **Granularidad Extrema**: Visualización de streams por ciudad, dispositivo, formato de audio y tipo de suscripción.
- **Audience Affinity (Overlap)**: Identificación de solapamiento de audiencia entre artistas para detectar oportunidades de colaboración.
- **A&R Insights con IA**: Generación de recomendaciones accionables utilizando Gemini AI (Flash 2.5) para interpretar los datos de afinidad.
- **Playlist Journey**: Seguimiento detallado del impacto de las playlists en el consumo del artista con sistema de recuperación profunda de metadatos.
- **Interfaz Premium**: Dashboard centralizado con navegación intuitiva y visualizaciones dinámicas.

## 🛠 Configuración Técnica

Para ejecutar este proyecto localmente, asegúrate de configurar las siguientes variables de entorno en un archivo `.env.local`:

```env
# Apple Music API Credentials
APPLE_KEY_ID=tu_key_id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_llave_privada\n-----END PRIVATE KEY-----"
APPLE_UUID=tu_issuer_id
APPLE_CONTENT_PROVIDER_ID=tu_provider_id

# Gemini AI (For A&R Insights)
GEMINI_API_KEY=tu_gemini_api_key
```

## 📦 Instalación y Uso

1. Instalar dependencias: `npm install`
2. Iniciar servidor de desarrollo: `npm run dev`
3. Abrir en el navegador: `http://localhost:3000`

---
*Desarrollado para ONErpm por el equipo de Advanced Analytics.*
