function forceDownload(blob: any, filename: string) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = blob;
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Current blob size limit is around 500MB for browsers
export function downloadFile(url: string) {
  // if (!filename) filename = url.split('\\').pop()?.split('/').pop() || '宣传海报.png';
  const filename = "宣传海报.png";

  fetch(url)
    .then((response) => response.json())
    .then((res) => b64toBlob(res))
    .then((blob) => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch((e) => console.error(e));

  // fetch(url)
  //   .then((response) => response.blob())
  //   .then((blob) => {
  //     let blobUrl = window.URL.createObjectURL(blob);
  //     forceDownload(blobUrl, filename);
  //   })
  //   .catch((e) => console.error(e));
}

const b64toBlob = (b64Data: any, contentType = "", sliceSize = 512) => {
  const byteCharacters = Buffer.from(b64Data, "base64").toString("latin1");
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};
