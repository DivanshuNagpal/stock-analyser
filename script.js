const apiKey = 'QT9YTQvPCPSEF8NGt2kKxg5aQkdZGinq';
let chart;

document.querySelector(".submit").addEventListener("click", (e) => {
  e.preventDefault();
  const symbol = document.getElementById("name").value.toUpperCase();
  const period = document.getElementById("year").value;
  const days = getDaysFromPeriod(period);
  if (symbol && days) {
    fetchAndRenderChart(symbol, days);
  }
});

function getDaysFromPeriod(period) {
  switch (period) {
    case "1 Month": return 30;
    case "1 Year": return 365;
    case "3 Year": return 365 * 3;
    case "5 Year": return 365 * 5;
    default: return 30;
  }
}

async function fetchAndRenderChart(symbol, days) {
  try {
    const quoteRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`);
    const quoteData = await quoteRes.json();
    if (!quoteData || quoteData.length === 0) {
      alert("Invalid stock symbol.");
      return;
    }

    const companyName = quoteData[0].name;
    const latestPrice = quoteData[0].price;

    const historyRes = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?serietype=line&apikey=${apiKey}`);
    const historyData = await historyRes.json();
    if (!historyData.historical || historyData.historical.length === 0) {
      alert("No historical data found for that symbol.");
      return;
    }

    const historical = historyData.historical.slice(0, days).reverse();
    const labels = historical.map(item => item.date);
    const prices = historical.map(item => item.close);

    document.getElementById("priceDisplay").innerHTML = `
          <div>Stock: <strong>${companyName}</strong> (${symbol})</div>
          <div>Latest Price: <strong>$${latestPrice.toFixed(2)}</strong></div>
        `;

    renderChart(symbol, labels, prices);
  } catch (err) {
    alert("Error fetching stock data.");
    console.error(err);
  }
}

function renderChart(symbol, labels, prices) {
  const ctx = document.getElementById("stockChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${symbol} Stock Price`,
        data: prices,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: {
          title: { display: true, text: "Date" },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: "Price (USD)" },
          grid: { display: false }
        }
      }
    }
  });
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!chart) {
    alert("No chart to download yet.");
    return;
  }
  const link = document.createElement("a");
  link.href = chart.toBase64Image();
  link.download = `${chart.data.datasets[0].label.replace(/ /g, "_")}.png`;
  link.click();
});

setInterval(() => {
  const symbol = document.getElementById("name").value.toUpperCase();
  const period = document.getElementById("year").value;
  if (symbol && period) {
    const days = getDaysFromPeriod(period);
    fetchAndRenderChart(symbol, days);
  }
}, 30000);