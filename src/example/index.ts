import { bag, Mutable, spy, tags, use } from "../main/jot.ts";

const { button, div, span } = tags;

const state1 = use(0);
const state2 = use(0);
const view = spy(() => state1.value + " " + state2.value);

let tmp: Mutable<unknown> | undefined = spy(() =>
  console.log("tmp", state1.value, state2.value),
);

void tmp;

function App() {
  return bag(
    button("A", {
      onclick: () => {
        state1.value = Date.now();
      },
    }),
    button("B", {
      onclick: () => {
        state2.value = Date.now();
      },
    }),
    button(
      "temporary view",
      {
        onclick: (e) => {
          (e.currentTarget as ChildNode).remove();
          tmp = undefined;
        },
      },
      () => console.log("tmp view", state1.value, state2.value),
    ),
    div(() => state1.value),
    div(() => span(view.value)),
  );
}

document.body.append(App());

// setTimeout(() => {
//   document.body.replaceChildren();
// }, 3_000);

// import { tags, use } from "../main/mod.ts";

// const j = tags;

// function Todo(item: string) {
//   const completed = use(false);

//   const label = j.span(item, {
//     style: [
//       (s) => {
//         s.textDecoration = completed.value ? "line-through" : "";
//       },
//     ],
//   });

//   const todo = j.div(
//     j.button("X", {
//       onclick: () => {
//         // dispose(todo);
//         todo.replaceWith();
//       },
//     }),
//     j.button("C", {
//       onclick: () => (completed.value = !completed.value),
//     }),
//     label,
//   );

//   return todo;
// }

// function App() {
//   const list = j.div();
//   const input = j.input();

//   return j.div(
//     j.h1("TODO LIST"),
//     j.form(
//       {
//         onsubmit: (event) => {
//           event.preventDefault();

//           if (!input.value) {
//             return;
//           }

//           list.append(Todo(input.value));
//           input.value = "";
//         },
//       },
//       input,
//       j.button("Create new todo"),
//       list,
//     ),
//   );
// }

// document.body.append(App());

/**
 *
 *
 *
 * OLD
 *
 *
 *
 */

// const url =
//   "https://corsproxy.io/?" +
//   encodeURIComponent(
//     "https://tabs.ultimate-guitar.com/tab/brooke-fraser-brooke-ligertwood/bless-god-chords-4996846",
//   );

// const doc = document
//   .createRange()
//   .createContextualFragment(await (await fetch(url)).text());

// const text = doc.querySelector("div.js-store")?.getAttribute("data-content");

// const data = JSON.parse(text || "{}");

// document.body.append(pre(data.store.page.data.tab_view.wiki_tab.content));

// css`
//   :where(&, *) {
//     all: unset;
//   }

//   :where(&, *) {
//     border: 0 solid var(--fg);
//     box-sizing: border-box;
//     display: revert;
//     outline: var(--accent) solid 0;

//     :focus-visible {
//       outline-width: 0.2rem;
//     }
//   }

//   & {
//     --bg: #ddd;
//     --fg: #333;
//     --primary: #0ff;
//     --secondary: #f0f;
//     --accent: #0f0;
//     background-color: var(--bg);
//     line-height: 1.5;
//     font-family: system-ui;
//   }

//   &.dark,
//   .dark {
//     --bg: #333;
//     --fg: #ccc;
//   }
// `(document.body);

// const style = css`
//   & {
//     width: 24rem;
//     margin: 2rem auto;
//     color: var(--fg);
//   }

//   h1 {
//     font-size: 2rem;
//     font-weight: lighter;
//     margin: 0.5rem 0;
//   }

//   form {
//     display: flex;
//     margin: 0.5rem 0;
//   }

//   input,
//   button {
//     background-color: var(--bg);
//     border-width: 0.1rem;
//     margin: 0.1rem;
//     padding: 0.1rem;
//   }

//   button {
//     cursor: pointer;
//     padding: 0.25rem 0.5rem;

//     &:hover {
//       background-color: var(--primary);
//     }
//   }

//   input {
//     flex-grow: 1;
//   }
// `;
