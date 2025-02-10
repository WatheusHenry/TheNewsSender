"use client";

// pages/index.jsx
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

export default function Home() {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [tweets, setTweets] = useState([]);
  // Estado para selecionar as fontes ativas
  const [sources, setSources] = useState({
    news: true,
    twitter: false,
  });

  const toggleSource = (source: "news" | "twitter") => {
    setSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSummary("");
    setTweets([]); // Limpa tweets antes da busca

    try {
      let summaries = [];
      let fetchedTweets = [];

      if (sources.news) {
        const newsSummary = await getNewsSummary(query);
        summaries.push(`## 📰 Notícias\n\n${newsSummary}`);
      }

      if (sources.twitter) {
        const tweetsSummary = await getTweetsSummary(query);
        fetchedTweets = await getTweets(query);
        summaries.push(`## 🐦 Twitter\n\n${tweetsSummary}`);
      }

      // setTweets(fetchedTweets);
      setSummary(summaries.join("\n\n---\n\n"));
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
      setSummary(
        "Ocorreu um erro: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      );
    }

    setLoading(false);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <section className="flex flex-col m-auto items-center justify-center gap-4 ">
      <div className="flex flex-col items-center justify-center">
        <img src="/newspaper_1f4f0.png" alt="logo" className="w-20 h-20" />
      </div>

      <div className="inline-flex text-center justify-center ">
        <span className="text-4xl/[1.5] font-bold dark:text-white text-gray-700">
          Receba&nbsp;
        </span>

        <RotatingText
          texts={["Notícias", "Atualizações", "Idéias", "Tendências"]}
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

        <span className="text-4xl/[1.5] font-bold dark:text-white text-gray-700">
          &nbsp;quando quiser&nbsp;
        </span>
      </div>
      {/* Botões para selecionar fontes */}
      <div className="flex flex-col justify-center items-center gap-1">
        <span className="text-sm text-gray-500">Fontes das informações:</span>
        <div className="flex gap-1">
          <Tooltip
            placement={"left"}
            showArrow={true}
            content="Pesquisas feitas no The News API"
          >
            <Button
              isIconOnly
              className=" w-8 h-8 rounded-lg"
              size="sm"
              color={sources.news ? "primary" : "default"}
              onPress={() => toggleSource("news")}
              variant={sources.news ? "flat" : "bordered"}
            >
              <img src="/globe-svgrepo-com.svg" className="w-5 h-5 " alt="" />
            </Button>
          </Tooltip>
          <Tooltip
            placement={"right"}
            showArrow={true}
            content="Pesquisas feitas no X (Twitter)"
          >
            <Button
              isIconOnly
              className="p-0 max-w-8 w-8 min-w-8  h-8 rounded-lg"
              color={sources.twitter ? "primary" : "default"}
              onPress={() => toggleSource("twitter")}
              variant={sources.twitter ? "flat" : "bordered"}
            >
              <img
                src="/icons8-x.svg"
                color="white"
                className="p-0 w-6 h-6"
                alt=""
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex gap-3 w-1/3">
        <Textarea
          size="md"
          description="Escreva o que deseja pesquisar e será entregue um resumo das noticias mais relevantes"
          placeholder="Insira informações que deseja pesquisar "
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

      {/* Resumo formatado em HTML */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 p-6 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg w-full border border-gray-300"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Resumo</h2>
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700"
            >
              <Copy size={20} />
            </button>
          </div>

          {/* Renderiza Markdown */}
          <ReactMarkdown className="prose max-w-none">{summary}</ReactMarkdown>
        </motion.div>
      )}

      {/* {tweets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 p-6 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg w-full border border-gray-300"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🐦 Tweets Relacionados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tweets.map((tweet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white shadow-md rounded-lg border border-gray-200"
              >
                <p className="text-gray-800">{tweet.text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-semibold">Autor ID:</span>{" "}
                  {tweet.author_id}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(tweet.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )} */}
    </section>
  );
}
function setTweets(fetchedTweets: any) {
  throw new Error("Function not implemented.");
}
