import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL no está definida. Revisa tu archivo .env.local',
  );
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nombre: true,
      icono: true,
      createdAt: true,
    },
  });

  console.log('Categorias encontradas:', categorias.length);
  console.table(categorias);
}

main()
  .catch((error: unknown) => {
    console.error('Error ejecutando select de categorias con Prisma:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
