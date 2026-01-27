function bbaTestApp() {

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    const total = rows.length;

    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i; // descending
    });
  }

  /* ================= ADD ROW ================= */

  function addRow() {
    const tbody = document.querySelector("#bbaTable tbody");
    const tpl = cloneTemplate("bbaAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= DELETE ================= */

  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (!confirm("Are you sure you want to delete this record?")) return;

    row.remove();
    updateSerialNumbers();
  }

  /* ================= EDIT ================= */

  function editRow(btn) {
    const row = btn.closest("tr");

    row.querySelectorAll("[contenteditable]").forEach(cell => {
      cell.focus();
    });
  }

  /* ================= SAVE (placeholder) ================= */

  function saveTable() {
    alert("Save logic can be added here");
  }

  /* ================= INIT ================= */

  function init() {
    updateSerialNumbers();
  }

  /* ================= EXPOSE TO HTML ================= */

  window.addRow = addRow;
  window.deleteRow = deleteRow;
  window.editRow = editRow;
  window.saveTable = saveTable;

  document.addEventListener("DOMContentLoaded", init);
}

/* ================= START APP ================= */
bbaTestApp();
