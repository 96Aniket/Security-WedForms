function pipelineMitraApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

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
    row.dataset.edited = "true";

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_pipeline_mitra_data", res => {
      if (!res.success) return;

      // latest first
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  function renderPage() {
    const tbody = document.querySelector("#mitraTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    pageData.forEach(item => {
      const tpl = cloneTemplate("mitraAddRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = item.n_sr_no;
      delete row.dataset.new;
      delete row.dataset.edited;

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
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage);

    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) {
      pageInfo.innerText = `Page ${currentPage} of ${totalPages || 1}`;
    }

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  function nextPage() {
    const totalPages = Math.ceil(allData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  }

  /* ================= EDIT ================= */

  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";
    row.querySelectorAll("[contenteditable]").forEach(td => td.focus());
  }

  /* ================= SAVE ================= */

  function saveTable() {
    const rows = document.querySelectorAll("#mitraTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {

      if (!row.dataset.new && !row.dataset.edited) return;

      const payload = {
        s_location_code: getCellValue(row, 1),
        d_entry_date: getCellValue(row, 2),
        s_chainage_no: getCellValue(row, 3),
        s_pm_name: getCellValue(row, 4),
        s_pm_village_name: getCellValue(row, 5),
        s_pm_mobile_no: getCellValue(row, 6),
        s_remarks: getCellValue(row, 7)
      };

      // INSERT
      if (row.dataset.new === "true") {
        hasAction = true;
        $.post({
          url: "/save_pipeline_mitra_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }

      // UPDATE
      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        payload.n_sr_no = row.dataset.id;
        $.post({
          url: "/update_pipeline_mitra_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }
    });

    if (!hasAction) {
      alert("Nothing to save");
      return;
    }

    alert("Pipeline Mitra data saved successfully");
    loadData();
  }

  /* ================= DELETE ================= */

  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new === "true") {
      row.remove();
      updateSerialNumbers();
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    $.post({
      url: "/delete_pipeline_mitra_data",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: res => {
        if (res.success) {
          loadData();
        }
      }
    });
  }

  /* ================= EXPOSE ================= */

  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  document.addEventListener("DOMContentLoaded", loadData);
}

/* ================= START APP ================= */
pipelineMitraApp();
