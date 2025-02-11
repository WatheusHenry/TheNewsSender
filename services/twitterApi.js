// services/twitterService.js

/**
 * Busca tweets com base no termo pesquisado usando nosso endpoint de proxy.
 * @param {string} query - O termo de pesquisa.
 * @returns {Promise<Array>} - Lista de tweets relevantes.
 * @throws {Error} - Em caso de erro na requisição.
 */
export async function getTweets(query) {
  if (!query) {
    throw new Error("Parâmetro 'query' é obrigatório.");
  }

  // Chama nosso endpoint interno que atua como proxy para o Twitter
  const response = await fetch(`http://localhost:3000/api/twitter?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Erro ao buscar tweets: " + errorText);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Gera um resumo dos tweets usando um LLM.
 * @param {string} query - O termo pesquisado.
 * @returns {Promise<string>} - Resumo gerado pelo LLM.
 */
export async function getTweetsSummary(query) {
  const tweets = await getTweets(query);

  if (!tweets.length) {
    return "Nenhum tweet relevante encontrado.";
  }

  const tweetsText = tweets
    .map((tweet) => `Usuário: ${tweet.author_id}\nTweet: ${tweet.text}`)
    .join("\n\n");

  const prompt = `Com base nos seguintes tweets, forneça um resumo formatado em Markdown:\n\n${tweetsText}`;

  const llmResponse = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen2.5-7b-instruct-1m",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!llmResponse.ok) {
    const errorText = await llmResponse.text();
    throw new Error("Erro ao chamar o LLM: " + errorText);
  }

  const llmData = await llmResponse.json();
  return llmData.choices?.[0]?.message?.content || "Nenhum resumo gerado.";
}
