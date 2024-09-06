import { html, on, ref } from "../main/jot.ts";

function App() {
  const list = ref();
  const input = ref<HTMLInputElement>();

  const onClick = on("click", () => {
    const todo = ref();
    const label = ref();

    const completeOnClick = on("click", () => {
      label.style.textDecoration = label.style.textDecoration
        ? ""
        : "line-through";
    });

    const deleteOnClick = on("click", () => {
      todo.replaceChildren();
    });

    list.append(html`
      <div ${todo}>
        <button ${completeOnClick}>C</button>
        <button ${deleteOnClick}>X</button>
        <span ${label}>${input.value}</span>
      </div>
    `);
  });

  return html`
    <h1>TODO LIST</h1>
    <input ${input} />
    <button ${onClick}>click me</button>
    <div ${list}></div>
  `;
}

document.body.append(App());
