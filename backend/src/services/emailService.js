const nodemailer = require('nodemailer');

// Configura o transporte de email com as credenciais SMTP do .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Envia email quando um ticket é criado e atribuído a um técnico
exports.sendTicketCreated = async (tech, ticket) => {
  try {
    let html = `
      <h3>Olá ${tech.name},</h3>
      <p>Foi-lhe atribuído um novo ticket:</p>
      <ul>
        <li><strong>Ticket #${ticket.id}</strong></li>
        <li><strong>Título:</strong> ${ticket.title}</li>
        <li><strong>Cliente:</strong> ${ticket.client?.name || 'N/D'}</li>
        <li><strong>Prioridade:</strong> ${ticket.priority}</li>
        <li><strong>Tipo de Serviço:</strong> ${ticket.serviceType}</li>
        <li><strong>Equipamento:</strong> ${ticket.equipment || 'N/D'}</li>
        <li><strong>Descrição:</strong> ${ticket.description}</li>
    `;

    // Se for serviço externo, inclui a morada com link para o Google Maps
    if (ticket.serviceType === 'externo' && ticket.clientAddress) {
      html += `
        <li><strong>Morada do Cliente:</strong> 
          <a href="https://maps.google.com/?q=${encodeURIComponent(ticket.clientAddress)}" target="_blank">
            ${ticket.clientAddress}
          </a>
        </li>`;
    }

    html += `
      </ul>
      <p>Aceda ao sistema para mais detalhes.</p>
    `;

    await transporter.sendMail({
      from: '"HelpDesk Informática" <no-reply@empresa.pt>',
      to: tech.email,
      subject: `Novo Ticket #${ticket.id} - ${ticket.title}`,
      html
    });

    console.log(`Email enviado para ${tech.email} (Ticket #${ticket.id})`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
};

// Envia email quando o status de um ticket é alterado
exports.sendStatusChange = async (tech, ticket, oldStatus, newStatus) => {
  try {
    await transporter.sendMail({
      from: '"HelpDesk Informática" <no-reply@empresa.pt>',
      to: tech.email,
      subject: `Ticket #${ticket.id} - Status alterado para "${newStatus}"`,
      html: `
        <h3>Olá ${tech.name},</h3>
        <p>O status do ticket abaixo foi alterado:</p>
        <ul>
          <li><strong>Ticket #${ticket.id}</strong> - ${ticket.title}</li>
          <li><strong>De:</strong> ${oldStatus}</li>
          <li><strong>Para:</strong> ${newStatus}</li>
        </ul>
        <p>Aceda ao sistema para mais detalhes.</p>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
};

// Envia alerta de stock mínimo para o admin
exports.sendStockAlert = async (admin, items) => {
  try {
    const itemsList = items.map(item => 
      `<li>${item.name} (Ref: ${item.reference || 'N/D'}) - Quantidade: <strong>${item.quantity}</strong> (Mínimo: ${item.minQuantity})</li>`
    ).join('');

    await transporter.sendMail({
      from: '"HelpDesk Informática" <no-reply@empresa.pt>',
      to: admin.email,
      subject: '🚨 Alerta de Stock Mínimo',
      html: `
        <h3>Olá ${admin.name},</h3>
        <p>Os seguintes itens estão com stock abaixo do mínimo:</p>
        <ul>${itemsList}</ul>
        <p>Aceda ao sistema para gerir o stock.</p>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar email de stock:', error);
  }
};