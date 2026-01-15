const $batteryText = document.querySelector('.js-battery-text');
const $clockScreen = document.querySelector('.js-clock-screen');
const $clockText = document.querySelector('.js-clock-text');
const $alarmList = document.querySelector('.js-alarm-list');
const $hourInput = document.querySelector('.js-alarm-hour');
const $minInput = document.querySelector('.js-alarm-min');
const $secInput = document.querySelector('.js-alarm-sec');
const $addAlarmBtn = document.querySelector('.js-add-alarm');
const $chargeBtn = document.querySelector('.js-charge-btn');

let battery = 100;
let alarms = [];
let batteryTimer = null;
let clockTimer = null;
let lastSecondKey = ''; // 중복 알람 방지용

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDateTime(date) {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`; // YYYY-MM-DD HH:MM:SS
}

function formatHMS(h, m, s) {
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function clampBattery() {
  if (battery < 0) battery = 0;
  if (battery > 100) battery = 100;
}

function isInt(n) {
  return Number.isInteger(n) && !Number.isNaN(n);
}

function renderBattery() {
  $batteryText.textContent = `${battery}%`;
}

function setClockOff(off) {
  if (off) {
    $clockScreen.classList.add('off');
    $clockText.textContent = '';
  } else {
    $clockScreen.classList.remove('off');
  }
}

function renderAlarms() {
  $alarmList.innerHTML = '';

  alarms.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'alarm-item';

    const span = document.createElement('span');
    span.className = 'alarm-time';
    span.textContent = t;

    // 알람 삭제 버튼
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'alarm-delete';
    delBtn.textContent = '삭제';
    delBtn.addEventListener('click', () => {
      alarms = alarms.filter((x) => x !== t);
      renderAlarms();
    });

    li.append(span, delBtn);
    $alarmList.appendChild(li);
  });
}

function flashAlarm() {
  $clockScreen.classList.add('alarm-flash');
  setTimeout(() => $clockScreen.classList.remove('alarm-flash'), 800);
}

function tickClock() {
  // 배터리 0이면 시계 OFF
  if (battery <= 0) {
    setClockOff(true);
    return;
  }

  setClockOff(false);

  const now = new Date();
  $clockText.textContent = formatDateTime(now);
  const secondKey = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  if (secondKey === lastSecondKey) return;

  const nowHMS = formatHMS(now.getHours(), now.getMinutes(), now.getSeconds());
  if (alarms.includes(nowHMS)) {
    lastSecondKey = secondKey;
    flashAlarm();
    alert(`알람 ${nowHMS}`);
  }
}

function startClock() {
  tickClock();
  clockTimer = setInterval(tickClock, 1000);
}

function startBatteryDrain() {
  // 1초에 1% 감소
  batteryTimer = setInterval(() => {
    if (battery <= 0) return;

    battery -= 1;
    clampBattery();
    renderBattery();

    if (battery <= 0) {
      setClockOff(true);
    }
  }, 1000);
}

$addAlarmBtn.addEventListener('click', () => {
  const h = Number($hourInput.value);
  const m = Number($minInput.value);
  const s = Number($secInput.value);

  if (!isInt(h) || !isInt(m) || !isInt(s)) {
    alert('시, 분, 초를 숫자로 입력해주세요.');
    return;
  }
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
    alert('시간 범위가 올바르지 않습니다. (시 : 0~23, 분, 초 : 0~59)');
    return;
  }

  if (alarms.length >= 3) {
    alert('알람은 최대 3개까지 가능합니다.');
    return;
  }

  const timeStr = formatHMS(h, m, s);

  if (alarms.includes(timeStr)) {
    alert('이미 같은 시간 알람이 있어요.');
    return;
  }

  alarms.push(timeStr);
  renderAlarms();

  $hourInput.value = '';
  $minInput.value = '';
  $secInput.value = '';
});

// 배터리 충전 버튼
$chargeBtn.addEventListener('click', () => {
  battery += 20;
  clampBattery();
  renderBattery();

  if (battery > 0) {
    // 0%였다가 충전하면 다시 시계 on
    tickClock();
  }
});

// 초기화

renderBattery();
renderAlarms();
startBatteryDrain();
startClock();
