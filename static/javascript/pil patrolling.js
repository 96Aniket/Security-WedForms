function patrollingApp() {

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
    const rows = document.querySelectorAll("#patrolTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      const cell = row.querySelector(".sr-no");
      if (cell) cell.innerText = total - i;
    });
  }

  /* ================= LOAD ================= */

  function loadPatrollingData() {
    $.get("/get_patrolling_data", res => {
      console.log("PATROLLING API:", res);

      if (!res.success || !Array.isArray(res.data)) return;

      
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */

  function renderPage() {
    const tbody = document.querySelector("#patrolTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageData = allData.slice(start, end);

    pageData.forEach(r => {
      const fragment = cloneTemplate("viewRowTemplate");
      if (!fragment) return;

      const row = fragment.querySelector("tr");
      if (!row) return;

      row.dataset.id = r.n_sr_no;

      row.querySelector(".sr-no").innerText = r.n_sr_no;
      row.querySelector(".loc").innerText = r.s_location_code || "";
      row.querySelector(".date").innerText = r.d_patrol_date || "";
      row.querySelector(".from").innerText = r.t_from_time || "";
      row.querySelector(".to").innerText = r.t_to_time || "";

      [
        r.s_boundary_wall_condition,
        r.s_patrolling_pathway_condition,
        r.s_suspicious_movement,
        r.s_wild_vegetation,
        r.s_illumination_status,
        r.s_workers_without_valid_permit,
        r.s_unknown_person_without_authorization,
        r.s_unattended_office_unlocked,
        r.s_other_observations_status
      ].forEach((v, idx) => {
        row.children[5 + idx].innerText = v || "";
      });

      row.querySelector(".remarks").innerText = r.s_remarks || "";
      row.querySelector(".guard").innerText = r.s_patrolling_guard_name || "";

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
    const tbody = document.querySelector("#patrolTable tbody");
    const fragment = cloneTemplate("addRowTemplate");
    const row = fragment.querySelector("tr");

    row.dataset.new = "true";
    row.dataset.edited = "true";
    row.querySelector(".location").innerText = USER_LOCATION;

    row.querySelectorAll(".ok").forEach(td => {
      td.appendChild(cloneTemplate("okNotOkTemplate"));
    });

    tbody.prepend(row);
    updateSerialNumbers();

    document.getElementById("saveBtn").style.display = "inline-block";
  }

  /* ================= EDIT ================= */

  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    row.querySelector(".loc").innerText = USER_LOCATION;

    ["date", "from", "to"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = `<input type="${cls === "date" ? "date" : "time"}" value="${val}">`;
    });

    for (let i = 5; i <= 13; i++) {
      const val = row.children[i].innerText;
      row.children[i].innerHTML = "";
      const sel = cloneTemplate("okNotOkTemplate");
      sel.querySelector("select").value = val;
      row.children[i].appendChild(sel);
    }

    row.children[14].innerHTML = `<textarea>${row.querySelector(".remarks").innerText}</textarea>`;
    row.children[15].innerHTML = `<input value="${row.querySelector(".guard").innerText}">`;
    
    btn.disabled = true;

    document.getElementById("saveBtn").style.display = "inline-block";
  }

  /* ================= Mandatory fields ================= */
  function validateMandatoryFields() {
  let isValid = true;

  // remove old errors
  document.querySelectorAll(".mandatory-error").forEach(el => {
    el.classList.remove("mandatory-error");
  });

  document.querySelectorAll(".mandatory-star").forEach(el => el.remove());

  const rows = document.querySelectorAll("#patrolTable tbody tr");

  rows.forEach(row => {
    const dateInput  = row.children[2]?.querySelector("input");
    const fromInput  = row.children[3]?.querySelector("input");
    const toInput    = row.children[4]?.querySelector("input");
    const guardInput = row.children[15]?.querySelector("input");

    [
      dateInput,
      fromInput,
      toInput,
      guardInput
    ].forEach(input => {
      if (input && !input.value) {
        isValid = false;
        input.classList.add("mandatory-error");

        // add red star
        const cell = input.closest("td");
cell.classList.add("mandatory-cell");

if (!cell.querySelector(".mandatory-star")) {
  const star = document.createElement("span");
  star.innerText = "*";
  star.className = "mandatory-star";
  cell.appendChild(star);
}

      }
    });
  });

  if (!isValid) {
    alert("Please fill mandatory fields");
  }

  return isValid;
}

  /* ================= SAVE ================= */

  function saveTable() {
     if (!validateMandatoryFields()) {
    return; 
  }
  const rows = document.querySelectorAll("#patrolTable tbody tr");

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

  // SAME confirm logic as pipeline mitra
  let confirmMsg = "Do you want to save changes?";
  if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
  if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
  if (hasNew && hasEdit) confirmMsg = "Do you want to add and update records?";

  if (!confirm(confirmMsg)) return;

  let requests = [];

  rows.forEach(row => {
    const td = row.children;

    const payload = {
      s_location_code: USER_LOCATION,
      d_patrol_date: td[2].querySelector("input")?.value,
      t_from_time: td[3].querySelector("input")?.value,
      t_to_time: td[4].querySelector("input")?.value,
      s_boundary_wall_condition: td[5].querySelector("select")?.value,
      s_patrolling_pathway_condition: td[6].querySelector("select")?.value,
      s_suspicious_movement: td[7].querySelector("select")?.value,
      s_wild_vegetation: td[8].querySelector("select")?.value,
      s_illumination_status: td[9].querySelector("select")?.value,
      s_workers_without_valid_permit: td[10].querySelector("select")?.value,
      s_unknown_person_without_authorization: td[11].querySelector("select")?.value,
      s_unattended_office_unlocked: td[12].querySelector("select")?.value,
      s_other_observations_status: td[13].querySelector("select")?.value,
      s_remarks: td[14].querySelector("textarea")?.value,
      s_patrolling_guard_name: td[15].querySelector("input")?.value
    };

    // INSERT
    if (row.dataset.new) {
      requests.push($.ajax({
        url: "/save_patrolling_data",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload)
      }));
    }

    // UPDATE
    if (row.dataset.edited && !row.dataset.new) {
      payload.n_sr_no = row.dataset.id;
      requests.push($.ajax({
        url: "/update_patrolling_data",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload)
      }));
    }
  });

  Promise.all(requests).then(() => {
    if (hasNew && hasEdit) {
      alert("Records added and updated successfully");
    } else if (hasNew) {
      alert("Record added successfully");
    } else {
      alert("Record updated successfully");
    }

    loadPatrollingData();
    document.getElementById("saveBtn").style.display = "none";
  });
}


  /* ================= DELETE ================= */

 function deleteRow(btn) {
  const row = btn.closest("tr");

  if (row.dataset.new) {
    if (!confirm("Are you sure you want to delete this row?")) return;
    row.remove();
    updateSerialNumbers();
    return;
  }

  if (!confirm("Are you sure you want to delete this record?")) return;

  $.ajax({
    url: "/delete_patrolling_data",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      n_sr_no: row.dataset.id
    }),
    success: res => {
      if (res.success) {
        row.remove();
        updateSerialNumbers();
        alert("Deleted successfully");
      } else {
        alert(res.message || "Delete failed");
      }
    },
    error: err => {
      console.error("Delete error:", err);
      alert("Delete failed at server");
    }
  });
}


