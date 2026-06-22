import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const areas = [
    { name: 'Hinjewadi IT Park', zoneType: 'it_park', centerLat: 18.5912, centerLng: 73.7389, typicalPeakHours: { morning: '08:00-10:00', evening: '17:30-20:00' } },
    { name: 'Kharadi IT Park', zoneType: 'it_park', centerLat: 18.5515, centerLng: 73.9354, typicalPeakHours: { morning: '08:30-10:30', evening: '18:00-20:30' } },
    { name: 'Magarpatta', zoneType: 'it_park', centerLat: 18.5089, centerLng: 73.9260, typicalPeakHours: { morning: '08:30-10:00', evening: '18:00-19:30' } },
    { name: 'Shivajinagar', zoneType: 'commercial', centerLat: 18.5308, centerLng: 73.8474, typicalPeakHours: { morning: '09:00-11:00', evening: '17:00-20:00' } },
    { name: 'Deccan Gymkhana', zoneType: 'commercial', centerLat: 18.5161, centerLng: 73.8397, typicalPeakHours: { morning: '09:00-10:30', evening: '17:00-19:30' } },
    { name: 'Pune Station', zoneType: 'transit_hub', centerLat: 18.5284, centerLng: 73.8742, typicalPeakHours: { morning: '07:00-10:00', evening: '17:00-21:00' } },
    { name: 'Aundh', zoneType: 'residential', centerLat: 18.5590, centerLng: 73.8076, typicalPeakHours: { morning: '08:00-09:30', evening: '17:30-19:30' } },
    { name: 'Kothrud', zoneType: 'residential', centerLat: 18.5074, centerLng: 73.8077, typicalPeakHours: { morning: '08:00-09:30', evening: '17:30-19:30' } },
    { name: 'Wakad', zoneType: 'residential', centerLat: 18.5988, centerLng: 73.7615, typicalPeakHours: { morning: '08:00-09:30', evening: '18:00-20:00' } },
    { name: 'Hadapsar', zoneType: 'commercial', centerLat: 18.5010, centerLng: 73.9280, typicalPeakHours: { morning: '08:30-10:00', evening: '17:30-19:30' } },
    { name: 'Baner', zoneType: 'residential', centerLat: 18.5590, centerLng: 73.7868, typicalPeakHours: { morning: '08:00-09:30', evening: '18:00-20:00' } },
    { name: 'Viman Nagar', zoneType: 'commercial', centerLat: 18.5679, centerLng: 73.9143, typicalPeakHours: { morning: '08:30-10:00', evening: '17:30-19:30' } },
  ]

  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.name },
      update: {},
      create: area,
    })
  }

  console.log('✅ Seeded Pune areas')

  const busRoutes = [
    { routeNumber: '11', routeName: 'Katraj - Deccan - Shivajinagar', color: '#E53E3E', frequency: 15 },
    { routeNumber: '105', routeName: 'Swargate - Hinjewadi', color: '#3182CE', frequency: 20 },
    { routeNumber: 'HT-1', routeName: 'Hinjewadi - Shivajinagar (Hinjewadi Tech Park)', color: '#38A169', frequency: 10 },
    { routeNumber: '50', routeName: 'Hadapsar - Shivajinagar', color: '#D69E2E', frequency: 15 },
  ]

  for (const route of busRoutes) {
    await prisma.busRoute.upsert({
      where: { id: route.routeNumber },
      update: {},
      create: route,
    })
  }

  console.log('✅ Seeded PMPML bus routes')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
