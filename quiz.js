let cerealData = [];

// Load the CSV with DV percentages
d3.csv("data/cleaned_cereal_with_dv.csv").then(data => {
  data.forEach(d => {
    d.sugar_dv_percent = +d.sugar_dv_percent;
    d.protein_dv_percent = +d.protein_dv_percent;
    d.calories_per_cup = +d.calories_per_cup;
    d.rating = +d.rating;
    d.fat_per_cup = +d.fat_per_cup;
    d.fat_dv_percent = +d.fat_dv_percent;
    d.sodium_mg_per_cup = +d.sodium_mg_per_cup;
    d.sodium_dv_percent = +d.sodium_mg_dv_percent;
    d.carbo_per_cup = +d.carbo_per_cup;
    d.carbo_dv_percent = +d.carbo_dv_percent;
    d.fiber_per_cup = +d.fiber_per_cup;
    d.fiber_dv_percent = +d.fiber_dv_percent;
    d.sugar_per_cup = +d.sugar_per_cup;
    d.potassium_mg_per_cup = +d.potassium_mg_per_cup;
    d.potassium_dv_percent = +d.potassium_mg_dv_percent;
  });

  cerealData = data; // store globally for access later
});


function getUserPreferences() {
  const prefs = {
    sugar: +document.getElementById("slider-sugar").value,
    protein: +document.getElementById("slider-protein").value,
    calories: +document.getElementById("slider-calories").value,
    rating: +document.getElementById("slider-rating").value
  };
  console.log("User prefs:", prefs);
  return prefs;
}



function normalize(value, min, max) {
  return (value - min) / (max - min);
}

function findBestMatch(data, prefs) {
  let best = null;
  let bestScore = Infinity;

  data.forEach(d => {
    const sugar = normalize(d.sugar_dv_percent, 0, 100);
    const protein = normalize(d.protein_dv_percent, 0, 100);
    const calories = normalize(d.calories_per_cup, 50, 300);
    const rating = normalize(d.rating, 0, 100);

    const score =
      Math.abs(sugar - prefs.sugar / 100) +
      Math.abs(protein - prefs.protein / 100) +
      Math.abs(calories - prefs.calories / 100) +
      Math.abs(rating - prefs.rating / 100);

    if (score < bestScore) {
      bestScore = score;
      best = d;
    }
  });

  return best;
}


function populateSVG(cereal) {
      console.log("Populating with:", cereal);
const titleText = d3.select("#cerealTitle");
  titleText.text(cereal.name);
const baseFontSize = 80;
const maxLength = 14;
const nameLength = cereal.name.length;

const newFontSize = nameLength <= maxLength
  ? baseFontSize
  : baseFontSize * (maxLength / nameLength);

  titleText.style("font-size", `${newFontSize}px`);
  // Log all percentage values
  console.log("Fat %:", cereal.fat_dv_percent);
  console.log("Sodium %:", cereal.sodium_dv_percent);
  console.log("Carbs %:", cereal.carbo_dv_percent);
  console.log("Fiber %:", cereal.fiber_dv_percent);
  console.log("Sugar %:", cereal.sugar_dv_percent);
  console.log("Protein %:", cereal.protein_dv_percent);
  console.log("Potassium %:", cereal.potassium_dv_percent);
  d3.select("#cerealTitle").text(cereal.name);
  d3.select("#caloriesAmount").text(Math.round(cereal.calories_per_cup));
  d3.select("#fatAmount").text(`${cereal.fat_per_cup}g`);
  d3.select("#fatPercentage").text(`${cereal.fat_dv_percent}%`);
  d3.select("#sodiumAmount").text(`${cereal.sodium_mg_per_cup}mg`);
  d3.select("#sodiumPercentage").text(`${cereal.sodium_dv_percent}%`);
  d3.select("#carbAmount").text(`${cereal.carbo_per_cup}g`);
  d3.select("#carbPercentage").text(`${cereal.carbo_dv_percent}%`);
  d3.select("#fiberAmount").text(`${cereal.fiber_per_cup}g`);
  d3.select("#fiberPercentage").text(`${cereal.fiber_dv_percent}%`);
  d3.select("#sugarAmount").text(`${cereal.sugar_per_cup}g`);
  d3.select("#sugarPercentage").text(`${cereal.sugar_dv_percent}%`);
  d3.select("#proteinAmount").text(`${cereal.protein_per_cup}g`);
  d3.select("#proteinPercentage").text(`${cereal.protein_dv_percent}%`);
  d3.select("#potassiumAmount").text(`${cereal.potassium_mg_per_cup}mg`);
  d3.select("#potassiumPercentage").text(`${cereal.potassium_dv_percent}%`);

}

// Attach click listener to SVG button
d3.select("#getMyCerealButton").on("click", () => {
  if (cerealData.length === 0) {
    console.error("Cereal data not yet loaded!");
    return;
  }

  const prefs = getUserPreferences();
  const best = findBestMatch(cerealData, prefs);
  populateSVG(best);
});

