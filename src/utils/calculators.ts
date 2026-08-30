/**
 * Calculator utilities: scientific expression evaluation, unit conversion,
 * and UK salary calculation (2024/25 tax year bands).
 */

// ---------------------------------------------------------------------------
// Scientific calculator — safe expression evaluator (no eval/Function)
// ---------------------------------------------------------------------------

type TokenType = 'number' | 'operator' | 'lparen' | 'rparen' | 'function' | 'constant' | 'comma';

interface Token {
  type: TokenType;
  value: string;
}

const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs', 'exp']);
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E
};

export class CalculatorError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = input.replace(/\s+/g, '');

  while (i < src.length) {
    const ch = src[i];

    if (/[0-9.]/.test(ch)) {
      let num = ch;
      i++;
      while (i < src.length && /[0-9.]/.test(src[i])) {
        num += src[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let word = ch;
      i++;
      while (i < src.length && /[a-zA-Z]/.test(src[i])) {
        word += src[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (FUNCTIONS.has(lower)) {
        tokens.push({ type: 'function', value: lower });
      } else if (lower in CONSTANTS) {
        tokens.push({ type: 'constant', value: lower });
      } else {
        throw new CalculatorError(`Unknown identifier: ${word}`);
      }
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen', value: ch });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ch });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma', value: ch });
      i++;
      continue;
    }
    if (['+', '-', '*', '/', '^', '%'].includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    throw new CalculatorError(`Unexpected character: ${ch}`);
  }

  return tokens;
}

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
const RIGHT_ASSOC = new Set(['^']);

/** Convert infix tokens to RPN using the shunting-yard algorithm. */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  // Insert implicit multiplication, e.g. 2(3) -> 2*(3), 2pi -> 2*pi
  const expanded: Token[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const cur = tokens[idx];
    const prev = tokens[idx - 1];
    if (
      prev &&
      (prev.type === 'number' || prev.type === 'rparen' || prev.type === 'constant') &&
      (cur.type === 'number' || cur.type === 'lparen' || cur.type === 'function' || cur.type === 'constant')
    ) {
      expanded.push({ type: 'operator', value: '*' });
    }
    expanded.push(cur);
  }

  for (const token of expanded) {
    switch (token.type) {
      case 'number':
      case 'constant':
        output.push(token);
        break;
      case 'function':
        stack.push(token);
        break;
      case 'comma':
        while (stack.length && stack[stack.length - 1].type !== 'lparen') {
          output.push(stack.pop() as Token);
        }
        break;
      case 'operator': {
        while (
          stack.length &&
          stack[stack.length - 1].type === 'operator' &&
          (PRECEDENCE[stack[stack.length - 1].value] > PRECEDENCE[token.value] ||
            (PRECEDENCE[stack[stack.length - 1].value] === PRECEDENCE[token.value] && !RIGHT_ASSOC.has(token.value)))
        ) {
          output.push(stack.pop() as Token);
        }
        stack.push(token);
        break;
      }
      case 'lparen':
        stack.push(token);
        break;
      case 'rparen': {
        while (stack.length && stack[stack.length - 1].type !== 'lparen') {
          output.push(stack.pop() as Token);
        }
        if (!stack.length) throw new CalculatorError('Mismatched parentheses');
        stack.pop(); // discard lparen
        if (stack.length && stack[stack.length - 1].type === 'function') {
          output.push(stack.pop() as Token);
        }
        break;
      }
    }
  }

  while (stack.length) {
    const top = stack.pop() as Token;
    if (top.type === 'lparen' || top.type === 'rparen') {
      throw new CalculatorError('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

function applyFunction(name: string, arg: number): number {
  switch (name) {
    case 'sin': return Math.sin(arg);
    case 'cos': return Math.cos(arg);
    case 'tan': return Math.tan(arg);
    case 'asin': return Math.asin(arg);
    case 'acos': return Math.acos(arg);
    case 'atan': return Math.atan(arg);
    case 'log': return Math.log10(arg);
    case 'ln': return Math.log(arg);
    case 'sqrt': return Math.sqrt(arg);
    case 'abs': return Math.abs(arg);
    case 'exp': return Math.exp(arg);
    default: throw new CalculatorError(`Unknown function: ${name}`);
  }
}

function applyOperator(op: string, a: number, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/':
      if (b === 0) throw new CalculatorError('Division by zero');
      return a / b;
    case '%': return a % b;
    case '^': return Math.pow(a, b);
    default: throw new CalculatorError(`Unknown operator: ${op}`);
  }
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'constant') {
      stack.push(CONSTANTS[token.value]);
    } else if (token.type === 'function') {
      const arg = stack.pop();
      if (arg === undefined) throw new CalculatorError('Invalid expression');
      stack.push(applyFunction(token.value, arg));
    } else if (token.type === 'operator') {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new CalculatorError('Invalid expression');
      stack.push(applyOperator(token.value, a, b));
    }
  }

  if (stack.length !== 1) throw new CalculatorError('Invalid expression');
  return stack[0];
}

/** Handle unary +/- by rewriting to (0-x) / prefixing, done at the token level. */
function handleUnary(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = tokens[i - 1];
    if (
      token.type === 'operator' &&
      (token.value === '-' || token.value === '+') &&
      (!prev || prev.type === 'operator' || prev.type === 'lparen' || prev.type === 'comma')
    ) {
      result.push({ type: 'number', value: '0' });
      result.push(token);
    } else {
      result.push(token);
    }
  }
  return result;
}

/** Evaluate a mathematical expression string. Throws CalculatorError on invalid input. */
export function evaluateExpression(expression: string): number {
  if (!expression || !expression.trim()) throw new CalculatorError('Empty expression');
  const tokens = handleUnary(tokenize(expression));
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);
  if (!Number.isFinite(result)) throw new CalculatorError('Result is not finite');
  return result;
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'data' | 'time';

interface UnitDefinition {
  label: string;
  /** Multiplier to convert this unit to the category's base unit (ignored for temperature). */
  toBase: number;
}

export const UNIT_DEFINITIONS: Record<UnitCategory, Record<string, UnitDefinition>> = {
  length: {
    mm: { label: 'Millimetres', toBase: 0.001 },
    cm: { label: 'Centimetres', toBase: 0.01 },
    m: { label: 'Metres', toBase: 1 },
    km: { label: 'Kilometres', toBase: 1000 },
    in: { label: 'Inches', toBase: 0.0254 },
    ft: { label: 'Feet', toBase: 0.3048 },
    yd: { label: 'Yards', toBase: 0.9144 },
    mi: { label: 'Miles', toBase: 1609.344 }
  },
  weight: {
    mg: { label: 'Milligrams', toBase: 0.001 },
    g: { label: 'Grams', toBase: 1 },
    kg: { label: 'Kilograms', toBase: 1000 },
    t: { label: 'Tonnes', toBase: 1_000_000 },
    oz: { label: 'Ounces', toBase: 28.349523125 },
    lb: { label: 'Pounds', toBase: 453.59237 },
    st: { label: 'Stone', toBase: 6350.29318 }
  },
  temperature: {
    c: { label: 'Celsius', toBase: 1 },
    f: { label: 'Fahrenheit', toBase: 1 },
    k: { label: 'Kelvin', toBase: 1 }
  },
  volume: {
    ml: { label: 'Millilitres', toBase: 0.001 },
    l: { label: 'Litres', toBase: 1 },
    'gal-uk': { label: 'Gallons (UK)', toBase: 4.54609 },
    'gal-us': { label: 'Gallons (US)', toBase: 3.785411784 },
    'pt-uk': { label: 'Pints (UK)', toBase: 0.56826125 },
    'fl-oz-uk': { label: 'Fluid Ounces (UK)', toBase: 0.0284130625 },
    'cubic-m': { label: 'Cubic Metres', toBase: 1000 }
  },
  area: {
    'sq-mm': { label: 'Square Millimetres', toBase: 0.000001 },
    'sq-cm': { label: 'Square Centimetres', toBase: 0.0001 },
    'sq-m': { label: 'Square Metres', toBase: 1 },
    hectare: { label: 'Hectares', toBase: 10000 },
    'sq-km': { label: 'Square Kilometres', toBase: 1_000_000 },
    'sq-ft': { label: 'Square Feet', toBase: 0.09290304 },
    'sq-yd': { label: 'Square Yards', toBase: 0.83612736 },
    acre: { label: 'Acres', toBase: 4046.8564224 },
    'sq-mi': { label: 'Square Miles', toBase: 2_589_988.110336 }
  },
  speed: {
    mps: { label: 'Metres/second', toBase: 1 },
    kph: { label: 'Kilometres/hour', toBase: 0.277777778 },
    mph: { label: 'Miles/hour', toBase: 0.44704 },
    knot: { label: 'Knots', toBase: 0.514444444 }
  },
  data: {
    bit: { label: 'Bits', toBase: 0.125 },
    byte: { label: 'Bytes', toBase: 1 },
    kb: { label: 'Kilobytes', toBase: 1024 },
    mb: { label: 'Megabytes', toBase: 1024 ** 2 },
    gb: { label: 'Gigabytes', toBase: 1024 ** 3 },
    tb: { label: 'Terabytes', toBase: 1024 ** 4 }
  },
  time: {
    ms: { label: 'Milliseconds', toBase: 0.001 },
    s: { label: 'Seconds', toBase: 1 },
    min: { label: 'Minutes', toBase: 60 },
    hr: { label: 'Hours', toBase: 3600 },
    day: { label: 'Days', toBase: 86400 },
    week: { label: 'Weeks', toBase: 604800 }
  }
};

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  switch (from) {
    case 'c': celsius = value; break;
    case 'f': celsius = ((value - 32) * 5) / 9; break;
    case 'k': celsius = value - 273.15; break;
    default: throw new Error(`Unknown temperature unit: ${from}`);
  }
  switch (to) {
    case 'c': return celsius;
    case 'f': return (celsius * 9) / 5 + 32;
    case 'k': return celsius + 273.15;
    default: throw new Error(`Unknown temperature unit: ${to}`);
  }
}

