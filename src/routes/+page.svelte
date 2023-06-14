<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  
  interface ChartData {
    Hodina: string;
    'Eur/MWH': number;
  }
  
  let currentTime = getCurrentTime();
  
  function getCurrentTime() {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  function transformChartData(data: any[]) {
    const transformedData: ChartData[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      transformedData.push(data[i]);
      transformedData.push({
        Hodina: '',
        'Eur/MWH': 0,
      });
    }
    transformedData.push(data[data.length - 1]);
    return transformedData;
  }
  
  let data: ChartData[] = [];
  let dailyMin = '';
  let currentPrice = '';
  let dailyMax = '';
  
  onMount(async () => {
    try {
      const response = await fetch('https://firebasestorage.googleapis.com/v0/b/enerstav.appspot.com/o/DataCen.json?alt=media&token=7e6a92a8-b17a-49e4-a33e-aa5f13c2a7f3');
      const originalData: ChartData[] = await response.json();
      const transformedData: ChartData[] = transformChartData(originalData);
  
      dailyMin = calculateDailyMin(originalData);
      currentPrice = calculateCurrentPrice(originalData);
      dailyMax = calculateDailyMax(originalData);
  
      renderChart(transformedData);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    }
  });
  
  function renderChart(data: ChartData[]) {
    const chartData = {
      labels: data.map((item) => item.Hodina),
      datasets: [
        {
          label: 'Ceny za 24 hodin',
          data: data.map((item) => {
            const priceEuro = item['Eur/MWH'];
            const exchangeRate = 25; // Předpokládaný kurz EUR/CZK
            const priceCZK = priceEuro * exchangeRate;
            return priceCZK;
          }),
          backgroundColor: data.map((item) => {
            const price = item['Eur/MWH'];
            if (price >= 0) {
              return '#8DC63F'; // Zelená barva pro pozitivní ceny
            } else {
              return '#FF5C60'; // Červená barva pro negativní ceny
            }
          }),
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  
    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          enabled: true, // Vypnutí tooltipu
        },
        legend: {
          display: true, // Skrytí legendy
        },
        annotation: {
          annotations: [
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y',
              value: parseFloat(dailyMin),
              borderColor: '#baf400',
              borderWidth: 1,
              label: {
                enabled: true,
                content: dailyMin,
                backgroundColor: 'transparent',
                font: {
                  family: 'Euclid Circular A',
                  size: 12,
                  weight: 500,
                  color: '#baf400',
                },
                yAdjust: -12, // Posunutí textu nahoru
              },
            },
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y',
              value: parseFloat(currentPrice),
              borderColor: '#000000',
              borderWidth: 1,
              label: {
                enabled: true,
                content: currentPrice,
                backgroundColor: 'transparent',
                font: {
                  family: 'Euclid Circular A',
                  size: 12,
                  weight: 500,
                  color: '#000000',
                },
                yAdjust: -12,
              },
            },
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y',
              value: parseFloat(dailyMax),
              borderColor: '#ff0000',
              borderWidth: 1,
              label: {
                enabled: true,
                content: dailyMax,
                backgroundColor: 'transparent',
                font: {
                  family: 'Euclid Circular A',
                  size: 12,
                  weight: 500,
                  color: '#ff0000',
                },
                yAdjust: -12,
              },
            },
          ],
        },
      },
    };
  
    const chartConfig = {
      type: 'bar',
      data: chartData,
      options: chartOptions,
    };
  
    const ctx = document.getElementById('chartCanvas');
    if (ctx) {
      new Chart(ctx, chartConfig);
    }
  }
  
  function calculateDailyMin(data: ChartData[]) {
    const prices = data.map((item) => item['Eur/MWH']);
    const minPrice = Math.min(...prices);
    return minPrice.toFixed(2);
  }
  
  function calculateCurrentPrice(data: ChartData[]) {
    const currentHour = new Date().getHours();
    const currentPrice = data[currentHour - 1]['Eur/MWH'];
    return currentPrice.toFixed(2);
  }
  
  function calculateDailyMax(data: ChartData[]) {
    const prices = data.map((item) => item['Eur/MWH']);
    const maxPrice = Math.max(...prices);
    return maxPrice.toFixed(2);
  }
  </script>
