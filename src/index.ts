import { app, BrowserWindow, ipcMain } from "electron";
import { join as p } from "path";
import csv from "csv-parser";
import pdftk from "node-pdftk";

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

ipcMain.handle(
  "parseCSV",
  (_e, rawData: string) =>
    new Promise((res, rej) => {
      let headers: string[];
      const data: DataItem[] = [];
      const parser = csv();
      parser.on("data", (newData) => {
        data.push(newData);
      });
      parser.on("headers", (newHeaders: string[]) => {
        headers = newHeaders;
      });
      parser.on("end", () => {
        console.log("ended");
        res({ headers, data });
      });
      parser.on("error", (err) => {
        rej(err);
      });
      parser.write(rawData);
      parser.end();
    })
);

ipcMain.handle("getFields", (_e, pdfPath: string) =>
  pdftk
    .input(pdfPath)
    .dumpDataFields()
    .output()
    .then((val) => val.toString())
);

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: true,
      preload: p(__dirname, "./preload"),
    },
  });

  mainWindow.removeMenu();

  mainWindow.loadFile(
    p(__dirname, "../node_modules/@hattmo/pdfgenfe/static/index.html")
  );

  if (process.env.NODE_ENV === "DEV") mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
