function pipelineMitraApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    const tpl = document.getElementById(id);
    if (!tpl) {
      console.error("Template not found:", id);
      return null;
    }
    return tpl.content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#mitraTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      const cell = row.querySelector(".sr-no");
      if (cell) cell.innerText = total - i;
    });
  }

  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_pipeline_mitra_data", res => {
      console.log("PIPELINE MITRA API:", res);

      if (!res.success || !Array.isArray(res.data)) return;

      // ❌ DO NOT FILTER delete_flag (not returned by API)
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);

      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */

  function renderPage() {
    const tbody = document.querySelector("#mitraTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageData = allData.slice(start, end);
    console.log("Rendering rows:", pageData);

    pageData.forEach(r => {
      const fragment = cloneTemplate("mitraViewRowTemplate");
      if (!fragment) return;

      const row = fragment.querySelector("tr");
      if (!row) return;

      row.dataset.id = r.n_sr_no;

      row.querySelector(".sr-no").innerText = r.n_sr_no;
      row.querySelector(".loc").innerText = r.s_location_code || "";
      row.querySelector(".date").innerText = r.d_entry_date || "";
      row.querySelector(".chainage").innerText = r.s_chainage_no || "";
      row.querySelector(".name").innerText = r.s_pm_name || "";
      row.querySelector(".village").innerText = r.s_pm_village_name || "";
      row.querySelector(".mobile").innerText = r.s_pm_mobile_no || "";
      row.querySelector(".remarks").innerText = r.s_remarks || "";

      tbody.appendChild(row);
    });

    updateSerialNumbers();
    updatePaginationButtons();
  }

  /* ================= PAGINATION ================= */

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

  /* ================= ADD ================= */

  function addRow() {
    const tbody = document.querySelector("#mitraTable tbody");
    const fragment = cloneTemplate("mitraAddRowTemplate");
    const row = fragment.querySelector("tr");

    row.dataset.new = "true";
    row.dataset.edited = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

    tbody.prepend(row);
    updateSerialNumbers();
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

  // 🚫 Nothing to save
  if (!hasNew && !hasEdit) {
    alert("Nothing to save");
    return;
  }

  // ✅ Dynamic confirmation message
  let confirmMsg = "Do you want to save changes?";
  if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
  if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
  if (hasNew && hasEdit) confirmMsg = "Do you want to add and update records?";

  // ❌ User cancelled
  if (!confirm(confirmMsg)) return;

  // ✅ Proceed with save
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

    // ➕ INSERT
    if (row.dataset.new) {
     $.ajax({
  url: "/api_url",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify(payload)
});


    }

    // ✏️ UPDATE
    if (row.dataset.edited && !row.dataset.new) {
      payload.n_sr_no = row.dataset.id;
     $.ajax({
  url: "/api_url",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify(payload)
});

    }
  });

  // ✅ Final success popup
  if (hasNew && hasEdit) {
    alert("Records added and updated successfully");
  } else if (hasNew) {
    alert("Record added successfully");
  } else {
    alert("Record updated successfully");
  }

  loadData();
}


  /* ================= DELETE ================= */

  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new) {
      row.remove();
      updateSerialNumbers();
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    row.remove();
    updateSerialNumbers();

    $.ajax({
  url: "/api_url",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify(payload)
});

  }

  /* ================= EXPOSE ================= */

  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  loadData();
}

pipelineMitraApp();
