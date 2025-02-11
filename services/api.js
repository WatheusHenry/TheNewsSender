export async function getNewsSummary(query, onUpdate) {
  if (!query) {
    throw new Error("Parâmetro 'query' é obrigatório.");
  }

  const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
  if (!GNEWS_API_KEY) {
    throw new Error("API key do GNews não configurada.");
  }

  const gnewsApiUrl = `https://gnews.io/api/v4/top-headlines?q=${encodeURIComponent(query)}&max=3&lang=pt&sortby=publishedAt&token=${GNEWS_API_KEY}`;
  const newsResponse = await fetch(gnewsApiUrl);

  if (!newsResponse.ok) {
    const errorText = await newsResponse.text();
    throw new Error("Erro ao buscar notícias: " + errorText);
  }

  const newsData = await newsResponse.json();
  if (!newsData.articles || newsData.articles.length === 0) {
    throw new Error("Nenhuma notícia encontrada para essa pesquisa.");
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  const summaries = [];

  for (const article of newsData.articles.slice(0, 3)) {
    const prompt = `
    **Resposta em JSON esperada:**
    {
      "title": "${article.title}",
      "description": "${article.description}",
      "image": "${article.image}",
      "date": "${formatDate(article.publishedAt)}",
      "sourceName": "${article.source?.name || "Fonte não informada"}",
      "sourceUrl": "${article.source?.url || "Fonte não informada"}",
      "content": "${article.content || "Sem descrição disponível"}",
      "tags": "Se necessário, inclua tags relacionadas"
    }

    **Responda somente em JSON, não inclua explicações ou comentários.**
  `;

    const llmResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        stream: false // Garante que a resposta venha completa de uma vez
      })
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error("Erro ao chamar o DeepSeek:", errorText);
      continue;
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content.trim();

    // Remove os delimitadores de código caso existam
    const cleanedContent = rawContent
      .replace(/^```(json)?\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    let jsonResponse;

    try {
      console.log(llmResponse)
      jsonResponse = JSON.parse(cleanedContent);
      summaries.push(jsonResponse);
    } catch (error) {
      console.error("Erro ao parsear o JSON:", error);
      continue;
    }

    // Atualiza a interface a cada novo resumo processado
    onUpdate([...summaries]);
  }
}
