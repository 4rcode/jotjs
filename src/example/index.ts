import { on } from "../main/core.ts";
import { add, html, ref } from "../main/jot.ts";

function App() {
  const addTodos = add();
  const todoInput: () => HTMLInputElement = ref();

  const onClick = on("click", () => {
    const item: () => Element = ref();
    const label: () => HTMLElement = ref();

    const onCompleteClick = on("click", () => {
      const i = label();

      i.style.textDecoration = i.style.textDecoration ? "" : "line-through";
    });

    const onDeleteClick = on("click", () => {
      item().replaceWith();
    });

    addTodos(html`
      <div ${item}>
        <button ${onCompleteClick}>C</button>
        <button ${onDeleteClick}>X</button>
        <span ${label}>${todoInput().value}</span>
      </div>
    `);
  });

  return html`
    <h1>TODO LIST</h1>
    <input ${todoInput} />
    <button ${onClick}>click me</button>
    <div ${addTodos}></div>
  `;
}

document.body.append(App());
