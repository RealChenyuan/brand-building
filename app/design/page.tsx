"use client";

import { timeStamp } from "console";
import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "../components/Header";

const getToken = async () => {
  const res = await fetch(
    "https://is-gateway-test.corp.kuaishou.com/token/get?appKey=14a2a526-1995-4b29-ac3c-eeb58baab600"
  )
    .then((res) => res.json())
    .then((res) => res.result)
    .catch((err) => console.error(err.message));
  return res.accessToken;
};

export default function Design() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [queryHistory, setQueryHistory] = useState([]);
  const [logoUrls, setLogoUrls] = useState([]);

  const request = async (params: any, url: string) => {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err.message));

    return res;
  };

  const chat = async (question: string) => {
    const params = {
      req_id: "111",
      query_history: queryHistory,
      biz: "api_test",
      query:
        "请帮我根据以下主题取十个具有创意的品牌名称，并将名字以数组形式返回，不要给名字加序号，关键词如下：" +
        question,
      session_id: "111",
      config: {},
    };
    const url = "https://is-gateway-test.corp.kuaishou.com/kwaiyii/chat";

    const res = await request(params, url);
    const { answer, query_history } = res;

    setAnswer(answer);
    setQueryHistory(query_history);
  };

  const drawPrepare = async (prompt: string) => {
    const time = new Date();
    const params = {
      prompt,
      negative_prompt: "",
      image_count: 3,
      seed: [],
      width: 1024,
      height: 1024,
      style: "",
      vcg_common_request: {
        biz: "vcg-test",
        request_id: "unique_id",
        request_type: 1,
        task_id: "",
        params: {
          callBackKey: "callBackValue",
        },
        create_time: time.getTime(),
        bucket_name: "mmu-aiplatform-temp",
      },
    };
    const url = "https://is-gateway-test.corp.kuaishou.com/vcg/textToImage";

    const res = await request(params, url);
    const {
      vcg_common_response: { task_id },
    } = res || {};
    return task_id;
  };

  const draw = async (taskId: string, prompt: string) => {
    const params = {
      prompt,
      negative_prompt: "",
      image_count: 3,
      seed: [],
      width: 1024,
      height: 1024,
      style: "",
      vcg_common_request: {
        biz: "vcg-test",
        request_id: "unique_id",
        request_type: 2,
        task_id: taskId,
        params: {
          callBackKey: "callBackValue",
        },
        create_time: 1695871819442,
        bucket_name: "mmu-aiplatform-temp",
      },
    };
    const url = "https://is-gateway-test.corp.kuaishou.com/vcg/textToImage";

    const res = await request(params, url);
    const {
      vcg_common_response: { result_code: resultCode },
      generate_image_infos,
    } = res;
    const imageIds = generate_image_infos.map((item: any) => item.image.key);
    return { resultCode, imageIds };
  };

  const ketu = async (prompt: string) => {
    const taskId = await drawPrepare("请以以下主题生成品牌logo：" + prompt);

    const timer = setInterval(async () => {
      const { resultCode, imageIds } = await draw(taskId, prompt);
      if (resultCode === 0) {
        setLogoUrls(imageIds);
        clearInterval(timer);
      }
    }, 1000);
  };

  const submitHandler = async () => {
    setAnswer("");
    setLogoUrls([]);
    await chat(question);
    await ketu(question);
    setQuestion("");
  };

  return (
    <div className="h-screen bg-background-gray relative overflow-hidden">
      <Header />
      <div className="flex flex-col gap-5 ml-4 mt-8">
        <div>
          <div>请用几个关键词描述你想打造的品牌：</div>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border-black border-2 mr-1"
          />
          <button
            className="bg-slate-500 text-white px-4 py-1 rounded-lg"
            onClick={submitHandler}
          >
            开始设计
          </button>
        </div>
        <div className="flex gap-2">
          {answer &&
            JSON.parse(answer).map((name: string, index: number) => {
              const names = name.split(".");

              return (
                <div
                  key={index}
                  className="px-2 py-1 bg-brand-green text-white rounded-md"
                >
                  {names[names.length - 1]}
                </div>
              );
            })}
        </div>
        <div className="flex gap-4 items-center">
          {logoUrls.map((url, index) => (
            <Image
              width={100}
              height={100}
              src={`https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${url}`}
              key={index}
              alt=""
              className="rounded-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
