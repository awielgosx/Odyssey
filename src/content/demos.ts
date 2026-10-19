// Fully prefilled answers for the four demo ships, so a teacher can walk a class through every
// stop and submit each one to Athena live. Students' own voyages start empty.
// They are drafts, not submissions: nothing is scored until "Submit to Athena" is pressed.
import type { Landing } from './landing'
import type { Voyage } from './voyages'

interface Demo {
  landings: Record<number, Landing>
  aeolus: { p: number; a: number; promise: string; enabler: string; link: string; who: string; gain: string }
  lemnos: { name: string; pitch: string; curve: number[]; added?: { name: string; level: number }[]; chain: string[]; price: string; zone: string; indicators: Record<string, string>; antagonism: string }
  olympus: { god: string; answer: string; hypotheses: { p: string; a: string; c: string }; riskiest: 'p' | 'a' | 'c'; assumption: string; mvp: string; stake: string }
}

const VRIO = { v: 'Valuable to customers', r: 'Rare among competitors', i: 'Hard to imitate', o: 'Organised to exploit it', u: 'Under-used today' }

function phone(v: Voyage): Demo {
  const c = v.chain!
  const r = v.resources!
  return {
    landings: {
      1: {
        costs: ['A high upfront price of about €800, often spread over a carrier contract', 'Cases, insurance and a battery that fades within two years', 'Paying for a new phone when one part breaks; the old one ends up in a drawer'],
        idea: 'We design a phone whose battery and screen swap out in minutes for under €40, so owners keep it five years instead of buying new; in exchange they accept a slightly thicker phone.',
      },
      2: { stage: 'Maintaining and fixing', idea: 'Instead of owners waiting days at a repair centre, we post the spare part with a screwdriver and a video guide; this costs us a parts stock and a support line.' },
      3: { barrier: 'They dislike how it is done today', idea: 'Ethically minded buyers who refuse disposable electronics keep their old phones or buy refurbished; a transparent, fairly sourced, repairable phone removes their objection.' },
      4: { idea: 'Phones are bought for performance and status; we add pride instead: traceable fair materials and a phone you can open and fix yourself.', lower: 'Raw performance' },
      5: { job: 'Staying connected every day without worry', idea: 'Like the bicycle trade, where owners swap worn parts and keep the frame for years, we would sell a durable core with spare parts; and we would stop launching a new model every year.' },
      6: { who: 'Independent repair shops', sides: ['Fast local repairs at a fair price', 'Certified parts, training and new customers', 'Owners pay the shop; we earn on the parts'] },
      7: { model: 'Rent or lease', idea: 'We charge a monthly fee that falls every year the customer keeps the same phone; they prefer it because the phone costs less the longer they use it, and we keep the customer longer.' },
      8: { step: c[0], idea: 'At the design step, we use modular connectors, standard screws and diagnostic software that tells owners which part is failing, so customers can fix it themselves in minutes.' },
      9: { step: c[2], pair: ['Contract factories assemble glued, sealed phones as cheaply as possible', 'Fewer, fairly paid suppliers assemble with screws instead of glue; each unit costs more, but every part becomes replaceable'] },
      10: { move: 'Add: refurbish and resell', idea: 'With this new step, we buy back old phones, refurbish them and resell them; second-hand buyers pay for it, and the parts we recover cut our sourcing costs.' },
      11: { input: 'Materials', pair: ['Gold, tin and cobalt bought on world markets, with unclear mining conditions', 'Fairtrade gold and recycled tin from our own take-back scheme: costlier per gram, but traceable and lower impact'] },
      12: { type: 'A supplier', deal: ['A certified fair-trade mining cooperative', 'Traceable conflict-free minerals and a story buyers trust', 'A guaranteed premium price and a multi-year purchase contract'] },
      13: { needs: 'A mobile plan, a case, insurance and somewhere to recycle the old phone', idea: 'With a mobile operator, we bundle the phone into a plan with free part replacements; customers get one simple contract and the operator gets loyal long-term subscribers.' },
      14: { resource: r[1], vrio: [VRIO.v, VRIO.i, VRIO.o], idea: 'We license our software design know-how to other hardware makers who want their devices supported for eight years: new service revenue from expertise we already have.' },
    },
    aeolus: {
      p: 7,
      a: 9,
      promise: 'a monthly lease that gets cheaper every year you keep the same phone',
      enabler: 'we assemble with screws and replaceable parts instead of glue',
      link: 'Phones built to be repaired survive five years of use, so a lease that falls over time still makes money instead of losing it on early breakdowns.',
      who: 'buyers tired of disposable phones',
      gain: 'resources',
    },
    lemnos: {
      name: 'Keepphone',
      pitch: 'For buyers tired of disposable phones, Keepphone offers a repairable, fairly sourced smartphone leased at a price that falls every year, unlike Troy, because it is built to last.',
      curve: [3, 2, 5, 4, 5],
      chain: ['Design modular hardware and software', 'Source fair and recycled materials', 'Assemble with screws at fairly paid suppliers', 'Lease directly online', 'Post spare parts and video guides', 'Buy back, refurbish and re-lease'],
      price: 'A monthly lease of about €30 that falls by a fifth every year the customer keeps the same phone, instead of €800 upfront',
      zone: 'game-changing',
      indicators: { revenue: '+', costs: '-', capital: '-', ghg: '+', pollutants: '+', resources: '+', employability: '0', quality: '+', fairness: '+' },
      antagonism: 'Leasing and fair materials raise our costs and the capital tied up in phones, while the environmental gains only appear if customers really keep them five years.',
    },
    olympus: {
      god: 'poseidon',
      answer: 'An incumbent can copy screws, but not our contracts with fair mines, our refurbishing loop, or a brand built on not selling a new phone every year, which contradicts its own revenue model.',
      hypotheses: {
        p: 'Buyers will accept weaker specifications for a phone they keep five years',
        a: 'Screwed, modular phones can be assembled at under 15% extra cost per unit',
        c: 'Leased phones really stay in use five years, so the lease stays profitable',
      },
      riskiest: 'p',
      assumption: 'Buyers will accept weaker specifications for a phone they keep five years',
      mvp: 'A landing page offering a pre-order of the leased phone, with a spec comparison, promoted to 2,000 eco-minded students',
      stake: '5% of visitors pay a €20 refundable deposit within two weeks',
    },
  }
}

