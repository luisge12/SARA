# Documentación y Resumen Integral del Sistema SARA
**Sistema Administrativo y de Registro Automatizado de Pacientes**

---

## 1. Visión General del Proyecto

**SARA** es una plataforma web médica y administrativa integral desarrollada para digitalizar, optimizar y automatizar los procesos de centros de salud, clínicas y consultorios médicos. Combina un entorno de gestión administrativa para el personal, una estación de trabajo clínica para médicos, un módulo financiero para caja, herramientas estadísticas avanzadas, un portal interactivo para pacientes y asistencia inteligente mediante IA.

### 🌟 Pilares y Capacidades Principales
1. **Control de Acceso Basado en Roles (RBAC):** Autenticación segura mediante JSON Web Tokens (JWT) y separación estricta de permisos para roles (`ADMINISTRADOR`, `MEDICO`, `RECEPCIONISTA`, `MASTER`).
2. **Ficha Médica y Gestión de Pacientes:** Registro demográfico, búsqueda por documento de identidad, control de antecedentes y asignación de médicos tratantes.
3. **Historia Clínica Electrónica (HCE):** Registro de signos vitales, cálculo automático de IMC, examen físico, diagnósticos CIE, evolución médica, emisión de recetas terapéuticas y bitácora de auditoría médica.
4. **Caja y Facturación:** Control de cobros de consultas y procedimientos, soporte multimoneda (USD / Bolívares), arqueo de caja y balances.
5. **Estadísticas y Análisis:** Visualización de métricas de rendimiento, distribución de diagnósticos más frecuentes, volumen de pacientes e ingresos.
6. **Portal del Paciente:** Entorno web exclusivo para pacientes con autenticación por cédula, consulta de próximas citas, acceso a historias clínicas publicadas y recetas.
7. **SARA AI:** Asistente conversacional con Inteligencia Artificial integrado para apoyo en consultas médicas y orientación clínica.
8. **Arquitectura Reactiva y Soporte Offline:** Comunicación bidireccional en tiempo real con WebSockets (`Socket.io`) y persistencia local mediante IndexedDB (`Dexie.js`).

---

## 2. Arquitectura Tecnológica

* **Frontend:** React 18, Vite, React Router DOM, Axios, Lucide React, Chart.js, Dexie.js (IndexedDB).
* **Backend:** Node.js, Express, Socket.io (WebSockets), JSON Web Token (JWT), Bcrypt, dotenv, CORS.
* **Base de Datos:** PostgreSQL con consultas relacionales optimizadas y scripts DDL.

---

## 3. Desglose Detallado de Archivos

