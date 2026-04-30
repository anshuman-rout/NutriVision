function Upload({ onUpload, preview }) {
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e.target.files[0])}
      />

      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={preview}
            alt="preview"
            width="200"
            style={{ borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
}

export default Upload;