export function downloadFile(url: string, filename = "宣传海报.png") {
  fetch(url)
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
