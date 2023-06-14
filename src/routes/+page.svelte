<script lang="ts">
import { onMount } from 'svelte';
import Chart from 'chart.js/auto';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';



const firebaseConfig = {
  apiKey: "AIzaSyAh5RVRAAmRT8UwIogGlY2AtDZUKcULFgk",
    authDomain: "enerstav.firebaseapp.com",
    databaseURL: "https://enerstav-default-rtdb.firebaseio.com",
    projectId: "enerstav",
    storageBucket: "enerstav.appspot.com",
    messagingSenderId: "101325697125",
    appId: "1:101325697125:web:53b25088da1a466a46168c"
};

// Inicializace Firebase
firebase.initializeApp(firebaseConfig);

let currentTime = getCurrentTime();

function getCurrentTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

setInterval(() => {
  currentTime = getCurrentTime ();
}, 1000); // Aktualizovat čas každou sekundu (1000 ms)

function transformChartData(data: any[]) {
  const transformedData = [];
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

let data: any[] = [];
let dailyMin = '';
let currentPrice = '';
let dailyMax = '';

onMount(async () => {
  try {
    // Načtení dat z Firebase Realtime Database
    const reference = firebase.database().ref('/Data');
    const snapshot = await reference.once('value');
    const originalData = snapshot.val();
    data = transformChartData(originalData);

    dailyMin = calculateDailyMin(originalData);
    currentPrice = calculateCurrentPrice(originalData);
    dailyMax = calculateDailyMax(originalData);

    renderChart();
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
});

function renderChart() {
  const chartData = {
    labels: data.map((item) => item.hodina),
    datasets: [
      {
        label: 'Ceny za 24 hodin',
        data: data.map((item) => {
          const priceEuro = parseFloat(item['EurMWH']);
          const exchangeRate = 25; // Předpokládaný kurz EUR/CZK
          const priceCZK = priceEuro * exchangeRate;
          return priceCZK;
        }),
        backgroundColor: data.map((item) => {
          const price = parseFloat(item['EurMWH']);
          if (price >= 0) {
            return '#8DC63F'; // Zelená barva pro pozitivní ceny
          } else {
            return '#FF5C60'; // Červená barva pro negativní ceny
          }
        }),
        borderColor: '#baf400',
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
        display: true,
        labels: {
          color: '#baf400', // Barva textu legendy
        },
        // Skrytí legendy
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
                color: '#baf400',
              },
              yAdjust: -12,
            },
          },
          {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: parseFloat(dailyMax),
            borderColor: '#baf400',
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

        drawTime: 'beforeDatasetsDraw', // Kreslení anotací před vykreslením sloupců

        // Vlastní kreslení sloupců
        drawCustomBars: true,
        customBarDraw: (ctx, { datasetIndex, element }) => {
          const dataset = chartData.datasets[datasetIndex];
          const barValue = dataset.data[element.index];

          const x = element.x;
          const y = element.y;
          const base = element.base;
          const width = element.width;
          const height = element.height;

          ctx.save();

          if (barValue >= 0) {
            // Vlastní styl sloupce
            ctx.fillStyle = 'rgba(141,198,63,1)'; // Zelená barva pro pozitivní ceny
            ctx.fillRect(x, y, width, height);
          } else {
            // Původní styl pro negativní ceny
            ctx.fillStyle = dataset.backgroundColor;
            ctx.fillRect(x, base, width, y - base);
          }

          ctx.restore();
        },
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

function convertToCZK(priceEUR: number): string {
  const conversionRate = 25; // Předpokládaný konverzní kurz z eur na koruny
  const priceCZK = priceEUR * conversionRate;
  return priceCZK.toFixed(2);
}

function calculateDailyMin(data: any[]): string {
  const prices = data.map((item) => parseFloat(item['EurMWH']));
  const minPrice = Math.min(...prices);
  const minPriceCZK = convertToCZK(minPrice);
  return minPriceCZK;
}

function calculateCurrentPrice(data: any[]): string {
  const currentHour = new Date().getHours();
  const currentPrice = parseFloat(data[currentHour - 1]['EurMWH']);
  const currentPriceCZK = convertToCZK(currentPrice);
  return currentPriceCZK;
}

function calculateDailyMax(data: any[]): string {
  const prices = data.map((item) => parseFloat(item['EurMWH']));
  const maxPrice = Math.max(...prices);
  const maxPriceCZK = convertToCZK(maxPrice);
  return maxPriceCZK;
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
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.96313 1L0.999962 7.96317L7.96313 14.9263" stroke="#14142B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <p class="text-xl leading-[1.4] text-white">23.3. 2023</p>
          <button class="w-[42px] h-[42px] rounded-[9000px] bg-[#D9DBE9] p-3 flex items-center justify-center opacity-40">
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7.96317 7.96317L1 14.9263" stroke="#14142B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex gap-3">
        <p class="text-white mt-2">{currentTime}</p>
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
        <p class="text-[#baf400] transform  text-left align-top text-2xl font-[Euclid Circular A]  w-[117px]">
          {dailyMin} Kč
          </p>
          <p class="text-[#ffffff] transform  text-left align-top text-base font-[Euclid Circular A]">
            Denní min
          </p>
          <p class="text-[#baf400] transform  text-left align-top text-base font-[Euclid Circular A] ">
            Casove rozmezi
          </p>
    </div>
    <!-- Druhá část rámečku -->
    <div class=" px-4">
        <p class="text-[#baf400] transform  text-left align-top text-2xl font-[Euclid Circular A] tracking-tighter leading-[40px] w-[117px]">
          {currentPrice} Kč
          </p>
          <p class="text-[#ffffff] transform text-left align-top text-base font-[Euclid Circular A] leading-[10px] ">
            Aktualní cena
          </p>
          <p class="text-[#baf400] transform text-left align-top text-base font-[Euclid Circular A] leading-[30px]">
            Casove rozmezi
          </p>
    </div>
    <!-- Třetí část rámečku -->
    <div class="px-4">
        <p class="text-[#baf400] transform  text-left align-top text-2xl font-[Euclid Circular A] tracking-tighter leading-[40px] w-[117px]">
          {dailyMax} Kč
          </p>
          <p class="text-[#ffffff] transform  text-left align-top text-base font-[Euclid Circular A] leading-[10px]">
            Denní max
          </p>
          <p class="text-[#baf400] transform  text-left align-top text-base font-[Euclid Circular A] leading-[30px]">
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

 </style>