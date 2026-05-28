const webpush = require('web-push');

// Configura as chaves VAPID para Web Push
webpush.setVapidDetails(
  'mailto:admin@empresa.pt',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Envia uma notificação push para um utilizador
exports.sendPush = async (subscription, payload) => {
  try {
    // subscription é uma string JSON guardada na BD
    const pushSubscription = JSON.parse(subscription);
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log('Notificação push enviada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
  }
};