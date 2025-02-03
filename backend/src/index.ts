import express from "express";
import ollama from "ollama";
import { BASE_PROMPT } from "./prompt";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";

const app = express();
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await ollama.chat({
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content:
            "Return either node or react based on what do you think this project should be. Ony return a single word either 'node' or 'react'. Do not return anything extra",
        },
      ],
      model: "deepseek-r1",
    });

    const answer = response.message.content.split("</think>")[1]?.trim();

    if (answer == "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer == "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }
    res.status(403).json({ error: "You can't access this" });
    return;
  } catch (error) {
    console.error("Error:", error);
  }
});

app.listen(3000);