function luxury(v: Voyage): Demo {
  const c = v.chain!
  const r = v.resources!
  return {
    landings: {
      1: {
        costs: ['A trip to a flagship store, often abroad, and waiting lists for iconic pieces', 'Careful storage, insurance and specialist cleaning', 'Repairs in the house’s workshops that can take months'],
        idea: 'We strip out the waiting list and the flagship visit for small objects made from offcuts, sold in pop-up exhibitions; in exchange clients accept that each piece is a one-off they cannot reorder.',
      },
      2: { stage: 'Finding and choosing', idea: 'Instead of clients hunting for something truly unique, our artisans design one-off pieces and a curator presents them; this costs us design time and small, unpredictable batches.' },
      3: { barrier: 'They can’t afford it', idea: 'Young design lovers who admire the house but cannot afford a bag buy cheaper designer brands instead; small unique objects made from offcuts give them an entry ticket at a lower price.' },
      4: { idea: 'Clients buy for prestige and craft; we add surprise and play: whimsical one-off objects that tell the story of the material they came from.', lower: 'Brand prestige' },
      5: { job: 'Owning a beautiful object with a story', idea: 'Like contemporary art galleries, which show one-off works in temporary exhibitions, we would sell unique objects in travelling pop-ups; and we would stop treating flawed materials as waste.' },
      6: { who: 'Independent artists and designers', sides: ['Unique, surprising objects with a creative story', 'Access to rare materials and the house’s workshops', 'Clients pay the house; artists receive a fee and credit'] },
      7: { model: 'Subscription', idea: 'We charge collectors an annual membership for first access to each new pop-up collection; they prefer it because they never miss a one-off piece, and it smooths our unpredictable sales.' },
      8: { step: c[2], idea: 'At quality control, we scan and catalogue every rejected material in a digital library, so designers can match offcuts to ideas and clients can see where their piece came from.' },
      9: { step: c[3], pair: ['Permanent flagship stores in the world’s capitals sell the standard collections', 'Short, staged pop-up exhibitions in a different city each season: cheaper than a store, and every visit feels like an event'] },
      10: { move: 'Add: refurbish and resell', idea: 'With this new step, we buy back pieces from clients, restore them in our workshops and resell them as certified heritage pieces; collectors pay for them, and the house earns twice on each object.' },
      11: { input: 'Materials', pair: ['Perfect leather, silk and crystal bought new from top suppliers', 'Offcuts and flawed materials from our own workshops: nearly free, they cut waste and give each object a story'] },
      12: { type: 'A supplier', deal: ['Our historic crystal manufacturer', 'Its own rejected pieces and its glass-working skills', 'First pick of our designs to sell in its own boutiques'] },
      13: { needs: 'Gift wrapping, an occasion to celebrate, and a place to display the piece at home', idea: 'With an interior designer, we stage each object in rooms shown at our exhibitions; clients see how to display their piece, and the designer meets wealthy new clients.' },
      14: { resource: r[0], vrio: [VRIO.v, VRIO.r, VRIO.i, VRIO.o, VRIO.u], idea: 'We open masterclasses where enthusiasts make a small object from offcuts with our artisans: an experience business built on know-how no rival can copy.' },
    },
    aeolus: {
      p: 4,
      a: 11,
      promise: 'whimsical one-off objects that surprise and tell the story of their material',
      enabler: 'our main input becomes the offcuts and flawed materials of our own workshops',
      link: 'Offcuts come in odd sizes and colours, so each object must be designed around its material, which is exactly what makes every piece a playful one-off.',
      who: 'design lovers who want something nobody else owns',
      gain: 'resources',
    },
    lemnos: {
      name: 'Offcut Atelier',
      pitch: 'For design lovers who want what no one else owns, Offcut Atelier offers playful one-off objects made from the house’s rejected materials, unlike Troy, because waste becomes the source of uniqueness.',
      curve: [5, 4, 5, 4, 5],
      chain: ['Collect offcuts and flawed pieces from our workshops', 'Catalogue them in a digital material library', 'Artists and artisans design one-off objects', 'Craft in in-house workshops', 'Sell in travelling pop-up exhibitions'],
      price: 'One-off objects from €300 to €5,000, priced by piece, plus an annual collectors’ membership for first access',
      zone: 'high-end',
      indicators: { revenue: '+', costs: '+', capital: '0', ghg: '0', pollutants: '0', resources: '+', employability: '+', quality: '+', fairness: '0' },
      antagonism: 'One-off pieces are slow and costly to design, so the model stays small: the environmental gain is real but limited to the offcuts we produce.',
    },
    olympus: {
      god: 'hermes',
      hypotheses: {
        p: 'Clients will value objects made from rejected materials as highly as new pieces',
        a: 'Our workshops produce enough usable offcuts for 300 objects a year',
        c: 'Pop-ups sell enough at full price to cover the extra design time',
      },
      riskiest: 'p',
      answer: 'Clients already pay for scarcity: a piece that exists only once, signed by an artisan and made from the house’s own materials, is rarer than a standard bag. They give up only the ability to reorder it.',
      assumption: 'Clients will value objects made from rejected materials as highly as new pieces',
      mvp: 'A one-week, invitation-only pop-up of 40 objects in one city, with prices shown',
      stake: 'At least 25 of the 40 objects sell at full price within the week',
    },
  }
}

