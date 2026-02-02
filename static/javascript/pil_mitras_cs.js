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

  /* ================= ADD ROW ================= */

function addRow() {
  const tbody = document.querySelector("#mitraTable tbody");
  const row = cloneTemplate("mitraAddRowTemplate").querySelector("tr");

  row.dataset.new = "true";
  row.dataset.edited = "true";

  row.querySelector(".loc").innerText = USER_LOCATION;

  tbody.prepend(row);
  updateSerialNumbers();
}




  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_pipeline_mitra_data", res => {
      if (!res.success) return;

      // Show latest records first
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER + PAGINATION ================= */

  function renderPage() {
    const tbody = document.querySelector("#mitraTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach(r => {
      const row = cloneTemplate("mitraViewRowTemplate").querySelector("tr");

      row.dataset.id = r.n_sr_no;
      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".date").innerText = r.d_entry_date;
      row.querySelector(".chainage").innerText = r.s_chainage_no;
      row.querySelector(".name").innerText = r.s_pm_name;
      row.querySelector(".village").innerText = r.s_pm_village_name;
      row.querySelector(".mobile").innerText = r.s_pm_mobile_no;
      row.querySelector(".remarks").innerText = r.s_remarks || "";

      tbody.appendChild(row);
    });

    updateSerialNumbers();
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;

    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
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

  /* ================= EDIT ================= */

function editRow(btn) {
  const row = btn.closest("tr");
  row.dataset.edited = "true";

  row.querySelector(".loc").innerText = USER_LOCATION;

  const d = row.children[2].innerText;
  row.children[2].innerHTML = `<input type="date" value="${d}">`;

  [3, 4, 5, 6, 7].forEach(i => {
    const val = row.children[i].innerText;
    row.children[i].innerHTML = `<input type="text" value="${val}">`;
  });

  btn.disabled = true;
  btn.innerText = "Editing";
}



  /* ================= SAVE ================= */

function saveTable() {
  const rows = document.querySelectorAll("#mitraTable tbody tr");

  let hasNew = false;
  let hasEdit = false;

  rows.forEach(row => {
    if (row.dataset.new) hasNew = true;
    if (row.dataset.edited && !row.dataset.new) hasEdit = true;
  });

  if (!hasNew && !hasEdit) {
    alert("Nothing to save");
    return;
  }

  // 🔔 Custom confirmation message
  let confirmMsg = "Do you want to save changes?";
  if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
  if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
  if (hasNew && hasEdit) confirmMsg = "Do you want to add and update records?";

  if (!confirm(confirmMsg)) return;

  let saved = false;
  let updated = false;

  rows.forEach(row => {
    const td = row.children;

    const payload = {
      s_location_code: USER_LOCATION,
      d_entry_date: td[2].querySelector("input")?.value,
      s_chainage_no: td[3].querySelector("input")?.value,
      s_pm_name: td[4].querySelector("input")?.value,
      s_pm_village_name: td[5].querySelector("input")?.value,
      s_pm_mobile_no: td[6].querySelector("input")?.value,
      s_remarks: td[7].querySelector("input")?.value
    };

    // INSERT
    if (row.dataset.new) {
      saved = true;
      $.post({
        url: "/save_pipeline_mitra_data",
        contentType: "application/json",
        data: JSON.stringify(payload)
      });
    }

    // UPDATE
    if (row.dataset.edited && !row.dataset.new) {
      updated = true;
      payload.n_sr_no = row.dataset.id;
      $.post({
        url: "/update_pipeline_mitra_data",
        contentType: "application/json",
        data: JSON.stringify(payload)
      });
    }
  });

  // ✅ Success popup
  if (saved && updated) {
    alert("Records added and updated successfully");
  } else if (saved) {
    alert("Record added successfully");
  } else if (updated) {
    alert("Record updated successfully");
  }

  loadData();
}



  /* ================= DELETE ================= */

function deleteRow(btn) {
  const row = btn.closest("tr");

  if (row.dataset.new) {
    if (!confirm("Are you sure you want to delete this row?")) return;

    row.remove();
    updateSerialNumbers();
    alert("Deleted successfully");
    return;
  }

  if (!confirm("Are you sure you want to delete this record?")) return;

  $.post({
    url: "/delete_pipeline_mitra_data",
    contentType: "application/json",
    data: JSON.stringify({ n_sr_no: row.dataset.id }),
    success: () => {
      alert("Deleted successfully");
      loadData();
    },
    error: () => alert("Delete failed")
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
