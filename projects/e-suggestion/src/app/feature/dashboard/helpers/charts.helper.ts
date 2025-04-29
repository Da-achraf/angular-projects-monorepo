import { EChartsOption } from 'echarts/types/dist/shared';

const CHART_COLORS = [
  '#C7D5F0',
  '#81DDC7',
  '#83A2DE',
  '#C96B89',
  '#7ECADE',
  '#F7A784',
  '#A391AC',
];

// Helper function to create chart options
export function createDognutChart(
  labels: string[],
  data: any[],
  label: string
): EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: labels,
    },
    series: [
      {
        name: label,
        type: 'pie',
        radius: ['40%', '70%'],
        color: shuffleArray(CHART_COLORS),
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{d}%',
          position: 'outer',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}
