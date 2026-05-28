const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('A criar utilizadores iniciais...');

  // Criar admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.pt' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@empresa.pt',
      passwordHash: adminPassword,
      role: 'admin',
      active: true,
    },
  });
  console.log('Admin criado:', admin.email, '/ Password: admin123');

  // Criar técnico
  const techPassword = await bcrypt.hash('tecnico123', 10);
  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@empresa.pt' },
    update: {},
    create: {
      name: 'Técnico Silva',
      email: 'tecnico@empresa.pt',
      passwordHash: techPassword,
      role: 'tecnico',
      active: true,
    },
  });
  console.log('Técnico criado:', tecnico.email, '/ Password: tecnico123');

  // Criar receção
  const recPassword = await bcrypt.hash('rececao123', 10);
  const rececao = await prisma.user.upsert({
    where: { email: 'rececao@empresa.pt' },
    update: {},
    create: {
      name: 'Receção Sousa',
      email: 'rececao@empresa.pt',
      passwordHash: recPassword,
      role: 'recepcao',
      active: true,
    },
  });
  console.log('Receção criado:', rececao.email, '/ Password: rececao123');

  console.log('\n✅ Utilizadores criados com sucesso!');
  console.log('Podes fazer login com qualquer um destes emails.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());