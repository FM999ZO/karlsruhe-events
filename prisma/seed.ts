import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Category, Status } from '../src/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const now = new Date()
const d = (days: number, hour = 20) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date
}

async function main() {
  console.log('Seeding database...')

  await prisma.event.deleteMany()

  await prisma.event.createMany({
    data: [
      {
        title: 'Jazz im Schloss',
        description:
          'Ein unvergesslicher Jazzabend mit internationalen Künstlern im historischen Schloss Karlsruhe. Genießt die Musik unter freiem Himmel mit Blick auf die beleuchteten Fassaden.',
        dateStart: d(1, 19),
        dateEnd: d(1, 22),
        locationName: 'Schloss Karlsruhe',
        locationAddress: 'Schloßbezirk 10, 76131 Karlsruhe',
        latitude: 49.0135,
        longitude: 8.4044,
        category: Category.MUSIC,
        isFeatured: true,
        status: Status.PUBLISHED,
      },
      {
        title: 'Flohmarkt Durlach',
        description:
          'Der beliebte Flohmarkt in Durlach – Schnäppchen, Vintage-Schätze und regionale Spezialitäten. Für Frühaufsteher gibt es die besten Funde!',
        dateStart: d(2, 8),
        dateEnd: d(2, 14),
        locationName: 'Marktplatz Durlach',
        locationAddress: 'Pfinztalstraße, 76227 Karlsruhe-Durlach',
        category: Category.FLEAMARKET,
        status: Status.PUBLISHED,
      },
      {
        title: 'KIT Erstsemesterparty',
        description:
          'Die offizielle Erstsemesterparty des KIT! Triff neue Kommilitonen, feiere den Start ins Studium und erlebe eine unvergessliche Nacht.',
        dateStart: d(3, 22),
        locationName: 'Substage Karlsruhe',
        locationAddress: 'Alter Schlachthof 19, 76131 Karlsruhe',
        category: Category.UNI,
        status: Status.PUBLISHED,
      },
      {
        title: 'Stadtgesprächsreihe: Klimawandel und Karlsruhe',
        description:
          'Experten aus Wissenschaft und Politik diskutieren, wie Karlsruhe auf die Herausforderungen des Klimawandels reagiert. Freier Eintritt, Anmeldung erforderlich.',
        dateStart: d(4, 18),
        dateEnd: d(4, 20),
        locationName: 'ZKM | Zentrum für Kunst und Medien',
        locationAddress: 'Lorenzstraße 19, 76135 Karlsruhe',
        category: Category.CULTURE,
        status: Status.PUBLISHED,
      },
      {
        title: 'Outdoor Yoga im Stadtgarten',
        description:
          'Startet euren Morgen mit einer entspannten Yoga-Session im Stadtgarten. Für alle Levels geeignet – Matte mitbringen!',
        dateStart: d(0, 9),
        dateEnd: d(0, 10),
        locationName: 'Stadtgarten Karlsruhe',
        locationAddress: 'Hans-Thoma-Straße 6, 76133 Karlsruhe',
        category: Category.SPORT,
        status: Status.PUBLISHED,
      },
      {
        title: 'Techno Night at Scruffys',
        description:
          'Eine der heißesten Techno-Nächte Karlsruhes! DJs aus der ganzen Region legen bis in den frühen Morgen auf.',
        dateStart: d(5, 23),
        locationName: "Scruffys Irish Pub",
        locationAddress: 'Zähringerstraße 13, 76133 Karlsruhe',
        category: Category.PARTY,
        isFeatured: true,
        status: Status.PUBLISHED,
      },
      {
        title: 'Kunstausstellung: Urban Visions',
        description:
          'Lokale und internationale Künstler zeigen ihre Werke zum Thema Stadtleben und Urbanität. Vernissage mit Getränken und Live-Musik.',
        dateStart: d(6, 17),
        locationName: 'Städtische Galerie Karlsruhe',
        locationAddress: 'Lorenzstraße 27, 76135 Karlsruhe',
        category: Category.CULTURE,
        status: Status.PUBLISHED,
      },
      {
        title: 'Karlsruher Stadtlauf',
        description:
          'Der jährliche Stadtlauf durch die Fächerstadt! Strecken von 5 km, 10 km und Halbmarathon. Anmeldung über die offizielle Website.',
        dateStart: d(7, 10),
        dateEnd: d(7, 17),
        locationName: 'Karlsruhe Innenstadt',
        locationAddress: 'Kaiserstraße, 76133 Karlsruhe',
        category: Category.SPORT,
        status: Status.PUBLISHED,
      },
    ],
  })

  console.log('Done! Created 8 sample events.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
