// import { append, Boh, css, html, ref } from "../main/jot.ts";

import { fragment, state, tags } from "../main/jot.ts";

const { button, div } = tags;

function App() {
  const counter = state(0, (value) =>
    fragment("this is: ", String(value), " ", String(Date.now())),
  );

  // const foo = state("");
  // const bar = state(0);

  // const _foobar = view(
  //   () => fragment(div("foo"), "bar", "foobar", "foobar"),
  //   foo,
  //   bar,
  // );

  return div(
    div(counter),
    button("click me", {
      onclick: () => {
        counter.value++;
      },
    }),
  );
}

document.body.append(App());

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

// document.body.append(App());

// function foo(boh: Boh) {
//   const fragment: ParentNode = document.createDocumentFragment();

//   fragment.append(
//     ...Object.entries(boh).map(([tag, value]) => {
//       const element = document.createElement(tag);

//       Object.assign(element, value);

//       if (append in value && value[append]) {
//         element.append(...value[append].map((p) => foo(p)));
//       }

//       return element;
//     }),
//   );

//   if (append in boh && boh[append]) {
//     fragment.append(...boh[append].map((p) => foo(p)));
//   }

//   return fragment;
// }

// const newLocal = document.createRange();

// newLocal.setStartAfter(node);

// slot(div(), () => {}, a, b, c);
