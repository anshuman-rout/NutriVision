function Result({ data }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Analysis Result</h2>

      <h3>Foods Detected:</h3>
      <ul>
        {data.foods.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h3>Nutrition:</h3>
      <p>Calories: {data.nutrition.calories}</p>
      <p>Protein: {data.nutrition.protein}g</p>
      <p>Carbs: {data.nutrition.carbs}g</p>
      <p>Fat: {data.nutrition.fat}g</p>

      <h3>Status:</h3>
      <p>{data.analysis.status}</p>
      <p>{data.analysis.notes}</p>

      <h3>Suggestions:</h3>
      <ul>
        {data.suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export default Result;