import { AppointmentService } from '../../services/appointment.service.js';

export default {
  name: "planifierRendezVous",
  description: "Planifier un rendez-vous dans le calendrier",
  parameters: {
    type: "object",
    properties: {
      resume: {
        type: "string",
        description: "Titre ou résumé du rendez-vous"
      },
      description: {
        type: "string",
        description: "Description détaillée du rendez-vous"
      },
      dateHeureDebut: {
        type: "string",
        description: "Heure de début au format ISO (YYYY-MM-DDTHH:MM:SS)"
      },
      dateHeureFin: {
        type: "string",
        description: "Heure de fin au format ISO (YYYY-MM-DDTHH:MM:SS)"
      },
      emailsParticipants: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Liste des adresses email des participants"
      }
    },
    required: ["resume", "dateHeureDebut", "dateHeureFin"]
  },
  action: async (args) => {
    try {
      const appointmentService = new AppointmentService();
      const resultat = await appointmentService.createAppointment(
        args.resume,
        args.description || '',
        args.dateHeureDebut,
        args.dateHeureFin,
        args.emailsParticipants || []
      );
      return { succes: true, rendezVous: resultat };
    } catch (error) {
      return { succes: false, erreur: error.message };
    }
  }
}