import React from 'react';

function FiltersBar({ filters, handleFilterChange }) {
  return (
    <div className="filters-bar">
      <select name="month" className="select-input" value={filters.month} onChange={handleFilterChange}>
        <option value="">All Months</option>
        <option value="2025-07">July 2025</option>
        <option value="2025-08">August 2025</option>
        <option value="2025-09">September 2025</option>
      </select>
      <select name="district" className="select-input" value={filters.district} onChange={handleFilterChange}>
        <option value="">All Districts</option>
        <option value="District A">District A</option>
        <option value="District B">District B</option>
      </select>
      <select name="block" className="select-input" value={filters.block} onChange={handleFilterChange}>
        <option value="">All Blocks</option>
        <option value="District A - Block 001">District A - Block 001</option>
        <option value="District A - Block 002">District A - Block 002</option>
      </select>
      <select name="grade" className="select-input" value={filters.grade} onChange={handleFilterChange}>
        <option value="">All Grades</option>
        <option value="Class 6">Class 6</option>
        <option value="Class 7">Class 7</option>
        <option value="Class 8">Class 8</option>
      </select>
      <select name="subject" className="select-input" value={filters.subject} onChange={handleFilterChange}>
        <option value="">All Subjects</option>
        <option value="Math">Math</option>
        <option value="Science">Science</option>
      </select>
    </div>
  );
}

export default FiltersBar;
