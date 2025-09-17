import { breederPipeline } from "./breeder.js";

const model = "llama3.1:8b";
const breeder = "Exotic Genetix";

breederPipeline(model, breeder).then(({ content, duration }) => {
  console.log("Breeder processed in " + duration.toFixed(2) + " seconds.");
  console.log(
    JSON.stringify({ name: breeder, ...JSON.parse(content) }, null, 2)
  );
});
