"use client";

import { timeStamp } from "console";
import Image from "next/image";
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
  const [description, setDescription] = useState("");
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
      query: question,
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
    const taskId = await drawPrepare(prompt);

    const timer = setInterval(async () => {
      const { resultCode, imageIds } = await draw(taskId, prompt);
      if (resultCode === 0) {
        setLogoUrls(imageIds);
        clearInterval(timer);
      }
    }, 1000);
  };

  const submitHandler = async () => {
    await chat(question);
    setQuestion("");
  };

  const drawLogoHandler = async () => {
    setLogoUrls([]);
    await ketu(description);
    setDescription("");
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
      <div>
        <div>请描述你想要设计的logo：</div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-black border-2 mr-1"
        />
        <button
          className="bg-slate-500 text-white px-4 py-1 rounded-lg"
          onClick={drawLogoHandler}
        >
          开始设计
        </button>
      </div>
      <div>
        {logoUrls.map((url, index) => (
          <Image
            width={200}
            height={200}
            src={`https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${url}`}
            key={index}
            alt=""
          />
        ))}
      </div>
    </div>
  );
}
