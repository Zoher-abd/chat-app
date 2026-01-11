import { expect, test } from "bun:test";
import { parseCookies } from "../src/utils/cookies";

test("flash cookie can be read from header", () => {
  const cookies = parseCookies("flash=Hello World");
  expect(cookies.flash).toBe("Hello World");
});
