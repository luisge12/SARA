// Servicio de Envío de Reporte Diario de Caja (19:00 VET) para SARA

// TODO: Configurar Nodemailer y programador de tareas diaria (Cron/Interval).
module.exports = {
  startDailyReportCron: () => {
    console.log('Daily financial report cron service started (scheduled for 19:00 VET).');
  }
};
