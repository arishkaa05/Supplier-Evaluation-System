import { FC, PropsWithChildren, Suspense, useEffect } from "react";
import { useThemeStore } from "@/shared/store/theme";
import { useSupplierStore } from "@/shared/store/suppliers";
import { useEvaluationStore } from "@/shared/store/evaluation";

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const { theme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (theme) {
      document.documentElement.className = theme;
    }
  }, [theme]);

  // Любая правка стора поставщиков → дебаунс 600ms → запрос на пересчёт обеих ИС.
  // 600ms даёт время оптимистичной мутации долететь до /api/observations/upsert.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let first = true;
    const unsub = useSupplierStore.subscribe((state, prev) => {
      if (state.supplier === prev.supplier) return;
      if (first) {
        first = false;
        return; // первое значение — это начальная подписка после bootstrap
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        useEvaluationStore.getState().refresh();
      }, 600);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, []);

  return <Suspense>{children}</Suspense>;
};
