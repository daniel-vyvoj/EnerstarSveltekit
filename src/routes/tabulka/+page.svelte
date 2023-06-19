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
            <p class="font-euclid_circular_a text-xl leading-[1.4] text-[#ffffff]">Spotové ceny</p>
            <div class="flex gap-6">
              <button class="w-[42px] h-[42px] rounded-[9000px] bg-[#BAF400] p-3 flex items-center justify-center">
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.96313 1L0.999962 7.96317L7.96313 14.9263" stroke="#14142B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <p class="text-xl leading-[1.4] text-[#ffffff]">23.3. 2023</p>
              <button class="w-[42px] h-[42px] rounded-[9000px] bg-[#D9DBE9] p-3 flex items-center justify-center opacity-40">
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7.96317 7.96317L1 14.9263" stroke="#14142B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-3">
            <p class="text-[#ffffff] mt-2">{currentTime}</p>
            <button class="font-euclid_circular_a inline-flex items-center justify-center gap-3 rounded-[9000px] hover:bg-[#BAF400] bg-[#14142B] px-4 py-2.5 font-normal text-[#FCFCFC] transition-all">
              <p class="text-sm leading-normal ">Graf</p>
            </button>
            <button class="font-euclid_circular_a inline-flex items-center justify-center gap-3 rounded-[9000px] hover:bg-[#14142B] bg-[#BAF400] hover:text-white px-4 py-2.5 font-normal text-[#14142B] transition-all">
              <p class="text-sm leading-normal">Tabulka</p>
            </button>
          </div>
        </div>
        <!-- Rámeček -->
        <div class="flex justify-center items-start mt-4 px-8 py-4 bg-[#004852] rounded-[16px]">
            <!-- První část rámečku -->
            <div class="flex flex-col items-center px-4">
                <p class="text-[#baf400] text-2xl font-[Euclid Circular A]">
                    {dailyMin} Kč
                </p>
                <p class="text-[#ffffff] text-base font-[Euclid Circular A]">
                    Denní min
                </p>
            </div>
            <!-- Druhá část rámečku -->
            <div class="flex flex-col items-center px-4">
                <p class="text-[#baf400] text-2xl font-[Euclid Circular A]">
                    {currentPrice} Kč
                </p>
                <p class="text-[#ffffff] text-base font-[Euclid Circular A]">
                    Aktuální cena
                </p>
            </div>
            <!-- Třetí část rámečku -->
            <div class="flex flex-col items-center px-4">
                <p class="text-[#baf400] text-2xl font-[Euclid Circular A]">
                    {dailyMax} Kč
                </p>
                <p class="text-[#ffffff] text-base font-[Euclid Circular A]">
                    Denní max
                </p>
            </div>
            <!-- Čtvrtá část rámečku -->
            <div class="flex flex-col items-center px-4">
                <p class="text-[#baf400] text-2xl font-[Euclid Circular A]">
                    {dailyMax} Kč
                </p>
                <p class="text-[#ffffff] text-base font-[Euclid Circular A]">
                    Denní max
                </p>
            </div>
            <!-- Pata část rámečku -->
            <div class="flex flex-col items-center px-4">
                <p class="text-[#baf400] text-2xl font-[Euclid Circular A]">
                    {dailyMax} Kč
                </p>
                <p class="text-[#ffffff] text-base font-[Euclid Circular A]">
                    Denní max
                </p>
            </div>
      </div>
      
        <!-- Dolní část graf -->
        <div class="flex justify-between items-start py-4">
            <table class="table w-full">
                <thead>
                  <tr>
                    <th class=" border-b border-[#709200] px-4 py-2 text-[#707070] text-center align-top  text-xs  w-[88px] h-[21px]">Hodina</th>
                    <th class="border-b border-[#709200] px-4 py-2 text-[#707070]  text-center align-top  text-xs  w-[88px] h-[21px]">Spot Kč / Mwh</th>
                    <th class="border-b border-[#709200] px-4 py-2 text-[#707070]  text-center align-top text-xs w-[88px] h-[21px]">Základní výkup</th>
                    <th class="border-b border-[#709200] px-4 py-2 text-[#707070] text-center align-top  text-xs w-[88px] h-[21px]">Chytrý výkup</th>
                  </tr>
                </thead>
                <tbody>
                    <!-- Vložte řádky tabulky zde -->
                    <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                      <tr>
                        <td class="border-b border-[#709200] px-4 py-2 text-[#FFFFFF] text-center">
                          <svg class="inline-block w-4 h-4 mr-2" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.50008 5.1665C8.50008 4.89036 8.27622 4.6665 8.00008 4.6665C7.72394 4.6665 7.50008 4.89036 7.50008 5.1665H8.50008ZM8.00008 9.1665H7.50008C7.50008 9.29911 7.55276 9.42629 7.64653 9.52006L8.00008 9.1665ZM9.31319 11.1867C9.50846 11.382 9.82504 11.382 10.0203 11.1867C10.2156 10.9915 10.2156 10.6749 10.0203 10.4796L9.31319 11.1867ZM14.8334 8.49984C14.8334 12.2738 11.774 15.3332 8.00008 15.3332V16.3332C12.3263 16.3332 15.8334 12.8261 15.8334 8.49984H14.8334ZM8.00008 15.3332C4.22614 15.3332 1.16675 12.2738 1.16675 8.49984H0.166748C0.166748 12.8261 3.67385 16.3332 8.00008 16.3332V15.3332ZM1.16675 8.49984C1.16675 4.72589 4.22614 1.6665 8.00008 1.6665V0.666504C3.67385 0.666504 0.166748 4.17361 0.166748 8.49984H1.16675ZM8.00008 1.6665C11.774 1.6665 14.8334 4.72589 14.8334 8.49984H15.8334C15.8334 4.17361 12.3263 0.666504 8.00008 0.666504V1.6665ZM7.50008 5.1665V9.1665H8.50008V5.1665H7.50008ZM7.64653 9.52006L9.31319 11.1867L10.0203 10.4796L8.35363 8.81295L7.64653 9.52006Z" fill="white"/>
                          </svg>
                          12:00
                        </td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                        <td class="border-b border-[#709200] px-4 py-2 text-center text-[#baf400]">1575 / MWh</td>
                      </tr>
                  </tbody>
              </table>
        </div>
      </div>
  </div>
    
    