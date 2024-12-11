import { css, fragment, jot, on, put, tags, use } from "../main/mod.ts";

const x = tags;

function Item(label: string, onclick: EventListener) {
  const completed = use(false);

  return x.div(
    x.button(
      "✔️",
      { type: "button" },
      on("click", () => (completed.value = !completed.value)),
    ),
    x.button("⌦", { type: "button" }, on("click", onclick)),
    x.span(label, {
      style: put((s) => {
        s.textDecoration = completed.value ? "line-through" : "";
      }),
    }),
  );
}

function App() {
  const todos = use<string[]>([]);
  const label = x.input();

  return fragment(
    x.form(
      label,
      x.button("+"),
      x.button(
        "⊗",
        { type: "button" },
        on("click", () => (todos.value = [])),
      ),
      on("submit", (event) => {
        event.preventDefault();

        if (!label.value) {
          return;
        }

        todos.value = [...todos.value, label.value];
        label.value = "";
      }),
    ),
    fragment(() =>
      fragment(
        ...todos.value.entries().map(([id, element]) =>
          Item(element, () => {
            todos.value.splice(id, 1);
            todos.value = [...todos.value];
          }),
        ),
      ),
    ),
  );
}

jot(
  document.body,
  App(),
  css(
    {
      fontFamily: "system-ui",
    },
    [
      "*, ::before, ::after",
      {
        all: "unset",
        display: "revert",
        margin: ".25rem",
        padding: ".25rem",
      },
    ],
    [
      "h1",
      {
        fontSize: "2rem",
      },
    ],
    [
      "input, button",
      {
        minHeight: "2rem",
        minWidth: "2rem",
        padding: ".25rem .75rem",
        border: ".1rem solid #ccc",
        backgroundColor: "#eee",
      },
    ],
    [
      "button",
      {
        textAlign: "center",
      },
    ],
  ),
);
