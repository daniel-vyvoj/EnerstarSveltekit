<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let data: any[] = [];
  let dailyMin = '';
  let currentPrice = '';
  let dailyMax = '';

  onMount(async () => {
    try {
      const response = await fetch('/src/DataCen.json');
      data = await response.json();

      dailyMin = calculateDailyMin(data);
      currentPrice = calculateCurrentPrice(data);
      dailyMax = calculateDailyMax(data);

      renderChart();
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    }
  });

  function renderChart() {
    const chartData = {
      labels: data.map((item) => item.Hodina),
      datasets: [
        {
          label: 'Ceny za 24 hodin',
          data: data.map((item) => {
            const priceEuro = parseFloat(item['Eur/MWH']);
            const exchangeRate = 25; // Předpokládaný kurz EUR/CZK
            const priceCZK = priceEuro * exchangeRate;
            return priceCZK;
          }),
          backgroundColor: data.map((item) => {
            const price = parseFloat(item['Eur/MWH']);
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
                backgroundColor: 'black',
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
              borderColor: '#baf400',
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
                yAdjust: -12, // Posunutí textu nahoru
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
                  color: '#baf400',
                },
                yAdjust: -12, // Posunutí textu nahoru
              },
            },
          ],
        },
      },
    };

    const ctx = document.getElementById('chart');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions,
      });
    }
  }

  function calculateDailyMin(data: any[]) {
    const prices = data.map((item) => parseFloat(item['Eur/MWH']));
    const minPrice = Math.min(...prices);
    return minPrice.toFixed(2);
  }

  function calculateCurrentPrice(data: any[]) {
    const currentHour = new Date().getHours();
    const currentPrice = parseFloat(data[currentHour - 1]['Eur/MWH']);
    return currentPrice.toFixed(2);
  }

  function calculateDailyMax(data: any[]) {
    const prices = data.map((item) => parseFloat(item['Eur/MWH']));
    const maxPrice = Math.max(...prices);
    return maxPrice.toFixed(2);
  }
</script>

<style>
  /* Importujte Tailwind CSS */
  @import 'tailwindcss/tailwind.css';
  @import url('https://fonts.googleapis.com/css2?family=Euclid+Circular+A:wght@400;600&display=swap');

  /* Přidejte vlastní styly */
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Celý box */


  /* Obdélník nad grafem */
  .rectangle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  width: 909px;
  height: 104px;
  background: #004852;
  border-radius: 16px;
  margin: 87px auto 0;
}

.spot-heading {
  width: 129px;
  height: 28px;
  font-family: 'Euclid Circular A';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
  color: #FFFFFF; /* System/Gray/White */
}

.spot-heading:before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #FFFFFF; /* System/Gray/White */
  border-radius: 50%;
  margin-right: 8px;
}

.spot-date-arrow {
  display: flex;
  align-items: center;
}

.spot-date-arrow:before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-top: 2px solid #FFFFFF; /* System/Gray/White */
  border-right: 2px solid #FFFFFF; /* System/Gray/White */
  transform: rotate(45deg);
  margin-right: 8px;
}

.spot-date {
  font-family: 'Euclid Circular A';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #FFFFFF; /* System/Gray/White */
}

.spot-date-arrow.right {
  flex-direction: row-reverse;
}

  /* Sloupcový graf */
  .chartjs-render-monitor {
    width: 909px;
    height: 400px;
    margin: 20px auto 0;
  }

  /* Styly textu */
  .price {
    font-family: 'Euclid Circular A';
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 30px;
    letter-spacing: -0.02em;
    font-variant: small-caps;
    color: #baf400; /* Lemon green/500 - (BASE) */
  }

  .caption {
    font-family: 'Euclid Circular A';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    color: #ffffff; /* System/Gray/White */
  }

  .time {
    font-family: 'Euclid Circular A';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    color: #baf400; /* Lemon green/500 - (BASE) */
  }

  .chartjs-render-monitor >div {
    position: absolute;
    width: 29px;
    height: 15px;
    left: 0;
    top: 0;
    font-family: 'Euclid Circular A';
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color: #baf400; /* Lemon green/500 - (BASE) */
  }

</style>

<main>
  <div class="chart-container">
    <div class="spot-heading">
      <span class="spot-date-arrow"></span>
      Spotové ceny
      <span class="spot-date-arrow right"></span>
    </div>
    <div class="rectangle">
      <div>
        <p class="price">{dailyMin} / MWh</p>
        <p class="caption">Denní min</p>
        <p class="time">00:00 - 01:00</p>
      </div>
      <div>
        <p class="price">{currentPrice} / MWh</p>
        <p class="caption">Aktuální cena</p>
        <p class="time">10:00 - 11:00</p>
      </div>
      <div>
        <p class="price">{dailyMax} / MWh</p>
        <p class="caption">Denní max</p>
        <p class="time">15:00 - 16:00</p>
      </div>
    </div>
    <canvas id="chart" class="chartjs-render-monitor"></canvas>
  </div>
</main>