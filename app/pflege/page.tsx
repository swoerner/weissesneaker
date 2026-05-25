import type { Metadata } from 'next'
import AffiliateButton from '@/components/AffiliateButton'

export const metadata: Metadata = {
  title: 'Weiße Sneaker reinigen & pflegen – Die ultimative Anleitung',
  description:
    'Schritt-für-Schritt-Anleitungen für saubere, strahlend weiße Sneaker – nach Material, Verschmutzungsgrad und Lagerung.',
}

const sections = [
  {
    number: '01',
    title: 'Grundreinigung',
    content: `Für die schnelle Reinigung nach jedem Tragen brauchst du nur wenig: eine weiche Bürste, mildes Spülmittel und warmes Wasser. Klopfe zunächst groben Schmutz ab. Mische einen Teelöffel Spülmittel mit 200 ml warmem Wasser und bearbeite Oberfläche und Sohle mit einer Schuhbürste in kreisenden Bewegungen. Wische mit einem feuchten Tuch nach und lass den Sneaker bei Zimmertemperatur trocknen – niemals direkt in der Sonne oder am Heizkörper.`,
  },
  {
    number: '02',
    title: 'Tiefenreinigung für Hartnäckiges',
    content: `Bei eingetrockneten Flecken hilft eine Paste aus Backpulver und Wasser (2:1). Auftragen, 10 Minuten einwirken lassen, dann mit einer alten Zahnbürste in kleinen Kreisen abreiben. Für Gummisohlen funktioniert ein Radiergummi oder Nagellackentferner (ohne Aceton) auf Wattepads. Wichtig: Immer erst an einer unauffälligen Stelle testen.`,
  },
  {
    number: '03',
    title: 'Pflege nach Material',
    content: `Leder & Kunstleder: Nach der Reinigung unbedingt mit Lederbalsam oder -creme pflegen, damit das Material nicht austrocknet und rissig wird. Canvas (Stoff): Kann bei 30°C in der Waschmaschine gewaschen werden – Schnürsenkel vorher entfernen, in einem Wäschenetz waschen, bei Zimmertemperatur trocknen. Mesh: Sehr empfindlich, niemals schrubben. Nur mit weichem Tuch und wenig Wasser betupfen. Wildleder/Nubuk: Nie nass waschen. Spezial-Wildlederbürste für trockene Verschmutzungen, Wildleder-Imprägnierung nach jeder Reinigung auftragen.`,
  },
  {
    number: '04',
    title: 'Weißmachen & Aufhellen',
    content: `Vergilbte Sohlen lassen sich mit einem Gemisch aus Wasserstoffperoxid (3 %) und Backpulver aufhellen. Paste auftragen, Sneaker in der Sonne platzieren (UV aktiviert den Effekt), nach 30–60 Minuten abspülen. Für das Obermaterial hilft Zahnpasta (weiße, ohne Gel) auf einer Zahnbürste – kurz einreiben, abwischen, wiederholen. Kommerziell: Jason Markk, Crep Protect und Sneaker Eraser liefern sehr gute Ergebnisse.`,
  },
  {
    number: '05',
    title: 'Lagerung & Prävention',
    content: `Weiße Sneaker vergilben durch UV-Licht und Sauerstoff. Lagere sie in ihrer Originalbox oder in transparenten Schuhboxen – kühl, trocken und lichtgeschützt. Silicagel-Beutel in der Box binden Feuchtigkeit. Vor dem Tragen immer Imprägnierspray auftragen (Abstand 30 cm, zwei Schichten, 24 h trocknen lassen). Tipp: Wechsle zwischen mehreren Paaren, damit jeder Sneaker nach dem Tragen vollständig austrocknen kann.`,
  },
]

export default function PflegePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <p className="font-dm-sans text-xs tracking-widest uppercase text-[#888] mb-3">
          Pflegehinweise
        </p>
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
          Weiße Sneaker reinigen & pflegen
        </h1>
        <p className="font-dm-sans text-[#555] text-base leading-relaxed">
          Weiße Sneaker sind wunderschön – aber empfindlich. Diese Anleitung zeigt,
          wie du sie sauber hältst, aufhellst und lange weiß hältst.
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.number} className="flex gap-6">
            <div className="flex-shrink-0">
              <span className="font-playfair text-4xl font-bold text-[#E8E0D5]">
                {section.number}
              </span>
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold mb-3">{section.title}</h2>
              <p className="font-dm-sans text-[#555] text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          </section>
        ))}

        {/* Produktempfehlungen */}
        <section className="flex gap-6">
          <div className="flex-shrink-0">
            <span className="font-playfair text-4xl font-bold text-[#E8E0D5]">06</span>
          </div>
          <div>
            <h2 className="font-playfair text-xl font-bold mb-3">
              Produktempfehlungen
            </h2>
            <p className="font-dm-sans text-[#555] text-sm leading-relaxed mb-6">
              Diese Pflegeprodukte haben wir getestet und empfehlen sie
              uneingeschränkt für weiße Sneaker:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: 'Jason Markk Essential Kit',
                  desc: 'Das Original – Reinigungslösung + Premium-Bürste. Für alle Materialien geeignet.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=jason-markk',
                },
                {
                  name: 'Crep Protect Cure',
                  desc: 'Schaumreiniger für hartnäckige Flecken. Besonders effektiv auf Gummisohlen.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=crep-protect',
                },
                {
                  name: 'Sneaker Shield Imprägnierung',
                  desc: 'Unsichtbarer Schutzfilm vor Schmutz und Wasser – ideal vor dem ersten Tragen.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=sneaker-shield',
                },
                {
                  name: 'Sneaker Lab Whitener',
                  desc: 'Spezifisch für vergilbte Sohlen und Obermaterial – restauriert das Weiß.',
                  url: 'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=sneaker-lab-whitener',
                },
              ].map((product) => (
                <div key={product.name} className="border border-[#eee] p-4 bg-white">
                  <h3 className="font-playfair font-bold text-sm mb-1">{product.name}</h3>
                  <p className="font-dm-sans text-xs text-[#888] mb-4 leading-relaxed">
                    {product.desc}
                  </p>
                  <AffiliateButton affiliateUrl={product.url} label="Ansehen" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