```
SARA/
├── schema.sql
├── README.md
├── RESUMEN_PROYECTO_SARA.md
├── server/
│   ├── .env
│   ├── fix-db.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/database.js
│       ├── controllers/
│       │   ├── aiController.js
│       │   ├── appointmentController.js
│       │   ├── billingController.js
│       │   ├── clinicalController.js
│       │   ├── patientController.js
│       │   ├── statsController.js
│       │   └── userController.js
│       ├── middlewares/authMiddleware.js
│       ├── models/
│       │   ├── Appointment.js
│       │   ├── AuditLog.js
│       │   ├── Consultation.js
│       │   ├── PatientProfile.js
│       │   ├── Transaction.js
│       │   └── User.js
│       ├── routes/
│       │   ├── aiRoutes.js
│       │   ├── appointmentRoutes.js
│       │   ├── billingRoutes.js
│       │   ├── clinicalRoutes.js
│       │   ├── patientRoutes.js
│       │   ├── statsRoutes.js
│       │   └── userRoutes.js
│       └── services/
│           ├── aiService.js
│           └── cronService.js
└── client/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── AppointmentModal.jsx
        │   ├── Button.jsx & Button.css
        │   ├── Card.jsx & Card.css
        │   ├── Esculapio.jsx
        │   ├── Input.jsx & Input.css
        │   ├── Layout.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── SaraAiChat.jsx & SaraAiChat.css
        │   ├── Sidebar.jsx & Sidebar.css
        │   └── layout/DashboardLayout.jsx
        ├── data/clinicalTemplates.js
        ├── database/dexieDB.js
        ├── hooks/useAuth.js
        ├── services/api.js
        ├── styles/
        │   ├── googleFormsUI.css
        │   ├── index.css
        │   ├── layout.css
        │   └── main.css
        └── pages/
            ├── Dashboard.jsx & Dashboard.css
            ├── Login.jsx & Login.css
            ├── Modulo_CitasMedicas/Modulo_CitasMedicas.jsx
            ├── Modulo2_GestionAdministrativa/
            │   ├── Modulo2_GestionAdministrativa.jsx
            │   └── PatientProfileEditor.jsx
            ├── Modulo3_RegistroCaja/Modulo3_RegistroCaja.jsx
            ├── Modulo4_DatosClinicos/
            │   ├── Modulo4_DatosClinicos.jsx
            │   ├── ClinicalWorkspace.jsx
            │   └── AuditLogModal.jsx
            ├── Modulo6_EstudiosProcedimientos/Modulo6_EstudiosProcedimientos.jsx
            ├── Modulo7_GestionMedicaEstadistica/Modulo7_GestionMedicaEstadistica.jsx
            └── PortalPaciente/
                ├── PortalPacienteDashboard.jsx
                ├── PortalPacienteHistoriaMedica.jsx & .css
                ├── PortalPacienteLayout.jsx & .css
                ├── PortalPacienteLogin.jsx
                ├── PortalPacienteProtectedRoute.jsx
                └── PortalPacienteSidebar.jsx & .css
```

---

### 3.1. Raíz del Proyecto

* **`schema.sql`**  
  Script SQL que define la estructura relacional de la base de datos PostgreSQL:
  * `users`: Cuentas del personal médico y administrativo, credenciales, roles, números de colegiatura (MPPS) y sedes.
  * `patients`: Ficha de identificación, datos de contacto, médico asignado y citas.
  * `services_rendered`: Registro de cobros, métodos de pago, montos en USD y reporte de caja.
  * `clinical_records`: Historias clínicas de consulta, signos vitales, evolución y examen físico.
  * `diagnoses`: Diagnósticos asociados a cada consulta clínica.
  * `treatment_plans`: Prescripciones médicas, dosis, medicamentos y pautas de tratamiento.
  * `audit_logs`: Registro histórico de auditoría sobre cambios y consultas de datos clínicos.
* **`README.md`**  
  Archivo inicial de descripción del repositorio.
* **`.gitignore`**  
  Exclusión de directorios pesados y archivos sensibles (`node_modules`, `.env`, builds).

---

### 3.2. Servidor Backend (`/server`)

#### ⚙️ Configuración y Arranque
* **`package.json`**: Define los paquetes npm del backend (Express, pg, bcrypt, jsonwebtoken, socket.io, cors, dotenv) y comandos de inicio.
* **`.env`**: Archivo de configuración para variables de entorno (puerto, conexión a base de datos PostgreSQL, claves JWT, API keys de IA).
* **`fix-db.js`**: Script de mantenimiento para aplicar correcciones automáticas y validación de columnas en PostgreSQL.
* **`src/app.js`**: Punto de entrada de la aplicación. Crea el servidor Express y HTTP, monta el servidor de WebSockets (`socket.io`), configura middlewares globales (CORS, JSON), expone las rutas REST `/api/*` e inicializa la base de datos.
* **`src/config/database.js`**: Gestiona el pool de conexiones a PostgreSQL (`pg.Pool`) y la rutina `initDatabase()` para verificar y levantar tablas.

#### 🛡️ Middlewares
* **`src/middlewares/authMiddleware.js`**: Middleware para verificar la validez del token JWT en las cabeceras HTTP y validar si el rol del usuario posee los permisos requeridos para acceder al recurso.

