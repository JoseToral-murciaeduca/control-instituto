# 🎓 Control Instituto - Plataforma de Gestión Estudiantil

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Control Instituto** es una aplicación web estática, instalable (PWA) y 100% *Serverless* diseñada para centralizar y gamificar la vida del estudiante. Permite gestionar horarios altamente personalizables, tareas, calificaciones calculadas en tiempo real y cuenta con un motor de repasos y exámenes dinámicos integrados.

---

## ✨ Características Principales

- 📱 **Diseño Responsive y App Instalable (PWA):** Úsala en PC, Tablet o Móvil. Funciona sin conexión a internet (Offline Mode).
- 🤖 **Onboarding Inteligente:** Generación de banners de fondo mediante Inteligencia Artificial (Pollinations AI) y geolocalización basada en tu centro de estudios.
- 📅 **Horario Dinámico:** Configura tus propios tramos horarios y descansos/recreos sin restricciones.
- 🎯 **Calculadora de Calificaciones:** Algoritmo que te dice exactamente qué nota necesitas sacar en el examen final para llegar a tu objetivo.
- 🎮 **Motor de Tests Interactivos:** Crea preguntas (Test, Rellenar, V/F), evalúate con el sistema de penalización (2 mal restan 1 bien) y recibe feedback visual al instante con efectos de dopamina (confeti, animaciones).

---

## 🚀 Instalación y Despliegue Local

Al ser una aplicación basada puramente en el cliente (Frontend), no necesitas instalar bases de datos ni Node.js. 

Para clonar y probar el proyecto en tu máquina local, abre tu terminal y ejecuta los siguientes comandos:

```bash
# 1. Clona el repositorio en tu equipo local
git clone [https://github.com/josetoral-murciaeduca/control-instituto.git](https://github.com/josetoral-murciaeduca/control-instituto.git)

# 2. Entra en el directorio del proyecto
cd control-instituto

# 3. (Opcional) Levanta un servidor local rápido para probar la PWA
# Si tienes Node instalado, puedes usar npx:
npx http-server -p 8080

Abre http://localhost:8080 en tu navegador para ver la aplicación funcionando. También puedes subir los archivos directamente a GitHub Pages para tenerla alojada gratis.
````
📖 Instrucciones de Uso (Guía de Inicio Rápido)
Para que la aplicación funcione a la perfección y genere todas las métricas, es importante seguir este orden la primera vez que entres:

1️⃣ Registro y Bienvenida
Al abrir la aplicación por primera vez, saltará el modal de bienvenida.

Introduce tu Nombre.

Añade tu Centro de Estudios (Ej: IES Alfonso X El Sabio).

Introduce tu Localidad (puedes usar el botón de la diana 🎯 para que la API de OpenStreetMap detecte tu ubicación automáticamente).
Nota: Con estos datos, la aplicación generará un entorno visual adaptado a ti.

2️⃣ Ajustar el Horario (¡Muy importante!)
Antes de crear asignaturas, ve a la sección Mi Horario.

Pulsa en el botón "⚙️ Ajustar Horas".

Borra o añade las franjas horarias exactas de tu turno (Ej: de 15:20 a 16:15).

Configura dónde van tus Recreos/Descansos.

Guarda la configuración.

3️⃣ Agregar las Asignaturas
Dirígete a la sección Asignaturas.

Añade el nombre, profesor y colores personalizados para el fondo y el texto.

Puedes incluir enlaces rápidos a Meet/Zoom y a la plataforma virtual (Moodle/Classroom).

Asigna la asignatura a los días y horas que configuraste en el paso anterior. (El horario general se dibujará solo).

4️⃣ Configurar las Calificaciones (Opcional)
En la sección Calificaciones, puedes ir añadiendo los exámenes que vayas haciendo.

Indica el peso del examen (%).

Usa la Calculadora Objetivo incorporada en cada tarjeta para proyectar cuánto necesitas en el trabajo final para aprobar o sacar nota.

🔒 Privacidad, Seguridad y Aviso Legal
Tu privacidad está garantizada por diseño.

Esta aplicación NO guarda datos de ningún tipo en servidores externos ni bases de datos en la nube. Toda la información que introduces (perfil, notas, tareas, tests, horarios) se almacena de forma estricta y exclusiva en el Almacenamiento Local (localStorage) de tu propio navegador web.

⚠️ ADVERTENCIA DE SEGURIDAD Y PÉRDIDA DE DATOS:
Debido a esta arquitectura orientada a la privacidad, si borras la caché de tu navegador, formateas el equipo o usas el modo incógnito, perderás toda tu información.

Para evitarlo, la aplicación incluye una herramienta de copias de seguridad:

Ve a la sección Ajustes / Datos.

Pulsa en "Descargar Backup" regularmente para generar un archivo .json cifrado con tu progreso.

Puedes usar "Subir Archivo (.json)" en cualquier otro equipo o navegador para restaurar tu sesión exactamente donde la dejaste.

El usuario es el único responsable de la gestión, resguardo (backup) y protección de los datos introducidos en la aplicación.

👨‍💻 Créditos y Licencia
Desarrollado y diseñado para facilitar la gestión académica en ciclos formativos y estudios superiores.

Copyright © 2026 @josetoral-murciaeduca. Todos los derechos reservados.

Se concede permiso para descargar, instalar y utilizar este software para fines educativos y personales. Prohibida su comercialización sin consentimiento del autor.