function dairy(v: Voyage): Demo {
  const c = v.chain!
  const r = v.resources!
  return {
    landings: {
      1: {
        costs: ['Long negotiations and prices that swing with milk markets', 'Cold storage, allergen controls and batch testing', 'Reformulating recipes when supply or prices change'],
        idea: 'We offer a dairy protein whose price does not follow milk markets or seasons, so food makers stop paying for volatility and reformulation; in exchange they accept a higher list price per tonne.',
      },
      2: { stage: 'Buying and paying', idea: 'Instead of food makers hedging milk prices themselves, we offer fixed-price three-year contracts; this costs us the risk that our own energy and sugar costs rise.' },
      3: { barrier: 'They dislike how it is done today', idea: 'Vegan and lactose-intolerant consumers avoid dairy and buy plant alternatives they find less tasty; an animal-free whey identical to milk’s removes their objection without losing taste.' },
      4: { idea: 'Food makers buy whey for function, texture and protein; we add a reason to feel good: the same ingredient with no cows and a far lower footprint.', lower: 'Price per tonne' },
      5: { job: 'Giving foods a creamy texture and protein', idea: 'Like brewers, who make products by fermentation in steel tanks close to cities, we would brew dairy proteins in fermentation plants; and we would stop depending on herds and seasons.' },
      6: { who: 'Consumer food brands', sides: ['A trusted brand selling the new ingredient', 'A ready, animal-free ingredient with a story to tell', 'Brands pay us per tonne; we co-market on the pack'] },
      7: { model: 'Other: Licensing fee per tonne produced', idea: 'We license our fermentation process to dairy companies and charge a fee per tonne they produce; they prefer it because they reuse their plants and their customers.' },
      8: { step: c[0], idea: 'At the first step, we replace milk collection with precision fermentation: microorganisms make whey from sugar in tanks, so food makers get the same protein with steady quality and supply.' },
      9: { step: c[4], pair: ['Powder is made in large rural plants near the farms and shipped long distances', 'Small fermentation plants built next to big food factories, delivering by short truck trips: less transport, more capital per plant'] },
      10: { move: `Remove: ${c[0]}`, idea: 'Without collecting milk from farms, herds, cooling and daily collection rounds disappear; fermentation tanks do the work, so emissions and seasonal swings fall.' },
      11: { input: 'Materials', pair: ['Raw milk from thousands of dairy farms, bought daily', 'Sugar from beet or by-products of other food factories, fed to microorganisms: steadier supply, far lower emissions per tonne of protein'] },
      12: { type: 'A competitor', deal: ['A large dairy cooperative', 'Its food-brand customers, plants and regulatory experience', 'A licence to our fermentation strains and a share of the margin'] },
      13: { needs: 'Other recipe ingredients, flavours, and application advice from food scientists', idea: 'With a flavour house, we offer ready recipe kits combining our protein and its flavours; food makers launch products faster, and the flavour house sells more.' },
      14: { resource: r[2], vrio: [VRIO.v, VRIO.i, VRIO.o], idea: 'We open an application lab where food brands co-develop new products with our scientists: a paid service built on decades of relationships and recipe knowledge.' },
    },
    aeolus: {
      p: 3,
      a: 8,
      promise: 'food brands can sell real dairy taste to the vegan and lactose-intolerant consumers who avoid milk today',
      enabler: 'precision fermentation replaces milk collection: microorganisms make whey from sugar',
      link: 'Only fermentation makes a whey identical to milk’s without any animal or lactose, so brands can put real dairy taste in products for people who refuse dairy.',
      who: 'food brands serving vegan and lactose-intolerant consumers',
      gain: 'ghg',
    },
    lemnos: {
      name: 'Cowless Whey',
      pitch: 'For food brands that want dairy taste without cows, Cowless Whey offers milk-identical protein brewed by fermentation, unlike Troy, because it needs no herd, no seasons and far fewer emissions.',
      curve: [5, 2, 5, 4, 4],
      added: [{ name: 'Price stability', level: 5 }],
      chain: ['Buy sugar from beet and food by-products', 'Brew whey by precision fermentation', 'Separate, dry and package the protein', 'Co-develop recipes with food brands', 'Ship from plants next to food factories'],
      price: 'A fixed price per tonne about 30% above dairy whey, on three-year contracts that do not follow milk markets',
      zone: 'high-end',
      indicators: { revenue: '+', costs: '-', capital: '-', ghg: '+', pollutants: '+', resources: '+', employability: '-', quality: '+', fairness: '0' },
      antagonism: 'Fermentation plants need heavy capital and cut emissions, but they also threaten the income of the dairy farmers who supply us today.',
    },
    olympus: {
      god: 'hestia',
      hypotheses: {
        p: 'Food brands will pay 30% more per tonne for animal-free whey',
        a: 'Fermentation yields can reach a cost per tonne within 30% of dairy whey',
        c: 'Partner farms can earn as much growing sugar crops as supplying milk',
      },
      riskiest: 'p',
      answer: 'Dairy farmers lose a buyer. We would phase the shift over ten years, offer partner farms contracts to grow the sugar crops we ferment, and share part of the margin with them.',
      assumption: 'Food brands will pay 30% more per tonne for animal-free whey',
      mvp: 'Send 20 kg samples and a price sheet to 15 ice-cream brands, then offer a pilot contract',
      stake: '3 of the 15 brands sign a paid pilot order at the higher price',
    },
  }
}

