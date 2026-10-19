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
      anchors: '0: offer or customers missing or generic. 1: offer and customers named but user/decision-maker/payer not distinguished, price vague, or the value curve uses the company’s view (features, internal metrics) instead of the customer’s. 2: concrete offer, the three customer roles thought through, price stated, and value curve attributes that customers really compare offers on.',
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
      key: 'grounded',
      label: 'Grounded in Troy',
      max: 2,
      anchors: '0: generic, could be said of any business ("use AI", "be greener"). 1: refers to the reference business but stays vague. 2: names concrete actors, steps, attributes or numbers of the reference business; a stranger could picture what changes.',
      question: 'Could a stranger picture exactly what changes, for whom, on Monday morning? Name the customer, the step, the moment.',
    },
    {
      key: 'logic',
      label: 'Uses this direction’s logic',
      max: 2,
      anchors: '0: does not apply this direction (e.g. a price cut on the total-cost island, a minor tweak on the radical-step island). 1: loosely related. 2: clearly applies the mechanism of this specific direction.',
      question: 'Reread the direction and the case. Which part of your answer actually uses that mechanism, rather than a general improvement?',
    },
    {
      key: 'consequence',
      label: 'Thinks through the consequence',
      max: 2,
      anchors: '0: ignores the island\'s follow-up (see LENS). 1: answers it thinly or wishfully (everything gets better). 2: answers it honestly, including what costs more, gets worse or must change elsewhere in the model.',
      question: 'What gets worse, costs more or has to change elsewhere in your model because of this idea?',
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
      anchors: '0: everything raised or nothing changed. 1: some change but no attribute lowered or eliminated. 2: at least one attribute raised or newly created AND one lowered or eliminated (level 0), consistent with the pitch.',
      question: 'Not everything can be better. Which attribute do you deliberately make worse to afford the new ones?',
    },
    {
      key: 'positioning',
      label: 'Pitch and positioning',
      max: 2,
      anchors: '0: no clear pitch or no revenue model. 1: pitch and price given, but generic, or inconsistent with the chosen zone (e.g. a higher price with less value). 2: crisp pitch naming customer and benefit, a concrete price and revenue model, consistent with the curve and the price/perceived-value zone.',
      question: 'In one sentence: for whom, what, and why is it worth the price?',
    },
    {
      key: 'coherence',
      label: 'Three pillars coherent',
      max: 2,
      anchors: '0: proposition and architecture contradict, or the new value chain is Troy’s unchanged. 1: plausible but loose: the new chain changes steps unrelated to the promise. 2: the new value chain clearly delivers the curve and pitch (the steps added, changed or removed are exactly what the promise needs) and the revenue model follows.',
      question: 'Which step of your new value chain makes your promise possible, and which one did you remove to afford it?',
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
      key: 'hypotheses',
      label: 'Hypotheses and the riskiest one',
      max: 2,
      anchors: '0: hypotheses missing or not testable (opinions, goals). 1: one per pillar but vague, or the one marked riskiest is a safe, already-known fact. 2: three testable hypotheses, one per pillar, and the riskiest is the one the model depends on most and the team knows least about.',
      question: 'If you could prove only one belief before investing, which one would you pick, and why that one?',
    },
    {
      key: 'test',
      label: 'Experiment design',
      max: 2,
      anchors: '0: no test of the riskiest hypothesis. 1: an MVP but not low-tech/low-scale, or no measurable stake. 2: a low-tech, low-scale MVP that tests exactly the riskiest hypothesis, and a metric where users put something at stake (money, time, reputation) with a threshold set in advance.',
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
