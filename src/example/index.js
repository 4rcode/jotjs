import { attr, css, jot, on, tags, text } from "../../dist/jot.js";

const { div, button } = tags;

const foo = attr("foo", "bar");
const t = jot(text("bar"));
const box = div("who am i");

jot(
  document.documentElement,
  css({
    fontFamily: "system-ui",
    _children: [
      {
        _selector: "*",
        margin: 0,
        fontFamily: "inherit",
        fontSize: "inherit",
        appearance: "none",
        background: "inherit",
        border: "0 solid red",
      },
    ],
  }),
);

jot(
  document.body,
  div(
    attr("foo", "var"),
    css({
      _selector: "&",
      border: ".5rem solid lightblue",
      padding: "1rem",
      _children: [
        {
          _selector: "button",
          color: "red",
          borderWidth: ".2rem",
        },
      ],
    }),
    button(
      "click me",
      on("click", (e) => {
        e.stopPropagation();
        console.log("click");
      }),
    ),
    foo,
    "foo",
    t,
    box,
    on("click", () => box.replaceChildren("nobody")),
  ),
);