#### 🎮 Controladores (`src/controllers/`)
* **`userController.js`**: Autenticación de usuarios del sistema, generación de tokens JWT, registro de nuevos colaboradores, hash de contraseñas con bcrypt y listado de personal médico.
* **`patientController.js`**: Operaciones CRUD sobre la tabla de pacientes, búsqueda avanzada por cédula o nombre, gestión de fichas demográficas y autenticación del Portal del Paciente.
* **`clinicalController.js`**: Gestión completa de la historia clínica: registro de signos vitales, antecedentes, diagnósticos, recetas, planes de trabajo y publicación de informes para el portal.
* **`billingController.js`**: Gestión de ingresos de caja, cobro de servicios prestados, métodos de pago (efectivo, transferencias, divisas) y consolidado de reportes diarios.
* **`appointmentController.js`**: Creación, actualización, reprogramación y consulta de citas médicas por paciente, médico tratante y fecha.
* **`statsController.js`**: Generación de reportes analíticos e indicadores clave de rendimiento (KPIs) para directivos y administradores.
* **`aiController.js`**: Endpoint de enlace entre el frontend y el servicio de IA para procesar consultas y emitir respuestas en lenguaje natural.

#### 🛣️ Rutas API (`src/routes/`)
* **`userRoutes.js`**: Enrutamiento para login, perfil y administración de usuarios (`/api/users`).
* **`patientRoutes.js`**: Enrutamiento para gestión de pacientes y acceso de pacientes (`/api/patients`).
* **`clinicalRoutes.js`**: Enrutamiento para historias clínicas, recetas y diagnósticos (`/api/clinical`).
* **`billingRoutes.js`**: Enrutamiento para caja y cobros de servicios (`/api/billing`).
* **`appointmentRoutes.js`**: Enrutamiento para agendamiento y calendario de citas (`/api/appointments`).
* **`statsRoutes.js`**: Enrutamiento para estadísticas y reportes gerenciales (`/api/stats`).
* **`aiRoutes.js`**: Enrutamiento para el asistente virtual con IA (`/api/ai`).

#### 🗄️ Modelos de Datos (`src/models/`)
* **`User.js`**: Funciones de acceso a datos para la tabla de usuarios y médicos.
* **`PatientProfile.js`**: Funciones SQL para la ficha y demografía del paciente.
* **`Consultation.js`**: Consultas relacionales para historias clínicas, diagnósticos y tratamientos.
* **`Appointment.js`**: Consultas y operaciones sobre la agenda de citas.
* **`Transaction.js`**: Consultas de transacciones y servicios facturados en caja.
* **`AuditLog.js`**: Registro y consulta de auditoría forense para cumplimiento normativo.

#### 🔧 Servicios (`src/services/`)
* **`aiService.js`**: Integración con servicios de Inteligencia Artificial (Google Gemini / OpenAI) para resúmenes clínicos y soporte conversacional.
* **`cronService.js`**: Ejecución de procesos programados en segundo plano (recordatorios, tareas de limpieza).

---

### 3.3. Cliente Frontend (`/client`)

#### ⚙️ Configuración y Arranque
* **`package.json`**: Lista de dependencias del frontend (React 18, React Router DOM, Vite, Lucide Icons, Chart.js, Dexie, Axios).
* **`vite.config.js`**: Configuración de compilación rápida con Vite y plugins para React.
* **`index.html`**: Estructura HTML base con fuentes tipográficas y contenedor `#root`.
* **`src/main.jsx`**: Punto de entrada de React en el navegador.
* **`src/App.jsx`**: Enrutador principal de la aplicación con configuración de rutas protegidas por roles tanto para el sistema administrativo como para el portal del paciente.

#### 🎨 Estilos Globales (`src/styles/`)
* **`index.css`**: Normalización CSS y variables tipográficas base.
* **`main.css`**: Variables de color, sombras y diseño de interfaz moderno.
* **`layout.css`**: Disposición espacial de contenedores, sidebars y áreas de trabajo.
* **`googleFormsUI.css`**: Estilización moderna inspirada en tarjetas y formularios limpios.

