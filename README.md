# Grid Monitoring System

**Guía de Inicio Rápido**

---

## 📋 Descripción General

Grid Monitoring System es una aplicación web de monitoreo en tiempo real para microredes eléctricas. Permite visualizar el estado operativo de diferentes zonas de una red de distribución, detectar anomalías automáticas y analizar datos históricos.

### Características Principales
- ✅ **Monitoreo en tiempo real** de voltaje y demanda por zona
- ✅ **Sistema de alertas automático** (Nominal/Aviso/Peligro)
- ✅ **Control horario** para análisis históricos de 24 horas
- ✅ **Dashboard interactivo** con KPIs principales
- ✅ **Filtros avanzados** para búsqueda de datos
- ✅ **Información climática** en tiempo real (Open-Meteo)
- ✅ **Interfaz responsiva** para desktop, tablet y móvil

---

## 🚀 Requisitos e Instalación

### Requisitos Previos
- **Node.js** 16.0.0 o superior
- **npm** o **yarn**
- **Git** (para clonar el proyecto)

### Pasos de Instalación

1. **Clonar el proyecto**
   ```bash
   git clone https://github.com/DeloStormblessed/Grid-Monitoring-System
   cd Grid-Monitoring-System
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

### Otros comandos útiles
```bash
npm run build      # Construir para producción
npm run preview    # Previsualizar build de producción
npm run lint       # Ejecutar análisis de código
```

---

## 🛠️ Stack Tecnológico (Resumen)

| Herramienta | Versión | Propósito |
|-----------|---------|----------|
| React | 19.2.5 | Framework UI |
| Vite | 8.0.9 | Build tool y dev server |
| React Router DOM | 7.14.1 | Enrutamiento |
| Recharts | 3.8.1 | Gráficos interactivos |
| React Icons | 5.6.0 | Iconografía |
| CSS Modules | - | Estilos encapsulados |
| ESLint | 9.39.4 | Linting |

---

## 📖 Guía de Uso Rápida

### Flujo Principal del Usuario

#### 1. **Login** → `/login`
- Inicia sesión en la aplicación
- Acceso a todas las funciones de monitoreo

#### 2. **Dashboard** → `/dashboard`
- **KPIs principales**: Estado de zonas, demanda total, pérdidas, clima
- **Gráfico de tendencias**: Demanda en las últimas 24 horas
- **Selector de hora**: Muestra los datos de una hora específica
- **Tabla de alertas**: Zonas que requieren atención para la hora seleccionada

#### 3. **Zonas** → `/zonas`
- Vista de todas las zonas de la microred
- **Filtros disponibles**:
  - Tipo de zona (Residencial, Industrial, Comercial, Desocupada)
  - Estado de voltaje (Nominal, Aviso, Peligro)
  - Rango de demanda (slider)
  - Selector horario
- Navega a análisis detallado de cada zona

#### 4. **Análisis de Zona** → `/zonas/:id`
- Información detallada de una zona específica
- Gráficos de voltaje (3 fases) y demanda de la zona en cuestión
- Datos horarios en tabla

### Interpretación de Estados
```
🟢 NOMINAL  (0.96-1.04 p.u.)   → Operación normal
🟡 AVISO    (0.94-0.96 ó 1.04-1.06 p.u.) → Requiere monitoreo
🔴 PELIGRO  (<0.94 ó >1.06 p.u.)   → Atención inmediata
```
## Tiempos de desarrollo

20/04/2026
- Diseño Navbar y menú hamburguesa - 2 horas
- Creación Trend chart - 2 horas
- KPI cards y página Dashboard - 2 horas
- Conexión API y extracción json - 1 hora

21/04/2026
- Tabla de zonas - 1 hora
- Página AnálisisZona - 1 hora
- Cambio de distribución - 3 horas

22/04/2026
- Mejora responsive - 1 hora
- Implementación de global.css, mejora gráfica general - 3 horas
- Implementación gauge charts en AnalisisZona - 2 horas

23/04/2026
- Adición modo noche y mejora responsive - 1 hora
- Añadida página Zonas y añadido slider - 3 horas

24/04/2026
- Implementación login - 1 hora
- Añadido página error 404 y popup al inicio - 1 hora
- Añadido filtro en página Zonas - 1 hora
- Mejoras generales a la página - 2 horas
- Implementación tests - 1 hora
- Desarrollo documentación README.md y spec.md - 1 hora

Desarrollo total: 26 horas
## 🔜 Mejoras Futuras

- [ ] Integración con API backend real
- [ ] Autenticación y autorización completa
- [ ] Exportación de reportes (PDF/CSV)
- [ ] Adición de líneas y cargas de la microred
- [ ] Simulación con inclusión de PV, BESS o nuevas cargas

---

## 📧 Contacto y Soporte

Para preguntas, problemas o sugerencias, contacta con el equipo de desarrollo de Ironhack.

**Documentación técnica completa**: Consulta `SPEC.md` para detalles de arquitectura, componentes y modelos de datos.

---

**Última actualización**: Abril 2026
