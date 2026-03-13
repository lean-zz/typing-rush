import type { Difficulty, Language, Snippet } from '../types';

type Builder = (i: number) => { title: string; content: string; tags: string[] };

const buildPack = (language: Language, difficulty: Difficulty, builders: Builder[]): Snippet[] => {
  const snippets: Snippet[] = [];
  for (let i = 0; i < 20; i += 1) {
    const built = builders[i % builders.length](i + 1);
    snippets.push({
      id: `${language}-${difficulty}-${i + 1}`,
      language,
      difficulty,
      title: built.title,
      content: built.content,
      tags: built.tags
    });
  }
  return snippets;
};

const jsEasyBuilders: Builder[] = [
  (i) => ({ title: `Array map ${i}`, content: `const nums = [1, 2, 3];\nconst mapped${i} = nums.map((n) => n + ${i % 5});`, tags: ['array', 'function'] }),
  (i) => ({ title: `If check ${i}`, content: `const value${i} = ${i};\nif (value${i} % 2 === 0) {\n  console.log('even');\n}`, tags: ['if', 'operator'] }),
  (i) => ({ title: `Loop ${i}`, content: `let total${i} = 0;\nfor (let j = 0; j < ${3 + (i % 5)}; j += 1) {\n  total${i} += j;\n}`, tags: ['loop', 'operator'] }),
  (i) => ({ title: `String ${i}`, content: `const name${i} = 'dev';\nconst msg${i} = ` + '`${name' + i + '} #${' + i + '}`' + `;`, tags: ['string', 'template'] }),
  (i) => ({ title: `Function ${i}`, content: `function sum${i}(a, b) {\n  return a + b;\n}`, tags: ['function'] })
];

const jsMediumBuilders: Builder[] = [
  (i) => ({ title: `Reduce ${i}`, content: `const items${i} = [${i}, ${i + 1}, ${i + 2}];\nconst total${i} = items${i}.reduce((acc, n) => acc + n, 0);`, tags: ['array', 'reduce'] }),
  (i) => ({ title: `Async fetch ${i}`, content: `async function load${i}(url) {\n  const res = await fetch(url);\n  return res.json();\n}`, tags: ['async', 'await'] }),
  (i) => ({ title: `Try catch ${i}`, content: `try {\n  JSON.parse('{"x":${i}}');\n} catch (err) {\n  console.error(err);\n}`, tags: ['exception'] }),
  (i) => ({ title: `Object entries ${i}`, content: `const obj${i} = { a: ${i}, b: ${i + 1} };\nfor (const [k, v] of Object.entries(obj${i})) {\n  console.log(k, v);\n}`, tags: ['object', 'loop'] }),
  (i) => ({ title: `Filter ${i}`, content: `const values${i} = [1, 2, 3, 4, 5];\nconst out${i} = values${i}.filter((n) => n > ${i % 4});`, tags: ['array', 'operator'] })
];

const jsHardBuilders: Builder[] = [
  (i) => ({ title: `Promise race ${i}`, content: `const timeout${i} = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500));\nconst data${i} = Promise.race([fetch('/api/${i}'), timeout${i}]);`, tags: ['promise', 'async'] }),
  (i) => ({ title: `Destructure ${i}`, content: `const config${i} = { retries: ${i % 4}, delay: ${100 + i} };\nconst { retries = 0, delay } = config${i};`, tags: ['object', 'destructure'] }),
  (i) => ({ title: `Higher order ${i}`, content: `const withLog${i} = (fn) => (...args) => {\n  console.log('call', args.length);\n  return fn(...args);\n};`, tags: ['function', 'spread'] }),
  (i) => ({ title: `Regex ${i}`, content: `const line${i} = 'a=b_${i}';\nconst ok${i} = /^\w+=\w+_\d+$/.test(line${i});`, tags: ['regex', 'string'] }),
  (i) => ({ title: `Nested map ${i}`, content: `const board${i} = Array.from({ length: 3 }, (_, r) =>\n  Array.from({ length: 3 }, (_, c) => r + c + ${i % 3})\n);`, tags: ['array', 'nested'] })
];

