"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ErrorIcon from "../../public/assets/error.svg";
import IdeaIcon from "../../public/assets/idea.svg";
import PhotoIcon from "../../public/assets/photo.svg";
import CheckIcon from "../../public/assets/check.svg";
import { answerFormatter, downloadFile } from "../utils/helpers";

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
  const [posterUrl, setPosterUrl] = useState([]);
  const [fileList, setFileList] = useState<FileList | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPosterLoading, setIsPosterLoading] = useState(false);
  const [chosenName, setChosenName] = useState("");
  const [chosenLogo, setChosenLogo] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

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
      query: `取十个具有创意的品牌名称，返回内容规则如下：
       1. 品牌主题为：${question}
       2. 回答的格式为数组格式，即返回数据包含在中括号里
       3. 返回的十个名称不可重复
       4. 品牌名称不超过七个字`,
      session_id: "111",
      config: {},
    };
    const url = "https://is-gateway-test.corp.kuaishou.com/kwaiyii/chat";

    const res = await request(params, url);
    const { answer, query_history } = res;

    setAnswer(answer);
    setQueryHistory(query_history);
  };

  const drawPrepare = async (
    prompt: string,
    imageCount: number,
    width: number,
    height: number
  ) => {
    const time = new Date();
    const params = {
      prompt,
      negative_prompt: "",
      image_count: imageCount,
      seed: [],
      width,
      height,
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

  const draw = async (
    taskId: string,
    prompt: string,
    imageCount: number,
    width: number,
    height: number
  ) => {
    const params = {
      prompt,
      negative_prompt: "",
      image_count: imageCount,
      seed: [],
      width,
      height,
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
    const { result_code: resultCode } = vcg_common_response || {};
    const imageIds = generate_image_infos?.map((item: any) => item.image?.key);
    return { resultCode, imageIds };
  };

  const drawWithImage = async (
    taskId: string,
    prompt: string,
    imageKey: string,
    imageCount: number,
    width: number,
    height: number
  ) => {
    const params = {
      prompt,
      negative_prompt: "",
      image_count: imageCount,
      seed: [],
      width,
      height,
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
      image: {
        custom_request_header: {},
        db: "mmu",
        table: "aiplatform-temp",
        key: imageKey,
      },
    };
    const url =
      "https://is-gateway-test.corp.kuaishou.com/vcg/textToImageWithRef";

    const res = await request(params, url);
    const { vcg_common_response, generate_image_infos } = res || {};
    const { result_code: resultCode } = vcg_common_response || {};
    const imageIds = generate_image_infos?.map((item: any) => item.image?.key);
    return { resultCode, imageIds };
  };

  const ketu = async (
    prompt: string,
    imageCount: number,
    width: number,
    height: number,
    imageKey?: string
  ) => {
    const taskId = await drawPrepare(prompt, imageCount, width, height);

    const timer = setInterval(async () => {
      const { resultCode, imageIds } = imageKey
        ? await drawWithImage(
            taskId,
            prompt,
            imageKey,
            imageCount,
            width,
            height
          )
        : await draw(taskId, prompt, imageCount, width, height);
      if (resultCode === 0) {
        if (imageKey) {
          imageIds && setPosterUrl(imageIds);
          setIsPosterLoading(false);
        } else {
          imageIds && setLogoUrls(imageIds);
          setIsLoading(false);
        }
        clearInterval(timer);
      }
    }, 1000);
  };

  const submitHandler = async () => {
    setPosterUrl([]);
    setAnswer("");
    setLogoUrls([]);
    setChosenName("");
    setChosenLogo("");
    setIsLoading(true);
    await chat(question);
    setQuestion("");
    await ketu("请以以下主题生成品牌logo：" + question, 6, 1024, 1024);
  };

  const createPoster = async () => {
    setIsPosterLoading(true);
    await ketu(
      "请以以下品牌名称以及品牌logo生成宣传海报：" + chosenName,
      1,
      896,
      1152,
      chosenLogo
    );
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
        <div className="rounded-lg bg-white shadow-sm px-10 py-8 flex flex-col items-center min-w-[350px] justify-center">
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
          <div className="mt-6 w-full relative">
            <input
              value={question}
              placeholder="请输入几个关键词"
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
              maxLength={75}
              className="w-full border-[1px] border-brand-green-tight px-4 py-2 focus-visible:border-[1px] focus-visible::border-brand-green-tight outline-none"
            />
            <button
              className="absolute top-[50%] right-4 translate-y-[-50%]"
              onClick={(e) => inputRef.current?.click()}
            >
              <Image width={22} height={22} src={PhotoIcon} alt="" />
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => {
              setFileList(e.target.files);
            }}
            className="hidden w-full border-[1px] border-brand-green-tight px-4 py-2 mt-3 focus-visible:border-[1px] focus-visible::border-brand-green-tight outline-none"
          />
          {fileList && fileList?.length > 0 && (
            <Image
              width={100}
              height={100}
              src={URL.createObjectURL(fileList[0])}
              alt=""
              className="self-start mt-3 border-[1px] border-brand-green p-1"
            />
          )}
          <button
            className="bg-brand-green text-white px-4 py-2 text-lg w-full mt-5 hover:bg-brand-green-tight active:bg-brand-green-tight disabled:cursor-not-allowed disabled:bg-brand-green-tight"
            onClick={submitHandler}
            disabled={isLoading || isPosterLoading}
          >
            开始设计
          </button>
        </div>
        <div className="rounded-lg bg-white shadow-sm py-8 px-10 min-w-[350px]">
          {posterUrl.length > 0 ? (
            <div className="flex flex-col items-center">
              <Image
                width={896 / 3}
                height={1152 / 3}
                src={ErrorIcon}
                alt=""
                className="rounded-md"
                loader={() =>
                  `https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${posterUrl[0]}`
                }
              />
              <div className="w-full mt-6 text-brand-green flex items-center justify-between">
                <div
                  className="cursor-pointer hover:text-brand-green-tight"
                  onClick={() => setPosterUrl([])}
                >
                  &larr;返回上一页
                </div>
                <div
                  className="cursor-pointer hover:text-brand-green-tight"
                  onClick={() =>
                    downloadFile(
                      `/api/image?id=${posterUrl[0]}`,
                      `${chosenName}品牌宣传海报.png`
                    )
                  }
                >
                  下载海报
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center h-full">
              {isLoading ? (
                <div className="text-center w-full self-center text-lg text-gray-500">
                  加载中……
                </div>
              ) : answer && logoUrls.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="flex justify-between">
                    <div className="grid grid-cols-2 gap-3 px-16 border-r-2 border-brand-green">
                      {answer &&
                        answerFormatter(answer).map(
                          (name: string, index: number) => {
                            const names = name.split(".");
                            const brandName = names[names.length - 1].trim();

                            return (
                              <div key={index} className="relative">
                                <div
                                  className="px-4 py-2 border-brand-green border-[1px] text-gray-700 self-center text-center cursor-pointer"
                                  onClick={() =>
                                    setChosenName((chosenName) =>
                                      chosenName === brandName ? "" : brandName
                                    )
                                  }
                                >
                                  {brandName}
                                </div>
                                {brandName === chosenName && (
                                  <Image
                                    width={22}
                                    height={22}
                                    src={CheckIcon}
                                    alt=""
                                    className="absolute top-0 right-0 translate-x-[30%] translate-y-[-30%]"
                                  />
                                )}
                              </div>
                            );
                          }
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-16">
                      {logoUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            width={100}
                            height={100}
                            src={ErrorIcon}
                            alt=""
                            className="rounded-md cursor-pointer"
                            loader={() =>
                              `https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${url}`
                            }
                            onClick={() =>
                              setChosenLogo((currentKey) =>
                                currentKey === url ? "" : url
                              )
                            }
                          />
                          {url === chosenLogo && (
                            <Image
                              width={22}
                              height={22}
                              src={CheckIcon}
                              alt=""
                              className="absolute top-0 right-0 translate-x-[30%] translate-y-[-30%]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full mt-10 text-brand-green flex items-center justify-between">
                    <button
                      className="cursor-pointer hover:text-brand-green-tight disabled:text-brand-green-tight disabled:cursor-not-allowed"
                      disabled={!chosenLogo}
                      onClick={() =>
                        downloadFile(
                          `/api/image?id=${chosenLogo}`,
                          `${chosenName}品牌Logo.png`
                        )
                      }
                    >
                      下载海报
                    </button>
                    <button
                      className="text-brand-green cursor-pointer disabled:text-brand-green-tight disabled:cursor-not-allowed"
                      disabled={!chosenName || !chosenLogo || isPosterLoading}
                      onClick={createPoster}
                    >
                      {isPosterLoading ? (
                        "生成海报中……"
                      ) : (
                        <>一键生成品牌宣传海报&rarr;</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full self-center text-xl text-gray-600">
                  暂时还没有品牌创意，快输入关键词一键生成吧
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
