import { foobar } from "./render-layout";

test("the data is peanut butter", () => {
  return foobar().then(data => {
    expect(data).toEqual(data.trim());
  });
});
