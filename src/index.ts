import { ReflectionOrchestrator } from "./orchestrator.js";
import { config } from "./config.js";

console.log("🚀 Reflection Agent - Setup initialized!");
console.log(`Model: ${config.MODEL_NAME}`);
console.log(`Max Iterations: ${config.MAX_ITERATIONS}`);
console.log(`Quality Threshold: ${config.QUALITY_THRESHOLD}`);
console.log("");

// Example usage
async function main() {
  const orchestrator = new ReflectionOrchestrator();

  // Example input - Theme for motivational phrase
  // Try themes like:
  // - "perseverance"
  // - "success"
  // - "overcoming challenges"
  // - "dreams and goals"
  // - "self-confidence"
  const userInput = "perseverance";

  console.log("📝 Input:", userInput);
  console.log("");

  try {
    const result = await orchestrator.reflect(userInput);

    console.log("✅ Reflection completed!");
    console.log(`📊 Total iterations: ${result.totalIterations}`);
    console.log(`🛑 Stopped early: ${result.stoppedEarly ? "Yes" : "No"}`);
    console.log("");

    // Display iterations summary
    console.log("📈 Iterations summary:");
    result.iterations.forEach((iter) => {
      console.log(
        `  Iteration ${
          iter.iteration
        }: Quality Score = ${iter.qualityScore.toFixed(2)}`
      );
    });
    console.log("");

    console.log("💬 Final Motivational Phrase:");
    console.log(result.finalResponse);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
