const Jasmine = require("jasmine");
const jasmine = new Jasmine();

jasmine.loadConfig({
  spec_dir: "tests",
  spec_files: ["test-*.js"],
});

jasmine.execute();
