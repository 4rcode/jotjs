import { css, html, on, ref } from "../main/jot.ts";

css`
  :where(&, *) {
    appearance: none;
    background: none;
    border: inherit;
    box-sizing: border-box;
    color: inherit;
    font-family: system-ui;
    font-size: inherit;
    font-weight: inherit;
    line-height: normal;
    margin: 0;
    outline: none;
    padding-block: 0;
    padding-inline: 0;
    padding: 0;
  }

  :where(&) {
    border: 0 solid #999;
    background-color: #eee;
  }
`(document.body);

const style = css`
  & {
    width: 24rem;
    margin: 2rem auto;
    color: #444;
  }

  h1 {
    font-size: 2rem;
    font-weight: lighter;
    margin: 1rem 0;
  }

  form {
    display: flex;
  }

  input,
  button {
    background-color: #ddd;
    border-width: 0.1rem;
    margin: 0.25rem;
    padding: 0.25rem;
  }

  input {
    flex-grow: 1;
  }
`;

function App() {
  const list = ref();
  const input = ref<HTMLInputElement>();

  const onSubmit = on("click", (event) => {
    event.preventDefault();

    if (!input.ref.value) {
      return;
    }

    const todo = ref();
    const label = ref();

    const completeOnClick = on("click", () => {
      label.ref.style.textDecoration = label.ref.style.textDecoration
        ? ""
        : "line-through";
    });

    const deleteOnClick = on("click", () => {
      todo.ref.replaceWith();
    });

    list.ref.append(html`
      <div ${todo}>
        <button ${deleteOnClick}>X</button>
        <button ${completeOnClick}>C</button>
        <span ${label}>${input.ref.value}</span>
      </div>
    `);

    input.ref.value = "";
  });

  return html`
    <div ${style}>
      <h1>TODO LIST</h1>
      <form ${onSubmit}>
        <input
          ${input}
          ${(e: HTMLElement) => {
            e.className = "foobar";
          }}
        />
        <button>Create new todo</button>
      </form>
      <div ${list}></div>
    </div>
  `;
}

document.body.append(App());
