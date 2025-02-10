// services/newsService.js

/**
 * Realiza a busca de notícias com base no termo pesquisado e chama o LLM para gerar um resumo.
 * @param {string} query - Termo pesquisado.
 * @returns {Promise<string>} - Resumo gerado pelo LLM.
 * @throws {Error} - Em caso de falha na requisição ou se nenhum resultado for encontrado.
 */
export async function getNewsSummary(query) {
  if (!query) {
    throw new Error("Parâmetro 'query' é obrigatório.");
  }

  // Use uma variável de ambiente para armazenar a API key do GNews
  const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
  if (!GNEWS_API_KEY) {
    throw new Error("API key do GNews não configurada.");
  }

  // 1. Busca de notícias via GNews API
  const gnewsApiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=pt&token=${GNEWS_API_KEY}`;
  
  const newsResponse = await fetch(gnewsApiUrl);
  if (!newsResponse.ok) {
    const errorText = await newsResponse.text();
    throw new Error("Erro ao buscar notícias: " + errorText);
  }

  const newsData = await newsResponse.json();
  if (!newsData.articles || newsData.articles.length === 0) {
    throw new Error("Nenhuma notícia encontrada para essa pesquisa.");
  }

  // 2. Prepara o texto dos artigos (limitando a 5 artigos)
  const articlesText = newsData.articles
    .slice(0, 5)
    .map(
      (article) =>
        `Título: ${article.title}\nDescrição: ${article.description || "Sem descrição"}`
    )
    .join("\n\n");

  // 3. Chama o LLM para gerar um resumo
  const localLLMUrl = process.env.NEXT_PUBLIC_LOCAL_LLM_URL;
  const prompt = `Com base nas seguintes notícias, forneça um resumo formatado em Markdown bem formatado: ${articlesText}`;

  const llmResponse = await fetch(localLLMUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen2.5-7b-instruct-1m",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!llmResponse.ok) {
    const errorText = await llmResponse.text();
    throw new Error("Erro ao chamar o LLM: " + errorText);
  }

  const llmData = await llmResponse.json();
  const summary = llmData.choices?.[0]?.message?.content || "Nenhum resumo gerado.";
  return summary;
}