const tsEasyBuilders: Builder[] = [
  (i) => ({ title: `Type alias ${i}`, content: `type User${i} = { id: number; name: string };\nconst user${i}: User${i} = { id: ${i}, name: 'u${i}' };`, tags: ['type', 'object'] }),
  (i) => ({ title: `Union ${i}`, content: `type State${i} = 'idle' | 'loading';\nconst state${i}: State${i} = 'idle';`, tags: ['type', 'union'] }),
  (i) => ({ title: `Array typed ${i}`, content: `const nums${i}: number[] = [1, 2, 3];\nconst x${i} = nums${i}[0];`, tags: ['array', 'type'] }),
  (i) => ({ title: `Function typed ${i}`, content: `const add${i} = (a: number, b: number): number => a + b;`, tags: ['function', 'type'] }),
  (i) => ({ title: `Interface ${i}`, content: `interface Task${i} {\n  done: boolean;\n  title: string;\n}`, tags: ['interface'] })
];

const tsMediumBuilders: Builder[] = [
  (i) => ({ title: `Generic ${i}`, content: `function first${i}<T>(arr: T[]): T | undefined {\n  return arr[0];\n}`, tags: ['generic'] }),
  (i) => ({ title: `Record ${i}`, content: `const flags${i}: Record<string, boolean> = {\n  dark: true,\n  compact: ${i % 2 === 0 ? 'true' : 'false'}\n};`, tags: ['record', 'object'] }),
  (i) => ({ title: `Narrow ${i}`, content: `function print${i}(v: string | number) {\n  if (typeof v === 'string') return v.toUpperCase();\n  return v.toFixed(2);\n}`, tags: ['union', 'typeguard'] }),
  (i) => ({ title: `Readonly ${i}`, content: `type Point${i} = Readonly<{ x: number; y: number }>;\nconst p${i}: Point${i} = { x: ${i}, y: ${i + 1} };`, tags: ['utility', 'type'] }),
  (i) => ({ title: `Async typed ${i}`, content: `async function load${i}(): Promise<number> {\n  return ${i};\n}`, tags: ['async', 'promise'] })
];

const tsHardBuilders: Builder[] = [
  (i) => ({ title: `Mapped ${i}`, content: `type Flags${i}<T> = { [K in keyof T]: boolean };\ntype UserFlags${i} = Flags${i}<{ name: string; age: number }>;`, tags: ['mapped', 'generic'] }),
  (i) => ({ title: `Conditional ${i}`, content: `type Id${i}<T> = T extends { id: infer U } ? U : never;\ntype Value${i} = Id${i}<{ id: number }>;`, tags: ['conditional', 'infer'] }),
  (i) => ({ title: `Reducer ${i}`, content: `type Action${i} = { type: 'inc' } | { type: 'dec' };\nconst reduce${i} = (s: number, a: Action${i}) => a.type === 'inc' ? s + 1 : s - 1;`, tags: ['union', 'function'] }),
  (i) => ({ title: `Tuple ${i}`, content: `const pair${i}: [string, number] = ['v${i}', ${i}];\nconst [name${i}, count${i}] = pair${i};`, tags: ['tuple', 'destructure'] }),
  (i) => ({ title: `Satisfies ${i}`, content: `const cfg${i} = { retries: ${i % 3}, strict: true } satisfies { retries: number; strict: boolean };`, tags: ['satisfies', 'object'] })
];

const pyEasyBuilders: Builder[] = [
  (i) => ({ title: `List loop ${i}`, content: `nums_${i} = [1, 2, 3]\nfor n in nums_${i}:\n    print(n + ${i % 4})`, tags: ['loop', 'list'] }),
  (i) => ({ title: `If ${i}`, content: `value_${i} = ${i}\nif value_${i} % 2 == 0:\n    print('even')`, tags: ['if', 'operator'] }),
  (i) => ({ title: `Function ${i}`, content: `def add_${i}(a, b):\n    return a + b`, tags: ['function'] }),
  (i) => ({ title: `String ${i}`, content: `name_${i} = 'dev'\nmsg_${i} = f"{name_${i}}-{${i}}"`, tags: ['string', 'fstring'] }),
  (i) => ({ title: `Dict ${i}`, content: `item_${i} = {'id': ${i}, 'ok': True}\nprint(item_${i}['id'])`, tags: ['dict'] })
];

const pyMediumBuilders: Builder[] = [
  (i) => ({ title: `Comprehension ${i}`, content: `values_${i} = [x * 2 for x in range(${3 + (i % 4)})]\nprint(values_${i})`, tags: ['list', 'comprehension'] }),
  (i) => ({ title: `Try except ${i}`, content: `try:\n    num_${i} = int('4${i % 10}')\nexcept ValueError:\n    num_${i} = 0`, tags: ['exception'] }),
  (i) => ({ title: `Enumerate ${i}`, content: `for idx, val in enumerate(['a', 'b', 'c']):\n    print(idx, val, ${i})`, tags: ['loop'] }),
  (i) => ({ title: `Type hint ${i}`, content: `def scale_${i}(n: int) -> int:\n    return n * ${2 + (i % 3)}`, tags: ['type', 'function'] }),
  (i) => ({ title: `Set ${i}`, content: `seen_${i} = {1, 2, 3}\nseen_${i}.add(${i % 5})`, tags: ['set'] })
];

