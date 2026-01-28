function bbaTestApp() {

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    const total = rows.length;

    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  function getCellValue(row, index) {
    const cell = row.children[index];
    const input = cell.querySelector("input, select");
    return input ? input.value : cell.innerText.trim();
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

  /* ================= LOAD DATA ================= */

  function loadData() {
    $.ajax({
      url: "/get_bba_test_data",
      type: "GET",
      success: function (res) {
        if (!res.success) return;

        const tbody = document.querySelector("#bbaTable tbody");
        tbody.innerHTML = "";

        res.data.forEach(item => {
          const tpl = cloneTemplate("bbaAddRowTemplate");
          const row = tpl.querySelector("tr");

          row.dataset.id = item.n_sr_no;

          row.children[0].innerText = item.n_sr_no;
          row.children[1].innerText = item.s_location_code;
          row.children[2].querySelector("input").value = item.d_test_date;
          row.children[3].querySelector("input").value = item.t_test_time;
          row.children[4].innerText = item.s_test_record_no;
          row.children[5].innerText = item.s_individual_name;
          row.children[6].querySelector("select").value = item.s_person_type;
          row.children[7].querySelector("select").value = item.s_test_result;
          row.children[8].innerText = item.n_bac_count;
          row.children[10].innerText = item.s_security_personnel_name;
          row.children[11].innerText = item.s_remarks;

          tbody.appendChild(row);
        });

        updateSerialNumbers();
      }
    });
  }

  /* ================= SAVE ================= */

  function saveTable() {
  const rows = document.querySelectorAll("#bbaTable tbody tr");

  // 🔒 FIX 1: If no rows, do nothing
  if (rows.length === 0) {
    alert("No records to save.");
    return;
  }

  let hasValidRow = false;

  rows.forEach(row => {

    // Check if row has ANY user input
    const hasData =
      row.children[1].innerText.trim() !== "" ||   // Location
      row.children[4].innerText.trim() !== "" ||   // Test record no
      row.children[5].innerText.trim() !== "";     // Individual name

    if (!hasData) {
      // ❌ Skip completely empty rows
      return;
    }

    hasValidRow = true;

    const data = {
      n_sr_no: row.dataset.id || null,
      s_location_code: getCellValue(row, 1),
      d_test_date: getCellValue(row, 2),
      t_test_time: getCellValue(row, 3),
      s_test_record_no: getCellValue(row, 4),
      s_individual_name: getCellValue(row, 5),
      s_person_type: getCellValue(row, 6),
      s_test_result: getCellValue(row, 7),
      n_bac_count: getCellValue(row, 8),
      s_security_personnel_name: getCellValue(row, 10),
      s_remarks: getCellValue(row, 11)
    };

    const url = row.dataset.new
      ? "/save_bba_test_data"
      : "/update_bba_test_data";

    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (res) {
        if (res.success) {
          row.dataset.new = "";
          if (res.n_sr_no) {
            row.dataset.id = res.n_sr_no;
          }
        }
      }
    });
  });

  if (!hasValidRow) {
    alert("Please enter data before saving.");
    return;
  }

  alert("Data saved successfully");
}


  /* ================= DELETE ================= */

  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (!confirm("Are you sure you want to delete this record?")) return;

    const id = row.dataset.id;

    if (!id) {
      row.remove();
      updateSerialNumbers();
      return;
    }

    $.ajax({
      url: "/delete_bba_test_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: id }),
      success: function (res) {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
        }
      }
    });
  }

  /* ================= EDIT ================= */

  function editRow(btn) {
    const row = btn.closest("tr");
    row.querySelectorAll("[contenteditable]").forEach(td => td.focus());
  }

  /* ================= INIT ================= */

  function init() {
    loadData();
  }

  /* ================= EXPOSE ================= */

  window.addRow = addRow;
  window.saveTable = saveTable;
  window.deleteRow = deleteRow;
  window.editRow = editRow;

  document.addEventListener("DOMContentLoaded", init);
}

/* ================= START APP ================= */
bbaTestApp();
