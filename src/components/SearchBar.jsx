import React, { useState } from "react";

/*
function SearchBar({ onSearch }) {
  const [inputCity, setInputCity] = useState("");

  function onHandleSubmit() {
    if (inputCity.trim() !== "") {
      onSearch(inputCity);
      setInputCity("");
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter your city"
        value={inputCity}
        onChange={(e) => setInputCity(e.target.value)}
        className="p-2 border rounded text-black"
      />
      <button
        onClick={onHandleSubmit}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;

*/

function SearchBar({ onSearch }) {
  const [inputCity, setInputCity] = useState("");
  function onHandleSubmit() {
    if (inputCity.trim() !== "") {
      onSearch(inputCity);
      setInputCity("");
    }
  }
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter your city"
        value={inputCity}
        onChange={(e) => setInputCity(e.target.value)}
        className="p-2 border rounded text-black"
      />
      <button
        onClick={onHandleSubmit}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
