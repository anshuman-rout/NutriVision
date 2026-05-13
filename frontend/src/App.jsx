import { useState } from "react";
import axios from "axios";
import Upload from "./components/Upload";
import Result from "./components/Result";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ageGroup, setAgeGroup] = useState("11-14");
  const [lifestyle, setLifestyle] = useState("student");
  const [weightCategory, setWeightCategory] = useState("normal");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Upload an image first");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("ageGroup", ageGroup);
    formData.append("lifestyle", lifestyle);
    formData.append("weightCategory", weightCategory);

    try {
      setLoading(true);

      const res = await axios.post(
        "https://nutrivision-cjw0.onrender.com/analyze",
        formData
      );

      setResult(res.data.result);

    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>NutriVision AI</h1>

      <Upload onUpload={handleUpload} preview={preview} />

      <div style={{ marginTop: "20px" }}>
        <label>Age Group: </label>
        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
          <option>6-10</option>
          <option>11-14</option>
          <option>15-18</option>
          <option>adult</option>
        </select>

        <label style={{ marginLeft: "10px" }}>Lifestyle: </label>
        <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)}>
          <option>student</option>
          <option>athlete</option>
          <option>bodybuilder</option>
          <option>sedentary</option>
        </select>

        <label style={{ marginLeft: "10px" }}>Weight: </label>
        <select
          value={weightCategory}
          onChange={(e) => setWeightCategory(e.target.value)}
        >
          <option>underweight</option>
          <option>normal</option>
          <option>overweight</option>
          <option>obese</option>
        </select>
      </div>

      <button
        onClick={handleAnalyze}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        {loading ? "Analyzing..." : "Analyze Meal"}
      </button>

      {result && <Result data={result} />}
    </div>
  );
}

export default App;