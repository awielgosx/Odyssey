// Practice voyages: each starts from the conventional business ("Troy") with no hint of the real innovation.
// At Ithaca, Tiresias reveals what the real company did. Texts are paraphrased summaries.

export interface Attribute {
  name: string
  level: number // 1-5, from the customer's point of view
}

export interface Voyage {
  id: string
  ship: string // ship name shown in the HUD
  title: string // the conventional business the player starts from
  blurb: string
  offer: string
  user: string
  decider: string
  payer: string
  price: string
  attributes: Attribute[]
  chain?: string[] // value chain steps, prefilled at the Narrows for demo ships
  resources?: string[]
  partners?: string
  recommended: number[]
  reveal?: { company: string; directions: number[]; text: string }
}

export const VOYAGES: Voyage[] = [
  {
    id: 'phone',
    ship: 'The Handset',
    title: 'A mainstream smartphone maker',
    blurb: 'You sell new phones every year. Customers replace them every two to three years.',
    offer: 'Premium smartphones sold outright, with a new model every year',
    user: 'Consumers',
    decider: 'Consumers',
    payer: 'Consumers (often through a carrier plan)',
    price: 'High upfront price, about €800',
    attributes: [
      { name: 'Raw performance', level: 5 },
      { name: 'Newest features every year', level: 5 },
      { name: 'Ease of repair', level: 1 },
      { name: 'Ethical sourcing', level: 1 },
      { name: 'Years of software support', level: 2 },
    ],
    chain: ['Design hardware and software', 'Source components', 'Assemble in contract factories', 'Sell through carriers and stores', 'Repair in after-sales centres'],
    resources: ['Brand', 'Chip and software design know-how', 'Global supply contracts'],
    partners: 'Component suppliers, contract manufacturers, mobile carriers',
    recommended: [4, 7, 10, 11],
    reveal: {
      company: 'Fairphone',
      directions: [4, 10, 11, 7],
      text: 'Fairphone designs modular phones anyone can repair with a screwdriver, sources materials responsibly, promises long software support and offers leasing that gets cheaper the longer you keep the phone. It gives up top performance to win on pride, durability and lower environmental impact.',
    },
  },
  {
    id: 'luxury',
    ship: 'The Silk Square',
    title: 'A luxury house that destroys its flawed materials',
    blurb: 'Your standards are so high that precious materials with tiny defects are rejected, and often destroyed.',
    offer: 'Leather goods, silk and crystal sold in flagship stores',
    user: 'Wealthy clients',
    decider: 'Wealthy clients',
    payer: 'Wealthy clients',
    price: 'Very high, set by craftsmanship and brand',
    attributes: [
      { name: 'Craftsmanship', level: 5 },
      { name: 'Brand prestige', level: 5 },
      { name: 'Uniqueness of each piece', level: 2 },
      { name: 'Environmental responsibility', level: 1 },
      { name: 'Surprise and playfulness', level: 1 },
    ],
    chain: ['Source precious materials', 'Craft in in-house workshops', 'Quality control: reject flawed pieces', 'Sell in flagship stores', 'Client service and repairs'],
    resources: ['Artisans’ know-how', 'Brand prestige', 'Stock of rare materials'],
    partners: 'Tanneries, silk weavers, crystal makers',
    recommended: [4, 5, 11, 14],
    reveal: {
      company: 'Hermès Petit h',
      directions: [11, 4, 14],
      text: 'Petit h gives rejected materials to artists and craftspeople who turn them into one-off, playful objects, sold in rare exhibitions and one small shop. Waste becomes the input, rarity drives the price, and the brand’s know-how is reused.',
    },
  },
  {
    id: 'dairy',
    ship: 'The Milk Run',
    title: 'A dairy protein supplier',
    blurb: 'You sell whey protein from cow’s milk to food companies. Demand for animal-free food is growing.',
    offer: 'Whey and casein ingredients from dairy farms, sold in bulk',
    user: 'Food manufacturers',
    decider: 'Food manufacturers’ R&D and purchasing',
    payer: 'Food manufacturers',
    price: 'Commodity price per tonne',
    attributes: [
      { name: 'Familiar taste and texture', level: 5 },
      { name: 'Price per tonne', level: 4 },
      { name: 'Animal-free', level: 1 },
      { name: 'Low carbon footprint', level: 1 },
      { name: 'Free of lactose and residues', level: 2 },
    ],
    chain: ['Collect milk from dairy farms', 'Separate and filter whey', 'Dry and package the powder', 'Sell in bulk to food makers', 'Ship by the tonne'],
    resources: ['Processing plants', 'Food-safety certifications', 'Long relationships with food brands'],
    partners: 'Dairy farmers and cooperatives, logistics firms',
    recommended: [3, 8, 11, 14],
    reveal: {
      company: 'Perfect Day',
      directions: [8, 11, 14],
      text: 'Perfect Day produces milk-identical whey protein by precision fermentation from plant sugars, with far lower emissions and water use. It sells the ingredient to food brands and licenses its fermentation know-how.',
    },
  },
  {
    id: 'tyres',
    ship: 'The Long Haul',
    title: 'A premium tyre maker selling to truck fleets',
    blurb: 'Your truck tyres last longest, but only if they are maintained well. Cheap imports are undercutting you.',
    offer: 'Premium truck tyres sold through distributors',
    user: 'Truck drivers',
    decider: 'Fleet managers',
    payer: 'Transport companies',
    price: 'About €400 per tyre, versus €250 for imports',
    attributes: [
      { name: 'Tyre lifespan', level: 5 },
      { name: 'Upfront price', level: 2 },
      { name: 'Ease of maintenance', level: 2 },
      { name: 'Predictable costs', level: 2 },
      { name: 'Fuel efficiency', level: 4 },
    ],
    chain: ['Research and design tyres', 'Manufacture tyres', 'Sell through distributors', 'Fit tyres at garages', 'Retread or scrap worn tyres'],
    resources: ['Tyre technology and patents', 'Brand reputation', 'European factory network'],
    partners: 'Distributors, independent garages',
    recommended: [2, 7, 13, 14],
    reveal: {
      company: 'Michelin Fleet Solutions',
      directions: [7, 2, 13, 14],
      text: 'Michelin offered to manage fleets’ tyres entirely and charge per kilometre driven. The fleet gets predictable costs and no hassle, while Michelin captures the value of its long-lasting, regroovable tyres. It needed more capital and clashed with its own product sales force.',
    },
  },
  {
    id: 'own',
    ship: 'Your ship',
    title: 'Your own business or project',
    blurb: 'Bring a real business, a startup idea or a company you know well.',
    offer: '',
    user: '',
    decider: '',
    payer: '',
    price: '',
    attributes: [
      { name: '', level: 3 },
      { name: '', level: 3 },
      { name: '', level: 3 },
      { name: '', level: 3 },
      { name: '', level: 3 },
    ],
    recommended: [],
  },
]

export const voyageById = (id: string) => VOYAGES.find((v) => v.id === id) ?? VOYAGES[0]
