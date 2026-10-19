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
export type Source = 'attributes' | 'lowerable' | 'chain' | 'resources' | 'cutAdd'

export type Step =
  | { kind: 'pick'; id: string; label: string; options?: string[]; source?: Source; other?: boolean }
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
  why: string // shown to the student: why these questions, and how they help their business
  tip: string // Athena's coaching line when the student arrives
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
        "A printer that costs more to buy but whose ink costs a tenth as much per page",
        "A printer 20% cheaper to buy, with ink cartridges priced higher to compensate",
        "A printer billed per page printed, so the customer never buys the machine",
        "A printer with a premium colour mode included at the same purchase price",
      ],
      why: 'Direction 1 looks at total cost over the life of the offer. The cheaper printer with dear ink lowers the entry price but raises the total. Paying per page changes how the customer pays (direction 7), not necessarily how much, and a free colour mode adds functionality (direction 4).',
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
    why: "Customers rarely pay only the price tag: they pay before, during and after using an offer. Mapping the whole bill shows where the real money and effort go, and which part you could remove.",
    tip: "Look beyond the price tag: the biggest cost is often time, upkeep or what happens afterwards.",
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
        "That it can do the chore cheaper or better than the customer, since it now carries the cost and risk",
        "That customers will accept a higher list price for the core product once the chore is bundled into it",
        "That no competitor already offers the same service at the same level of quality and price",
        "That its product specifications can be upgraded first, so the service has something new to sell",
      ],
      why: 'A hassle never disappears: it moves. The other checks are about the product or the competition, not about who now carries the chore. Removing it from the customer (proposition) means someone in your architecture absorbs it, with its cost and risk. Michelin Fleet Solutions had to learn to price that risk.',
    },
    steps: [
      { kind: 'pick', id: 'stage', label: 'Where in the customer’s journey is the worst hassle?', options: JOURNEY, other: true },
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
    why: "Every chore around your offer is a reason to hesitate. Taking one over can be worth more than a lower price, but the chore never disappears: someone in your value chain now has to do it.",
    tip: "Picture one real customer's week with your offer. Where do they sigh?",
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
        "A no-frills, “judgement-free” gym with simple machines and a low monthly fee",
        "More personal trainers and premium equipment to keep its current members loyal",
        "A loyalty discount for members who commit to a two-year renewal up front",
        "A bigger advertising campaign showing how welcoming the existing gyms are",
      ],
      why: 'Non-customers stay away because of a barrier, here fear of being judged. Serving current members better or shouting louder leaves the barrier intact; redesigning the offer removes it.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'barrier',
        label: 'Why do some people stay away from offers like Troy’s?',
        options: ['They can’t afford it', 'They can’t access or use it (skills, place, time)', 'They dislike how it is done today', 'They never thought it was for them'],
        other: true,
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
    why: "The biggest growth often sits with people who do not buy at all. Knowing exactly why they stay away tells you what to change.",
    tip: "Don't ask who buys. Ask who should buy but doesn't, and what stops them.",
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
        "Its buyers weight pride and repairability above the attributes it lowered, so perceived value holds",
        "Its production costs are far lower than the flagships’, so it can undercut them and still make a profit",
        "Specifications have stopped mattering to smartphone buyers, so a weaker phone loses no value",
        "Mobile operators subsidise its handsets to meet their own environmental reporting targets",
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
      { kind: 'pick', id: 'lower', label: 'Not everything can be better. Which Troy attribute do you deliberately lower to pay for it?', source: 'lowerable' },
    ],
    main: 'idea',
    lens: 'The value curve trade-off: an attribute raised or created, and one deliberately lowered.',
    why: "Every offer is bought for what it does, how it makes people feel, or both. Shifting that balance redraws your value curve, and something has to give to pay for it.",
    tip: "Strong value curves lower something on purpose. What would your target customer happily give up?",
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
        "Having borrowed theatre’s codes, it is compared with a night at the theatre, not with the circus",
        "Its animal acts were bigger and more spectacular than anything a classic touring circus could afford",
        "It targeted families with young children, the audience that is least sensitive to ticket price",
        "It kept its costs low by touring small towns where no other live entertainment competes",
      ],
      why: 'Borrowing from another industry changes the reference point customers judge value and price against. Dropping the animals also cut one of the circus’s biggest costs.',
    },
    steps: [
      { kind: 'text', id: 'job', label: 'The job your customers hire Troy to do, in a few words', min: 2, max: 12, short: true, placeholder: 'e.g. a night out to remember; getting goods to shops on time' },
      {
        kind: 'text',
        id: 'idea',
        label: 'Which industry or segment does that same job brilliantly? Name the one rule or feature you would borrow from it, and the Troy habit you would drop to make room.',
        min: 12,
        max: 50,
        placeholder: 'Like [industry], we would …; and we would stop …',
      },
    ],
    main: 'idea',
    lens: 'The job to be done, one specific rule borrowed from an industry doing that job well, and one Troy habit dropped; the new reference point for price.',
    why: "Customers judge an offer against the alternatives they know. Borrowing one rule from an industry that does the same job well changes that reference point: Cirque did 'a magical night out' the way theatre does, so it was judged, and priced, like theatre.",
    tip: "First name the job your customer hires you for. Then ask who else does that job brilliantly.",
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
        "Getting enough drivers and passengers at the same time, and making strangers trust each other",
        "Buying, insuring and maintaining a large fleet of vehicles while keeping every seat filled",
        "Recruiting, training and retaining enough professional coach drivers to cover every single route",
        "Securing departure slots at bus stations in every city it wants to connect to the network",
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
    why: "A third group can bring assets, demand or money you do not have. It turns a one-sided sale into a deal where both sides must win, and someone has to come first.",
    tip: "Every two-sided idea must answer: which side joins first, and why would they join an empty platform?",
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
        "User: commuters. Decision-maker: the city. Payer: advertisers",
        "User: the city. Decision-maker: advertisers. Payer: commuters",
        "User: commuters. Decision-maker: advertisers. Payer: the city",
        "User: advertisers. Decision-maker: the city. Payer: commuters",
      ],
      why: 'Three different actors. Once you separate user, decision-maker and payer, a third-party payer becomes an obvious lever.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'model',
        label: 'Which revenue model do you try?',
        options: ['Pay per use', 'Subscription', 'Pay for results', 'Freemium', 'A third party pays', 'Rent or lease', 'Commission on transactions'],
        other: true,
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
    why: "How customers pay shapes what they value and who carries the risk. User, decision-maker and payer can be different people, and changing who pays can unlock the whole model.",
    tip: "Separate the three roles first: who uses, who decides, who pays. Then move the money.",
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
        "Food brands keep a familiar ingredient and recipe; only the upstream chain changes, so adoption is easier",
        "It avoids explaining precision fermentation to food regulators, who only inspect consumer-facing brands",
        "Food brands pay more per kilo of protein than consumers ever would for a finished dairy product",
        "It lets Perfect Day run its value chain without any partners, from fermentation tank to shelf",
      ],
      why: 'The technology rebuilds one part of the architecture (inputs and production) while the proposition to the next actor stays familiar. Less change for the customer means faster adoption.',
    },
    steps: [
      { kind: 'pick', id: 'step', label: 'Where in your value chain does the technology go?', source: 'chain', other: true },
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
    why: "A technology only matters when it changes something the customer notices. Placing it at one precise step of your value chain stops it being a buzzword.",
    tip: "Name the step first, then the technology. 'Use AI' is not an answer; 'AI that does X at step Y' is.",
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
        "Overdrafts and credit, so it carries no lending risk and needs no credit check",
        "Its own branches, so the tobacconists carry all the costs of serving customers",
        "Customers without a regular income, who would make account opening slower",
        "Mobile banking, so the account can be opened on paper at the counter instead",
      ],
      why: 'Without credit there is no risk to assess, so a tobacconist can open the account in minutes. The redesigned step (distribution) only works because the proposition was narrowed too.',
    },
    steps: [
      { kind: 'pick', id: 'step', label: 'Which step do you reinvent?', source: 'chain', other: true },
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
    why: "Doing one step radically differently (not just faster) can change the whole proposition, but it usually forces trade-offs elsewhere, as Nickel gave up credit.",
    tip: "Radical means a different who, where or how, not 10% better.",
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
        "Use of scarce resources and waste fall, but Desso must organise and pay for reverse logistics",
        "Revenue rises at once from selling recycled yarn, and the take-back adds no running costs",
        "Waste falls, but scarce resources rise because recycling uses more raw material than it saves",
        "Costs fall straight away because collected carpets replace all virgin material at no charge",
      ],
      why: 'An added step is never free: environmental contributions improve, while financial ones face new costs (collection, sorting) that must be offset by cheaper inputs or a price premium.',
    },
    steps: [
      { kind: 'pick', id: 'move', label: 'Remove one step of the value chain you charted at the Narrows, or add a new one', source: 'cutAdd', other: true },
      {
        kind: 'text',
        id: 'idea',
        label: 'If removed: who does it instead, or why is it no longer needed? If added: what does it create, and who pays for it?',
        min: 8,
        max: 40,
        placeholder: 'Without this step, … does it instead / With this new step, we … and … pays for it',
      },
    ],
    main: 'idea',
    lens: 'Who does the removed step instead, or who pays for the added one; the effect on cost and environmental impact.',
    why: "Each step costs money and resources. Removing one (who does it instead?) or adding one, such as repair or recycling, changes costs, price and environmental impact at the same time.",
    tip: "A removed step still needs someone to do the work. An added step still needs someone to pay for it.",
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
      'Hermès rejects precious leather, silk and porcelain for the slightest flaw. Since 2010, Petit h gives these offcuts to artists and craftspeople, who turn them into one-off objects sold in its own space in Paris and in travelling pop-up sales around the world.',
    quiz: {
      question: 'Why does Petit h strengthen rather than dilute the Hermès brand, even though its input is waste?',
      options: [
        "Craftsmanship and uniqueness turn rejects into rare objects, so the luxury promise holds",
        "Selling the offcuts cheaply through outlets reaches younger buyers who later trade up to bags",
        "Recycled pieces gradually replace the core collections, so the brand looks sustainable",
        "Synthetic substitutes that look like leather cut costs while keeping the Hermès look",
      ],
      why: 'A new input only works if the proposition stays coherent. Here waste plus the brand’s know-how produces rarity, which is exactly what luxury sells.',
    },
    steps: [
      {
        kind: 'pick',
        id: 'input',
        label: 'Which input of Troy do you rethink?',
        options: ['Materials', 'Energy', 'Money and funding', 'Labour and skills', 'Ideas and content', 'Data'],
        other: true,
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
    why: "What you depend on (materials, money, skills, ideas) limits your costs and your impact. A new source, sometimes what others throw away, can change both.",
    tip: "Ask what others discard, under-use or would give for free.",
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
        "Charging is a shared bottleneck: nobody wins buyers on chargers, but everyone loses if there are none",
        "Co-owning the chargers prepares a merger of their brands, which is the partners’ real long-term plan",
        "Charging stations will become their main source of profit once electric cars outsell petrol",
        "Regulators require carmakers to build charging networks jointly rather than one brand alone",
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
    why: "Partners with complementary strengths, even rivals, let you do what you cannot do alone. A deal only lasts if both sides gain.",
    tip: "A good partnership answers two questions: what do they have that I lack, and what is in it for them?",
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
        "A network of fast-charging stations along the motorways",
        "The company that supplies its battery cells and modules",
        "Another electric-car brand selling in the same markets",
        "A car-rental firm that buys its cars for its own fleet",
      ],
      why: 'A complementor makes your offer more valuable when customers use both. The battery maker is a supplier, the other brand a competitor, and the rental firm a client. On island 12, rival carmakers co-owned chargers (a partnership); here the charging network is someone else’s business whose existence makes your car worth more (a complementor).',
    },
    steps: [
      {
        kind: 'text',
        id: 'needs',
        label: 'What do your customers buy from someone else to get the most out of Troy’s offer?',
        min: 3,
        max: 25,
        placeholder: 'e.g. for a car: fuel, insurance, parking; for a concert: transport, drinks, a hotel',
      },
      {
        kind: 'text',
        id: 'idea',
        label: 'Team up with or integrate one of them. What does your customer gain, and what does that provider gain?',
        min: 10,
        max: 45,
        placeholder: 'With [provider], we … so customers … and they …',
      },
    ],
    main: 'idea',
    lens: 'A real complementor (bought alongside the offer from someone else) and the gain for both the customer and that provider.',
    why: "Customers rarely use your offer on its own: they also need other products or services to get its full value (a car needs fuel, insurance and parking). Teaming up with those providers makes both offers worth more.",
    tip: "Follow your customer before, during and after using your offer. What else do they buy, and from whom?",
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
        "Using its lifts, slopes and hotels for summer mountain biking, hiking and conferences",
        "Cutting winter lift-pass prices to win skiers from the neighbouring resorts in winter",
        "Partnering with a ski brand so its guests get discounts on equipment and lessons",
        "Opening a café and shop at the top of the main lift to raise spending per skier",
      ],
      why: 'Direction 14 redeploys an existing, hard-to-copy resource (a mountain with lifts and beds) towards new uses or customers. A price cut changes no business model at all, and the equipment partnership and the café add partners and complements (directions 12 and 13) without putting the idle resource to work.',
    },
    steps: [
      { kind: 'pick', id: 'resource', label: 'Which of your resources or competences?', source: 'resources', other: true },
      { kind: 'checks', id: 'vrio', label: 'Be honest: tick only what is true', options: ['Valuable to customers', 'Rare among competitors', 'Hard to imitate', 'Organised to exploit it', 'Under-used today'] },
      {
        kind: 'text',
        id: 'idea',
        label: 'Who else would pay for it, and what new offer does it create (as AWS rented out Amazon’s servers)?',
        min: 10,
        max: 45,
      },
    ],
    main: 'idea',
    lens: 'The VRIO test (valuable, rare, hard to imitate, organised to exploit it) and a named new customer for the resource.',
    why: "Some of what you already own (know-how, assets, data, brand) is valuable, rare and hard to copy. Offered to new customers, it can become a business of its own, as AWS did.",
    tip: "Look for what you built for yourself that others would pay to use.",
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
