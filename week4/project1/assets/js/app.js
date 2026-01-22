(() => {
  // DOM 준비 끝나면 앱 시작
  document.addEventListener('DOMContentLoaded', () => {
    const app = createTodoApp();
    app.init();
  });

  // 앱 구성 함수: 상태/이벤트/렌더링을 한 덩어리로 묶음
  function createTodoApp() {
    const State = {
      todos: [], // { id, text, done, createdAt }
    };

    // DOM 요소 캐싱(한번만 찾아서 재사용)
    const $form = document.querySelector('.js-todo-form');
    const $input = document.querySelector('.js-todo-input');
    const $msg = document.querySelector('.js-form-msg');
    const $list = document.querySelector('.js-todo-list');
    const $empty = document.querySelector('.js-empty');
    const $totalCount = document.querySelector('.js-total-count');
    const $doneCount = document.querySelector('.js-done-count');

    // 시작 함수: 이벤트 연결 + 첫 화면 그리기
    function init() {
      bindEvents();
      render();
    }

    // 이벤트 리스너 등록(한 곳에서 관리)
    function bindEvents() {
      $form.addEventListener('submit', handleSubmit); // 추가
      $list.addEventListener('click', handleListClick); // 완료/삭제
      $input.addEventListener('input', () => setMessage('')); // 입력 중 메시지 제거
    }

    // 입력 확인 후 todo 추가
    function handleSubmit(e) {
      e.preventDefault();

      const text = $input.value;
      const error = validateTodoText(text);
      if (error) {
        setMessage(error, 'error');
        return;
      }

      addTodo(text.trim());
      $input.value = '';
      setMessage('추가되었습니다.');
      render();
    }

    // 리스트 클릭 처리: 완료 토글/삭제 처리
    function handleListClick(e) {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const li = actionBtn.closest('li[data-id]');
      if (!li) return;

      const id = li.dataset.id;
      const action = actionBtn.dataset.action;

      if (action === 'toggle') {
        toggleTodo(id);
        render();
        return;
      }

      if (action === 'delete') {
        const ok = confirm('삭제하시겠습니까?');
        if (!ok) return;

        removeTodo(id);
        setMessage('삭제되었습니다.');
        render();
      }
    }

    // todo 추가
    function addTodo(text) {
      const todo = {
        id: createId(),
        text,
        done: false,
        createdAt: Date.now(),
      };
      State.todos = [todo, ...State.todos];
    }

    // todo 완료/미완료 토글
    function toggleTodo(id) {
      State.todos = State.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    }

    // todo 삭제
    function removeTodo(id) {
      State.todos = State.todos.filter((t) => t.id !== id);
    }

    // 화면 전체 갱신
    function render() {
      renderList();
      renderMeta();
      renderEmpty();
    }

    // 리스트 화면 렌더링
    function renderList() {
      $list.innerHTML = '';

      State.todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.done ? 'todo-item--done' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
          <button class="btn" type="button" data-action="toggle" aria-label="완료 토글">
            <span class="todo-item__check" aria-hidden="true"></span>
          </button>
          <p class="todo-item__text"></p>
          <div class="todo-item__actions">
            <button class="btn btn--danger" type="button" data-action="delete">삭제</button>
          </div>
        `;

        li.querySelector('.todo-item__text').textContent = todo.text;
        $list.appendChild(li);
      });
    }

    // 상단 카운트 갱신
    function renderMeta() {
      const total = State.todos.length;
      const done = State.todos.filter((t) => t.done).length;

      $totalCount.textContent = String(total);
      $doneCount.textContent = String(done);
    }

    // 빈 목록 안내 문구 표시/숨김
    function renderEmpty() {
      $empty.hidden = State.todos.length !== 0;
    }

    // 안내/에러 메시지 표시
    function setMessage(text, type) {
      $msg.textContent = text;
      $msg.classList.toggle('form-msg--error', type === 'error');
    }

    // 입력 검증(빈값/길이 제한)
    function validateTodoText(value) {
      const text = String(value ?? '').trim();
      if (!text) return '일정을 입력해주세요.';
      if (text.length > 50) return '일정은 50자 이내로 입력해주세요.';
      return null;
    }

    // 간단한 id 생성(시간+랜덤)
    function createId() {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    return { init };
  }
})();
