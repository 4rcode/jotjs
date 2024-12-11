import { jot } from "../main/jot.ts";
import { css, fragment, type Function, tags, use } from "../main/mod.ts";

const { button, div, input, span, h1, form } = tags;

function Item(label: string, onclick: Function<unknown, void>) {
  const completed = use(false);

  return div(
    button("✔️", {
      onclick: () => (completed.value = !completed.value),
    }),
    button("⌦", {
      onclick,
    }),
    span(label, {
      style: [
        (s) => {
          s.textDecoration = completed.value ? "line-through" : "";
        },
      ],
    }),
  );
}

function App() {
  const data = use({ todos: new Set<string>() });
  const label = input();

  return div(
    h1("TODO LIST"),
    form(
      {
        onsubmit: (event) => {
          event.preventDefault();

          if (!label.value) {
            return;
          }

          data.value = {
            todos: (data.value.todos.add(label.value), data.value.todos),
          };
          label.value = "";
        },
      },
      label,
      button("+"),
    ),
    () =>
      fragment(
        ...data.value.todos.values().map((element) =>
          Item(element, () => {
            data.value = {
              todos: (data.value.todos.delete(element), data.value.todos),
            };
          })
        ),
      ),
  );
}

jot(
  document.body,
  css({
    fontFamily: "system-ui",
  }, ["*, ::before, ::after", {
    all: "unset",
    display: "revert",
    margin: ".25rem",
    padding: ".25rem",
  }], ["h1", {
    fontSize: "2rem",
  }], ["input, button", {
    minHeight: "2rem",
    minWidth: "2rem",
    padding: ".25rem .75rem",
    border: ".1rem solid #ccc",
    backgroundColor: "#eee",
  }], ["button", {
    textAlign: "center",
  }]),
  App(),
);
