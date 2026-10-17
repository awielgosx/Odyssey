// The 14 directions of Odyssey 3.14, using the course's names and numbering.
// All teaching text is paraphrased for this tool, not copied from the book.

export type Pillar = 'proposition' | 'architecture'

export type Landmark =
  | 'amphora'
  | 'stoa'
  | 'lighthouse'
  | 'theatre'
  | 'agora'
  | 'bridge'
  | 'treasury'
  | 'forge'
  | 'mill'
  | 'stairs'
  | 'grove'
  | 'circle'
  | 'twins'
  | 'mine'

export interface Quiz {
  question: string
  options: string[] // first option is correct; shuffled at display time
  why: string
}

// Option lists that come from the student's own Troy and Narrows answers
export type Source = 'attributes' | 'chain' | 'resources' | 'cutAdd'

export type Step =
  | { kind: 'pick'; id: string; label: string; options?: string[]; source?: Source }
  | { kind: 'text'; id: string; label: string; min: number; max: number; placeholder?: string; short?: boolean }
  | { kind: 'slots'; id: string; label: string; slots: { label: string; placeholder?: string }[]; min: number }
  | { kind: 'signs'; id: string; label: string }
  | { kind: 'checks'; id: string; label: string; options: string[] }

export interface Direction {
  id: number
  pillar: Pillar
  name: string
  short: string
  landmark: Landmark
  definition: string
  caseTitle: string
  caseText: string
  quiz: Quiz
  // the island's own task: one or two questions that walk through this direction's logic
  steps: Step[]
  main: string // the step whose answer summarises the idea (for Aeolus and the log)
  lens: string // the follow-up thinking this island trains, for the coach
  questions: string[]
  lexicon: string[]
}

export const JOURNEY = ['Finding and choosing', 'Buying and paying', 'Delivery and set-up', 'Using it day to day', 'Maintaining and fixing', 'Replacing or disposing']

