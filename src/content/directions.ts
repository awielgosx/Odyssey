// The 14 directions of Odyssey 3.14, using the course's names and numbering.
// Guiding questions are paraphrased for this tool, not copied from the book.

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

export interface Direction {
  id: number
  pillar: Pillar
  name: string
  short: string
  landmark: Landmark
  questions: string[]
  courseExamples: string[]
}

export const DIRECTIONS: Direction[] = [
  {
    id: 1,
    pillar: 'proposition',
    name: 'Reduce customer overall costs',
    short: 'Lower total cost',
    landmark: 'amphora',
    questions: [
      'Which costs does your customer carry before, during and after buying: searching, buying, using, maintaining?',
      'What could you strip out of the offer so the price can fall?',
      'Could part of the offer be free to draw people in, with someone else paying?',
    ],
    courseExamples: ['Embrace', 'Ryanair', 'Spotify (freemium)'],
  },
  {
    id: 2,
    pillar: 'proposition',
    name: 'Reduce customer hassles',
    short: 'Remove the hassle',
    landmark: 'stoa',
    questions: [
      'What else does your customer have to buy or do to make your offer work?',
      'Where does using your offer get frustrating, slow or complicated?',
      'Which of those pain points could you take over or remove entirely?',
    ],
    courseExamples: ['Graze', 'Michelin Fleet Solutions'],
  },
  {
    id: 3,
    pillar: 'proposition',
    name: 'Find non-customers',
    short: 'Look beyond customers',
    landmark: 'lighthouse',
    questions: [
      'Who could use this kind of offer but ignores or refuses it today?',
      'What do they do instead, and what does that alternative cost them?',
      'Which part of the current offer do customers always complain about?',
    ],
    courseExamples: ['Grameen Bank', 'Embrace'],
  },
  {
    id: 4,
    pillar: 'proposition',
    name: 'Add more functionality or more emotion',
    short: 'Function or emotion',
    landmark: 'theatre',
    questions: [
      'Is your offer bought mainly for what it does, or for how it makes people feel?',
      'What positive emotion could you add to a purely functional offer?',
      'Or the reverse: what would a stripped-back, purely functional version look like?',
    ],
    courseExamples: ['Fairphone', 'Hermès Petit h'],
  },
  {
    id: 5,
    pillar: 'proposition',
    name: 'Explore other segments or industries',
    short: 'Borrow from elsewhere',
    landmark: 'agora',
    questions: [
      'How is your industry split into segments, and which rules does each segment follow?',
      'Which code or feature from another segment could you bring into your offer?',
      'Which completely different industry solves a similar problem in a smarter way?',
    ],
    courseExamples: ['Cirque du Soleil', 'Hello Fresh'],
  },
  {
    id: 6,
    pillar: 'proposition',
    name: 'Introduce other stakeholders',
    short: 'Bring in a third party',
    landmark: 'bridge',
    questions: [
      'Who would benefit from being connected to your customers?',
      'Could you become the intermediary between two groups who need each other?',
      'Could someone else own the assets your offer relies on?',
    ],
    courseExamples: ['Airbnb', 'BlaBlaCar', 'Pinduoduo'],
  },
  {
    id: 7,
    pillar: 'proposition',
    name: 'Modify the revenue stream',
    short: 'Change how you get paid',
    landmark: 'treasury',
    questions: [
      'Could the customer pay differently: per use, by subscription, by result?',
      'Which third party might fund part of the offer, and what would they get in return?',
      'Does your offer save the customer money or earn them some, and could you share in that?',
    ],
    courseExamples: ['JCDecaux', 'Michelin Fleet Solutions', 'Rolls-Royce Power by the Hour'],
  },
  {
    id: 8,
    pillar: 'architecture',
    name: 'Introduce a technology',
    short: 'Bring in a technology',
    landmark: 'forge',
    questions: [
      'Which technology do competitors use that you do not?',
      'Which technology from a completely different sector could change how you deliver?',
      'What problem would it solve for the customer, not just for you?',
    ],
    courseExamples: ['Perfect Day', 'Netflix'],
  },
  {
    id: 9,
    pillar: 'architecture',
    name: 'Modify one or several steps in the value chain',
    short: 'Redesign a step',
    landmark: 'mill',
    questions: [
      'What are the main activities in your value chain, from start to finish?',
      'Which step could be carried out in a radically different way?',
      'What would that change cost, and what would it change for the customer?',
    ],
    courseExamples: ['Nickel', 'Wikipedia'],
  },
  {
    id: 10,
    pillar: 'architecture',
    name: 'Eliminate or add one or more steps to the value chain',
    short: 'Cut or add a step',
    landmark: 'stairs',
    questions: [
      'What is each step really for? What happens if you remove it?',
      'What new step could you add, for example repair, reuse or recycling?',
      'How would removing or adding the step change cost, price and environmental impact?',
    ],
    courseExamples: ['Desso', 'IKEA', 'Fairphone'],
  },
  {
    id: 11,
    pillar: 'architecture',
    name: 'Identify new inputs',
    short: 'Find new inputs',
    landmark: 'grove',
    questions: [
      'Where could new inputs come from: money, expertise, materials, a crowd?',
      'Could you work with fewer inputs instead of more?',
      'Which input could be replaced by a more sustainable one, or by something others throw away?',
    ],
    courseExamples: ['Topcoder', 'Hermès Petit h', 'Lego Ideas'],
  },
  {
    id: 12,
    pillar: 'architecture',
    name: 'Associate with competitors or clients or suppliers',
    short: 'Team up',
    landmark: 'circle',
    questions: [
      'Who are your competitors, and what are their strongest resources?',
      'Where do their strengths complement your weaknesses?',
      'Could the relationship with your suppliers or clients become a partnership?',
    ],
    courseExamples: ['IONITY', 'Google Earth (with NASA)'],
  },
  {
    id: 13,
    pillar: 'architecture',
    name: 'Identify complementors',
    short: 'Find complementors',
    landmark: 'twins',
    questions: [
      'What do customers use before, during and after your offer?',
      'Could you integrate one of those offers into yours?',
      'What would the company providing it gain from working with you?',
    ],
    courseExamples: ['Euromaster with Michelin', 'Barnes & Noble'],
  },
  {
    id: 14,
    pillar: 'architecture',
    name: 'Leverage strategic resources',
    short: 'Use what you own',
    landmark: 'mine',
    questions: [
      'Which of your resources and competencies are rare and hard to copy?',
      'Which ones are under-used today?',
      'Who else would pay for your know-how or assets?',
    ],
    courseExamples: ['Amazon Web Services', 'Michelin Fleet Solutions'],
  },
]

export const directionById = (id: number) => DIRECTIONS.find((d) => d.id === id)!
