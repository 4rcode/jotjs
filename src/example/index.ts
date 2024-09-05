import { add, html, on, put, ref } from "../main/jot.ts";

function App() {
  const addTodos = add();
  const todoInputRef = ref<HTMLInputElement>();

  const onClick = on("click", () => {
    const todoRef = ref();
    const labelRef = ref<HTMLElement>();

    const completeOnClick = on("click", () => {
      const label = labelRef();

      label.style.textDecoration = label.style.textDecoration
        ? ""
        : "line-through";
    });

    const deleteOnClick = on("click", () => {
      todoRef(put());
    });

    addTodos(html`
      <div ${todoRef}>
        <button ${completeOnClick}>C</button>
        <button ${deleteOnClick}>X</button>
        <span ${labelRef}>${todoInputRef().value}</span>
      </div>
    `);
  });

  return html`
    <h1>TODO LIST</h1>
    <input ${todoInputRef} />
    <button ${onClick}>click me</button>
    <div ${addTodos}></div>
  `;
}

document.body.append(App());
