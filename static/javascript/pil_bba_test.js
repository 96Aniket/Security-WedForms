function bbaTestApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

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

    // ✅ Auto location (same as patrolling)
    row.children[1].innerText = USER_LOCATION;

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= EDIT ================= */
  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    row.querySelectorAll("[contenteditable]").forEach(td => td.focus());
  }

  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {
      if (!row.dataset.new && !row.dataset.edited) return;

      const data = {
        s_location_code: USER_LOCATION,
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

      // INSERT
      if (row.dataset.new === "true") {
        hasAction = true;
        $.post({
          url: "/save_bba_test_data",
          contentType: "application/json",
          data: JSON.stringify(data)
        });
      }

      // UPDATE
      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        data.n_sr_no = row.dataset.id;
        $.post({
          url: "/update_bba_test_data",
          contentType: "application/json",
          data: JSON.stringify(data)
        });
      }
    });

    if (!hasAction) {
      alert("Nothing to save");
      return;
    }

    alert("BBA Test data saved successfully");
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
      url: "/delete_bba_test_data",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: res => {
        if (res.success) loadData();
      }
    });
  }

  /* ================= LOAD + PAGINATION ================= */
  function loadData() {
    $.get("/get_bba_test_data", res => {
      if (!res.success) return;

      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  function renderPage() {
    const tbody = document.querySelector("#bbaTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach(item => {
      const tpl = cloneTemplate("bbaAddRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = item.n_sr_no;
      delete row.dataset.new;

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
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;
    document.getElementById("pageInfo").innerText =
      `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages;
  }

  function nextPage() {
    if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
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

  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  document.addEventListener("DOMContentLoaded", loadData);
}

bbaTestApp();
