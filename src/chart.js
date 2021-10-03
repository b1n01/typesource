import Chart from "chart.js/auto";
// We need to clone the options otherwise differen charts will
// overwrite the same config
import { clone } from "chart.js/helpers";

// Chart colors
const colors = {
  sessions: "#e07a5f",
  wpm: "#f2cc8f",
  accuracy: "#81b29a",
  x: "#666",
  legend: "#999",
};
export const getColors = () => clone(colors);

// Line chart base options
const options = {
  animation: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  scales: {
    x: {
      ticks: {
        color: colors.legend,
      },
      grid: {
        color: colors.x,
        borderColor: colors.x,
      },
    },
    yWpm: {
      title: {
        display: true,
        text: "Words per minute",
        color: colors.wpm,
      },
      position: "left",
      ticks: {
        color: colors.wpm,
      },
      grid: {
        borderColor: colors.wpm,
        drawOnChartArea: false,
      },
    },
    yAccuracy: {
      title: {
        display: true,
        text: "Accuracy",
        color: colors.accuracy,
      },
      position: "right",
      ticks: {
        color: colors.accuracy,
      },
      grid: {
        borderColor: colors.accuracy,
        drawOnChartArea: false,
      },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#FFF",
        padding: 32,
        font: {
          size: 14,
        },
      },
    },
    tooltip: {
      titleAlign: "center",
      bodySpacing: 8,
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 14,
      },
      callbacks: {
        label: (context) => {
          // Format each tooltip label
          let label = context.dataset.label;
          label = " " + label; // add left space
          return label + ": " + context.parsed.y;
        },
        title: () => null,
      },
    },
  },
};
export const getOptions = () => clone(options);

// Create a new line chart
export const getChart = (canvas, series, labels, options) => {
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "wpm",
          data: series.wpm,
          backgroundColor: colors.wpm,
          borderColor: colors.wpm,
          tension: 0.3,
          yAxisID: "yWpm",
        },
        {
          label: "accuracy",
          data: series.acc,
          backgroundColor: colors.accuracy,
          borderColor: colors.accuracy,
          tension: 0.3,
          yAxisID: "yAccuracy",
        },
      ],
    },
    options: options,
  });
};
