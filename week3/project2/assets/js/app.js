const $expr = document.querySelector('.js-expr');
const $result = document.querySelector('.js-result');
const $keypad = document.querySelector('.js-keypad');
const $history = document.querySelector('.js-history');
const $clearHistoryBtn = document.querySelector('.js-clear-history');

let expr = '0'; // 화면 상단에 보여줄 "입력 중 식"
let lastEval = ''; // 마지막 계산 결과

// 연산 기록
let history = [];

const OPS = new Set(['+', '-', '*', '/']);

function render() {
  $expr.textContent = expr || '0';
  $result.textContent = lastEval;
}

function renderHistory() {
  if (!$history) return;
  $history.innerHTML = '';
  history.slice(-10).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.textContent = item;
    $history.appendChild(li);
  });
}

function isNumberChar(ch) {
  return (ch >= '0' && ch <= '9') || ch === '.' || ch === '00';
}

function endsWithOperator(s) {
  return OPS.has(s.slice(-1));
}

function safeNormalizeExpression(input) {
  const cleaned = input.replace(/[^0-9+\-*/.]/g, '');
  return cleaned;
}

function tryEvaluate(inputExpr) {
  const normalized = safeNormalizeExpression(inputExpr);

  if (!normalized || endsWithOperator(normalized)) return null;

  try {
    const value = Function(`"use strict"; return (${normalized});`)();
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    if (!Number.isFinite(value)) return 'Infinity';
    return String(Math.round(value * 1e12) / 1e12);
  } catch {
    return null;
  }
}

function setExpr(next) {
  expr = next === '' ? '0' : next;
  render();
}

function appendDigitOrDot(ch) {
  if (expr === '0' && ch !== '.') {
    setExpr(ch);
    return;
  }

  if (ch === '.') {
    const lastOpIndex = Math.max(
      expr.lastIndexOf('+'),
      expr.lastIndexOf('-'),
      expr.lastIndexOf('*'),
      expr.lastIndexOf('/')
    );
    const token = expr.slice(lastOpIndex + 1);
    if (token.includes('.')) return;
    if (token === '') {
      setExpr(expr + '0.');
      return;
    }
  }

  setExpr(expr + ch);
}

function appendOperator(op) {
  if (expr === '0') {
    if (op === '-') {
      setExpr('-');
    }
    return;
  }

  if (endsWithOperator(expr)) {
    setExpr(expr.slice(0, -1) + op);
    return;
  }

  setExpr(expr + op);
}

function clearAll() {
  expr = '0';
  lastEval = '';
  render();
}

function clearEntry() {
  if (expr.length <= 1) {
    expr = '0';
  } else {
    expr = expr.slice(0, -1);
    if (expr === '-' || expr === '') expr = '0';
  }
  lastEval = '';
  render();
}

function equals() {
  const value = tryEvaluate(expr);
  if (value === null) {
    lastEval = 'Error';
    render();
    return;
  }

  lastEval = value;

  history.push(`${expr} = ${value}`);
  renderHistory();

  expr = value === 'Infinity' ? '0' : value;
  render();
}

$keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('.js-key');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'C') {
    clearAll();
    return;
  }
  if (action === 'CE') {
    clearEntry();
    return;
  }
  if (action === '=') {
    equals();
    return;
  }

  if (value) {
    if (isNumberChar(value)) appendDigitOrDot(value);
    else if (OPS.has(value)) appendOperator(value);
  }
});

if ($clearHistoryBtn) {
  $clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
  });
}

render();
renderHistory();
