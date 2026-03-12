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

export const SNIPPETS: Snippet[] = [
  ...buildPack('javascript', 'easy', jsEasyBuilders),
  ...buildPack('javascript', 'medium', jsMediumBuilders),
  ...buildPack('javascript', 'hard', jsHardBuilders),
  ...buildPack('typescript', 'easy', tsEasyBuilders),
  ...buildPack('typescript', 'medium', tsMediumBuilders),
  ...buildPack('typescript', 'hard', tsHardBuilders),
  ...buildPack('python', 'easy', pyEasyBuilders),
  ...buildPack('python', 'medium', pyMediumBuilders),
  ...buildPack('python', 'hard', pyHardBuilders)
];