/* ================= DOWNLOAD ================= */
async function downloadTable() {
  
  if (!allData.length) {
    alert("No data available to download");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Patrolling Observation");
  // ===== TITLE AT TOP =====
worksheet.mergeCells(1, 1, 1, 16); // 16 columns
worksheet.getCell("A1").value = "Patrolling Observation Register";
worksheet.getCell("A1").font = { bold: true, size: 16 };
worksheet.getCell("A1").alignment = {
  horizontal: "center",
  vertical: "middle"
};
worksheet.getRow(1).height = 30;

// =====  BLANK ROWS =====
worksheet.addRow([]);



  // ===== HEADERS =====
  const headers = [
    "Sr No",
    "Location",
    "Date",
    "From Time",
    "To Time",
    "Condition of boundary wall / fencing / gates / infrastructure",
    "Condition of patrolling pathway",
    "Any Suspicious Movement",
    "Wild Vegetation",
    "Illumination Status",
    "Workers working without valid work permit",
    "Any unknown person without authorized entry permits",
    "Any unattended office in unlocked condition (Silent Hours)",
    "Any other observations",
    "Remarks",
    "Name of patrolling guard	"
  ];

  const headerRowIndex = worksheet.lastRow.number + 1;
worksheet.addRow(headers);


  // ===== DATA =====
  let srNo = 1;
  allData.forEach(r => {
    worksheet.addRow([
      srNo++,   
      r.s_location_code ?? "",
      r.d_patrol_date ?? "",
      r.t_from_time ?? "",
      r.t_to_time ?? "",
      r.s_boundary_wall_condition ?? "",
      r.s_patrolling_pathway_condition ?? "",
      r.s_suspicious_movement ?? "",
      r.s_wild_vegetation ?? "",
      r.s_illumination_status ?? "",
      r.s_workers_without_valid_permit ?? "",
      r.s_unknown_person_without_authorization ?? "",
      r.s_unattended_office_unlocked ?? "",
      r.s_other_observations_status ?? "",
      r.s_remarks ?? "",
      r.s_patrolling_guard_name ?? ""
    ]);
  });

  // ===== STYLE HEADER ROW =====
 worksheet.getRow(headerRowIndex).eachCell(cell => {
  cell.font = { bold: true };
  cell.alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center"
  };
});
worksheet.getRow(headerRowIndex).height = 40;


// Optional: better header height
worksheet.getRow(1).height = 40;


  // ===== STYLE SR NO COLUMN =====
  worksheet.getColumn(1).eachCell((cell, rowNumber) => {
    if (rowNumber !== 1) {
      cell.font = { bold: true };
    }
  });

  // ===== AUTO COLUMN WIDTH =====
  worksheet.columns.forEach(column => {
  let maxLength = 12; // minimum readable width

  column.eachCell({ includeEmpty: true }, cell => {
    const len = cell.value ? cell.value.toString().length : 0;
    if (len > maxLength) maxLength = len;
  });

  column.width = Math.min(maxLength + 2, 27.5); 
});


  // ===== DOWNLOAD =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Patrolling_Observation_Register.xlsx";
  link.click();
}



  /* ================= EXPOSE ================= */

  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadTable = downloadTable;

   document.addEventListener("input", e => {
    const input = e.target;

    if (input.classList.contains("mandatory-error")) {
      input.classList.remove("mandatory-error");

      const cell = input.closest("td");
      const star = cell?.querySelector(".mandatory-star");
      if (star) star.remove();

      cell?.classList.remove("mandatory-cell");
    }
  });

  loadPatrollingData();
}

patrollingApp();
