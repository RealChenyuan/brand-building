"use client";

import { useEffect, useState } from "react";

const getToken = async () => {
  const res = await fetch(
    "https://is-gateway-test.corp.kuaishou.com/token/get?appKey=14a2a526-1995-4b29-ac3c-eeb58baab600"
  )
    .then((res) => res.json())
    .then((res) => res.result)
    .catch((err) => console.error(err.message));
  return res.accessToken;
};

export default function Home() {
  const [answer, setAnswer] = useState(
    "目前还未提问哦，快去提问获取相关答案吧～"
  );
  const [question, setQuestion] = useState("");
  const [queryHistory, setQueryHistory] = useState([]);

  const chat = async (question: string) => {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
    const params = {
      req_id: "111",
      query_history: queryHistory,
      biz: "api_test",
      query: question,
      session_id: "111",
      config: {},
    };
    const url = "https://is-gateway-test.corp.kuaishou.com/kwaiyii/chat";

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err.message));

    const { answer, query_history } = res;

    setAnswer(answer);
    setQueryHistory(query_history);
  };

  const submitHandler = async () => {
    await chat(question);
    setQuestion("");
  };

  return (
    <div>
      <div>
        <div>请输入你的问题：</div>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border-black border-2 mr-1"
        />
        <button
          className="bg-slate-500 text-white px-4 py-1 rounded-lg"
          onClick={submitHandler}
        >
          提问
        </button>
      </div>
      <div>{answer}</div>
    </div>
  );
}
