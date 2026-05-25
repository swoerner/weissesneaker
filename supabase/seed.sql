-- Run in Supabase SQL Editor after schema.sql

insert into sneakers (name, brand, slug, description, price_min, image_url, affiliate_url, badge, style, source, active)
values
  (
    'Air Force 1', 'Nike', 'nike-air-force-1',
    'Der zeitlose Klassiker mit superweicher Ledersohle – seit 1982 unschlagbar clean. Perfekt zu Jeans, Chinos oder Jogginghose.',
    11000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=nike-air-force-1',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Stan Smith', 'Adidas', 'adidas-stan-smith',
    'Ikonisches Tennis-Modell mit minimalistischem Design, das seit den 70ern Stil definiert. Vegane Version erhältlich.',
    9000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=adidas-stan-smith',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    '574', 'New Balance', 'new-balance-574',
    'Chunky Silhouette trifft auf maximalen Tragekomfort – der 574 ist der Allrounder unter den weißen Sneakern.',
    12000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=new-balance-574',
    'Neu', 'lifestyle', 'manual', true
  ),
  (
    'Achilles Low', 'Common Projects', 'common-projects-achilles-low',
    'Handgefertigtes italienisches Leder, minimales Design, goldene Seriennummer – das Nonplusultra für Minimalisten mit Anspruch.',
    42000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=common-projects-achilles-low',
    'Luxus', 'luxus', 'manual', true
  ),
  (
    'V-10', 'Veja', 'veja-v-10',
    'Nachhaltig produziert aus Bio-Baumwolle und Amazonas-Kautschuk – der weiße Sneaker mit gutem Gewissen.',
    15000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=veja-v-10',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    'Cloud 5', 'On Running', 'on-running-cloud-5',
    'Revolutionäre CloudTec-Sohle für maximale Dämpfung – läuft wie auf Wolken, sieht dabei noch gut aus.',
    17000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=on-running-cloud-5',
    'Neu', 'sport', 'manual', true
  ),
  (
    'Suede Classic', 'Puma', 'puma-suede-classic',
    'Streetwear-Ikone seit 1968 – das weiche Wildleder-Obermaterial und die saubere Silhouette machen ihn zeitlos.',
    8000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=puma-suede-classic',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Chuck Taylor All Star', 'Converse', 'converse-chuck-taylor',
    'Der ultimative Jugendkult-Sneaker – vulkanisierte Sohle, ikonisches Design, unschlagbarer Preis.',
    7000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=converse-chuck-taylor',
    'Bestseller', 'lifestyle', 'manual', true
  ),
  (
    'Low Top', 'Filling Pieces', 'filling-pieces-low-top',
    'Amsterdamer Premium-Label trifft auf handgenähtes Leder – eine europäische Alternative zu Common Projects.',
    28000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=filling-pieces-low-top',
    'Luxus', 'luxus', 'manual', true
  ),
  (
    'Graduate', 'Lacoste', 'lacoste-graduate',
    'Cleane Silhouette mit dem berühmten Krokodil-Logo – der Graduate ist Lacoste puristisch und zeitlos.',
    10000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=lacoste-graduate',
    'Neu', 'lifestyle', 'manual', true
  ),
  (
    'Club C 85', 'Reebok', 'reebok-club-c-85',
    'Tennis-Erbe aus den 80ern in schneeweißem Leder – schlicht, clean, und dabei erstaunlich vielseitig kombinierbar.',
    8500, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=reebok-club-c-85',
    'Trend', 'lifestyle', 'manual', true
  ),
  (
    'Gel-Lyte III', 'Asics', 'asics-gel-lyte-iii',
    'Kult-Laufschuh der 90er mit Split-Tongue und GEL-Dämpfung – heute der Streetwear-Tipp für Kenner.',
    13000, null,
    'https://www.awin1.com/cread.php?awinmid=0&awinaffid=0&p=asics-gel-lyte-iii',
    'Trend', 'sport', 'manual', true
  );
