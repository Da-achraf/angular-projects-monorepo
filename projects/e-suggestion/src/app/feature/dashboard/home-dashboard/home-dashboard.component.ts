import {
  Component,
  computed,
  effect,
  inject,
  model,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { graphic } from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective } from 'ngx-echarts';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BU } from 'projects/e-suggestion/src/app/core/crud/bus/bu.model';
import { BUStore } from 'projects/e-suggestion/src/app/core/crud/bus/bu.store';
import { Plant } from 'projects/e-suggestion/src/app/core/crud/plants/plant.model';
import { PlantStore } from 'projects/e-suggestion/src/app/core/crud/plants/plant.store';
import { IdeaStatus } from 'projects/e-suggestion/src/app/core/idea/models/idea-status.model';
import { IdeaStatusDisplayPipe } from 'projects/e-suggestion/src/app/pattern/idea-status/pipes/idea-status.pipe';
import { IdeaStatusBadgeComponent } from '../../../pattern/idea-status/components/idea-status-badge.component';
import { ScoreCardComponent } from "../components/score-card.component";
import { ScoreCardsListComponent } from "../components/score-cards/score-cards-list.component";

interface ChartType {
  name: string;
  value: string;
}

const CHART_COLORS = [
  '#C7D5F0',
  '#81DDC7',
  '#83A2DE',
  '#C96B89',
  '#7ECADE',
  '#F7A784',
  '#A391AC',
];

@Component({
  selector: 'ba-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styles: [
    `
      :host {
        @apply block bg-gray-50;
      }
    `,
  ],
  imports: [
    MultiSelectModule,
    FormsModule,
    NgxEchartsDirective,
    SelectButtonModule,
    IdeaStatusBadgeComponent,
    FloatLabelModule,
    IdeaStatusDisplayPipe,
    ScoreCardComponent,
    ScoreCardsListComponent
],
})
export class HomeDashboardHomeComponent implements OnInit {
  plants = inject(PlantStore).allEntities;
  bus = inject(BUStore).allEntities;
  statuses = signal(Object.values(IdeaStatus));

  selectedPlants: Plant[] = [];
  selectedBus: BU[] = [];
  selectedStatuses: string[] = [];

  isLoading = false;
  byBuschartOptions!: EChartsOption;
  byPlantschartOptions!: EChartsOption;
  unImplementedActionschartOptions!: EChartsOption;

  // Chart type options
  chartTypes: ChartType[] = [
    { name: 'Pie', value: 'pie' },
    { name: 'Radar', value: 'radar' },
    { name: 'Funnel', value: 'funnel' },
    { name: 'Nightingale', value: 'nightingale' },
    { name: 'Bar', value: 'bar' },
  ];
  selectedChartType = model<string>('pie');

  // Sample data - replace with actual data from your service
  ideasByPlantData = computed(() =>
    this.plants().map(({ id }) => ({
      plantId: id,
      count: Math.floor(Math.random() * 1000) + 100, // Random number between 100 and 1099
    }))
  );

  // Sample data - replace with actual data from your service
  ideasByBUData = computed(() =>
    this.bus().map(({ id }) => ({
      buId: id,
      count: Math.floor(Math.random() * 1000) + 100, // Random number between 100 and 1099
    }))
  );

  plantsEffect = effect(() => {
    const plants = this.plants();
    const statuses = this.statuses();
    if (plants && plants.length > 0 && statuses && statuses.length > 0) {
      untracked(() => {
        this.selectedPlants = [...plants];
        this.selectedStatuses = [...statuses];
        this.updateByPlantsChart();
      });
    }
  });

  busEffect = effect(() => {
    const bus = this.bus();
    const statuses = this.statuses();
    if (bus && bus.length > 0 && statuses && statuses.length > 0) {
      untracked(() => {
        this.selectedBus = [...bus];
        this.updateByBusChart();
      });
    }
  });

  ngOnInit(): void {
    this.updateunImplementedActionschart();
  }

