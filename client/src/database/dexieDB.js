import Dexie from 'dexie';

// Inicialización de la Base de Datos IndexedDB para soporte PWA Offline
export const db = new Dexie('SARADatabase');

// Definición del esquema de base de datos local
db.version(1).stores({
  // Fichas de pacientes guardadas localmente
  patients: '++id, identificationNumber, name, lastName, email, phoneNumber, registeredDate, isSynced',
  
  // Citas médicas guardadas localmente
  appointments: '++id, patientId, doctorId, date, time, status, isSynced',
  
  // Historias clínicas guardadas localmente
  clinicalRecords: '++id, patientId, doctorId, date, summary, isSynced',
  
  // Cola de acciones pendientes de sincronizar con el servidor
  syncQueue: '++id, action, table, data, timestamp'
});

// Helper para verificar si hay conexión a internet
export const isOnline = () => navigator.onLine;
