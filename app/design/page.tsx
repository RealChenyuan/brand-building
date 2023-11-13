"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import IdeaIcon from "../../public/assets/idea.svg";

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
  const [isLoading, setIsLoading] = useState(false);

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
        "请帮我根据以下主题取十个具有创意的品牌名称，并以数组形式返回，不要给名字加序号，关键词如下：" +
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
      image_count: 6,
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
    const { vcg_common_response } = res || {};
    const { task_id } = vcg_common_response || {};
    return task_id;
  };

  const draw = async (taskId: string, prompt: string) => {
    const params = {
      prompt,
      negative_prompt: "",
      image_count: 6,
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
    const { vcg_common_response, generate_image_infos } = res || {};
    const { result_code: resultCode } = vcg_common_response;
    const imageIds = generate_image_infos.map((item: any) => item.image.key);
    return { resultCode, imageIds };
  };

  const ketu = async (prompt: string) => {
    const taskId = await drawPrepare("请以以下主题生成品牌logo：" + prompt);

    const timer = setInterval(async () => {
      const { resultCode, imageIds } = await draw(taskId, prompt);
      if (resultCode === 0) {
        setLogoUrls(imageIds);
        setIsLoading(false);
        clearInterval(timer);
      }
    }, 1000);
  };

  const submitHandler = async () => {
    setAnswer("");
    setLogoUrls([]);
    setIsLoading(true);
    await chat(question);
    setQuestion("");
    await ketu(question);
  };

  return (
    <div className="h-screen bg-background-gray relative overflow-hidden min-w-[1200px] flex flex-col">
      <Header />
      <div className="title w-full text-center text-5xl  text-gray-800 font-semibold mt-32">
        构思优秀的品牌创意，让品牌赢在起跑点
      </div>
      <div className="title w-full text-center text-xl  text-gray-600 font-medium mt-6">
        只需输入几个关键词，即可帮您找到最合适的品牌创意
      </div>
      <div className="flex gap-5 mt-10 min-w-[900px] self-center justify-center">
        <div className="rounded-lg bg-white shadow-sm px-10 py-8 flex flex-col items-center min-w-[350px]">
          <Image
            width={100}
            height={100}
            src={IdeaIcon}
            alt=""
            className="rounded-md"
          />
          <div className="text-2xl font-bold text-gray-800 mt-8">
            请描述你想打造的品牌
          </div>
          <input
            value={question}
            placeholder="请输入几个关键词"
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border-[1px] border-brand-green-tight px-4 py-2 mt-6 focus-visible:border-[1px] focus-visible::border-brand-green-tight outline-none"
          />
          <button
            className="bg-brand-green text-white px-4 py-2 text-lg w-full mt-3 hover:bg-brand-green-tight active:bg-brand-green-tight"
            onClick={submitHandler}
          >
            开始设计
          </button>
        </div>
        <div className="rounded-lg bg-white shadow-sm py-8 flex justify-between px-10 min-w-[350px]">
          {isLoading ? (
            <div className="text-center w-full self-center text-lg text-gray-500">
              加载中……
            </div>
          ) : answer && logoUrls.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 px-16 border-r-2 border-brand-green">
                {answer &&
                  JSON.parse(answer).map((name: string, index: number) => {
                    const names = name.split(".");

                    return (
                      <div
                        key={index}
                        className="px-4 py-2 border-brand-green border-[1px] text-gray-700 self-center text-center"
                      >
                        {names[names.length - 1]}
                      </div>
                    );
                  })}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-16">
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
            </>
          ) : (
            <div className="text-center w-full self-center text-xl text-gray-600">
              暂时还没有品牌创意，快输入关键词一键生成吧
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