  updateByPlantsChart() {
    this.isLoading = true;

    // If no plants selected, show all plants
    const plantsToShow =
      this.selectedPlants.length === 0 ? this.plants() : this.selectedPlants;

    // Filter data based on selected plants
    const filteredData = this.ideasByPlantData().filter(item =>
      plantsToShow.some(plant => plant.id === item.plantId)
    );

    // Sort data by count in descending order
    filteredData.sort((a, b) => b.count - a.count);

    // Prepare chart data
    const xAxisData = filteredData.map(item => {
      const plant = this.plants().find(p => p.id === item.plantId);
      return plant ? plant.name : 'Unknown';
    });

    const seriesData = filteredData.map(item => ({
      value: item.count,
      name: xAxisData[filteredData.indexOf(item)],
    }));

    this.byPlantschartOptions = this.createPieChart(xAxisData, seriesData);

    this.isLoading = false;
  }

  updateByBusChart() {
    this.isLoading = true;

    // If no plants selected, show all plants
    const busToShwo =
      this.selectedBus.length === 0 ? this.bus() : this.selectedBus;

    // Filter data based on selected plants
    const filteredData = this.ideasByBUData().filter(item =>
      busToShwo.some(bu => bu.id === item.buId)
    );

    // Sort data by count in descending order
    filteredData.sort((a, b) => b.count - a.count);

    // Prepare chart data
    const xAxisData = filteredData.map(item => {
      const bu = this.bus().find(bu => bu.id === item.buId);
      return bu ? bu.name : 'Unknown';
    });

    const seriesData = filteredData.map(item => ({
      value: item.count,
      name: xAxisData[filteredData.indexOf(item)],
    }));

    this.byBuschartOptions = this.createPieChart(xAxisData, seriesData);

    this.isLoading = false;
  }

