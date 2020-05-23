<script>

var smoothie = new SmoothieChart();
smoothie.streamTo(document.getElementById("mycanvas"));
// Create a time series
var series = new TimeSeries();

// Find the canvas
var canvas = document.getElementById('chart');

// Create the chart
var chart = new SmoothieChart();
chart.addTimeSeries(series, { strokeStyle: 'rgba(0, 255, 0, 1)' });
chart.streamTo(canvas, 500);

// Randomly add a data point every 500ms
setInterval(function() {
    series.append(Date.now(), Math.random() * 10000);
}, 500);
</script>

<svelte:head>
    <script type="text/javascript" src="smoothie.js"></script>
</svelte:head>

<body>
    <canvas id="chart" width="400" height="100"></canvas>

</body>