export function convertUnit(value: number, category: UnitCategory, from: string, to: string): number {
  if (category === 'temperature') return convertTemperature(value, from, to);

  const defs = UNIT_DEFINITIONS[category];
  const fromDef = defs[from];
  const toDef = defs[to];
  if (!fromDef || !toDef) throw new Error(`Unknown unit for category ${category}`);

  const baseValue = value * fromDef.toBase;
  return baseValue / toDef.toBase;
}

// ---------------------------------------------------------------------------
// UK salary calculator (2024/25 tax year)
// ---------------------------------------------------------------------------

export interface SalaryInput {
  grossAnnual: number;
  taxCode?: string;
  studentLoanPlan?: 'none' | 'plan1' | 'plan2' | 'plan4' | 'postgrad';
  pensionPercent?: number;
  isScottish?: boolean;
}

export interface SalaryResult {
  grossAnnual: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoan: number;
  pensionContribution: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  effectiveTaxRate: number;
  breakdown: { band: string; amount: number; rate: number; tax: number }[];
}

const PERSONAL_ALLOWANCE = 12570;
const PERSONAL_ALLOWANCE_TAPER_START = 100000;

const ENGLAND_BANDS = [
  { name: 'Basic rate', upTo: 50270, rate: 0.2 },
  { name: 'Higher rate', upTo: 125140, rate: 0.4 },
  { name: 'Additional rate', upTo: Infinity, rate: 0.45 }
];