  createPieChart(labels: string[], data: any[]): EChartsOption {
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
          name: 'Ideas',
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

  mockData: { [key: string]: number } = {
    Production: 62,
    Quality: 45,
    Process: 38,
    'Tools Shop': 27,
    Maintenance: 53,
    'Tool & Die': 29,
    Warehouse: 19,
    SC: 33,
    Other: 15,
  };

  updateunImplementedActionschart() {
    // Sort departments by action count in descending order
    const sortedDepartments = Object.entries(this.mockData).sort(
      (a, b) => b[1] - a[1]
    );

    const departments = sortedDepartments.map(([dept]) => dept);
    const values = sortedDepartments.map(([, count]) => count);

    // Shuffle colors for variety
    const shuffledColors = shuffleArray(CHART_COLORS);

    // Set chart options
    this.unImplementedActionschartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c} actions',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Number of Unimplemented Actions',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'category',
        data: departments,
        axisLabel: {
          width: 120,
          overflow: 'truncate',
        },
      },
      series: [
        {
          name: 'Unimplemented Actions',
          type: 'bar',
          data: values.map((value, index) => ({
            value,
            itemStyle: {
              color: new graphic.LinearGradient(1, 0, 0, 0, [
                {
                  offset: 0,
                  color: shuffledColors[index % shuffledColors.length],
                }, // Base color
                {
                  offset: 1,
                  color: adjustColorBrightness(
                    shuffledColors[index % shuffledColors.length],
                    -40
                  ),
                }, // Darker shade
              ]),
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
          },
        },
      ],
    };
  }
}

// Function to darken or lighten a color
function adjustColorBrightness(hex: string, amount: number): string {
  let usePound = false;
  if (hex[0] === '#') {
    hex = hex.slice(1);
    usePound = true;
  }

  let num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return (
    (usePound ? '#' : '') +
    ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
  );

  //   mockData: { [key: string]: { implemented: number; unimplemented: number } } =
  //     {
  //       Production: { implemented: 30, unimplemented: 62 },
  //       Quality: { implemented: 25, unimplemented: 45 },
  //       Process: { implemented: 20, unimplemented: 38 },
  //       'Tools Shop': { implemented: 15, unimplemented: 27 },
  //       Maintenance: { implemented: 28, unimplemented: 53 },
  //       'Tool & Die': { implemented: 14, unimplemented: 29 },
  //       Warehouse: { implemented: 10, unimplemented: 19 },
  //       SC: { implemented: 18, unimplemented: 33 },
  //       Other: { implemented: 8, unimplemented: 15 },
  //     };

  //   updateunImplementedActionschart() {
  //     // Sort departments by unimplemented actions (descending)
  //     const sortedDepartments = Object.entries(this.mockData).sort(
  //       (a, b) => b[1].unimplemented - a[1].unimplemented
  //     );

  //     const departments = sortedDepartments.map(([dept]) => dept);
  //     const implementedValues = sortedDepartments.map(
  //       ([, counts]) => counts.implemented
  //     );
  //     const unimplementedValues = sortedDepartments.map(
  //       ([, counts]) => counts.unimplemented
  //     );
  //     const totalValues = sortedDepartments.map(
  //       ([, counts]) => counts.implemented + counts.unimplemented
  //     );

  //     // Color definitions
  //     const implementedBaseColor = '#5EB087'; // Green
  //     const unimplementedBaseColor = '#C86C89'; // Red

  //     this.unImplementedActionschartOptions = {
  //       tooltip: {
  //         trigger: 'axis',
  //         axisPointer: { type: 'shadow' },
  //         formatter: (params: any) => {
  //           let imp = 0,
  //             unimp = 0;
  //           params.forEach((p: any) => {
  //             if (p.seriesName === 'Implemented') imp = p.value;
  //             if (p.seriesName === 'Unimplemented') unimp = p.value;
  //           });
  //           return `Department: ${params[0].name}<br/>
  //                     Implemented: ${imp}<br/>
  //                     Unimplemented: ${unimp}<br/>
  //                     Total: ${imp + unimp}`;
  //         },
  //       },
  //       grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  //       xAxis: {
  //         type: 'value',
  //       },
  //       yAxis: {
  //         type: 'category',
  //         data: departments,
  //         axisLabel: {
  //           width: 120,
  //           formatter: (value: string, index: number) => {
  //             // Append the total to the department name
  //             return `${value} (${totalValues[index]})`;
  //           },
  //         },
  //       },
  //       series: [
  //         {
  //           name: 'Implemented',
  //           type: 'bar',
  //           barGap: '0%',
  //           data: implementedValues.map(value => ({
  //             value,

  //             itemStyle: {
  //               color: {
  //                 type: 'linear',
  //                 x: 0,
  //                 y: 0,
  //                 x2: 1,
  //                 y2: 0,
  //                 colorStops: [
  //                   { offset: 0, color: '#A8E6CF' }, // Start color (light green)
  //                   { offset: 1, color: '#5EB087' }, // End color (medium green)
  //                 ],
  //               },
  //             },

  //             // itemStyle: {
  //             //   color: implementedBaseColor,
  //             // },
  //           })),
  //           barWidth: '40%',
  //           label: {
  //             show: true,
  //             position: 'insideRight',
  //             color: '#fff',
  //             formatter: '{c}',
  //           },
  //         },
  //         {
  //           name: 'Unimplemented',
  //           type: 'bar',
  //           barGap: '0%',
  //           data: unimplementedValues.map(value => ({
  //             value,
  //             itemStyle: {
  //               color: {
  //                 type: 'linear',
  //                 x: 0,
  //                 y: 0,
  //                 x2: 1,
  //                 y2: 0,
  //                 colorStops: [
  //                   { offset: 0, color: '#FF8B94' }, // Start color (light red)
  //                   { offset: 1, color: '#C86C89' }, // End color (medium red)
  //                 ],
  //               },
  //             },
  //           })),
  //           barWidth: '40%',
  //           label: {
  //             show: true,
  //             position: 'insideRight',
  //             color: '#fff',
  //             formatter: '{c}',
  //           },
  //         },
  //       ],
  //     };
  //   }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}