const pyHardBuilders: Builder[] = [
  (i) => ({ title: `Generator ${i}`, content: `def gen_${i}(limit):\n    for n in range(limit):\n        yield n * ${i % 4 + 1}`, tags: ['generator'] }),
  (i) => ({ title: `Class ${i}`, content: `class Counter${i}:\n    def __init__(self):\n        self.value = 0`, tags: ['class'] }),
  (i) => ({ title: `Match ${i}`, content: `def route_${i}(code):\n    match code:\n        case 200:\n            return 'ok'`, tags: ['match', 'control'] }),
  (i) => ({ title: `Zip ${i}`, content: `keys_${i} = ['a', 'b']\nvals_${i} = [${i}, ${i + 1}]\npairs_${i} = dict(zip(keys_${i}, vals_${i}))`, tags: ['dict', 'zip'] }),
  (i) => ({ title: `Lambda sort ${i}`, content: `rows_${i} = [(1, 'a'), (3, 'b'), (2, 'c')]\nrows_${i}.sort(key=lambda x: x[0])`, tags: ['lambda', 'sort'] })
];

const buildArticleFromPool = (pool: string[], startOffset: number, lineCount: number): string =>
  Array.from({ length: lineCount }, (_, lineIdx) => pool[(startOffset + lineIdx) % pool.length]).join('\n');

const englishEasyPool = [
  'Typing slowly at first helps your fingers remember each key.',
  'A steady pace is better than a fast pace that breaks every few words.',
  'When your shoulders relax, your hands usually move with less tension.',
  'Read the next phrase with your eyes before your fingers reach it.',
  'Short daily practice builds stronger habits than one long weekend session.',
  'After 5 minutes, rest your eyes for 20 seconds and then continue.',
  'Simple sentences are useful because they let you focus on rhythm.',
  'Press space with a light touch and keep your wrists level.',
  'Good posture can reduce pain and improve typing control.',
  'If you miss a word, correct it and return to a calm flow.',
  'Clear punctuation makes each sentence easier to scan quickly.',
  'A warm keyboard often feels easier after the first few lines.',
  'Train accuracy first, then increase speed in small steps.',
  'The goal is not perfect text, but consistent progress every day.',
  'A brief pause can help when your focus starts to drift.',
  'Quiet breathing can keep your tempo smooth during long runs.',
  'Your hands learn patterns faster when you repeat common words.',
  'Use a gentle key press so your fingers stay fresh.',
  'Strong habits come from repetition, feedback, and patience.',
  'Small improvements each week create a big change over time.',
  'Track your errors and notice which letters fail most often.',
  'Try to keep your eyes on the current line, not the keyboard.',
  'A focused ten-minute session can be surprisingly effective.',
  'You can build speed safely by raising your target one step at a time.'
];

const englishMediumPool = [
  'Although speed feels exciting, reliable accuracy usually predicts long-term growth.',
  'When a paragraph contains commas, your timing must adapt without breaking your flow.',
  'A practical routine includes warm-up lines, focused drills, and a brief cooldown.',
  'If your rhythm collapses after an error, pause for one breath and restart cleanly.',
  'Many typists improve faster when they review mistakes at the end of each run.',
  'The most useful feedback is specific, measurable, and connected to daily habits.',
  'As your confidence rises, increase difficulty with longer clauses and denser punctuation.',
  'A balanced session trains speed, control, and attention in roughly equal measure.',
  'Writers who draft quickly still benefit from precise keystrokes during revision.',
  'Even in a short practice block, consistency matters more than dramatic bursts.',
  'Because fatigue builds quietly, smart typists manage effort before errors explode.',
  'Complex sentences demand stronger eye tracking across clauses and transitions.',
  'If you can maintain calm under pressure, your output remains stable for longer.',
  'Good technique feels light, deliberate, and repeatable under different workloads.',
  'Measure progress weekly so small gains become visible and motivating.',
  'When punctuation increases, your hands must coordinate symbols with clear intent.',
  'A disciplined workflow turns random practice into steady skill acquisition.',
  'Most plateaus break when you reduce tension and restore clean fundamentals.',
  'Useful drills combine familiar vocabulary with uncommon character patterns.',
  'If one finger falls behind, isolate that motion and retrain it slowly.',
  'High-quality sessions end before concentration drops below a reliable threshold.',
  'You can improve endurance by extending focused practice in small increments.',
  'Consistent recovery habits protect performance over months of practice.',
  'During longer passages, maintain a stable cadence instead of chasing spikes.'
];

