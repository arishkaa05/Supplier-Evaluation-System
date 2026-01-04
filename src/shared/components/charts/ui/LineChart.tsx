import * as echarts from "echarts";
import { FC, useEffect, useRef } from "react";

import { useThemeStore } from "@/shared/store/theme";

interface PropsLineChart {
  title: string;
  xAxisData: Array<string | number>;
  yAxisCategory: Array<string>;
}

export const LineChart: FC<PropsLineChart> = ({
  title,
  xAxisData,
  yAxisCategory,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const numericValues = xAxisData
      .map((v) => (typeof v === "number" ? v : Number(v)))
      .filter((v) => Number.isFinite(v)) as number[];

    const minValue =
      numericValues.length > 0 ? Math.min(...numericValues) : undefined;

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        textStyle: {
          color: theme === "light" ? "#111827" : "#f3f4f6",
          fontSize: 10,
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
        textStyle: {
          color: theme === "light" ? "#111827" : "#f3f4f6",
        },
        backgroundColor: theme === "light" ? "#f3f4f6" : "#1f2937",
      },
      xAxis: {
        type: "value",
        min: minValue !== undefined ? minValue * 0.95 : undefined,
        axisLabel: {
          color: theme === "light" ? "#111827" : "#f3f4f6",
          fontSize: 8,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === "light" ?  "#e2e8f0" : "#111827",
          },
        },
      },
      yAxis: {
        type: "category",
        data: yAxisCategory,
        show: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === "light" ?  "#e2e8f0" : "#111827",
          },
        },
      },
      grid: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 20,
      },
      series: [
        {
          data: xAxisData,
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
        },
      ],
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [theme, title, xAxisData, yAxisCategory]);

  return <div ref={chartRef} style={{ width: "120px", height: "100px" }} />;
};
