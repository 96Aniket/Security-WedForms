function pipelineMitraApp() {

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#mitraTable tbody tr");
    const total = rows.length;

    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  function getCellValue(row, index) {
    const cell = row.children[index];
    const input = cell.querySelector("input");
    return input ? input.value : cell.innerText.trim();
  }

  /* ================= ADD ROW ================= */

  function addRow() {
    const tbody = document.querySelector("#mitraTable tbody");
    const tpl = cloneTemplate("mitraAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= LOAD DATA ================= */

  function loadData() {
    $.ajax({
      url: "/get_pipeline_mitra_data",
      type: "GET",
      success: function (res) {
        if (!res.success) return;

        const tbody = document.querySelector("#mitraTable tbody");
        tbody.innerHTML = "";

        res.data.forEach(item => {
          const tpl = cloneTemplate("mitraAddRowTemplate");
          const row = tpl.querySelector("tr");

          row.dataset.id = item.n_sr_no;

          row.children[0].innerText = item.n_sr_no;
          row.children[1].innerText = item.s_location_code;
          row.children[2].querySelector("input").value = item.d_entry_date;
          row.children[3].innerText = item.s_chainage_no;
          row.children[4].innerText = item.s_pm_name;
          row.children[5].innerText = item.s_pm_village_name;
          row.children[6].innerText = item.s_pm_mobile_no;
          row.children[7].innerText = item.s_remarks;

          tbody.appendChild(row);
        });

        updateSerialNumbers();
      }
    });
  }

  /* ================= SAVE ================= */

  function saveTable() {
    const rows = document.querySelectorAll("#mitraTable tbody tr");

    rows.forEach(row => {
      const data = {
        n_sr_no: row.dataset.id,
        s_location_code: getCellValue(row, 1),
        d_entry_date: getCellValue(row, 2),
        s_chainage_no: getCellValue(row, 3),
        s_pm_name: getCellValue(row, 4),
        s_pm_village_name: getCellValue(row, 5),
        s_pm_mobile_no: getCellValue(row, 6),
        s_remarks: getCellValue(row, 7)
      };

      const url = row.dataset.new
        ? "/save_pipeline_mitra_data"
        : "/update_pipeline_mitra_data";

      $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (res) {
          if (res.success) {
            row.dataset.new = "";
          }
        }
      });
    });

    alert("Pipeline Mitra data saved successfully");
    loadData();
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
      url: "/delete_pipeline_mitra_data",
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
pipelineMitraApp();