const englishHardPool = [
  'In performance-critical writing contexts, disciplined keystroke economy can preserve both precision and cognitive bandwidth.',
  'Because advanced prose contains nested clauses, punctuation density, and subtle transitions, typists must coordinate anticipation with restraint.',
  'A robust practice protocol alternates high-load passages with controlled recovery, thereby reducing error cascades under sustained pressure.',
  'When attention fragments across structure and semantics, execution quality degrades unless rhythm is deliberately re-centered.',
  'Skilled operators treat correction as a measured intervention, not an emotional interruption, even after conspicuous mistakes.',
  'While raw speed attracts attention, resilient throughput depends on stable mechanics, visual planning, and low-friction recovery loops.',
  'The interaction between syntax complexity and motor timing becomes especially visible during long-form, punctuation-heavy narration.',
  'Strategic pacing matters: if early tempo is excessive, downstream accuracy typically collapses before the final section.',
  'Experts often segment a paragraph into semantic units, then map finger motion to those units with near-metronomic control.',
  'Under fatigue, minor deviations compound quickly; therefore, micro-adjustments in posture and force are operationally significant.',
  'Training data suggests that intentional variability, applied carefully, improves transfer across unfamiliar lexical distributions.',
  'If a passage introduces multiple emulations of formal tone, execution must remain consistent despite stylistic shifts.',
  'High-integrity typing systems prioritize repeatability, observability, and bounded error recovery over temporary speed inflation.',
  'Long-duration sessions expose hidden inefficiencies in reach patterns, especially around punctuation and uncommon letter pairs.',
  'As complexity increases, the ability to preserve cadence through subordinate clauses becomes a meaningful differentiator.',
  'A well-calibrated routine treats pauses as control points, not failures, and re-enters flow with explicit intent.',
  'When lexical novelty rises, pre-reading half a line ahead can stabilize motor planning without reducing tempo.',
  'Sustained excellence requires balancing ambition with mechanical discipline, particularly beyond the 10-minute threshold.',
  'Operational fluency emerges when attention allocation, error handling, and rhythm management converge into a single habit.',
  'Even elite practitioners revisit fundamentals; precision under pressure is maintained through deliberate, structured repetition.',
  'In dense analytical prose, typists should preserve sentence architecture while executing symbols with minimal hesitation.',
  'Controlled breathing and ergonomic neutrality can materially reduce drift in extended high-focus runs.',
  'A mature workflow records failure patterns, updates drills, and validates gains through repeatable benchmarks.',
  'Ultimately, advanced typing is not merely fast text entry; it is sustained, verifiable control across complexity.'
];

const englishEasyBuilders: Builder[] = [
  (i) => ({
    title: `English article easy ${i}`,
    content: buildArticleFromPool(englishEasyPool, i % englishEasyPool.length, 14),
    tags: ['english', 'article', 'flow']
  })
];

const englishMediumBuilders: Builder[] = [
  (i) => ({
    title: `English article medium ${i}`,
    content: buildArticleFromPool(englishMediumPool, i % englishMediumPool.length, 16),
    tags: ['english', 'article', 'punctuation']
  })
];

const englishHardBuilders: Builder[] = [
  (i) => ({
    title: `English article hard ${i}`,
    content: buildArticleFromPool(englishHardPool, i % englishHardPool.length, 18),
    tags: ['english', 'article', 'advanced']
  })
];

export const SNIPPETS: Snippet[] = [
  ...buildPack('javascript', 'easy', jsEasyBuilders),
  ...buildPack('javascript', 'medium', jsMediumBuilders),
  ...buildPack('javascript', 'hard', jsHardBuilders),
  ...buildPack('typescript', 'easy', tsEasyBuilders),
  ...buildPack('typescript', 'medium', tsMediumBuilders),
  ...buildPack('typescript', 'hard', tsHardBuilders),
  ...buildPack('python', 'easy', pyEasyBuilders),
  ...buildPack('python', 'medium', pyMediumBuilders),
  ...buildPack('python', 'hard', pyHardBuilders),
  ...buildPack('english', 'easy', englishEasyBuilders),
  ...buildPack('english', 'medium', englishMediumBuilders),
  ...buildPack('english', 'hard', englishHardBuilders)
];

