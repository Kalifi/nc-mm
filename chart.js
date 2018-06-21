window.initChart = (matches, gamePoints) => {
  const ctx = document.getElementById('chart');
  const chartColors = ['#00AAFF', '#FF0000', '#000000', '#008000', '#00FFFF', '#FF00FF'];
  const datasets = gamePoints.map((person, index) => ({
      label: person.name,
      fill: false,
      backgroundColor: chartColors[index],
      borderColor: chartColors[index],
      data: person.points
    }));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...matches],
      datasets: datasets 
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Nerdclub MM-Jalkapallo 2018 Kisatietäjä'
      },
      tooltips: {
        mode: 'index',
      },
      hover: {
        mode: 'index'
      },
      elements: {
        line: {
          tension: 0, // disables bezier curves
        }
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Ottelu'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Pisteet'
          }
        }]
      }
    }
  });
}