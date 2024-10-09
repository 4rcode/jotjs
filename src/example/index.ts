import { $, css, tags, use } from "../main/jot.ts";

const { button, div, pre } = tags;

const counter = use(0, (v) => div("foo => ", v));

function App() {
  return $(
    button(
      "click me",
      {
        className: [() => "foo bar " + Date.now(), counter],
        style: [(s) => ((s.color = "red"), undefined)],
        onclick: () => counter.value++,
      },
      css({
        "&": {
          // color: "blue",
        },
      }),
    ),
    " => ",
    counter,
    " >>> ",
    [() => (counter.value > 3 ? "done" : null), counter],
    div({
      className: "foobar",
      textContent: [() => "this is the counter: " + counter.value, counter],
    }),
  );
}

document.body.append(App(), div("and more => ", counter));

const url =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://tabs.ultimate-guitar.com/tab/brooke-fraser-brooke-ligertwood/bless-god-chords-4996846",
  );

const doc = document
  .createRange()
  .createContextualFragment(await (await fetch(url)).text());

const text = doc.querySelector("div.js-store")?.getAttribute("data-content");

const data = JSON.parse(text || "{}");

document.body.append(pre(data.store.page.data.tab_view.wiki_tab.content));

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

// function Todo(input: HTMLInputElement) {
//   const todo = ref();
//   const label = ref();

//   return html`
//     <div ${todo}>
//       <button
//         ${{ a: { href: "" } }}
//         ${(b: HTMLInputElement) => {
//           b.addEventListener("click", () => {
//             todo.ref.replaceWith();
//           });
//         }}
//       >
//         X
//       </button>
//       <button
//         ${ref((b) => {
//           b.addEventListener("click", () => {
//             label.ref.style.textDecoration = label.ref.style.textDecoration
//               ? ""
//               : "line-through";
//           });
//         })}
//       >
//         C
//       </button>
//       <span ${label}>${input.value}</span>
//     </div>
//   `;
// }

// function App() {
//   const list = ref();
//   const input = ref<HTMLInputElement>();

//   return html`
//     <div ${style}>
//       <h1>TODO LIST</h1>
//       <form
//         ${ref((f) => {
//           f.addEventListener("submit", (event) => {
//             event.preventDefault();

//             if (!input.ref.value) {
//               return;
//             }

//             list.ref.append(Todo(input.ref));
//             input.ref.value = "";
//           });
//         })}
//       >
//         <input
//           ${input}
//           ${(e: HTMLElement) => {
//             e.className = "foobar";
//           }}
//         />
//         <button>Create new todo</button>
//       </form>
//       <div ${list}></div>
//     </div>
//   `;
// }