const SCOTLAND_BANDS = [
  { name: 'Starter rate', upTo: 14876, rate: 0.19 },
  { name: 'Basic rate', upTo: 26561, rate: 0.2 },
  { name: 'Intermediate rate', upTo: 43662, rate: 0.21 },
  { name: 'Higher rate', upTo: 75000, rate: 0.42 },
  { name: 'Advanced rate', upTo: 125140, rate: 0.45 },
  { name: 'Top rate', upTo: Infinity, rate: 0.48 }
];

const NI_PRIMARY_THRESHOLD = 12570;
const NI_UPPER_EARNINGS_LIMIT = 50270;
const NI_MAIN_RATE = 0.08;
const NI_UPPER_RATE = 0.02;

const STUDENT_LOAN_THRESHOLDS: Record<string, { threshold: number; rate: number }> = {
  plan1: { threshold: 24990, rate: 0.09 },
  plan2: { threshold: 27295, rate: 0.09 },
  plan4: { threshold: 31395, rate: 0.09 },
  postgrad: { threshold: 21000, rate: 0.06 }
};

function calculatePersonalAllowance(grossAnnual: number): number {
  if (grossAnnual <= PERSONAL_ALLOWANCE_TAPER_START) return PERSONAL_ALLOWANCE;
  const reduction = Math.floor((grossAnnual - PERSONAL_ALLOWANCE_TAPER_START) / 2);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

function calculateIncomeTax(taxableIncome: number, isScottish: boolean): { total: number; breakdown: SalaryResult['breakdown'] } {
  const bands = isScottish ? SCOTLAND_BANDS : ENGLAND_BANDS;
  const breakdown: SalaryResult['breakdown'] = [];
  let remaining = taxableIncome;
  let lowerBound = 0;
  let total = 0;

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandWidth = band.upTo - lowerBound;
    const amountInBand = Math.min(remaining, bandWidth);
    const tax = amountInBand * band.rate;
    if (amountInBand > 0) {
      breakdown.push({ band: band.name, amount: amountInBand, rate: band.rate, tax });
      total += tax;
    }
    remaining -= amountInBand;
    lowerBound = band.upTo;
  }

  return { total, breakdown };
}

