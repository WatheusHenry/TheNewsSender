const { tavily } = require('@tavily/core');

// Helper function to wait between requests
async function summarizeText(articles,query) {
  if (!articles.length) return 'Nenhuma notícia disponível para resumo.';

  const contentToSummarize = articles
    .map((article, index) => `Notícia ${index + 1}: ${article.title} - ${article.content}`)
    .join("\n\n");

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_WEBSITE_URL,
      },
      body: JSON.stringify({
        model: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
        messages: [
          {
            role: "system",
            content: `Você é um especialista em notícias e jornalismo. Gere um resumo claro das seguintes notícias em português brasileiro focando no assunto ${query}.`
          },
          {
            role: "user",
            content: contentToSummarize
          }
        ],
        max_tokens: 5000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro da API: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || 'Resumo não disponível';
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return 'Resumo não disponível';
  }
}



export async function getNews(query) {
  const client = tavily({ apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY });

  try {
    const response = await client.search(query, {
      searchDepth: "advanced",
      // topic: "news",
      includeImages: true,
      maxResults: 9,
      days: 20,
      time_range:"m",


      
    });

    // Criar um resumo consolidado das notícias em PT-BR
    const newsSummary = await summarizeText(response.results,query);

    return { ...response, results: response.results, newsSummary };
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}

