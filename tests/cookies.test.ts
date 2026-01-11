import { expect, test } from "bun:test";
import { parseCookies } from "../src/utils/cookies";

test("parseCookies returns empty object for missing header", () => {
  expect(parseCookies(undefined)).toEqual({});
  expect(parseCookies("")).toEqual({});
});

test("parseCookies parses multiple pairs", () => {
  expect(parseCookies("user_id=42; theme=dark")).toEqual({ user_id: "42", theme: "dark" });
});