function tyres(v: Voyage): Demo {
  const c = v.chain!
  const r = v.resources!
  return {
    landings: {
      1: {
        costs: ['Comparing tyre offers and negotiating with distributors', 'Pressure checks, regrooving and fuel lost on under-inflated tyres', 'Breakdowns, trucks off the road and disposing of worn casings'],
        idea: 'We fold fitting, checks, regrooving and retreading into one price, so fleets stop paying for downtime and early replacements; in exchange they give up choosing their own garage.',
      },
      2: { stage: 'Maintaining and fixing', idea: 'Instead of fleet managers organising tyre checks, our technicians inspect every truck at its depot each month; this costs us a national team of technicians and vans.' },
      3: { barrier: 'They can’t access or use it (skills, place, time)', idea: 'Small hauliers with ten trucks have no tyre specialist, so they run cheap tyres until they fail; a ready tyre-care package sold with the truck by their dealer removes the barrier.' },
      4: { idea: 'Fleets buy tyres for pure function; for older trucks we strip it back further: certified retreaded tyres at half the price, sold on reliability rather than brand.', lower: 'Fuel efficiency' },
      5: { job: 'Keeping trucks rolling safely at the lowest cost per kilometre', idea: 'Like aircraft engine makers, who sell engine hours with maintenance included, we would sell kilometres with tyre care included; and we would stop selling tyres one by one through distributors.' },
      6: { who: 'Telematics software providers', sides: ['Tyre alerts inside the fleet software they already use', 'Richer data and a new paid module for their clients', 'Fleets pay the provider; we pay it per truck connected'] },
      7: { model: 'Pay per use', idea: 'We charge transport companies a fee per kilometre driven, billed monthly; they prefer it because tyre costs become predictable and follow their revenue, while we carry the risk of early wear.' },
      8: { step: c[3], idea: 'At fitting, we add pressure and wear sensors to every tyre, so fleets get alerts before a blowout and we bill exact kilometres, cutting breakdowns and fuel lost to under-inflation.' },
      9: { step: c[2], pair: ['Distributors sell tyres one by one to fleets, competing on price per tyre', 'Multi-year contracts signed directly with fleets, with distributors paid as service partners: costlier to run, but we keep the customer'] },
      10: { move: 'Add: take back and recycle', idea: 'With this new step, we collect every worn casing at the depot and retread it twice before recycling; fleets pay nothing extra because the retreads cut our own tyre costs.' },
      11: { input: 'Data', pair: ['Tyre performance known only from lab tests and occasional complaints', 'Live sensor data from thousands of trucks: we learn how tyres really wear, design better ones and price contracts more accurately'] },
      12: { type: 'A client', deal: ['A large European logistics group', 'Thousands of trucks and real road data to test the service', 'A lower, guaranteed cost per kilometre and priority technicians'] },
      13: { needs: 'Fuel, truck maintenance, insurance and fleet-management software', idea: 'With a truck insurer, we share our tyre-health data; fleets get lower premiums for fewer tyre-related accidents, and the insurer cuts its claims.' },
      14: { resource: r[0], vrio: [VRIO.v, VRIO.r, VRIO.i], idea: 'We sell our wear-prediction models and regrooving know-how to bus and mining fleets: a new customer group for expertise built to make our own tyres last longer.' },
    },
    aeolus: {
      p: 7,
      a: 8,
      promise: 'one predictable fee per kilometre driven, with tyre care included',
      enabler: 'pressure and wear sensors fitted to every tyre at the garage',
      link: 'Sensors measure exact kilometres and wear, so we can bill per kilometre fairly and act before a tyre fails, which keeps the price per kilometre profitable for us.',
      who: 'transport companies',
      gain: 'resources',
    },
    lemnos: {
      name: 'Kilometre Keeper',
      pitch: 'For European truck fleets, Kilometre Keeper sells kilometres instead of tyres: one predictable fee per kilometre, with sensors and our technicians doing the rest, unlike Troy, because we keep the tyres.',
      curve: [4, 5, 5, 5, 4],
      chain: ['Research and design tyres with sensors', 'Manufacture tyres', 'Sign multi-year contracts directly with fleets', 'Fit tyres and sensors at partner garages', 'Monitor wear remotely and inspect at depots', 'Retread twice, then recycle'],
      price: 'A fee per kilometre driven, billed monthly, with fitting, checks and retreading included',
      zone: 'game-changing',
      indicators: { revenue: '+', costs: '-', capital: '-', ghg: '+', pollutants: '0', resources: '+', employability: '+', quality: '+', fairness: '0' },
      antagonism: 'Owning the tyres ties up far more capital, while the environmental gains only come if fleets stay for years and we retread every casing.',
    },
    olympus: {
      god: 'hermes',
      hypotheses: {
        p: 'Fleet managers will trust a supplier to own and manage their tyres',
        a: 'Sensors can measure kilometres and wear reliably enough to bill on them',
        c: 'Retreading each casing twice cuts our tyre costs by at least a quarter',
      },
      riskiest: 'p',
      answer: 'Fleets give up control of tyre buying, but they already outsource maintenance and hate unpredictable costs; a fixed price per kilometre is easier to budget and to pass on to their own clients.',
      assumption: 'Fleet managers will trust a supplier to own and manage their tyres',
      mvp: 'A manual three-month pilot with three mid-size fleets in Lyon, billed per kilometre from odometer readings',
      stake: '2 of the 3 fleets sign a 12-month contract at the pilot price',
    },
  }
}

const BUILDERS: Record<string, (v: Voyage) => Demo> = { phone, luxury, dairy, tyres }

// Drafts keyed like the in-game forms: land1..land14, aeolus, lemnos, olympus
export function demoDrafts(v: Voyage): Record<string, unknown> {
  const build = BUILDERS[v.id]
  if (!build || !v.chain) return {}
  const d = build(v)
  const drafts: Record<string, unknown> = {}
  Object.entries(d.landings).forEach(([id, a]) => (drafts[`land${id}`] = a))
  drafts.aeolus = { ...d.aeolus, sentence: '' }
  drafts.lemnos = d.lemnos
  drafts.olympus = d.olympus
  return drafts
}
