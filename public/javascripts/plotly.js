TESTER = document.getElementById('plotly');

// x-axis data needs to be array of incremental distance
// y-axis data needs to be array of average(?) speed
Plotly.plot( TESTER, [{
  x: [1, 2, 3, 4, 5],
  y: [1, 2, 4, 8, 16] }], { 
    margin: { t: 0 } } );

/* Current Plotly.js version */
console.log( Plotly.BUILD );

