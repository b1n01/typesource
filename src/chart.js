import Chart from "chart.js/auto";
import { merge } from "lodash";

// Chart colors
const colors = {
  sessions: "#e07a5f",
  wpm: "#f2cc8f",
  accuracy: "#81b29a",
  x: "#666",
  legend: "#999",
};

// Line chart options
export const getOptions = (options) => {
  const baseOptions = {
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
  return merge(baseOptions, options);
};

// Get date title tooptio
export const getDateTitleTooltip = () => ({
  plugins: {
    tooltip: {
      callbacks: {
        title: (context) => {
          let date = new Date(context[0].label);
          let options = {
            year: "numeric",
            month: "short",
            day: "numeric",
          };
          return date.toLocaleDateString("en-US", options);
        },
      },
    },
  },
});

// Get options for Sessions y axis
export const getSessionsAxis = () => ({
  scales: {
    ySessions: {
      title: {
        display: true,
        text: "Sessions",
        color: colors.sessions,
      },
      position: "right",
      ticks: {
        color: colors.sessions,
      },
      grid: {
        borderColor: colors.sessions,
        drawOnChartArea: false,
      },
    },
  },
});

// Get options for the Wpm dataset
export const getWpmSet = (data) => ({
  label: "wpm",
  data: data,
  backgroundColor: colors.wpm,
  borderColor: colors.wpm,
  tension: 0.3,
  yAxisID: "yWpm",
});

// Get options for the Accuraty dataset
export const getAccuracySet = (data) => ({
  label: "accuracy",
  data: data,
  backgroundColor: colors.accuracy,
  borderColor: colors.accuracy,
  tension: 0.3,
  yAxisID: "yAccuracy",
});

// Get options for the Sessions dataset
export const getSessionsSet = (data) => ({
  label: "sessions",
  data: data,
  backgroundColor: colors.sessions,
  borderColor: colors.sessions,
  tension: 0.3,
  yAxisID: "ySessions",
});

// Create a new line chart
export const getChart = (canvas, datasets, labels, options) => {
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: options,
  });
};
