export function downloadFile(url: string, filename = "宣传海报.png") {
  const API_BASE_URL = getBaseUrl();

  fetch(`${API_BASE_URL}${url}`)
    .then((response) => response.json())
    .then((res) => {
      var base64 = res.toString(); // imgSrc 就是base64哈
      var byteCharacters = atob(
        base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
      );
      var byteNumbers = new Array(byteCharacters.length);
      for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      var blob = new Blob([byteArray], {
        type: undefined,
      });
      var aLink = document.createElement("a");
      aLink.download = filename; //这里写保存时的图片名称
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
      aLink.remove();
    })
    .catch((e) => console.error(e));
}

export function isJSON(str: any) {
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function answerFormatter(str: any) {
  if (isJSON(str)) return JSON.parse(str);
  if (str.indexOf("[") !== -1 && str.indexOf("]") !== -1) {
    const formatStr = `[${str.split("[")[1].split("]")[0]}]`;
    if (isJSON(formatStr)) return JSON.parse(formatStr);
  }
  const formatStr = str
    .split("\n")
    .filter((str: any) => str.split(".").length > 1);
  return formatStr;
}

export const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return process.env.NEXT_PUBLIC_VERCEL_URL;
};
