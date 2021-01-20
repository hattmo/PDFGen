import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  testCall: () => {
    console.log("electron");
    ipcRenderer.invoke("mycall", "foo").then((res) => {
      console.log(res);
    });
  },
});
