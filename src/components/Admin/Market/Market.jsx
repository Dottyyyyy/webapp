import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Market() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '' });
  const [fromDate, setFromDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase();

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/item/get-items`);
      setItems(response.data.items);
    } catch (error) {
      console.error("Error fetching items:", error.message);
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
      setNewItem({
        name: item.name,
        category: item.category,
        price: ''
      });
    } else {
      setEditItemId(null);
      setNewItem({ name: '', category: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewItem({ name: '', category: '', price: '' });
    setEditItemId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        await axios.put(`${import.meta.env.VITE_API}/item/item-update/${editItemId}`, newItem);
      } else {
        await axios.post(`${import.meta.env.VITE_API}/item/item-create`, {
          ...newItem,
          day: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          }
        });
      }
      fetchItems();
      handleModalClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const filterByDate = () => {
    if (!fromDate) return;
    setIsFiltering(true);

    const selectedDate = new Date(fromDate).toISOString().split('T')[0];

    const filtered = items.map(item => {
      const newDayData = {};
      let hasPriceForDate = false;

      for (const day of days) {
        const filteredEntries = item.day[day].filter(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === selectedDate;
        });

        if (filteredEntries.length > 0) {
          hasPriceForDate = true;
        }

        newDayData[day] = filteredEntries;
      }

      return hasPriceForDate ? { ...item, day: newDayData } : null;
    }).filter(Boolean);

    setFilteredItems(filtered);
  };


  const dataToRender = isFiltering ? filteredItems : items;

  const groupedItems = dataToRender.reduce((acc, item) => {
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const renderCategorySection = (categoryName, items) => (
    <>
      <tr className="bg-gray-100">
        <td className="py-2 px-4 font-bold" colSpan={days.length + 2}>{categoryName}</td>
      </tr>
      {items.map((item, index) => (
        <tr key={`${categoryName}-${index}`} className="border-t">
          <td className="py-2 px-4">{item.name}</td>
          {days.map((day) => {
            const latestPrice = item.day?.[day]?.[item.day[day].length - 1]?.price ?? '';
            const isToday = day === today && latestPrice !== '';
            return (
              <td
                key={day}
                className={`py-2 px-4 text-center ${isToday ? 'text-emerald-600 font-bold' : ''}`}
              >
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
    <div className="min-h-screen bg-green-900 flex flex-col items-center p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Market Price List For this Week</h1>

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
            onClick={() => filterByDate()}
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
        >Add</button>
      </div>

      <div className="bg-white text-black rounded-lg overflow-auto shadow-md w-full max-w-6xl border-4 border-green-500">
        <table className="w-full text-sm text-left table-auto">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="py-2 px-4">Item</th>
              {days.map((day) => (
                <th key={day} className="py-2 px-4 text-center">{day.charAt(0).toUpperCase() + day.slice(1)}</th>
              ))}
              <th className="py-2 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([category, items]) =>
              renderCategorySection(category, items)
            )}
            {isFiltering && filteredItems.length === 0 && (
              <p className="text-black mt-4" style={{ textAlign: 'center' }}>No price data found for the selected date.</p>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
          <form onSubmit={handleFormSubmit} className="bg-green-500 p-6 rounded-lg w-80 text-center text-black space-y-3">
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
              pattern="[0-9]*"
              placeholder={`Price for ${today.charAt(0).toUpperCase() + today.slice(1)}`}
              className="w-full p-2 rounded bg-gray-200 no-spinner"
              value={newItem.price}
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="bg-green-300 hover:bg-green-400 w-full py-2 rounded-full font-semibold">
              {editItemId ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={handleModalClose} className="text-white text-sm mt-2 underline">
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Market;