export const DIRECTIONS: Direction[] = [
  {
    id: 1,
    pillar: 'proposition',
    name: 'Reduce customer overall costs',
    short: 'Lower total cost',
    landmark: 'amphora',
    definition: 'Cut what the customer pays in total over the life of the offer (buying, using, maintaining, replacing), not only the price tag.',
    caseTitle: 'Embrace infant warmer',
    caseText:
      'A hospital incubator costs around $20,000, and the bigger burden comes after purchase: stable electricity, a hospital setting and trained staff, which rural clinics lack. Embrace is a sleeping-bag warmer with a wax pouch that is heated in minutes and holds body temperature for hours, at roughly 1% of the cost.',
    quiz: {
      question: 'Which move is direction 1, rather than a simple price cut?',
      options: [
        'A printer that costs more to buy but whose ink costs a tenth as much per page',
        'A printer 20% cheaper to buy, with ink cartridges priced higher to compensate',
        'A printer billed per page printed instead of bought outright',
        'A printer with a premium colour mode for the same price',
      ],
      why: 'Direction 1 looks at total cost over the life of the offer. The cheaper printer with dear ink lowers the entry price but raises the total. Paying per page changes how the customer pays (direction 7), not necessarily how much.',
    },
    steps: [
      {
        kind: 'slots',
        id: 'costs',
        label: 'What does the Troy customer really pay, in money, time or effort?',
        min: 2,
        slots: [
          { label: 'Before buying', placeholder: 'e.g. comparing, installing, training' },
          { label: 'While using', placeholder: 'e.g. energy, consumables, downtime' },
          { label: 'After', placeholder: 'e.g. repairs, replacement, disposal' },
        ],
      },
      {
        kind: 'text',
        id: 'idea',
        label: 'Shrink the biggest of these. What do you strip out or redesign, and what does the customer give up in exchange?',
        min: 8,
        max: 40,
        placeholder: 'We remove … so the customer no longer pays for …; in exchange they accept …',
      },
    ],
    main: 'idea',
    lens: 'Total cost of ownership and the trade-off: what the customer gives up so the total falls.',
    questions: [
      'Which costs does your customer carry before, during and after buying?',
      'What could you strip out of the offer so the total cost falls?',
      'What does the customer give up in exchange, and will they accept it?',
    ],
    lexicon: ['cheaper', 'cost', 'price', 'free', 'strip', 'save', 'saving', 'lower', 'budget', 'maintenance', 'upkeep', 'total', 'affordable', 'remove', 'instead'],
  },
  {
    id: 2,
    pillar: 'proposition',
    name: 'Reduce customer hassles',
    short: 'Remove the hassle',
    landmark: 'stoa',
    definition: 'Find the chores, delays and pain points around your offer, and take them off the customer.',
    caseTitle: 'Michelin Fleet Solutions',
    caseText:
      'Fleet managers had to buy, inspect, regroove, retread and replace tyres across a whole network of trucks. From 2000, Michelin offered to take over the entire tyre job and bill per kilometre driven. The chore moved to Michelin, and so did the cost and the risk: if tyres wear out early or are badly driven on, Michelin pays.',
    quiz: {
      question: 'Before taking a hassle off its customers, what must a supplier check first in its own value architecture?',
      options: [
        'That it can do the chore cheaper or better than the customer, since it now carries that cost and risk',
        'That customers will accept a higher list price for the core product',
        'That no competitor already sells a product of the same quality',
        'That its product specifications can be improved before launch',
      ],
      why: 'A hassle never disappears: it moves. Removing it from the customer (proposition) means someone in your architecture absorbs it, with its cost and risk. Michelin Fleet Solutions had to learn to price that risk.',
    },
    steps: [
      { kind: 'pick', id: 'stage', label: 'Where in the customer’s journey is the worst hassle?', options: JOURNEY },
      {
        kind: 'text',
        id: 'idea',
        label: 'Take that hassle off the customer. Who carries it now (you, a partner, a machine), and what does that cost you?',
        min: 8,
        max: 40,
        placeholder: 'Instead of the customer …, we … ; this costs us …',
      },
    ],
    main: 'idea',
    lens: 'The hassle moves into the value architecture: who absorbs it, and at what cost or risk.',
    questions: [
      'What else does your customer have to buy or do to make your offer work?',
      'Where does using it get frustrating, slow or complicated?',
      'If you take that chore over, who in your organisation does it, and what does it cost?',
    ],
    lexicon: ['hassle', 'easy', 'simple', 'convenient', 'deliver', 'handle', 'manage', 'one-stop', 'pain', 'chore', 'automatic', 'faster', 'no need', 'instead', 'we take'],
  },
  {
    id: 3,
    pillar: 'proposition',
    name: 'Find non-customers',
    short: 'Look beyond customers',
    landmark: 'lighthouse',
    definition: 'Look at the people who ignore or refuse your industry’s offer, and find the barrier that keeps them away.',
    caseTitle: 'Grameen Bank',
    caseText:
      'Banks would not lend to Bangladesh’s rural poor: tiny loans, no collateral, no credit history. Grameen lent small sums to groups of five borrowers, mostly women, who vouched for each other and met weekly. Peer pressure replaced collateral, and repayment rates were reported above those of conventional banks.',
    quiz: {
      question: 'Most adults never join a gym because they feel intimidated and judged there. Which response targets these non-customers?',
      options: [
        'A no-frills, “judgement-free” gym with simple machines and a low monthly fee',
        'More personal trainers and premium equipment for current members',
        'A discount for members who renew for two years',
        'A bigger advertising campaign for the existing gyms',
      ],
      why: 'Non-customers stay away because of a barrier, here fear of being judged. Serving current members better or shouting louder leaves the barrier intact; redesigning the offer removes it.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'barrier',
        label: 'Why do some people stay away from offers like Troy’s?',
        options: ['They can’t afford it', 'They can’t access or use it (skills, place, time)', 'They dislike how it is done today', 'They never thought it was for them'],
      },
      {
        kind: 'text',
        id: 'idea',
        label: 'Name that group, what they do instead today, and the one change that removes their barrier.',
        min: 10,
        max: 45,
        placeholder: '[Group] currently …; we remove the barrier by …',
      },
    ],
    main: 'idea',
    lens: 'Barrier analysis: the specific barrier that excludes a named group, and what they use instead.',
    questions: [
      'Who could use this kind of offer but ignores or refuses it?',
      'What do they do instead, and what does that cost them?',
      'What exactly would have to change for them to say yes?',
    ],
    lexicon: ['non-customer', 'excluded', 'never', 'refuse', 'ignore', 'segment', 'students', 'elderly', 'rural', 'first-time', 'access', 'reach', 'barrier', 'instead', 'currently'],
  },
  {
    id: 4,
    pillar: 'proposition',
    name: 'Add more functionality or more emotion',
    short: 'Function or emotion',
    landmark: 'theatre',
    definition: 'Decide whether people buy your offer for what it does or for how it feels, then add one, or strip back to the other.',
    caseTitle: 'Fairphone',
    caseText:
      'Fairphone does not try to win on processor speed or camera. Its phones are modular (a battery or screen swaps out with a screwdriver), use responsibly sourced materials and get years of software support. Buyers accept weaker specifications for something they can be proud of and keep for a long time.',
    quiz: {
      question: 'Why can Fairphone sell weaker specifications at a mid-range price?',
      options: [
        'Its buyers weight pride and repairability above the attributes it lowered, so perceived value holds',
        'Its production costs are far lower, so it can undercut the flagship brands',
        'Specifications no longer matter to any smartphone buyer',
        'Mobile operators subsidise it to meet regulations',
      ],
      why: 'Perceived value depends on what a segment cares about. Emotion can compensate for lowered function, but only for buyers who weight it. For a gamer chasing performance, the same curve would be non-viable.',
    },
    steps: [
      {
        kind: 'text',
        id: 'idea',
        label: 'Is Troy bought for what it does or for how it makes people feel? Add one emotional element (or strip it back to pure function): what do you raise or create?',
        min: 8,
        max: 40,
        placeholder: 'Customers buy it for …; we raise / create … by …',
      },
      { kind: 'pick', id: 'lower', label: 'Not everything can be better. Which Troy attribute do you deliberately lower to pay for it?', source: 'attributes' },
    ],
    main: 'idea',
    lens: 'The value curve trade-off: an attribute raised or created, and one deliberately lowered.',
    questions: [
      'Is your offer bought for what it does, or for how it makes people feel?',
      'What positive emotion could you add to a functional offer?',
      'Which attribute could you lower without your target customers caring?',
    ],
    lexicon: ['emotion', 'feel', 'pride', 'experience', 'design', 'beautiful', 'story', 'community', 'status', 'function', 'feature', 'basic', 'stripped', 'fun', 'personal'],
  },
  {
    id: 5,
    pillar: 'proposition',
    name: 'Explore other segments or industries',
    short: 'Borrow from elsewhere',
    landmark: 'agora',
    definition: 'Borrow the codes, rules or features of another segment or industry that solves a similar problem.',
    caseTitle: 'Cirque du Soleil',
    caseText:
      'In the 1980s the circus was shrinking: animal acts were costly and criticised, and children were its only audience. Cirque du Soleil dropped the animals and star clowns, and borrowed storylines, original music, choreography and staging from theatre. Adults came, and paid theatre prices.',
    quiz: {
      question: 'Cirque du Soleil charges several times a classic circus ticket. Why does that work?',
      options: [
        'Having borrowed theatre’s codes, it is compared with a night at the theatre, not with the circus',
        'Its animal acts were more spectacular than any competitor’s',
        'It targeted children, who are the least price-sensitive audience',
        'It kept costs low by touring only small towns',
      ],
      why: 'Borrowing from another industry changes the reference point customers judge value and price against. Dropping the animals also cut one of the circus’s biggest costs.',
    },
    steps: [
      { kind: 'text', id: 'source', label: 'Another industry or segment that does a similar job well', min: 1, max: 8, short: true, placeholder: 'e.g. theatre, airlines, video games, hotels' },
      {
        kind: 'text',
        id: 'idea',
        label: 'Which specific rule or feature do you borrow from it, and which Troy habit do you drop, as Cirque dropped the animals?',
        min: 10,
        max: 45,
        placeholder: 'We borrow … from …, and drop …',
      },
    ],
    main: 'idea',
    lens: 'Borrow one specific code and eliminate one industry habit; the new reference point for price.',
    questions: [
      'Which other industry solves a similar problem better?',
      'Which precise rule or feature would you borrow, not just the "spirit"?',
      'Which habit of your industry would you drop to make room for it?',
    ],
    lexicon: ['borrow', 'like', 'inspired', 'industry', 'segment', 'hotel', 'airline', 'gaming', 'subscription', 'theatre', 'luxury', 'retail', 'drop', 'apply', 'from'],
  },
  {
    id: 6,
    pillar: 'proposition',
    name: 'Introduce other stakeholders',
    short: 'Bring in a third party',
    landmark: 'bridge',
    definition: 'Connect your customers with another group who needs them, or let someone else own the assets.',
    caseTitle: 'BlaBlaCar',
    caseText:
      'BlaBlaCar owns no cars and employs no drivers. It matches drivers who have empty seats on long trips with passengers who share the fuel cost, and takes a service fee. Its real work is trust between strangers: verified profiles, ratings and reviews.',
    quiz: {
      question: 'Which problem must BlaBlaCar solve that a coach company never faces?',
      options: [
        'Getting enough drivers and passengers at the same time, and making strangers trust each other',
        'Buying, insuring and maintaining a fleet of vehicles',
        'Recruiting and training professional drivers',
        'Securing slots at bus stations in every city',
      ],
      why: 'Bringing in a new stakeholder creates two sides to win at once (the chicken-and-egg problem) and two value curves to manage. The coach company has the opposite problems: it owns the assets.',
    },
    steps: [
      { kind: 'text', id: 'who', label: 'The new stakeholder you bring in (a specific group)', min: 2, max: 10, short: true, placeholder: 'e.g. retirees with spare time, local farmers' },
      {
        kind: 'slots',
        id: 'sides',
        label: 'Two sides, one deal',
        min: 2,
        slots: [
          { label: 'What Troy’s customers gain', placeholder: '' },
          { label: 'What the new group gains', placeholder: '' },
          { label: 'Who pays whom', placeholder: 'e.g. passengers pay drivers, we take 15%' },
        ],
      },
    ],
    main: 'sides',
    lens: 'Two-sided logic: what each side gains, the money flow, and the chicken-and-egg or trust problem.',
    questions: [
      'Who would benefit from being connected to your customers?',
      'What does each side gain, and who pays whom?',
      'Which side do you need first, and how do you get it?',
    ],
    lexicon: ['platform', 'marketplace', 'connect', 'third party', 'partner', 'hosts', 'drivers', 'sellers', 'two-sided', 'intermediary', 'community', 'owners', 'match', 'network', 'pay'],
  },
  {
    id: 7,
    pillar: 'proposition',
    name: 'Modify the revenue stream',
    short: 'Change how you get paid',
    landmark: 'treasury',
    definition: 'Change how money flows: pay per use, subscription, pay for results, or a third party who pays instead of the user.',
    caseTitle: 'JCDecaux',
    caseText:
      'In 1964, cities wanted bus shelters but had no budget. JCDecaux offered to install and clean them for free, in exchange for the right to rent their poster panels to advertisers. Commuters get shelter, the city pays nothing, and advertisers fund it all.',
    quiz: {
      question: 'Map the JCDecaux model: who is the user, who decides, and who pays?',
      options: [
        'User: commuters. Decision-maker: the city. Payer: advertisers',
        'User: the city. Decision-maker: advertisers. Payer: commuters',
        'User: commuters. Decision-maker: commuters. Payer: the city',
        'User: advertisers. Decision-maker: the city. Payer: the city',
      ],
      why: 'Three different actors. Once you separate user, decision-maker and payer, a third-party payer becomes an obvious lever.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'model',
        label: 'Which revenue model do you try?',
        options: ['Pay per use', 'Subscription', 'Pay for results', 'Freemium', 'A third party pays', 'Rent or lease', 'Commission on transactions'],
      },
      {
        kind: 'text',
        id: 'idea',
        label: 'What exactly is charged, when, and to whom? Is the payer still the user, and why would they prefer this to Troy’s price?',
        min: 10,
        max: 45,
        placeholder: 'We charge … per … to …; they prefer it because …',
      },
    ],
    main: 'idea',
    lens: 'User, decision-maker and payer after the change, and why the payer prefers the new money flow.',
    questions: [
      'Could the customer pay differently: per use, subscription, by result?',
      'Which third party might fund part of the offer?',
      'Who carries the risk under the new model, you or the customer?',
    ],
    lexicon: ['subscription', 'per use', 'pay per', 'rent', 'lease', 'advertis', 'commission', 'fee', 'monthly', 'pay-as', 'result', 'share of savings', 'sponsor', 'freemium', 'payer'],
  },
  {
    id: 8,
    pillar: 'architecture',
    name: 'Introduce a technology',
    short: 'Bring in a technology',
    landmark: 'forge',
    definition: 'Bring a technology from your industry or another one into a specific step of how you build and deliver.',
    caseTitle: 'Perfect Day',
    caseText:
      'Perfect Day makes whey protein identical to milk’s without cows: microorganisms programmed by precision fermentation produce it from sugar. It mainly sells the ingredient to food brands, which keep their recipes and taste, while emissions and water use fall sharply.',
    quiz: {
      question: 'Perfect Day sells its protein to food brands rather than launching a consumer dairy brand. Why does that choice help the technology spread?',
      options: [
        'Food brands keep a familiar ingredient and recipe; only the upstream chain changes, so adoption is easier',
        'It avoids having to explain fermentation to regulators',
        'Food brands pay more per kilo than consumers do',
        'It removes the need for any partners in the value chain',
      ],
      why: 'The technology rebuilds one part of the architecture (inputs and production) while the proposition to the next actor stays familiar. Less change for the customer means faster adoption.',
    },
    steps: [
      { kind: 'pick', id: 'step', label: 'Where in your value chain does the technology go?', source: 'chain' },
      {
        kind: 'text',
        id: 'idea',
        label: 'Which technology (from your industry or another), what does it do at that step, and what changes for the customer, not just for you?',
        min: 10,
        max: 45,
        placeholder: 'At …, we use … so that the customer …',
      },
    ],
    main: 'idea',
    lens: 'A named technology at one value-chain step, and its knock-on effect on the value proposition.',
    questions: [
      'Which technology do competitors or other industries use that you do not?',
      'At which exact step of your chain would it act?',
      'What would the customer notice? If nothing, why bother?',
    ],
    lexicon: ['app', 'ai', 'sensor', 'data', 'algorithm', 'platform', 'iot', 'automation', 'robot', '3d', 'blockchain', 'software', 'digital', 'fermentation', 'online', 'technology'],
  },
  {
    id: 9,
    pillar: 'architecture',
    name: 'Modify one or several steps in the value chain',
    short: 'Redesign a step',
    landmark: 'mill',
    definition: 'Take one activity in your value chain and carry it out in a radically different way.',
    caseTitle: 'Nickel',
    caseText:
      'Opening a French bank account used to mean a branch appointment and income checks. Since 2014, Nickel opens an account in about five minutes at a tobacconist’s counter, with an ID and a phone number, for a small yearly fee. Tobacconists earn a commission; BNP Paribas bought Nickel in 2017.',
    quiz: {
      question: 'Redesigning one step forces changes elsewhere. What did Nickel give up so that five-minute opening at a tobacconist could work?',
      options: [
        'Overdrafts and credit, so it carries no lending risk and needs no credit check',
        'Payment cards, so it has nothing to post to customers',
        'Customers without a regular income',
        'Its banking licence, to escape regulation',
      ],
      why: 'Without credit there is no risk to assess, so a tobacconist can open the account in minutes. The redesigned step (distribution) only works because the proposition was narrowed too.',
    },
    steps: [
      { kind: 'pick', id: 'step', label: 'Which step do you reinvent?', source: 'chain' },
      {
        kind: 'slots',
        id: 'pair',
        label: 'Before and after',
        min: 3,
        slots: [
          { label: 'How it is done today (who, where, how)', placeholder: '' },
          { label: 'The radically different way, and what it costs or saves', placeholder: '' },
        ],
      },
    ],
    main: 'pair',
    lens: 'A radical (not incremental) change to one step, its cost, and what else must change to make it work.',
    questions: [
      'What are the main activities in your value chain?',
      'Which step could be done in a radically different way, not just faster?',
      'What else must change in your model for that new step to work?',
    ],
    lexicon: ['step', 'process', 'distribution', 'production', 'sourcing', 'sales', 'logistics', 'redesign', 'instead of', 'value chain', 'manufactur', 'store', 'channel', 'design'],
  },
  {
    id: 10,
    pillar: 'architecture',
    name: 'Eliminate or add one or more steps to the value chain',
    short: 'Cut or add a step',
    landmark: 'stairs',
    definition: 'Remove a step (who does it instead?) or add one, such as repair, reuse or recycling.',
    caseTitle: 'Desso carpets',
    caseText:
      'Desso, now part of Tarkett, redesigned its carpet tiles following Cradle to Cradle principles and added a take-back step: used tiles return to the factory, where yarn and backing are separated and fed back into production instead of going to landfill.',
    quiz: {
      question: 'Desso adds take-back and recycling. Which effect on contributions is most realistic?',
      options: [
        'Use of scarce resources and waste fall, but Desso must organise and pay for reverse logistics',
        'Revenue rises immediately and no new costs appear',
        'Nothing changes for the environment; only the marketing improves',
        'Costs fall to zero because the recycled material is free',
      ],
      why: 'An added step is never free: environmental contributions improve, while financial ones face new costs (collection, sorting) that must be offset by cheaper inputs or a price premium.',
    },
    steps: [
      { kind: 'pick', id: 'move', label: 'Remove a step of your chain, or add a new one', source: 'cutAdd' },
      {
        kind: 'text',
        id: 'idea',
        label: 'If removed: who does it instead, or why is it no longer needed? If added: what does it create, and who pays for it?',
        min: 8,
        max: 40,
      },
      { kind: 'signs', id: 'contrib', label: 'What happens to the three contributions?' },
    ],
    main: 'idea',
    lens: 'Contributions: the financial, environmental and societal effects of the cut or added step, including a cost.',
    questions: [
      'What is each step really for? What happens if you remove it?',
      'What step could you add: repair, reuse, recycling?',
      'Which contribution gets worse, or costs more, because of this?',
    ],
    lexicon: ['remove', 'eliminate', 'cut', 'skip', 'add', 'repair', 'reuse', 'recycle', 'take back', 'refurbish', 'second hand', 'self-service', 'middleman', 'direct'],
  },
  {
    id: 11,
    pillar: 'architecture',
    name: 'Identify new inputs',
    short: 'Find new inputs',
    landmark: 'grove',
    definition: 'Find new sources for what you depend on: materials, money, expertise or ideas, including what others throw away.',
    caseTitle: 'Hermès Petit h',
    caseText:
      'Hermès rejects precious leather, silk and porcelain for the slightest flaw. Since 2010, Petit h gives these offcuts to artists and craftspeople, who turn them into one-off objects sold in a few pop-up exhibitions around the world.',
    quiz: {
      question: 'Why does Petit h strengthen rather than dilute the Hermès brand, even though its input is waste?',
      options: [
        'Craftsmanship and uniqueness turn rejects into rare objects, so the luxury promise holds',
        'It sells the offcuts cheaply through outlet stores',
        'It replaces the core collections with recycled ones',
        'It uses synthetic substitutes that look like leather',
      ],
      why: 'A new input only works if the proposition stays coherent. Here waste plus the brand’s know-how produces rarity, which is exactly what luxury sells.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'input',
        label: 'Which input of Troy do you rethink?',
        options: ['Materials', 'Energy', 'Money and funding', 'Labour and skills', 'Ideas and content', 'Data'],
      },
      {
        kind: 'slots',
        id: 'pair',
        label: 'Old source, new source',
        min: 3,
        slots: [
          { label: 'Where it comes from today', placeholder: '' },
          { label: 'The new source (a crowd, a waste stream, a by-product, a substitute) and what it changes', placeholder: '' },
        ],
      },
    ],
    main: 'pair',
    lens: 'A concrete new source, and its effect on cost, quality and environmental contributions.',
    questions: [
      'Where could new inputs come from: money, expertise, materials, a crowd?',
      'Which input could be replaced by something others discard?',
      'Does the new input keep the promise to customers intact?',
    ],
    lexicon: ['waste', 'scrap', 'leftover', 'recycled', 'crowd', 'crowdsourc', 'volunteer', 'user-generated', 'material', 'input', 'sustainable', 'local', 'by-product', 'surplus'],
  },
  {
    id: 12,
    pillar: 'architecture',
    name: 'Associate with competitors or clients or suppliers',
    short: 'Team up',
    landmark: 'circle',
    definition: 'Partner with a competitor, supplier or client whose strengths fill your gaps.',
    caseTitle: 'IONITY',
    caseText:
      'In 2017, carmakers that compete fiercely for buyers (BMW, Daimler, Ford and the Volkswagen group, later joined by Hyundai) created IONITY together: a network of high-power chargers along Europe’s motorways that none of them wanted to fund alone.',
    quiz: {
      question: 'Why does it make sense for rival carmakers to co-own a charging network?',
      options: [
        'Charging is a shared bottleneck: nobody wins buyers on chargers, but everyone loses if there are none',
        'They plan to merge their brands in the long run',
        'Charging stations are their main source of profit',
        'Regulation forbids carmakers from building chargers alone',
      ],
      why: 'Co-operate where no one can differentiate, compete where you can. Pooling resources on shared infrastructure lowers each partner’s capital employed.',
    },
    steps: [
      { kind: 'pick', id: 'type', label: 'Who do you team up with?', options: ['A competitor', 'A supplier', 'A client'] },
      {
        kind: 'slots',
        id: 'deal',
        label: 'The deal',
        min: 2,
        slots: [
          { label: 'Who exactly (name one)', placeholder: '' },
          { label: 'What they bring that you lack', placeholder: '' },
          { label: 'What they get in return', placeholder: '' },
        ],
      },
    ],
    main: 'deal',
    lens: 'Complementary resources, and what the partner gets in return (fair value sharing).',
    questions: [
      'Who are your competitors, and what are their strongest resources?',
      'Where do their strengths complement your weaknesses?',
      'Why would they say yes? What is in it for them?',
    ],
    lexicon: ['partner', 'partnership', 'joint venture', 'alliance', 'competitor', 'supplier', 'together', 'co-', 'share', 'pool', 'collaborat', 'consortium'],
  },
  {
    id: 13,
    pillar: 'architecture',
    name: 'Identify complementors',
    short: 'Find complementors',
    landmark: 'twins',
    definition: 'Look at what customers use before, during and after your offer, and integrate it or team up with its provider.',
    caseTitle: 'Bookshop cafés',
    caseText:
      'Since the 1990s, bookshops such as Barnes & Noble have hosted cafés. The café sells no books, yet visitors stay longer, browse more and come back, so the bookshop’s offer gains value from something it does not make itself.',
    quiz: {
      question: 'Which of these is a complementor for an electric-car maker?',
      options: [
        'A network of fast-charging stations',
        'The company that supplies its battery cells',
        'Another electric-car brand',
        'A car-rental firm that buys its cars',
      ],
      why: 'A complementor makes your offer more valuable when customers use both. The battery maker is a supplier, the other brand a competitor, and the rental firm a client.',
    },
    steps: [
      {
        kind: 'slots',
        id: 'usage',
        label: 'What else do Troy’s customers use around the offer?',
        min: 1,
        slots: [
          { label: 'Before', placeholder: '' },
          { label: 'During', placeholder: '' },
          { label: 'After', placeholder: '' },
        ],
      },
      {
        kind: 'text',
        id: 'idea',
        label: 'Integrate one of them or team up with its provider. What does your customer gain, and what does the complementor gain?',
        min: 10,
        max: 45,
      },
    ],
    main: 'idea',
    lens: 'Before/during/after usage, and the gain for both the customer and the complementor.',
    questions: [
      'What do customers use before, during and after your offer?',
      'Could you integrate one of those offers into yours?',
      'What would the complementor gain from working with you?',
    ],
    lexicon: ['before', 'after', 'during', 'bundle', 'together with', 'integrate', 'complement', 'add-on', 'insurance', 'service', 'accessories', 'package', 'combined'],
  },
  {
    id: 14,
    pillar: 'architecture',
    name: 'Leverage strategic resources',
    short: 'Use what you own',
    landmark: 'mine',
    definition: 'Find a resource or competence that is valuable, rare and hard to copy, and use it for a new offer or new customers.',
    caseTitle: 'Amazon Web Services',
    caseText:
      'To run its own store, Amazon built enormous computing infrastructure and the know-how to operate it reliably at scale. In 2006 it began renting that capacity to other companies. AWS became the world’s largest cloud provider and a major source of Amazon’s operating profit.',
    quiz: {
      question: 'A ski resort is busy four months a year. Which move leverages its strategic resources?',
      options: [
        'Using its lifts, slopes and hotels for summer mountain biking, hiking and conferences',
        'Lowering winter lift-pass prices to attract more skiers',
        'Partnering with a ski brand to offer equipment discounts',
        'Opening a café at the top of the main lift',
      ],
      why: 'Direction 14 redeploys an existing, hard-to-copy resource (a mountain with lifts and beds) towards new uses or customers. The others are directions 1, 12 and 13.',
    },
    steps: [
      { kind: 'pick', id: 'resource', label: 'Which of your resources or competences?', source: 'resources' },
      { kind: 'checks', id: 'vrio', label: 'Be honest: tick only what is true', options: ['Valuable to customers', 'Rare among competitors', 'Hard to imitate', 'Under-used today'] },
      {
        kind: 'text',
        id: 'idea',
        label: 'Who else would pay for it, and what new offer does it create (as AWS rented out Amazon’s servers)?',
        min: 10,
        max: 45,
      },
    ],
    main: 'idea',
    lens: 'The VRIO test (valuable, rare, hard to imitate) and a named new customer for the resource.',
    questions: [
      'Which resources and competencies are rare and hard to copy?',
      'Which are under-used today?',
      'Who else would pay for your know-how or assets?',
    ],
    lexicon: ['expertise', 'know-how', 'brand', 'data', 'patent', 'network', 'assets', 'unused', 'idle', 'capacity', 'competence', 'reputation', 'license', 'rent out', 'skills'],
  },
]

export const ADD_STEPS = ['Add: repair', 'Add: refurbish and resell', 'Add: take back and recycle', 'Add: an after-sales service', 'Add: rental and return']

export const directionById = (id: number) => DIRECTIONS.find((d) => d.id === id)!
