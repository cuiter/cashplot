const utils = require("../src/js/lib/utils");

describe("Utils", function () {
  it("can interleave two lists", function () {
    expect(utils.interleaveLists([1, 2], [3, 4])).toEqual([1, 3, 2, 4]);
  });
});
