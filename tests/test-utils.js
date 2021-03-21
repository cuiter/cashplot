const utils = require("../src/js/lib/utils");

describe("Utils", function () {
  it("can determine whether a date is valid", function () {
    expect(utils.isValidDate(null)).toEqual(false);
    expect(utils.isValidDate(5)).toEqual(false);
    expect(utils.isValidDate({})).toEqual(false);
    expect(utils.isValidDate(new Date("invalid"))).toEqual(false);
    expect(utils.isValidDate(new Date("2020-01-01"))).toEqual(true);
  });

  it("can determine whether a regex is valid", function () {
    expect(utils.isValidRegex(null)).toEqual(false);
    expect(utils.isValidRegex(5)).toEqual(false);
    expect(utils.isValidRegex({})).toEqual(false);
    expect(utils.isValidRegex("invalid\\")).toEqual(false);
    expect(utils.isValidRegex("^[Vv]ali.*d$")).toEqual(true);
  });

  it("can fill an object with values", function () {
    expect(utils.fillObject(["x", "y"], 0.0)).toEqual({ x: 0.0, y: 0.0 });

    const obj1 = utils.fillObject(["sum", "changes"], []);
    expect(obj1).toEqual({ sum: [], changes: [] });
    expect(obj1["sum"] === obj1["changes"]); // References same array.

    // Use deep-cloning.
    const obj2 = utils.fillObject(["sum", "changes"], [], true);
    expect(obj2).toEqual({ sum: [], changes: [] });
    expect(obj2["sum"] !== obj2["changes"]); // References different arrays.
  });

  it("can interleave two arrays", function () {
    expect(utils.interleaveArrays([1, "duck"], [3, "goose"])).toEqual([
      1,
      3,
      "duck",
      "goose",
    ]);
  });
});
