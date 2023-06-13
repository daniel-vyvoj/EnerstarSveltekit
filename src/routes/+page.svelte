<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let data = [];

  onMount(async () => {
    try {
      const response = await fetch('/src/DataCen.json'); // cesta k souboru DataCen.json
      data = await response.json();

      const ctx = document.getElementById('chart');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar', // Sloupcový graf
          data: {
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
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    }
  });
</script>

<style>
  /* Importujte Tailwind CSS */
  @import 'tailwindcss/tailwind.css';

  /* Přidejte vlastní styly */
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Sloupcový graf */
  .chartjs-render-monitor {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .chartjs-render-monitor > div {
    width: 24px;
    height: 43px;
    background: linear-gradient(180deg, #8DC63F 0%, rgba(141, 198, 63, 0.3) 100%);
    border: 1px solid #000000;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 8px 8px 0px 0px;
    transform: matrix(-1, 0, 0, 1, 0, 0);
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .chartjs-render-monitor > div.negative {
    height: 74px;
    background: linear-gradient(180deg, #FF5C60 0%, rgba(255, 92, 96, 0.3) 100%);
    border-radius: 8px 8px 0px 0px;
    transform: matrix(1, 0, 0, -1, 0, 0);
  }

  /* Obalový box */
  main {
    position: relative;
    width: 1017px;
    height: 539px;
    margin-left: auto;
    margin-right: auto;
    background: #003A42;
    border-radius: 56px;
  }
</style>
<main>
  <canvas id="chart" width="600" height="400"></canvas>
</main>