function calculateNationalInsurance(grossAnnual: number): number {
  if (grossAnnual <= NI_PRIMARY_THRESHOLD) return 0;
  const mainBandEarnings = Math.min(grossAnnual, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD;
  const upperBandEarnings = Math.max(0, grossAnnual - NI_UPPER_EARNINGS_LIMIT);
  return mainBandEarnings * NI_MAIN_RATE + upperBandEarnings * NI_UPPER_RATE;
}

function calculateStudentLoan(grossAnnual: number, plan: string): number {
  const config = STUDENT_LOAN_THRESHOLDS[plan];
  if (!config || grossAnnual <= config.threshold) return 0;
  return (grossAnnual - config.threshold) * config.rate;
}

export function calculateUKSalary(input: SalaryInput): SalaryResult {
  const { grossAnnual, studentLoanPlan = 'none', pensionPercent = 0, isScottish = false } = input;

  if (grossAnnual < 0) throw new Error('Gross salary cannot be negative');

  const pensionContribution = grossAnnual * (pensionPercent / 100);
  const pensionableGross = grossAnnual - pensionContribution;

  const personalAllowance = calculatePersonalAllowance(pensionableGross);
  const taxableIncome = Math.max(0, pensionableGross - personalAllowance);

  const { total: incomeTax, breakdown } = calculateIncomeTax(taxableIncome, isScottish);
  const nationalInsurance = calculateNationalInsurance(pensionableGross);
  const studentLoan = studentLoanPlan === 'none' ? 0 : calculateStudentLoan(pensionableGross, studentLoanPlan);

  const netAnnual = grossAnnual - incomeTax - nationalInsurance - studentLoan - pensionContribution;

  return {
    grossAnnual,
    personalAllowance,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    studentLoan,
    pensionContribution,
    netAnnual,
    netMonthly: netAnnual / 12,
    netWeekly: netAnnual / 52,
    effectiveTaxRate: grossAnnual > 0 ? (incomeTax + nationalInsurance) / grossAnnual : 0,
    breakdown
  };
}
