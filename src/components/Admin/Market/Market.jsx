import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../../partials/Sidebar';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Market() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase();
  const pdfRef = useRef();

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const originalOverflow = element.style.overflow;
    const originalMaxWidth = element.style.maxWidth;

    element.style.overflow = 'visible';
    element.style.maxWidth = 'none';

    const style = document.createElement("style");
    style.innerHTML = `
      * {
        color: #000 !important;
        background-color: #fff !important;
      }
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      th, td {
        border: 1px solid #ccc !important;
        padding: 6px !important;
        text-align: center;
      }
      .text-emerald-600 {
        color: #059669 !important;
      }
      .font-bold {
        font-weight: bold !important;
      }
    `;
    element.appendChild(style);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: document.body.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`market-list-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      element.removeChild(style);
      element.style.overflow = originalOverflow;
      element.style.maxWidth = originalMaxWidth;
    }
  };

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '' });
  const [fromDate, setFromDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/item/get-items`);
      setItems(res.data.items);
    } catch (err) {
      console.error("Error fetching items:", err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalOpen = (item = null) => {
    if (item) {
      setEditItemId(item._id);
      setNewItem({ name: item.name, category: item.category, price: '' });
    } else {
      setEditItemId(null);
      setNewItem({ name: '', category: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditItemId(null);
    setNewItem({ name: '', category: '', price: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        await axios.put(`${import.meta.env.VITE_API}/item/item-update/${editItemId}`, newItem);
      } else {
        await axios.post(`${import.meta.env.VITE_API}/item/item-create`, {
          ...newItem,
          day: Object.fromEntries(days.map((d) => [d, []])),
        });
      }
      fetchItems();
      handleModalClose();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const filterByDate = () => {
    if (!fromDate) return;
    setIsFiltering(true);

    const selectedDate = new Date(fromDate).toISOString().split('T')[0];

    const filtered = items
      .map((item) => {
        const newDayData = {};
        let hasPrice = false;

        for (const day of days) {
          const filteredEntries = item.day[day].filter((entry) =>
            new Date(entry.date).toISOString().split('T')[0] === selectedDate
          );
          if (filteredEntries.length > 0) hasPrice = true;
          newDayData[day] = filteredEntries;
        }

        return hasPrice ? { ...item, day: newDayData } : null;
      })
      .filter(Boolean);

    setFilteredItems(filtered);
  };

  const dataToRender = isFiltering ? filteredItems : items;

  const groupedItems = dataToRender.reduce((acc, item) => {
    const cat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const renderCategorySection = (categoryName, items) => (
    <>
      <tr className="bg-gray-100">
        <td className="py-2 px-4 font-bold" colSpan={days.length + 2}>{categoryName}</td>
      </tr>
      {items.map((item, idx) => (
        <tr key={`${categoryName}-${idx}`} className="border-t">
          <td className="py-2 px-4">{item.name}</td>
          {days.map((day) => {
            const latestPrice = item.day?.[day]?.[item.day[day].length - 1]?.price ?? '';
            const isToday = day === today && latestPrice;
            return (
              <td key={day} className={`py-2 px-4 text-center ${isToday ? 'text-emerald-600 font-bold' : ''}`}>
                {latestPrice}
              </td>
            );
          })}
          <td className="py-2 px-4 text-center">
            {item.isDeleted ? (
              <button
                onClick={async () => {
                  await axios.put(`${import.meta.env.VITE_API}/item/restore/${item._id}`);
                  fetchItems();
                }}
                className="text-green-600"
              >
                ♻️ Restore
              </button>
            ) : (
              <>
                <button onClick={() => handleModalOpen(item)}>✏️</button>
                <button
                  onClick={async () => {
                    await axios.delete(`${import.meta.env.VITE_API}/item/delete/${item._id}`);
                    fetchItems();
                  }}
                  className="text-red-600 ml-2"
                >
                  🗑️
                </button>
              </>
            )}
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-green-600">
      <Sidebar />
      <main className="flex-1 p-6 text-white" ref={pdfRef}>
        {/* Use a wrapper div for PDF capture */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Market Dashboard</h1>
            <button
              onClick={handleDownloadPDF}
              className="bg-white text-green-700 font-semibold px-4 py-2 rounded shadow hover:bg-green-100"
            >
              📄 Download PDF
            </button>
          </div>

          <div>
            {/* Filter + Add Controls */}
            <div className="flex justify-between items-center w-full max-w-6xl mb-4">
              <div className="flex gap-2 items-center text-black">
                <label className="text-white">View prices on:</label>
                <input
                  type="date"
                  className="px-2 py-1 rounded"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <button
                  onClick={filterByDate}
                  className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold px-3 py-1 rounded"
                >
                  Filter
                </button>
                <button
                  onClick={() => {
                    setFromDate('');
                    setFilteredItems([]);
                    setIsFiltering(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-3 py-1 rounded"
                >
                  Reset
                </button>
              </div>
              <button
                onClick={() => handleModalOpen()}
                className="bg-green-300 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full"
              >
                ➕ Add
              </button>
            </div>

            {/* Table */}
            <div className="bg-white text-black rounded-lg overflow-auto shadow-md w-full max-w-6xl border-4 border-green-500">
              <table className="w-full text-sm table-auto">
                <thead className="bg-gray-200 text-gray-800">
                  <tr>
                    <th className="py-2 px-4">Item</th>
                    {days.map((day) => (
                      <th key={day} className="py-2 px-4 text-center">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </th>
                    ))}
                    <th className="py-2 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedItems).map(([category, items]) =>
                    renderCategorySection(category, items)
                  )}
                  {isFiltering && filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={days.length + 2} className="text-center py-4 text-black">
                        No price data found for the selected date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {
          isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <form
                onSubmit={handleFormSubmit}
                className="bg-green-500 p-6 rounded-lg w-80 text-center text-black space-y-3"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Type Item Name"
                  className="w-full p-2 rounded bg-gray-200"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="category"
                  className="w-full p-2 rounded bg-gray-200"
                  value={newItem.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose Category</option>
                  <option value="vegetable">Vegetables</option>
                  <option value="fruit">Fruits</option>
                  <option value="rootcrop">Root crops</option>
                </select>
                <input
                  name="price"
                  type="number"
                  inputMode="numeric"
                  placeholder={`Price for ${today.charAt(0).toUpperCase() + today.slice(1)}`}
                  className="w-full p-2 rounded bg-gray-200"
                  value={newItem.price}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="submit"
                  className="bg-green-300 hover:bg-green-400 w-full py-2 rounded-full font-semibold"
                >
                  {editItemId ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={handleModalClose} className="text-white text-sm mt-2 underline">
                  Cancel
                </button>
              </form>
            </div>
          )
        }
      </main>
    </div>
  );

}

export default Market;