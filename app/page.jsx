"use client";

import { useState } from "react";
import { Textarea } from "@heroui/input";
import RotatingText from "@/components/RotatingText";
import { Button } from "@heroui/button";
import { getNews } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Tooltip } from "@heroui/tooltip";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({ news: true, twitter: false });
  const [news, setNews] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  const toggleSource = (source) => {
    setSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    console.log("Botão Comprar foi clicado!");


    setLoading(true);
    setTranslating(true);

    setError("");
    setNews(null);

    try {
      if (sources.news) {
        const response = await getNews(query);

        setNews(response);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news. Please try again.");
    } finally {
      setLoading(false);
      setTranslating(false);
    }
  };

  const NewsCard = ({ summary, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-4 bg-white h-96 shadow-md w-auto rounded-lg border border-gray-300 dark:bg-neutral-800 dark:border-stone-700"
    >
      {summary.image && (
        <img
          src={summary.image}
          alt=""
          className="w-full h-48 object-cover rounded-lg mb-2"
        />
      )}
      <div className="flex justify-between items-center mb-2 p-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {summary.title}
        </h2>
      </div>

      {summary.publishedDate && (
        <div className="text-sm text-gray-500 px-3 dark:text-gray-400 mb-2">
          🗓{" "} {new Date(summary.publishedDate).toLocaleDateString("pt-BR")}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-2 px-3  text-wrap dark:text-gray-300 truncate">
        🔗{""}
        <a
          href={summary.url}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          {summary.url || "Unknown source"}
        </a>
      </div>
      <div className="prose text-sm dark:prose-invert px-3 line-clamp-6 overflow-hidden">
        {summary.content}
      </div>
    </motion.div>
  );

  const SkeletonCard = () => (
    <div className="p-4 bg-white w-96 mx-auto shadow-md rounded-lg border border-gray-300 dark:bg-neutral-800 dark:border-stone-700">
      <Skeleton className="w-full h-48 rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-3/4 h-4" />
        ))}
      </div>
    </div>
  );

  return (
    <section className="flex flex-col m-auto items-center justify-center gap-4 p-4">
      {/* Cabeçalho */}
      <div className="flex flex-col items-center justify-center">
        <img src="/newspaper_1f4f0.png" alt="logo" className="w-20 h-20" />
      </div>

      <div className="inline-flex text-center justify-center">
        <span className="text-4xl font-bold dark:text-white text-gray-700 mt-2">
          Pesquise&nbsp;
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
          &nbsp;e receba quando quiser&nbsp;
        </span>
      </div>

      {/* Botões de fontes */}
      <div className="flex flex-col justify-center items-center gap-1">
        <span className="text-sm text-gray-500">Tipo das informações:</span>
        <div className="flex gap-1">
          <Tooltip placement="top" showArrow content="Noticias">
            <Button
              isIconOnly
              className={`w-8 h-8 rounded-lg transition-all duration-200 ${
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
        </div>
      </div>

      {/* Search box and buttons */}
      <div className="flex gap-3 w-full max-w-2xl">
        <Textarea
          size="lg"
          className="w-2/3 m-auto"
          description="Escreva o que você quer e receba um resumo das noticias mais relevantes"
          placeholder="Insira o que você quer pesquisar"
          variant="faded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          isClearable
          onClear={() => setQuery("")}
        />
      </div>

      <div className="flex gap-2">
        <Button
          isLoading={loading}
          color="primary"
          variant="flat"
          onPress={handleSearch}
          disabled={loading || translating}
        >
          {loading
            ? "Buscando..."
            : translating
              ? "Traduzindo..."
              : "Pesquisar"}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {((news?.results && news.results.length > 0) || loading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col items-center justify-center mt-4 gap-10"
          >
            <h3 className="text-2xl font-bold text-gray-700 dark:text-white">
              {translating ? "Traduzindo resultados..." : "Resultados:"}
            </h3>
            {news?.newsSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 dark:bg-neutral-800 text-blue-900 dark:text-white shadow-md rounded-lg border border-blue-300 dark:border-neutral-700 w-4/5"
              >
                <div  className="flex justify-between items-center">
                  <h3 className="text-lg font-bold mb-2">
                    Resumo das notícias:
                  </h3>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(news.newsSummary)
                    }
                    className=" text-blue-500 hover:bg-blue-200 p-2 rounded-lg bg-blue-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <span className="text-sm">
                  <ReactMarkdown>{news.newsSummary}</ReactMarkdown>
                </span>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-5/5">
              {loading || translating
                ? [...Array(3)].map((_, index) => <SkeletonCard key={index} />)
                : news?.results?.map((summary, index) => (
                    <NewsCard key={index} summary={summary} index={index} />
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
