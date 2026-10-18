import { PrismaClient, Phase } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding recommendation rules...');

  const rules = [
    {
      phase: Phase.CONTROLLED,
      dietText: 'Pertahankan pola makan seimbang dengan karbohidrat kompleks, sayuran, dan protein rendah lemak. Batasi gula sederhana dan makanan olahan.',
      activityText: 'Aktivitas fisik minimal 150 menit per minggu (jalan cepat, bersepeda, atau berenang). Latihan kekuatan 2x per minggu.',
      medicationNote: 'Minum obat sesuai resep dokter secara teratur. Jangan mengubah dosis tanpa konsultasi.',
    },
    {
      phase: Phase.NEEDS_ATTENTION,
      dietText: 'Kurangi porsi karbohidrat, hindari gula dan makanan manis. Tingkatkan serat dari sayuran dan biji-bijian. Konsultasikan dengan ahli gizi.',
      activityText: 'Aktivitas fisik minimal 150 menit per mingyu dengan intensitas sedang. Mulai dengan jalan kaki 30 menit setiap hari.',
      medicationNote: 'Pastikan minum obat teratur. Diskusikan dengan dokter apakah perlu penyesuaian dosis.',
    },
    {
      phase: Phase.HIGH_RISK,
      dietText: 'SEGERA hubungi tenaga medis. Sementara itu: hindari gula, kurangi karbohidrat drastis, dan minum air putih yang cukup.',
      activityText: 'Istirahat yang cukup. Aktivitas fisik ringan saja setelah konsultasi dengan dokter.',
      medicationNote: 'SEGERA hubungi dokter. Jangan mengubah atau menghentikan obat tanpa saran medis.',
    },
    {
      phase: Phase.UNDETERMINED,
      dietText: 'Mohon lengkapi data pemeriksaan Anda agar sistem dapat memberikan rekomendasi yang sesuai.',
      activityText: 'Jaga aktivitas fisik teratur sesuai kemampuan Anda.',
      medicationNote: 'Konsultasikan dengan dokter untuk pengobatan yang tepat berdasarkan data medis Anda.',
    },
  ];

  for (const rule of rules) {
    await prisma.recommendationRule.upsert({
      where: { phase: rule.phase },
      update: { dietText: rule.dietText, activityText: rule.activityText, medicationNote: rule.medicationNote },
      create: rule,
    });
  }

  console.log('Recommendation rules seeded:');
  console.log('  - CONTROLLED (Terkontrol Baik)');
  console.log('  - NEEDS_ATTENTION (Perlu Perhatian)');
  console.log('  - HIGH_RISK (Berisiko Tinggi)');
  console.log('  - UNDETERMINED (Belum Dapat Ditentukan)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
