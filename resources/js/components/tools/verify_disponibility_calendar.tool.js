import { AppointmentService } from '../../services/appointment.service.js';

export default {
  name: "verifierDisponibiliteCalendrier",
  description: "Vérifier le calendrier pour les créneaux de rendez-vous disponibles",
  parameters: {
    type: "object",
    properties: {
      dateDebut: {
        type: "string",
        description: "Date de début au format YYYY-MM-DD"
      },
      dateFin: {
        type: "string",
        description: "Date de fin au format YYYY-MM-DD"
      },
      dureeRendezVous: {
        type: "number",
        description: "Durée du rendez-vous en minutes"
      }
    },
    required: ["dateDebut", "dateFin", "dureeRendezVous"]
  },
  action: async (args) => {
    try {
      const appointmentService = new AppointmentService();
      const creneauxDisponibles = await appointmentService.findAvailableSlots(
        args.dureeRendezVous,
        args.dateDebut,
        args.dateFin
      );
      return { succes: true, creneauxDisponibles };
    } catch (error) {
      console.error(error);
      return { succes: false, erreur: error.message };
    }
  }
}