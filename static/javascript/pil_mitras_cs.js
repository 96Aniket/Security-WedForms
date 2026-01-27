document.addEventListener("DOMContentLoaded", function () {
  const addRowButton = document.getElementById("addRowButton");
  const tableBody = document.querySelector("#mitraTable tbody");

  addRowButton.addEventListener("click", addRowAtTop);

  function addRowAtTop() {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td></td>
      <td contenteditable="true"></td>
      <td><input type="date"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td>
        <button class="btn-edit" onclick="editRow(this)">Edit</button>
        <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
      </td>
    `;

    // Insert at top
    tableBody.insertBefore(newRow, tableBody.firstChild);
    updateSerialNumbers();
  }

  function updateSerialNumbers() {
    const rows = Array.from(tableBody.rows);
    const total = rows.length;

    rows.forEach((row, index) => {
      // Highest Sr No at top, 1 at bottom
      row.cells[0].textContent = total - index;
    });
  }

  // Delete row
  window.deleteRow = function (btn) {
    if (confirm("Are you sure you want to delete this record?")) {
      btn.closest("tr").remove();
      updateSerialNumbers();
    }
  };

  // Edit row (focus editable cells)
  window.editRow = function (btn) {
    const row = btn.closest("tr");
    row.querySelectorAll("[contenteditable]").forEach(cell => {
      cell.focus();
    });
  };
});
