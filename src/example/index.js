import { html, on, props, text } from "../../dist/jot.js";

const label = text("I will change");

document.body.append(
  html`<h1 ${{ foo: "bar", boo: true, class: "style" }}>
    <a ${props("a", { href: "/" })}>don't click me</a>
    hi ${"foobar"} ${undefined} ${123} ${Symbol("foobar")} ${null} ${123n}
    ${label}
    <input
      type="text"
      ${on("click", () => {
        label(Date.now());
      })}
    />
  </h1>`,
);
