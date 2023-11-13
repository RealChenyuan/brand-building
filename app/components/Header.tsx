import Image from "next/image";
import NavIcon from "../../public/assets/nav-logo.svg";
import { useRouter } from "next/navigation";

export default function Header() {
  const route = useRouter();

  return (
    <div className="nav-bar pt-10 mx-14 flex justify-between items-center">
      <div className="logo text-gray-800 text-3xl font-bold font-mono flex gap-2 items-center">
        <Image width={55} height={26} src={NavIcon} alt="" />
        <span>Brand Building</span>
      </div>
      <div className="flex gap-10">
        <a
          href="/"
          className="text-gray-800 text-lg font-bold tracking-wider border-b-2 border-brand-green-tight hover:text-gray-600"
          onClick={(e) => {
            e.preventDefault();
            route.push("/");
          }}
        >
          首页
        </a>
        <a
          href="https://docs.corp.kuaishou.com/d/home/fcAAMyzFxuxk99hxhFYIs_J6v"
          className="text-gray-800 text-lg font-bold tracking-wider border-b-2 border-brand-green-tight hover:text-gray-600"
        >
          网站介绍
        </a>
        <a
          href="/design"
          className="text-brand-green text-lg font-bold tracking-wider border-b-2 border-brand-green-tight hover:text-brand-green-tight"
          onClick={(e) => {
            e.preventDefault();
            route.push("/design");
          }}
        >
          开始探索
        </a>
      </div>
    </div>
  );
}
