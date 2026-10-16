// Rubrics shared by the AI coach (server) and the fallback grader (browser).

export type TaskKind = 'troy' | 'landing' | 'aeolus' | 'lemnos' | 'olympus'

export interface Criterion {
  key: string
  label: string
  max: number
  anchors: string // what 0 / 1 / 2 look like, for the AI
  question: string // Socratic follow-up when the score is low (fallback)
}

export const RUBRICS: Record<TaskKind, Criterion[]> = {
  troy: [
    {
      key: 'framing',
      label: 'Reference offer framed',
      max: 2,
      anchors: '0: offer or customers missing or generic. 1: offer and customers named but user/decision-maker/payer not distinguished or price vague. 2: concrete offer, the three customer roles thought through, price stated.',
      question: 'Who uses the offer, who decides to buy it, and who actually pays? Are they the same person?',
    },
    {
      key: 'insight',
      label: 'Frustration and orthodoxy',
      max: 2,
      anchors: '0: missing or a solution in disguise. 1: one of the two is specific. 2: a concrete customer frustration AND an industry belief everyone takes for granted.',
      question: 'What does every company in this industry assume that nobody questions anymore?',
    },
  ],
  landing: [
    {
      key: 'fit',
      label: 'Uses this direction',
      max: 2,
      anchors: '0: the idea does not use this direction at all. 1: loosely related. 2: the idea clearly applies this specific direction to the reference business.',
      question: 'Read the direction again. Which part of your idea actually comes from it?',
    },
    {
      key: 'specificity',
      label: 'Concrete and specific',
      max: 2,
      anchors: '0: vague ("use AI", "be greener"). 1: understandable but generic. 2: a stranger could picture it; names who benefits and how, tied to the reference business.',
      question: 'Could a stranger picture exactly what changes on Monday morning? Name the customer and the moment.',
    },
    {
      key: 'pillars',
      label: 'Pillar logic',
      max: 2,
      anchors: '0: wrong pillar or no knock-on. 1: right pillar but no consequence for the other pillar. 2: right pillar and states what must change in the other pillar to make it real.',
      question: 'If your offer changes like this, what must change in how you build and deliver it (or the reverse)?',
    },
    {
      key: 'contributions',
      label: 'Contributions reasoning',
      max: 2,
      anchors: '0: signs missing or unexplained. 1: signs given with thin reasons, everything +. 2: plausible reasoned signs, ideally naming a trade-off (a 0 or a -).',
      question: 'Is it really positive on all three? What gets worse, or costs more, because of this idea?',
    },
  ],
  aeolus: [
    {
      key: 'coherence',
      label: 'Proposition and architecture hold together',
      max: 2,
      anchors: '0: two unrelated ideas glued together. 1: related but the architecture does not really enable the promise. 2: the architecture change is what makes the new promise possible.',
      question: 'What would have to be true in your value chain for that promise to be kept?',
    },
    {
      key: 'specificity',
      label: 'Specific',
      max: 2,
      anchors: '0: vague. 1: partly concrete. 2: concrete change, named customer, named contribution effect.',
      question: 'Which customer, exactly, and which contribution moves?',
    },
  ],
  lemnos: [
    {
      key: 'curve',
      label: 'Value curve trade-off',
      max: 2,
      anchors: '0: everything raised or nothing changed. 1: some change but no attribute lowered. 2: at least one attribute raised AND one lowered or removed, consistent with the pitch.',
      question: 'Not everything can be better. Which attribute do you deliberately make worse to afford the new ones?',
    },
    {
      key: 'positioning',
      label: 'Pitch and positioning',
      max: 2,
      anchors: '0: no clear pitch. 1: pitch but generic or inconsistent with the chosen zone. 2: crisp pitch naming customer and benefit, consistent with the price/perceived-value zone.',
      question: 'In one sentence: for whom, what, and why is it worth the price?',
    },
    {
      key: 'coherence',
      label: 'Three pillars coherent',
      max: 2,
      anchors: '0: proposition and architecture contradict. 1: plausible but loose. 2: the architecture clearly delivers the proposition and the financial logic follows.',
      question: 'Does your value chain really deliver the curve you drew?',
    },
    {
      key: 'contributions',
      label: 'Contributions and antagonism',
      max: 2,
      anchors: '0: indicators missing. 1: indicators set but no real antagonism named. 2: indicators set with a credible antagonism (financial vs environmental vs societal, short vs long term).',
      question: 'Where do your financial, environmental and societal contributions pull against each other?',
    },
  ],
  olympus: [
    {
      key: 'defence',
      label: 'Answer to the god',
      max: 2,
      anchors: '0: dodges the question. 1: answers but generically. 2: answers directly with a concrete argument or evidence.',
      question: 'Answer the god directly: what evidence do you have, or would you need?',
    },
    {
      key: 'test',
      label: 'Experiment design',
      max: 2,
      anchors: '0: no testable assumption. 1: assumption and MVP but no measurable stake. 2: riskiest assumption, a low-tech low-scale MVP, and a metric where users put something at stake (money, time, reputation) with a threshold.',
      question: 'What would users have to put at stake to prove your assumption, and what number would convince you?',
    },
  ],
}

export const maxFor = (kind: TaskKind) => RUBRICS[kind].reduce((m, c) => m + c.max, 0)

export const METHOD_SUMMARY = `Odyssey 3.14 (HEC Paris, Lehmann-Ortega, Musikas, Schoettl): a business model has 3 pillars.
1) Value proposition: what is offered, to whom (user, decision-maker and payer can differ), at what price. Tool: the value curve (attributes from the customer's view; not everything can be better).
2) Value architecture: how it is built and delivered: value chain steps, partners (value network), strategic resources and competencies (valuable, rare, hard to imitate).
3) Contributions: financial (revenue, costs, capital employed, ROCE), environmental (GHG emissions, pollutants, scarce resources), societal (employability, quality of life, fair value sharing), each rated +, 0 or -.
Performance comes from a coherent, unique combination of proposition and architecture.
14 directions. Value proposition: 1 Reduce customer overall costs, 2 Reduce customer hassles, 3 Find non-customers, 4 Add more functionality or more emotion, 5 Explore other segments or industries, 6 Introduce other stakeholders, 7 Modify the revenue stream. Value architecture: 8 Introduce a technology, 9 Modify one or several steps in the value chain, 10 Eliminate or add one or more steps to the value chain, 11 Identify new inputs, 12 Associate with competitors or clients or suppliers, 13 Identify complementors, 14 Leverage strategic resources.
Experimentation: test the riskiest assumption with a low-tech, low-scale, low-risk MVP; true proof is users putting something at stake.`