<div class="flex justify-center items-center h-screen">
  <div class="table bg-[#003941] h-[544px] w-[1020px] rounded-[56px] px-5 py-5">
    <!-- Horní část -->
    <div class="flex items-center justify-between">
      <div class="flex gap-8">
        <p class="font-euclid_circular_a text-xl leading-[1.4] text-white">Spotové ceny</p>
        <div class="flex gap-6">
          <button class="w-[42px] h-[42px] rounded-[9000px] bg-[#BAF400] p-3 flex items-center justify-center">
            <p class="text-white">B</p>
          </button>
          <p class="text-xl leading-[1.4] text-white">23.3. 2023</p>
          <button class="w-[42px] h-[42px] rounded-[9000px] bg-[#D9DBE9] p-3 flex items-center justify-center opacity-40">
            <p>B</p>
          </button>
        </div>
      </div>
      <div class="flex gap-3">
        <p class="text-[#BAF400)">{currentTime}</p>
        <button class="font-euclid_circular_a inline-flex items-center justify-center gap-3 rounded-[9000px] hover:bg-[#BAF400] bg-[#14142B] px-4 py-2.5 font-normal text-[#FCFCFC] transition-all">
          <p class="text-sm leading-normal ">Graf</p>
        </button>
        <button class="font-euclid_circular_a inline-flex items-center justify-center gap-3 rounded-[9000px] hover:bg-[#14142B] bg-[#BAF400] hover:text-white px-4 py-2.5 font-normal text-[#14142B] transition-all">
          <p class="text-sm leading-normal">Tabulka</p>
        </button>
      </div>
    </div>
    <!-- Rámeček -->
<!-- Rámeček -->
<div class="flex justify-between items-start mt-4 px-8 py-4 bg-[#004852] rounded-[16px]">
    <!-- První část rámečku -->
    <div class=" pr-4">
        <p class="text-[#baf400] transform -rotate-1 text-left align-top text-2xl font-[Euclid Circular A] tracking-tighter leading-[40px] border-style-none outline-none w-[117px]">
          {dailyMin}
          </p>
          <p class="text-[#ffffff] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[10px] border-style-none outline-none ">
            Denni min
          </p>
          <p class="text-[#baf400] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[30px] border-style-none outline-none">
            Casove rozmezi
          </p>
    </div>
    <!-- Druhá část rámečku -->
    <div class=" px-4">
        <p class="text-[#baf400] transform -rotate-1 text-left align-top text-2xl font-[Euclid Circular A] tracking-tighter leading-[40px] border-style-none outline-none w-[117px]">
          {currentPrice}
          </p>
          <p class="text-[#ffffff] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[10px] border-style-none outline-none ">
            Aktualni cena
          </p>
          <p class="text-[#baf400] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[30px] border-style-none outline-none">
            Casove rozmezi
          </p>
    </div>
    <!-- Třetí část rámečku -->
    <div class="px-4">
        <p class="text-[#baf400] transform -rotate-1 text-left align-top text-2xl font-[Euclid Circular A] tracking-tighter leading-[40px] border-style-none outline-none w-[117px]">
          {dailyMax}
          </p>
          <p class="text-[#ffffff] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[10px] border-style-none outline-none ">
            Denni max
          </p>
          <p class="text-[#baf400] transform -rotate-1 text-left align-top text-base font-[Euclid Circular A] leading-[30px] border-style-none outline-none">
            Casove rozmezi
          </p>
    </div>
  </div>
  
  
    <!-- Dolní část graf -->
    <div class="flex justify-between items-start py-4">
      <div class="w-[1020px]">
        <canvas id="chartCanvas" class="h-[44px]"></canvas>
      </div>
    </div>
  </div>
</div>


 <style>
#chart {
  background-color: transparent;
}
 </style>