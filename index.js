import { getNode, insertLast } from "./lib/dom.js";
import { getStorage, setStorage } from "./lib/storage.js";

// save시 Prettier가 작동하도록 설정되어 있으면 아마도 한 줄로 다 엮어버릴 거에요.
// 저는 그냥 Shift + Alt + F 눌렀을 때만 작동하도록 설정해뒀습니다.

let inputForm = getNode("#add-todo-form");
let inputText = getNode("#add-todo-input");
let todoListUl = getNode("#todo-list-ul");
let selectCompleteBtn = getNode("#select-complete-btn");
let selectIncompleteBtn = getNode("#select-incomplete-btn");

// 저장된 할 일 데이터 불러오기(localStorage → 메모리 배열)
let todoListArray = getStorage();

// 완료된 상태 표시용 SVG 아이콘 문자열
const completedSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22
22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4
12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12
20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18
9L16.59 7.58Z" fill="#9CE3A5"/>
</svg>
`;

// 미완료 상태 표시용 SVG 아이콘 문자열
const incompleteSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22
22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4
12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12
20Z" fill="#A4A4A4"/>
</svg>
`;

// 삭제 표시용 SVG 아이콘
const deleteBtnSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
xmlns="http://www.w3.org/2000/svg">
<path d="M5 9V11H15V9H5ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20
10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18
2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41
18 10 18Z" fill="#FF6969"/>
</svg>
`;

// form submit 처리 방지
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = inputText.value.trim();
  if (!value) return;

  const id = Date.now();
  addItemArray(id, value);
  renderItem({ target: todoListUl, value, id });
  setStorage(todoListArray);
  inputText.value = "";
});

// 완료 항목만 보기 버튼 클릭 이벤트 처리
selectCompleteBtn.addEventListener("click", () => {
  moveToCompleteTab();
});

// 미완료 항목만 보기 버튼 클릭 이벤트 처리
selectIncompleteBtn.addEventListener("click", () => {
  moveToImCompleteTab();
});

// 완료된 할 일만 화면에 표시하는 함수
function moveToCompleteTab() {
  todoListUl.innerHTML = "";
  todoListArray
    .filter((item) => item.completed)
    .forEach((item) => renderItem({ target: todoListUl, ...item }));
}

// 미완료 할 일만 화면에 표시하는 함수
function moveToImCompleteTab() {
  todoListUl.innerHTML = "";
  todoListArray
    .filter((item) => !item.completed)
    .forEach((item) => renderItem({ target: todoListUl, ...item }));
}

// 할 일 항목을 문자열로 생성
function createItem(value, id, completed = false) {
  const checkedClass = completed ? "completed" : "";
  return `
    <li class="todo-list-cell" data-id="${id}">
      <div class="align-wrap">
        <button class="todo-list-complete-btn">
          ${
            completed ? completedSvg : incompleteSvg
          }  <!-- 상태에 따른 아이콘 -->
        </button>
        <div class="todo-list-text ${checkedClass}">${value}</div>  <!-- 할 일 텍스트 -->
      </div>
      <div class="align-wrap">
        <div class="todo-list-date">${getToday()}</div>  <!-- 오늘 날짜 표시 -->
        <button type="button" class="todo-list-optional">${deleteBtnSvg}</button> <!-- 삭제 버튼 -->
      </div>
    </li>
    `;
}

// `createItem`을 사용해 생성된 `<li>`를 `target` 요소의 맨 뒤에 추가함 (ul 목록 안에 li가 삽입되는 구조)
function renderItem({ target, value, id, completed }) {
  const toDoHtml = createItem(value, id, completed);
  insertLast(target, toDoHtml);
}

// 해당 data-id를 가진 <li> 요소를 찾아 DOM에서 제거
function removeItem(id) {
  const toDoHtmlli = document.querySelector(`li[data-id='${id}']`);
  if (toDoHtmlli) toDoHtmlli.remove();
}

// 새로운 할 일을 todoListArray에 객체 형태로 추가
function addItemArray(id, value) {
  todoListArray.push({ id, value, completed: false });
}

// 배열에서 해당 id와 일치하는 항목을 제거 (filter 사용)
function removeItemArray(id) {
  todoListArray = todoListArray.filter((item) => item.id !== id);
}

// 완료 상태 토글 처리 함수
function handleToggleComplete(id, li) {
  const item = todoListArray.find((item) => item.id === id);
  if (!item) return;
  item.completed = !item.completed;
  setStorage(todoListArray);

  li.querySelector(".todo-list-text").classList.toggle("completed");
  li.querySelector(".todo-list-complete-btn").innerHTML = item.completed
    ? completedSvg
    : incompleteSvg;
}

// <ul> 안에서 항목을 클릭하면 실행됨
// 해당 항목을 제거하고, 배열에서도 삭제하며, localStorage 업데이트
function handleRemove(id) {
  removeItem(id);
  removeItemArray(id);
  setStorage(todoListArray);
}

// 이벤트 위임: 삭제 / 완료 버튼 클릭 모두 처리
todoListUl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.closest(".todo-list-optional")) {
    handleRemove(id);
  }

  if (e.target.closest(".todo-list-complete-btn")) {
    handleToggleComplete(id, li);
  }
});

function getToday() {
  const today = new Date();
  return `${today.getMonth() + 1}월 ${today.getDate()}일`;
}

// 페이지가 로드되었을 때 실행
// localStorage에서 기존 todo 데이터를 불러와 목록 복원
function init() {
  todoListUl.innerHTML = "";
  todoListArray.forEach((item) => renderItem({ target: todoListUl, ...item })); // 저장된 항목 전부 렌더링
}

init();