#### 🔌 Servicios, Hooks y Persistencia
* **`src/services/api.js`**: Instancia centralizada de Axios configurada con interceptores para inyectar automáticamente el token JWT en las peticiones.
* **`src/hooks/useAuth.js`**: Hook personalizado para manejar el estado de autenticación, login, logout y roles de usuario.
* **`src/database/dexieDB.js`**: Implementación de base de datos local en el navegador (IndexedDB) con Dexie para garantizar funcionamiento en escenarios de baja conectividad.
* **`src/data/clinicalTemplates.js`**: Banco de datos de plantillas clínicas y diagnósticos predefinidos para agilizar el llenado de consultas.

#### 🧩 Componentes Reutilizables (`src/components/`)
* **`Button.jsx` & `Button.css`**: Botones personalizables con estados de carga y variantes.
* **`Card.jsx` & `Card.css`**: Tarjetas de contenido modulares y adaptables.
* **`Input.jsx` & `Input.css`**: Campos de entrada con etiquetas flotantes y validaciones.
* **`Sidebar.jsx` & `Sidebar.css`**: Menú lateral dinámico que despliega los módulos autorizados según el rol del usuario conectado.
* **`DashboardLayout.jsx` & `Layout.jsx`**: Estructuras envolventes con cabecera de usuario, alertas y barra lateral.
* **`ProtectedRoute.jsx`**: Componente de seguridad que restringe el acceso a páginas según el rol del usuario autenticado.
* **`AppointmentModal.jsx`**: Modal interactivo para crear y editar citas médicas.
* **`SaraAiChat.jsx` & `SaraAiChat.css`**: Widget flotante de asistente virtual interactivo con IA.
* **`Esculapio.jsx`**: Ícono vectorial del símbolo médico clásico.

#### 📄 Páginas Administrativas y Clínicas (`src/pages/`)
* **`Login.jsx` & `Login.css`**: Vista de inicio de sesión para el personal médico y administrativo.
* **`Dashboard.jsx` & `Dashboard.css`**: Panel de control principal con métricas rápidas y accesos a módulos.
* **`Modulo_CitasMedicas/Modulo_CitasMedicas.jsx`**: Calendario y gestión integral de citas médicas.
* **`Modulo2_GestionAdministrativa/`**:
  * `Modulo2_GestionAdministrativa.jsx`: Listado y búsqueda general de pacientes.
  * `PatientProfileEditor.jsx`: Editor completo de la ficha de identificación del paciente.
* **`Modulo3_RegistroCaja/Modulo3_RegistroCaja.jsx`**: Registro de cobros, selección de servicios y cuadre de caja.
* **`Modulo4_DatosClinicos/`**:
  * `Modulo4_DatosClinicos.jsx`: Vista principal de atención médica y selección de historias.
  * `ClinicalWorkspace.jsx`: Estación clínica médica con registro de constantes vitales, examen físico, diagnósticos CIE, plan de tratamiento y publicación de recetas.
  * `AuditLogModal.jsx`: Modal para visualizar la bitácora de auditoría y modificaciones de una historia clínica.
* **`Modulo6_EstudiosProcedimientos/Modulo6_EstudiosProcedimientos.jsx`**: Gestión y visualización de estudios diagnósticos, ecografías e imágenes.
* **`Modulo7_GestionMedicaEstadistica/Modulo7_GestionMedicaEstadistica.jsx`**: Informes estadísticos y gráficos de productividad médica y financiera.

#### 🌐 Portal del Paciente (`src/pages/PortalPaciente/`)
* **`PortalPacienteLogin.jsx`**: Formulario de ingreso para pacientes mediante número de documento de identidad.
* **`PortalPacienteDashboard.jsx`**: Vista de bienvenida del paciente con sus próximas citas y estado general.
* **`PortalPacienteHistoriaMedica.jsx` & `.css`**: Consulta de consultas médicas, evoluciones publicadas y recetas con indicaciones terapéuticas.
* **`PortalPacienteLayout.jsx` & `.css`**: Estructura visual diseñada especialmente para la experiencia del paciente.
* **`PortalPacienteSidebar.jsx` & `.css`**: Menú lateral específico del portal del paciente.
* **`PortalPacienteProtectedRoute.jsx`**: Guardián de rutas que valida la sesión específica del paciente (`portal_token`).

---
*Documento generado automáticamente para el sistema SARA.*
