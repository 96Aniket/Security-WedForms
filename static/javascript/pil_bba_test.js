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

  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#bbaTable tbody");
    const tpl = cloneTemplate("bbaAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

    tbody.prepend(row);
    updateSerialNumbers();
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

    $.ajax({
      url: "/delete_bba_test_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: res => {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
        } else {
          alert(res.message || "Delete failed");
        }
      },
      error: () => alert("Delete failed")
    });
  }

  /* ================= EDIT ================= */
  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    row.querySelector(".loc").innerText = USER_LOCATION;

    // Date & Time
    ["date", "time"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = cls === "date" ? "date" : "time";
      input.value = val;
      td.appendChild(input);
    });

    // Text fields
    [4, 5, 8, 10, 11].forEach(idx => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";
      const input = document.createElement("input");
      input.value = val;
      row.children[idx].appendChild(input);
    });

    // Select fields (Type, Result)
[6, 7].forEach(idx => {
  const val = row.children[idx].innerText;
  row.children[idx].innerHTML = "";

  const select = document.createElement("select");

  if (idx === 6) {
    ["Employee", "Contractor", "Others"].forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      o.text = v;
      if (v === val) o.selected = true;
      select.appendChild(o);
    });
  }

  if (idx === 7) {
    ["Negative", "Positive"].forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      o.text = v;
      if (v === val) o.selected = true;
      select.appendChild(o);
    });
  }

  row.children[idx].appendChild(select);
});


    btn.disabled = true;
    btn.innerText = "Editing";
  }

  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {
      const td = row.children;

      const payload = {
        s_location_code: USER_LOCATION,
        d_test_date: td[2].querySelector("input")?.value,
        t_test_time: td[3].querySelector("input")?.value,
        s_test_record_no: td[4].querySelector("input")?.value,
        s_individual_name: td[5].querySelector("input")?.value,
        s_person_type: td[6].querySelector("select")?.value,
        s_test_result: td[7].querySelector("select")?.value,
        n_bac_count: td[8].querySelector("input")?.value,
        s_security_personnel_name: td[10].querySelector("input")?.value,
        s_remarks: td[11].querySelector("input")?.value
      };

      // INSERT
      if (row.dataset.new === "true") {
        hasAction = true;
        $.post({
          url: "/save_bba_test_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }

      // UPDATE
      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        payload.n_sr_no = row.dataset.id;
        $.post({
          url: "/update_bba_test_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }
    });

    if (!hasAction) {
      alert("Nothing to save");
      return;
    }

    alert("Saved successfully");
    loadBbaData();
  }

  /* ================= LOAD ================= */
  function loadBbaData() {
    $.get("/get_bba_test_data", res => {
      if (!res.success) return alert("Load failed");

      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER + PAGINATION ================= */
  function renderPage() {
    const tbody = document.querySelector("#bbaTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    pageData.forEach(r => {
      const tpl = cloneTemplate("bbaViewRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = r.n_sr_no;
      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".date").innerText = r.d_test_date;
      row.querySelector(".time").innerText = r.t_test_time;
      row.querySelector(".record").innerText = r.s_test_record_no;
      row.querySelector(".name").innerText = r.s_individual_name;
      row.querySelector(".type").innerText = r.s_person_type;
      row.querySelector(".result").innerText = r.s_test_result;
      row.querySelector(".bac").innerText = r.n_bac_count;
      row.querySelector(".security").innerText = r.s_security_personnel_name;
      row.querySelector(".remarks").innerText = r.s_remarks || "";

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

  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  document.addEventListener("DOMContentLoaded", loadBbaData);
}

/* ================= START APP ================= */
bbaTestApp();
