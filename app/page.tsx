"use client";

import Image from "next/image";
import HeroIcon from "../public/assets/hero-card.svg";
import HeroBg from "../public/assets/hero-bg.svg";
import { useRouter } from "next/navigation";
import Header from "./components/Header";

export default function Home() {
  const route = useRouter();

  return (
    <div className="h-screen bg-background-gray relative overflow-hidden min-w-[1400px]">
      <Header />
      <div className="heading ml-14 mt-64 flex flex-col gap-6">
        <div className="text-gray-900 text-6xl font-bold tracking-wider leading-tight">
          全智能的品牌建设平台
        </div>
        <div className="text-gray-600 text-xl font-medium tracking-wider leading-snug">
          让快意&可图帮您打造一款极具创造力的品牌
        </div>
      </div>
      <a
        href="/design"
        className="inline-block ml-14 mt-10 py-3 px-5 bg-brand-green text-white text-lg font-bold leading-snug rounded-lg hover:bg-brand-green-tight"
        onClick={(e) => {
          e.preventDefault();
          route.push("/design");
        }}
      >
        开始探索
      </a>
      <Image
        width={900}
        height={300}
        src={HeroIcon}
        alt=""
        className="absolute top-40 right-0 z-10"
      />
      <Image
        width={600}
        height={600}
        src={HeroBg}
        alt=""
        className="absolute top-40 right-20"
      />
    </div>
  );
}
