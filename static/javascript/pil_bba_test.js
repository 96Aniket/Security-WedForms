document.addEventListener("DOMContentLoaded", function () {
  const addRowButton = document.getElementById("addRowButton");
  const tableBody = document.querySelector("#bbaTable tbody");

  addRowButton.addEventListener("click", addRowAtTop);

  function addRowAtTop() {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td></td>
      <td contenteditable="true"></td>
      <td><input type="date"></td>
      <td><input type="time"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>

      <td>
        <select>
          <option value="">Select</option>
          <option value="Employee">Employee</option>
          <option value="Contractor">Contractor</option>
          <option value="Others">Others</option>
        </select>
      </td>

      <td>
        <select>
          <option value="">Select</option>
          <option value="Negative">Negative</option>
          <option value="Positive">Positive</option>
        </select>
      </td>

      <td contenteditable="true"></td>
      <td><input type="file"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>

      <td>
        <button class="btn-edit" onclick="editRow(this)">Edit</button>
        <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
      </td>
    `;

    tableBody.insertBefore(newRow, tableBody.firstChild);
    updateSerialNumbers();
  }

  function updateSerialNumbers() {
    const rows = Array.from(tableBody.rows);
    const total = rows.length;

    rows.forEach((row, index) => {
      row.cells[0].textContent = total - index;
    });
  }

  window.deleteRow = function (btn) {
    if (confirm("Are you sure you want to delete this record?")) {
      btn.closest("tr").remove();
      updateSerialNumbers();
    }
  };

  window.editRow = function (btn) {
    const row = btn.closest("tr");
    row.querySelectorAll("[contenteditable]").forEach(cell => {
      cell.focus();
    });
  };
});
