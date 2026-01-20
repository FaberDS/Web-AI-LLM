import "./style.css";

const triggerBtn = document.querySelector("#trigger");
const outputElement = document.querySelector("#output");
const inputTextElement = document.querySelector("#inputText");
const summaryTypeSelect = document.querySelector("#summaryTypes");
const lengthTypeSelect = document.querySelector("#lengthType");

const llmInputElement = document.querySelector("#llmInput");
const llmOutputElement = document.querySelector("#llmOutput");
const promptBtn = document.querySelector("#prompt");

if ("Summarizer" in self) {
  const options = {
    outputLanguage: "en",
    expectedInputLanguage: "de", //optional not important
    length: "short", // short, medium, long
    format: "markdown", //markdown, plain-text
    type: "headline", // "headline", //"key-points", // "tldr", // "teaser"
  };

  const availability = await Summarizer.availability(options);
  if (availability == "available") {
    console.log(`availability: ${availability}`);
    let summarizer = await Summarizer.create({ ...options });

    async function summarize() {
      const text = inputTextElement.value;
      const type = summaryTypes.value;
      const length = lengthTypeSelect.value;
      options.type = type;
      options.length = length;
      summarizer = await Summarizer.create({ ...options });
      console.log(`summarize: ${text} type: ${type}`);

      const streams = await summarizer.summarize(text);
      outputElement.innerHTML = "";
      for await (const stream of streams) {
        console.log(stream);
        outputElement.innerHTML += stream;
      }
    }
    triggerBtn.addEventListener("click", async () => {
      summarize();
    });
  }
}

if ("LanguageModel" in self) {
  console.log("✅ LanguageModel");
  const session = await LanguageModel.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    },
  });

  promptBtn.addEventListener("click", async () => {
    prompt();
  });

  async function prompt() {
    llmOutputElement.innerHTML = "";
    const inputText = llmInputElement.value;
    const stream = await session.promptStreaming(inputText);

    for await (const chunk of stream) {
      llmOutputElement.innerHTML += chunk;
    }
  }
} else {
  console.log("❌ LanguageModel is not available");
}
