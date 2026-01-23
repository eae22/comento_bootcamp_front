(() => {
  // DOM 로드 완료 후 앱 시작
  document.addEventListener('DOMContentLoaded', () => {
    const app = createSignupApp();
    app.init();
  });

  function createSignupApp() {
    const State = {
      users: [], // { id, pw, createdAt }
      idChecked: false,
      checkedIdValue: '',
    };

    // DOM 캐싱
    const $form = document.querySelector('.js-signup-form');

    const $id = document.querySelector('.js-id');
    const $checkBtn = document.querySelector('.js-check-btn');
    const $idHint = document.querySelector('.js-id-hint');

    const $pw = document.querySelector('.js-pw');
    const $pwHint = document.querySelector('.js-pw-hint');
    const $togglePw = document.querySelector('.js-toggle-pw');

    const $pw2 = document.querySelector('.js-pw2');
    const $pw2Hint = document.querySelector('.js-pw2-hint');
    const $togglePw2 = document.querySelector('.js-toggle-pw2');

    const $msg = document.querySelector('.js-msg');
    const $submitBtn = document.querySelector('.js-submit-btn');

    // 시작 함수
    function init() {
      bindEvents();
      resetUi();
    }

    // 이벤트 연결
    function bindEvents() {
      $checkBtn.addEventListener('click', handleCheckId);

      $id.addEventListener('input', handleIdInput);
      $pw.addEventListener('input', handlePwInput);
      $pw2.addEventListener('input', handlePw2Input);

      $togglePw.addEventListener('click', () => togglePassword($pw, $togglePw));
      $togglePw2.addEventListener('click', () => togglePassword($pw2, $togglePw2));

      $form.addEventListener('submit', handleSubmit);
    }

    // 초기 UI 상태 정리
    function resetUi() {
      setHint($idHint, '');
      setHint($pwHint, '');
      setHint($pw2Hint, '');
      setMsg('');
      setSubmitEnabled(false);
    }

    // 아이디 입력 텍스트를 바꾸면 "중복확인 다시 필요" 상태로 되돌림
    function handleIdInput() {
      State.idChecked = false;
      State.checkedIdValue = '';
      setHint($idHint, '아이디 중복확인이 필요합니다.', 'bad');
      setMsg('');
      updateSubmitState();
    }

    // 비밀번호 입력 시 규칙 검증
    function handlePwInput() {
      const { ok, message } = validatePassword($pw.value);

      if (!String($pw.value ?? '')) {
        setHint($pwHint, '');
      } else if (ok) {
        setHint($pwHint, '사용 가능한 비밀번호입니다.', 'ok');
      } else {
        setHint($pwHint, message, 'bad');
      }

      // 비밀번호가 바뀌면 확인칸도 다시 체크
      renderPw2Hint();

      setMsg('');
      updateSubmitState();
    }

    // 비밀번호 확인 -> 일치 여부 체크
    function handlePw2Input() {
      renderPw2Hint();
      updateSubmitState();
    }

    // 비밀번호 확인 힌트만 갱신
    function renderPw2Hint() {
      const pw = $pw.value;
      const pw2 = $pw2.value;

      if (!String(pw2 ?? '')) {
        setHint($pw2Hint, '');
        return;
      }

      if (pw === pw2) {
        setHint($pw2Hint, '비밀번호가 일치합니다.', 'ok');
      } else {
        setHint($pw2Hint, '비밀번호가 일치하지 않습니다.', 'bad');
      }
    }

    // 아이디 중복확인 처리
    function handleCheckId() {
      const idValue = String($id.value ?? '').trim();

      // 아이디 입력 검증
      const idError = validateId(idValue);
      if (idError) {
        failIdCheck(idError);
        return;
      }

      // 중복 여부 확인
      if (isDuplicatedId(idValue)) {
        failIdCheck('이미 사용 중인 아이디입니다.');
        return;
      }

      // 통과
      State.idChecked = true;
      State.checkedIdValue = idValue;
      setHint($idHint, '사용 가능한 아이디입니다.', 'ok');
      setMsg('');
      updateSubmitState();
    }

    // 아이디 중복확인 실패 처리
    function failIdCheck(message) {
      setHint($idHint, message, 'bad');
      State.idChecked = false;
      State.checkedIdValue = '';
      setMsg('');
      updateSubmitState();
    }

    // 제출 처리
    function handleSubmit(e) {
      e.preventDefault();

      const idValue = String($id.value ?? '').trim();
      const pwValue = String($pw.value ?? '');
      const pw2Value = String($pw2.value ?? '');

      // 1) 아이디 유효성
      const idError = validateId(idValue);
      if (idError) {
        setHint($idHint, idError, 'bad');
        setMsg('아이디를 확인해주세요.', 'bad');
        updateSubmitState();
        return;
      }

      // 2) 아이디 중복확인 여부
      if (!State.idChecked || State.checkedIdValue !== idValue) {
        setHint($idHint, '아이디 중복확인을 먼저 해주세요.', 'bad');
        setMsg('아이디 중복확인이 필요합니다.', 'bad');
        updateSubmitState();
        return;
      }

      // 3) 중복확인 이후 상태가 바뀌는 경우 재확인 유도
      if (isDuplicatedId(idValue)) {
        setHint($idHint, '이미 사용 중인 아이디입니다.', 'bad');
        State.idChecked = false;
        State.checkedIdValue = '';
        setMsg('아이디 중복확인을 다시 진행해주세요.', 'bad');
        updateSubmitState();
        return;
      }

      // 4) 비밀번호 규칙
      const pwCheck = validatePassword(pwValue);
      if (!pwCheck.ok) {
        setHint($pwHint, pwCheck.message, 'bad');
        setMsg('비밀번호 규칙을 확인해주세요.', 'bad');
        updateSubmitState();
        return;
      }

      // 5) 비밀번호 vs 비밀번호 확인 일치
      if (pwValue !== pw2Value) {
        setHint($pw2Hint, '비밀번호가 일치하지 않습니다.', 'bad');
        setMsg('비밀번호 확인을 다시 해주세요.', 'bad');
        updateSubmitState();
        return;
      }

      // 6) 회원가입 처리(배열 저장)
      addUser({ id: idValue, pw: pwValue });

      // 성공 알림
      alert(`정상적으로 회원가입 되었습니다.\n아이디: ${idValue}`);

      // 7) 초기화
      clearForm();
      resetUi();
    }

    // 사용자 추가(배열 저장)
    function addUser({ id, pw }) {
      State.users = [
        ...State.users,
        {
          id,
          pw,
          createdAt: Date.now(),
        },
      ];
    }

    // 아이디 중복 확인
    function isDuplicatedId(id) {
      return State.users.some((u) => u.id === id);
    }

    // 제출 버튼 활성/비활성 업데이트
    function updateSubmitState() {
      const idValue = String($id.value ?? '').trim();
      const pwValue = String($pw.value ?? '');
      const pw2Value = String($pw2.value ?? '');

      const isIdOk = !validateId(idValue);
      const isIdCheckedOk = State.idChecked && State.checkedIdValue === idValue && isIdOk;

      const isPwOk = validatePassword(pwValue).ok;
      const isPw2Ok = pwValue.length > 0 && pwValue === pw2Value;

      setSubmitEnabled(isIdCheckedOk && isPwOk && isPw2Ok);
    }

    // 회원가입 버튼 on/off
    function setSubmitEnabled(enabled) {
      $submitBtn.disabled = !enabled;
      $submitBtn.style.opacity = enabled ? '1' : '0.6';
      $submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }

    // 메시지 출력(폼 하단)
    function setMsg(text, type) {
      $msg.textContent = text || '';
      $msg.classList.remove('msg--ok', 'msg--bad');
      if (type === 'ok') $msg.classList.add('msg--ok');
      if (type === 'bad') $msg.classList.add('msg--bad');
    }

    // 힌트 출력(각 입력 아래)
    function setHint($el, text, type) {
      $el.textContent = text || '';
      $el.classList.remove('hint--ok', 'hint--bad');
      if (type === 'ok') $el.classList.add('hint--ok');
      if (type === 'bad') $el.classList.add('hint--bad');
    }

    // 폼 입력값 초기화
    function clearForm() {
      $id.value = '';
      $pw.value = '';
      $pw2.value = '';

      // 비밀번호 보기 상태였다면 다시 숨김으로 변경
      resetPasswordField($pw, $togglePw);
      resetPasswordField($pw2, $togglePw2);

      State.idChecked = false;
      State.checkedIdValue = '';
    }

    // 비밀번호 보기/숨기기 토글
    function togglePassword($input, $btn) {
      const isShown = $input.type === 'text';
      $input.type = isShown ? 'password' : 'text';

      $btn.setAttribute('aria-pressed', String(!isShown));
      $btn.textContent = isShown ? '보기' : '숨기기';

      $input.focus();
    }

    // 비밀번호 입력창 상태를 숨김(기본)으로 돌림
    function resetPasswordField($input, $btn) {
      $input.type = 'password';
      $btn.setAttribute('aria-pressed', 'false');
      $btn.textContent = '보기';
    }

    // 아이디 규칙(영문/숫자, 4~12자)
    function validateId(id) {
      if (!id) return '아이디를 입력해주세요.';
      if (id.length < 4) return '아이디는 4자 이상 입력해주세요.';
      if (id.length > 12) return '아이디는 12자 이내로 입력해주세요.';
      if (!/^[a-zA-Z0-9]+$/.test(id)) return '아이디는 영문과 숫자만 사용할 수 있습니다.';
      return null;
    }

    /*
      비밀번호 규칙:
      - 8자 이상
      - 대문자 1개 이상
      - 숫자 1개 이상
      - 특수문자 1개 이상
    */
    function validatePassword(pw) {
      const value = String(pw ?? '');

      if (!value) return { ok: false, message: '비밀번호를 입력해주세요.' };
      if (value.length < 8) return { ok: false, message: '8자 이상이어야 합니다.' };
      if (!/[A-Z]/.test(value)) return { ok: false, message: '대문자를 1개 이상 포함해야 합니다.' };
      if (!/[0-9]/.test(value)) return { ok: false, message: '숫자를 1개 이상 포함해야 합니다.' };
      if (!/[`~!@#$%^&*()_\-+={[}\]|\\:;"'<,>.?/]/.test(value)) {
        return { ok: false, message: '특수문자를 1개 이상 포함해야 합니다.' };
      }

      return { ok: true, message: '' };
    }

    return { init };
  }
})();
