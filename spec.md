# NO MODIFICAR EL ARCHIVO

# Resumen del Proyecto
**Grid Monitoring System** es una aplicación web avanzada diseñada para el monitoreo y análisis en tiempo real de microredes eléctricas, específicamente basada en el modelo de prueba IEEE de 13 nodos. La plataforma permite a los operadores de red visualizar el estado operativo de diferentes zonas (buses), detectar anomalías de voltaje de forma automática y realizar un seguimiento exhaustivo de la demanda energética y las pérdidas del sistema.

# Requisitos Técnicos
La aplicación está construida utilizando un stack moderno de tecnologías web para asegurar rendimiento y escalabilidad:
- **Framework Core:** React 19.2.5 (Vite 8.0.9).
- **Enrutamiento:** React Router DOM 7.14.1.
- **Visualización de Datos:** Recharts 3.8.1 para gráficos de tendencias y indicadores tipo Gauge.
- **Iconografía:** React Icons 5.6.0.
- **Estilos:** CSS Modules para encapsulamiento y Vanilla CSS con variables personalizadas para el sistema de diseño.
- **Testing:** Vitest con JSDOM y React Testing Library para pruebas unitarias y de componentes.
- **Linting:** ESLint 9.39.4.
- **Compatibilidad:** Node.js v16.0.0 o superior.

# Finalidad del Proyecto
El objetivo principal es proporcionar una interfaz de nivel industrial (tipo SCADA) que facilite la toma de decisiones críticas en la gestión de redes eléctricas:
1.  **Monitoreo Operativo:** Visualización instantánea de voltajes en p.u. (por unidad) y demanda en kW.
2.  **Detección de Anomalías:** Clasificación automática del estado de la red (Nominal, Aviso, Peligro) según rangos de voltaje predefinidos (0.94 - 1.06 p.u.).
3.  **Análisis Histórico:** Capacidad de navegar a través de datos de 24 horas mediante un selector horario interactivo.
4.  **Gestión de Zonas:** Clasificación y filtrado de buses por tipo de carga (Residencial, Industrial, Comercial).
5.  **Optimización:** Seguimiento de pérdidas totales del sistema y picos de demanda.

# Jerarquía de Carpetas
```text
Grid-Monitoring-System/
├── public/                 # Recursos estáticos públicos
├── src/
│   ├── __tests__/          # Pruebas unitarias y de integración
│   ├── assets/             # Imágenes y vectores (logos, backgrounds)
│   ├── components/         # Componentes UI reutilizables
│   │   ├── Chart/          # Gráficos (Trend, Gauge)
│   │   ├── HourSlider/     # Selector de tiempo 24h
│   │   ├── InfoCard/       # Tarjetas de KPI
│   │   ├── LoginForm/      # Formulario de acceso
│   │   ├── Navbar/         # Navegación principal
│   │   ├── WelcomeModal/   # Modal de bienvenida/intro
│   │   └── ZonesTable/     # Tablas de datos de zonas
│   ├── context/            # Gestión de estado global (ApiContext)
│   ├── hooks/              # Hooks personalizados para lógica de datos
│   ├── mocks/              # Datos de simulación (JSON)
│   ├── pages/              # Vistas principales (Dashboard, Zonas, Analisis)
│   ├── utils/              # Funciones auxiliares y utilidades de red
│   ├── App.jsx             # Punto de entrada de la aplicación y rutas
│   ├── global.css          # Sistema de diseño, tokens y estilos globales
│   ├── main.jsx            # Renderizado de React
│   └── setupTests.js       # Configuración del entorno de pruebas
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── spec.md                 # Especificaciones técnicas (este archivo)
```

# UI/UX Planteados
El diseño se centra en la legibilidad y la eficiencia operativa en entornos industriales:
-   **Estética SCADA Moderna:** Uso de una paleta de colores industrial con tonos Teal, Azul Oscuro y Grises Técnicos.
-   **Sistema de Temas:** Soporte nativo para modo claro y modo oscuro (Dark Mode) mediante variables CSS.
-   **Tipografía:** Uso de "Roboto" para transmitir un sentimiento técnico y limpio.
-   **Codificación de Colores Semántica:**
    -   🟢 **Nominal:** 0.96 - 1.04 p.u.
    -   🟡 **Aviso:** 0.94-0.96 / 1.04-1.06 p.u.
    -   🔴 **Peligro:** <0.94 / >1.06 p.u.
-   **Responsividad Inteligente:** Layout adaptable que bloquea el scroll en desktop para una experiencia de "Single Screen Dashboard" y permite scroll vertical en dispositivos móviles.
-   **Micro-interacciones:** Feedback visual en hovers, transiciones suaves de estado y componentes interactivos para mejorar el engagement del usuario.
