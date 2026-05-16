import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { bootstrap } from "@/shared/api/bootstrap";

const root = createRoot(document.getElementById("root")!);

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8081/api";

root.render(
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>Загрузка данных…</div>,
);

bootstrap()
  .then(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((err) =>
    root.render(
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h2>Не удалось загрузить данные с сервера</h2>
        <p style={{ color: "#a00" }}>{String(err)}</p>
        <p>
          Проверьте, что API запущен (см. <code>server_system/</code>) и доступен
          по адресу <code>{apiUrl}</code>.
        </p>
      </div>,
    ),
  );
