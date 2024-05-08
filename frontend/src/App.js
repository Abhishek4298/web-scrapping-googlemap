import React, { useState } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import XLSX from "xlsx-js-style";
import FileSaver from "file-saver";

function App() {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:4000/search?searchFilter=${searchFilter}`
      );

      const data = response.data;
      console.log("RESULT GOT");
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(searchResults);

    // Set cell styles
    const cellStyle = {
      font: { size: 12, bold: false },
      alignment: { wrapText: true, vertical: "top" },
      border: {
        top: { style: "thin", color: { rgb: "D3D3D3" } },
        bottom: { style: "thin", color: { rgb: "D3D3D3" } },
        left: { style: "thin", color: { rgb: "D3D3D3" } },
        right: { style: "thin", color: { rgb: "D3D3D3" } },
      },
      fill: { fgColor: { rgb: "F7F7F7" } },
      width: 20, // Specify the width value here (in characters)
    };

    Object.keys(worksheet).forEach((cell) => {
      if (cell !== "!ref") {
        worksheet[cell].s = cellStyle;
      }
    });
    const currentTime = new Date();
    // make a unique file name from the current time
    const fileName = currentTime
      .toISOString()
      .replace(/:/g, "")
      .replaceAll(".", "")
      .replaceAll("-", "");
    let unique_name = `${searchFilter.slice(0, 5)}_${fileName}`;
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, unique_name);

    // Generate Excel file
    const excelData = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Convert data to Blob
    const buffer = new ArrayBuffer(excelData.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < excelData.length; i++) {
      view[i] = excelData.charCodeAt(i) & 0xff;
    }

    // Save the file
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, `${unique_name}.xlsx`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Vincer Impex - Ravi</h1>
      <div className="flex flex-wrap mb-4">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="p-4 border border-gray-400 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto mb-2 sm:mb-0"
          placeholder="Enter a search term..."
        />
        <button
          onClick={handleSearch}
          className="px-6 py-4 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Search
        </button>
        {!!searchResults.length && (
          <button
            onClick={handleDownload}
            className="px-6 py-4 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none focus:bg-green-600 ml-0 sm:ml-2"
          >
            Excel Download
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center mt-8">
          <div className="loader">
            <h2 className="text-xl font-bold">Loading...</h2>
          </div>
        </div>
      ) : (
        <div>
          {searchResults.length === 0 ? (
            <p className="text-xl font-semibold">No results found.</p>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mt-8 mb-4">Here are the search results</h2>
              <hr className="my-4 border-gray-300" />
              {searchResults.map((result, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-gray-800">Name: {result.title}</h2>
                  <p className="text-gray-600">Rating: {result.rating}</p>
                  <p className="text-gray-600">Reviews: {result.reviews}</p>
                  <p className="text-gray-600">Type: {result.type}</p>
                  <p className="text-gray-600">Address: {result.address}</p>
                  <p className="text-gray-600">
                    Open State: {result.openState}
                  </p>
                  <p className="text-gray-600">Phone: {result.phone}</p>
                  <p className="text-gray-600">
                    Website: <a href={result.website}>{result.website}</a>
                  </p>
                  <p className="text-gray-600">
                    Description: {result.description}
                  </p>
                  <p className="text-gray-600">
                    Service Options: {result.serviceOptions}
                  </p>
                  <p className="text-gray-600">
                    GPS Coordinates: {result.gpsCoordinates.latitude},{" "}
                    {result.gpsCoordinates.longitude}
                  </p>
                  <p className="text-gray-600">
                    Place URL: <a href={result.placeUrl}>{result.placeUrl}</a>
                  </p>
                  {/* <p className="text-gray-600">Data ID: {result.dataId}</p> */}
                  <hr className=" -4 border-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default App;
