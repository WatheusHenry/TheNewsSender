"use client";

import { useState } from "react";
import { Textarea } from "@heroui/input";
import RotatingText from "@/components/RotatingText";
import { Button } from "@heroui/button";
import { getNewsSummary } from "../services/api";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Tooltip } from "@heroui/tooltip";
import { getTweets, getTweetsSummary } from "@/services/twitterApi";
import { Skeleton } from "@heroui/skeleton";

interface NewsSummary {
  sourceName: string;
  sourceUrl: string | undefined;
  date: string;
  title: string;
  summary: string;
  content: string; // Adicionando o campo content do JSON
  tags: string[]; // Adicionando as tags, se necessário
  image: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({ news: true, twitter: false });
  const [newsSummaries, setNewsSummaries] = useState<NewsSummary[]>([]);

  const toggleSource = (source: "news" | "twitter") => {
    setSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setNewsSummaries([]);

    try {
      if (sources.news) {
        await getNewsSummary(query, (summaries: any[]) => {
          const structuredSummaries = summaries.map((summary) => ({
            title: summary.title,
            date: summary.date,
            sourceName: summary.sourceName,
            sourceUrl: summary.sourceUrl,
            summary: summary.summary,
            content: summary.content || "Sem conteúdo disponível",
            tags: summary.tags || [],
            image: summary.image || "",
          }));
          setNewsSummaries(structuredSummaries);
        });
      }
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
      setNewsSummaries([
        {
          title: "Erro",
          summary: "Ocorreu um erro ao buscar as notícias.",
          sourceName: "Sistema",
          sourceUrl: "",
          date: "",
          content: "Sem conteúdo disponível",
          tags: [],
          image: "",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <section className="flex flex-col m-auto items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center">
        <img src="/newspaper_1f4f0.png" alt="logo" className="w-20 h-20" />
      </div>

      <div className="inline-flex text-center justify-center">
        <span className="text-4xl font-bold dark:text-white text-gray-700 mt-2">
          Receba&nbsp;
        </span>
        <RotatingText
          texts={["Notícias", "Atualizações", "Ideias", "Tendências"]}
          mainClassName="dark:bg-black bg-white text-4xl font-bold text-sky-500 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
        <span className="text-4xl font-bold dark:text-white text-gray-700 mt-2">
          &nbsp;quando quiser&nbsp;
        </span>
      </div>

      <div className="flex flex-col justify-center items-center gap-1">
        <span className="text-sm text-gray-500">Fontes das informações:</span>
        <div className="flex gap-1">
          <Tooltip
            placement="left"
            showArrow
            content="Pesquisas feitas no The News API"
          >
            <Button
              isIconOnly
              className={`w-8 h-8 rounded-lg transition-all duration-200
      ${
        sources.news
          ? "bg-blue-500 border-blue-600 dark:bg-blue-400 dark:border-blue-500"
          : "bg-white border-gray-300 dark:bg-neutral-800 dark:border-neutral-700"
      }`}
              size="sm"
              onPress={() => toggleSource("news")}
              variant={sources.news ? "flat" : "bordered"}
            >
              <img
                src="/globe-svgrepo-com.svg"
                className="w-5 h-5 dark:stroke-white"
                alt="Ícone da News API"
              />
            </Button>
          </Tooltip>

          <Tooltip
            placement="right"
            showArrow
            content="Pesquisas feitas no X (Twitter)"
          >
            <Button
              isIconOnly
              className={`p-0 max-w-8 w-8 min-w-8 h-8 rounded-lg transition-all duration-200
      ${
        sources.twitter
          ? "bg-blue-500 border-blue-600 dark:bg-blue-400 dark:border-blue-500"
          : "bg-white border-gray-300 dark:bg-neutral-800 dark:border-neutral-700"
      }`}
              onPress={() => toggleSource("twitter")}
              variant={sources.twitter ? "flat" : "bordered"}
            >
              <img
                src="/icons8-x.svg"
                className="p-0 w-6 h-6 "
                alt="Ícone do Twitter"
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex gap-3 w-1/3">
        <Textarea
          size="md"
          description="Escreva o que deseja pesquisar e será entregue um resumo das notícias mais relevantes"
          placeholder="Insira informações que deseja pesquisar"
          variant="faded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          isClearable
          onClear={() => setQuery("")}
        />
      </div>

      <div>
        <Button
          isLoading={loading}
          color="primary"
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? "Pesquisando..." : "Pesquisar"}
        </Button>
      </div>
      {loading ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-4/5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full">
              <Skeleton className="w-full h-40 rounded-lg bg-gray-300" />
              <div className="mt-3 space-y-2">
                <Skeleton className="w-3/4 h-6 bg-gray-300" />
                <Skeleton className="w-1/2 h-4 bg-gray-300" />
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        newsSummaries.length > 0 && (
          <div className="flex flex-col items-center justify-center mt-4 gap-10">
            <h3 className="text-2xl font-bold text-gray-700 dark:text-white">
              Resumos:
            </h3>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-4/5"
            >
              {newsSummaries.map((news, index) => (
                <div
                  key={index}
                  className="p-4 bg-white mx-auto shadow-md rounded-lg border border-gray-300 dark:bg-neutral-800 dark:border-stone-700"
                >
                  {news.image && (
                    <img
                      src={news.image}
                      alt=""
                      className="m-auto rounded-lg mb-2"
                    />
                  )}
                  <div className="flex justify-between items-center mb-2 p-3">
                    <h2 className="text-lg font-bold text-gray-800 w-4/5 dark:text-white">
                      {news.title}
                    </h2>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(news.summary)
                      }
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-lg bg-gray-100"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 px-3">
                    📅 {news.date || "Data não disponível"} | 🔗{" "}
                    <a
                      href={news.sourceUrl}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {news.sourceName || "Fonte desconhecida"}
                    </a>
                  </p>
                  <ReactMarkdown className="prose px-3">
                    {news.summary}
                  </ReactMarkdown>
                </div>
              ))}
            </motion.div>
          </div>
        )
      )}
    </section>
  );
}
