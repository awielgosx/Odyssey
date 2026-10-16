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
  prompt: string
  questions: string[]
  lexicon: string[]
}

export const DIRECTIONS: Direction[] = [
  {
    id: 1,
    pillar: 'proposition',
    name: 'Reduce customer overall costs',
    short: 'Lower total cost',
    landmark: 'amphora',
    definition: 'Cut what the customer pays in total, not only the price: buying, using, maintaining and replacing.',
    caseTitle: 'Embrace infant warmer',
    caseText:
      'Hospital incubators are expensive to buy and need constant electricity. Embrace designed a warmer that works without either, so total cost for clinics in poor regions collapsed.',
    quiz: {
      question: 'Embrace costs a fraction of a hospital incubator. What cut the total cost the most?',
      options: ['It works without constant electricity or a hospital setting', 'It uses premium materials that last longer', 'Parents rent it by the month'],
      why: 'Total cost includes using the product. Removing the need for power and infrastructure removed the biggest costs.',
    },
    prompt:
      'List what your customer pays before, during and after using the Troy offer (money, time, upkeep). Pick the biggest cost and redesign the offer so it shrinks. What do you strip out, and who pays less?',
    questions: [
      'Which costs does your customer carry before, during and after buying?',
      'What could you strip out of the offer so the price can fall?',
      'Could part of the offer be free, with someone else paying?',
    ],
    lexicon: ['cheaper', 'cost', 'price', 'free', 'strip', 'save', 'saving', 'lower', 'budget', 'maintenance', 'upkeep', 'total cost', 'freemium', 'affordable'],
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
      'Truck fleets struggled to maintain tyres well across Europe. Michelin offered to manage the tyres entirely and bill per kilometre, so the chore became Michelin’s job.',
    quiz: {
      question: 'Which hassle did Michelin Fleet Solutions take off truck-fleet managers?',
      options: ['Buying, checking and replacing tyres', 'Driving the trucks', 'Finding freight clients'],
      why: 'Fleets pay per kilometre while Michelin manages the tyres. The customer’s chore becomes the supplier’s job.',
    },
    prompt:
      'What else must the customer buy, do or manage to make the Troy offer work? Take over the single most annoying step. Who does it now, and how?',
    questions: [
      'What else does your customer have to buy or do to make your offer work?',
      'Where does using it get frustrating, slow or complicated?',
      'Which pain point could you take over or remove entirely?',
    ],
    lexicon: ['hassle', 'easy', 'simple', 'simplify', 'convenient', 'delivered', 'delivery', 'handle', 'manage', 'one-stop', 'pain', 'chore', 'automatic', 'faster', 'no need'],
  },
  {
    id: 3,
    pillar: 'proposition',
    name: 'Find non-customers',
    short: 'Look beyond customers',
    landmark: 'lighthouse',
    definition: 'Look at the people who ignore or refuse your industry’s offer, and find out what keeps them away.',
    caseTitle: 'Grameen Bank',
    caseText:
      'Banks refused to lend to the rural poor because they had no collateral. Grameen lent small sums to groups of borrowers who backed each other, opening a market banks had ignored.',
    quiz: {
      question: 'Grameen Bank lent to people the banks refused. What replaced collateral?',
      options: ['Small borrower groups sharing responsibility', 'Gold deposits', 'A state guarantee on every loan'],
      why: 'The non-customers became reachable once the model removed the barrier that excluded them.',
    },
    prompt:
      'Name a group who could use this kind of offer but doesn’t today (can’t afford it, can’t reach it, or refuses it). What do they do instead? What change turns them into customers?',
    questions: [
      'Who could use this kind of offer but ignores or refuses it?',
      'What do they do instead, and what does that cost them?',
      'Which part of the offer do customers always complain about?',
    ],
    lexicon: ['non-customer', 'non customers', 'excluded', 'never', 'refuse', 'ignore', 'new segment', 'students', 'elderly', 'rural', 'poor', 'first-time', 'access', 'reach', 'barrier'],
  },
  {
    id: 4,
    pillar: 'proposition',
    name: 'Add more functionality or more emotion',
    short: 'Function or emotion',
    landmark: 'theatre',
    definition: 'Decide whether people buy your offer for what it does or for how it feels, then add one or strip back to the other.',
    caseTitle: 'Fairphone',
    caseText:
      'Fairphone does not compete on raw specifications. It sells pride: ethically sourced parts, a phone you can repair with a screwdriver and keep for years.',
    quiz: {
      question: 'Fairphone’s specifications are weaker than the big brands’. What does it raise on the value curve?',
      options: ['Ethical sourcing and repairability that buyers are proud of', 'The fastest processor', 'The lowest price'],
      why: 'It trades raw performance for emotion and repairability. Not everything can be better.',
    },
    prompt:
      'Is the Troy offer bought for what it does or how it makes people feel? Add one emotional element (or strip it to pure function), and say which attribute you lower to pay for it.',
    questions: [
      'Is your offer bought for what it does, or for how it makes people feel?',
      'What positive emotion could you add to a functional offer?',
      'Or what would a stripped-back, purely functional version look like?',
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
      'The circus was losing its audience. Cirque du Soleil dropped animal acts and borrowed storylines, music and staging from theatre, attracting adults who never went to the circus.',
    quiz: {
      question: 'Cirque du Soleil borrowed from theatre. What did it remove and what did it add?',
      options: ['Removed animal acts, added storylines and music', 'Removed acrobats, added animals', 'Removed tickets, made shows free'],
      why: 'It took codes from another industry to reach adults who never went to the circus.',
    },
    prompt:
      'Pick another segment or industry that does a similar job in a smarter way. Borrow one specific feature or rule from it. What does the new offer look like?',
    questions: [
      'How is your industry split into segments, and what rules does each follow?',
      'Which feature from another segment could you bring in?',
      'Which other industry solves a similar problem better?',
    ],
    lexicon: ['borrow', 'like', 'inspired', 'industry', 'segment', 'hotel', 'airline', 'gaming', 'subscription', 'theatre', 'luxury', 'retail', 'model of', 'apply', 'from'],
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
      'BlaBlaCar owns no cars. It connects drivers who have empty seats with passengers who need a ride, so private drivers supply the assets.',
    quiz: {
      question: 'In BlaBlaCar, who owns the cars?',
      options: ['Private drivers sharing their empty seats', 'BlaBlaCar’s own fleet', 'Rental companies'],
      why: 'A new stakeholder supplies the assets. It becomes a two-sided market with two value curves.',
    },
    prompt:
      'Name a third party who would gain from being connected to the Troy customers, or who could own the assets. What does each side gain, and who pays whom?',
    questions: [
      'Who would benefit from being connected to your customers?',
      'Could you become the intermediary between two groups?',
      'Could someone else own the assets your offer relies on?',
    ],
    lexicon: ['platform', 'marketplace', 'connect', 'third party', 'partner', 'hosts', 'drivers', 'sellers', 'two-sided', 'intermediary', 'community', 'owners', 'match', 'network'],
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
      'Cities need bus shelters but have tight budgets. JCDecaux installs and cleans them for free and earns its money by renting the poster space to advertisers.',
    quiz: {
      question: 'JCDecaux gives cities bus shelters for free. Who pays?',
      options: ['Advertisers renting the poster space', 'Passengers, through tickets', 'The city, through rent'],
      why: 'The user (commuter), the decision-maker (city) and the payer (advertiser) are three different actors.',
    },
    prompt:
      'Change how the money flows: per use, subscription, pay for results, or a third-party payer. Name the user, the decision-maker and the payer, before and after.',
    questions: [
      'Could the customer pay differently: per use, subscription, by result?',
      'Which third party might fund part of the offer?',
      'Does your offer save customers money that you could share?',
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
      'Perfect Day makes the same whey protein found in milk, without cows, by precision fermentation. The architecture changes completely while the food industry gets a familiar ingredient.',
    quiz: {
      question: 'How does Perfect Day make dairy protein without cows?',
      options: ['Precision fermentation with microorganisms', 'Blending oat and pea proteins', 'Cloned high-yield cows'],
      why: 'The technology rebuilt the architecture: new inputs, a new chain, the same taste for the customer.',
    },
    prompt:
      'Choose a technology from your industry or another, and place it at one specific step of the Troy value chain. What does it change for the customer, not just for you?',
    questions: [
      'Which technology do competitors use that you do not?',
      'Which technology from another sector could change how you deliver?',
      'What problem would it solve for the customer?',
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
      'Opening a bank account usually meant an appointment at a branch. Nickel moved account opening to the tobacconist’s counter, done in minutes.',
    quiz: {
      question: 'Where can you open a Nickel account in minutes?',
      options: ['At a tobacconist’s counter', 'Only in a bank branch', 'By post, after a two-week check'],
      why: 'The distribution step was redesigned on top of an existing network of local shops.',
    },
    prompt:
      'Write the Troy value chain in 4 to 6 steps. Pick one step and carry it out in a radically different way. What does it cost, and what changes for the customer?',
    questions: [
      'What are the main activities in your value chain?',
      'Which step could be done in a radically different way?',
      'What would that cost, and what would it change for the customer?',
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
      'Desso added a take-back step to the carpet business: used carpets come back to the factory and are recycled into new ones.',
    quiz: {
      question: 'Which step did Desso add to the carpet value chain?',
      options: ['Taking back used carpets and recycling them', 'In-store design advice', 'Door-to-door selling'],
      why: 'The added step lowers the use of scarce resources and creates a new input, so the environmental contribution goes up.',
    },
    prompt:
      'Remove one step (who does it instead?) or add one (repair, reuse, recycle, service). Show the effect on cost, price and environmental impact.',
    questions: [
      'What is each step really for? What happens if you remove it?',
      'What step could you add: repair, reuse, recycling?',
      'How does that change cost, price and environmental impact?',
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
      'Hermès rejects many precious materials for tiny defects. Petit h hands them to artists and craftspeople who turn them into unique, desirable objects.',
    quiz: {
      question: 'What is the main input of Hermès Petit h?',
      options: ['Leftover and rejected materials from Hermès’ own workshops', 'Newly sourced exotic leathers', 'Plastic collected from consumers'],
      why: 'Something the company used to discard became the raw material of a new, desirable offer.',
    },
    prompt:
      'Name an input the Troy business depends on (materials, money, ideas, labour) and a new source for it: a crowd, a waste stream, or a greener substitute. What does it change in costs and contributions?',
    questions: [
      'Where could new inputs come from: money, expertise, materials, a crowd?',
      'Could you work with fewer inputs?',
      'Which input could be replaced by a sustainable one, or by something others discard?',
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
      'No single carmaker wanted to build a European fast-charging network alone. Competing manufacturers created IONITY together and shared the cost.',
    quiz: {
      question: 'Who built the IONITY fast-charging network?',
      options: ['A joint venture of competing carmakers', 'A single oil major', 'The EU alone'],
      why: 'Rivals pooled resources to build infrastructure none of them would build alone.',
    },
    prompt:
      'Pick a competitor, supplier or client whose strongest resource fills your gap. What do you give them in return? Describe the partnership in one sentence.',
    questions: [
      'Who are your competitors, and what are their strongest resources?',
      'Where do their strengths complement your weaknesses?',
      'Could a supplier or client relationship become a partnership?',
    ],
    lexicon: ['partner', 'partnership', 'joint venture', 'alliance', 'competitor', 'supplier', 'together', 'co-', 'share', 'pool', 'collaborat', 'consortium'],
  },
  {
    id: 13,
    pillar: 'architecture',
    name: 'Identify complementors',
    short: 'Find complementors',
    landmark: 'twins',
    definition: 'Look at what customers use before, during and after your offer, and integrate or team up with it.',
    caseTitle: 'Bookshop cafés',
    caseText:
      'A café inside a bookshop keeps people browsing longer and makes the visit pleasant, so the books gain value from something the bookshop does not sell itself.',
    quiz: {
      question: 'Why is a café inside a bookshop a complementor?',
      options: ['It makes browsing longer and more pleasant, so the books gain value', 'It competes with book sales', 'It supplies the paper'],
      why: 'A complementor raises the value of your offer when the two are used together.',
    },
    prompt:
      'List what customers use before, during and after the Troy offer. Integrate one of those offers. What does the complementor gain, and what does your customer gain?',
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
      'Amazon built huge computing infrastructure and know-how to run its own store. It then rented that capacity to other companies, creating a new business.',
    quiz: {
      question: 'Amazon Web Services grew out of which Amazon resource?',
      options: ['The computing infrastructure and know-how built to run its own store', 'Its warehouse robots', 'Its book catalogue'],
      why: 'A valuable, rare and under-used resource was sold to entirely new customers.',
    },
    prompt:
      'Name one resource or competence that is valuable, rare and hard to imitate. Who else would pay for it, and what new offer could it create?',
    questions: [
      'Which resources and competencies are rare and hard to copy?',
      'Which are under-used today?',
      'Who else would pay for your know-how or assets?',
    ],
    lexicon: ['expertise', 'know-how', 'brand', 'data', 'patent', 'network', 'assets', 'unused', 'idle', 'capacity', 'competence', 'reputation', 'license', 'rent out', 'skills'],
  },
]

export const directionById = (id: number) => DIRECTIONS.find((d) => d.id === id)!
