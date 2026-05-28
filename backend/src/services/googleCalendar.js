const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cria um cliente OAuth2 para um utilizador específico
function getOAuth2Client(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    access_token: user.googleToken,
    refresh_token: user.googleRefreshToken
  });
  return oauth2Client;
}

// Retorna o colorId do Google Calendar com base na prioridade
function getColorByPriority(priority) {
  const colorMap = {
    urgente: '11',  // vermelho
    alta: '6',      // laranja
    media: '5',     // amarelo
    baixa: '2'      // verde
  };
  return colorMap[priority] || '5';
}

// Cria ou atualiza um evento no Google Calendar do técnico
exports.createOrUpdateEvent = async (ticket) => {
  // Só cria evento se tiver técnico atribuído, data agendada e for serviço externo
  if (!ticket.techId || !ticket.scheduledAt || ticket.serviceType !== 'externo') return;

  try {
    const tech = await prisma.user.findUnique({ where: { id: ticket.techId } });
    if (!tech || !tech.googleToken) return; // Técnico não tem Google ligado

    const calendar = google.calendar({ version: 'v3', auth: getOAuth2Client(tech) });

    // Detalhes do evento
    const eventDetails = {
      summary: `🔧 [Ticket #${ticket.id}] ${ticket.client?.name || 'Cliente'}`,
      location: ticket.clientAddress,
      description: `Problema: ${ticket.description}\nEquipamento: ${ticket.equipment || 'N/D'}\nContacto: ${ticket.client?.phone || 'N/D'}\nTécnico: ${tech.name}\nPrioridade: ${ticket.priority}\nLink: ${process.env.CLIENT_URL}/tickets/${ticket.id}`,
      start: {
        dateTime: new Date(ticket.scheduledAt).toISOString(),
        timeZone: 'Europe/Lisbon'
      },
      end: {
        dateTime: new Date(new Date(ticket.scheduledAt).getTime() + (ticket.estimatedDuration || 60) * 60000).toISOString(),
        timeZone: 'Europe/Lisbon'
      },
      colorId: getColorByPriority(ticket.priority)
    };

    // Se o ticket já foi resolvido, muda título e cor
    if (ticket.status === 'resolvido' || ticket.status === 'fechado') {
      eventDetails.summary = `✅ ${eventDetails.summary}`;
      eventDetails.colorId = '8'; // cinzento
    }

    // Atualiza evento existente ou cria novo
    if (ticket.googleEventId) {
      await calendar.events.update({
        calendarId: 'primary',
        eventId: ticket.googleEventId,
        resource: eventDetails
      });
    } else {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventDetails
      });
      // Guarda o ID do evento no ticket
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { googleEventId: event.data.id }
      });
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar evento Google Calendar:', error);
  }
};

// Remove um evento do Google Calendar (quando o técnico é trocado ou ticket cancelado)
exports.deleteEvent = async (ticket, techId) => {
  if (!ticket.googleEventId || !techId) return;

  try {
    const tech = await prisma.user.findUnique({ where: { id: techId } });
    if (!tech || !tech.googleToken) return;

    const calendar = google.calendar({ version: 'v3', auth: getOAuth2Client(tech) });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: ticket.googleEventId
    });

    // Limpa o ID do evento no ticket
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { googleEventId: null }
    });
  } catch (error) {
    console.error('Erro ao remover evento Google Calendar:', error);
  }
};