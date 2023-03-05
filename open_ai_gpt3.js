import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  console.log(req.body.data);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `can you describe this hexcode to a blind person #${req.body.data} in 5 or less words, be as descriptive as possible. please dont mention the hex code.`,
    temperature: 0,
    max_tokens: 7,
  });

  return response.data.choices[0].text;
};