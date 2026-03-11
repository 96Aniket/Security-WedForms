let currentPreviewFile = null;

function bbaTestApp() {
  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  /* ================= IMAGE PREVIEW ================= */
  function previewFile(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    input.dataset.base64 = e.target.result;
    input.dataset.type = file.type;
    input.dataset.name = file.name;

    const td = input.closest("td");

    let previewDiv = td.querySelector(".img-preview");
    if (!previewDiv) {
      previewDiv = document.createElement("div");
      previewDiv.className = "img-preview";
      td.appendChild(previewDiv);
    }

    previewDiv.innerHTML = "";

    const fileName = document.createElement("div");

    const shortName =
      file.name.length > 15
        ? file.name.substring(0, 15) + "..."
        : file.name;

    fileName.textContent = shortName;
    fileName.title = file.name;
    fileName.style.fontSize = "12px";
    fileName.style.marginBottom = "4px";

    fileName.style.fontSize = "12px";
    fileName.style.marginBottom = "4px";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "View Document";
    btn.onclick = () => openFromInput(btn);

    previewDiv.appendChild(fileName);
    previewDiv.appendChild(btn);
  };

  reader.readAsDataURL(file);
}


function showFile(base64, type, name) {
  if (!base64) {
    alert("No file available");
    return;
  }

  const win = window.open("", "_blank");

  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${name}</title>
        <link rel="stylesheet" href="/static/css/pil_bba_test.css">
      </head>
      <body class="file-preview-body">

        <div class="file-preview-toolbar">
          <span>${name}</span>
          <button onclick="downloadFile()">Download</button>
        </div>

        <div class="file-preview-viewer">
          ${
            type.startsWith("image/")
              ? `<img src="${base64}" />`
              : `<iframe src="${base64}"></iframe>`
          }
        </div>

        <script>
          function downloadFile() {
            const a = document.createElement("a");
            a.href = "${base64}";
            a.download = "${name}";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        </script>

      </body>
    </html>
  `);
  win.document.close();
}



  function closePreview() {
    const modal = document.getElementById("filePreviewModal");
    const frame = document.getElementById("fileFrame");

    frame.src = "";
    modal.classList.add("hidden");
  }

  /* ================= HELPERS ================= */
  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function formatLocation(code) {
    if (!code) return "";
    if (/^[A-Z]{2}-\d{2}$/.test(code)) return code;

    const match = code.match(/^([A-Z]+)(\d+)$/);
    if (!match) return code;

    return `${match[1]}-${match[2].padStart(2, "0")}`;
  }
  
  function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;

    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  function recalculateSrNo() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    rows.forEach((row, index) => {
      const cell = row.querySelector(".sr-no");
      if (cell) {
        cell.innerText = index + 1; 
      }
    });
  }


function openFromInput(btn) {
  const input = btn.closest("td").querySelector("input[type='file']");

  if (!input || !input.dataset.base64) {
    alert("No file attached");
    return;
  }

  showFile(
    input.dataset.base64,
    input.dataset.type,
    input.dataset.name
  );
}


 function downloadCurrentFile() {
  if (!currentPreviewFile) {
    alert("No file to download");
    return;
  }

  const { base64, name } = currentPreviewFile;

  const byteString = atob(base64.split(",")[1]);
  const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = name || "attachment";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#bbaTable tbody");
    const tpl = cloneTemplate("bbaAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";
    row.querySelector(".loc").innerText = formatLocation(USER_LOCATION);

    const previewDiv = row.querySelector(".img-preview");
    if (previewDiv) previewDiv.innerHTML = "";

    tbody.prepend(row);
    recalculateSrNo();
    document.getElementById("saveBtn").style.display = "inline-block";

  }

  /* ================= DELETE ================= */
  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new === "true") {
      if (!confirm("Are you sure you want to delete this row?")) return;
      row.remove();
      recalculateSrNo(); 
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    $.ajax({
      url: "/delete_bba_test_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: (res) => {
        if (res.success) {
          row.remove();
          
          alert("Deleted successfully");
        } else {
          alert(res.message || "Delete failed");
        }
      },
      error: () => {
        alert("Delete failed at server");
      },
    });
  }

  /* ================= EDIT ================= */
  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    // Date & Time
    ["date", "time"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = cls === "date" ? "date" : "time";
      input.value = cls === "date" ? formatDateForInput(val) : val;
      td.appendChild(input);
    });

    // Text inputs
    [4, 5, 6, 11].forEach(idx => {
      const td = row.children[idx];
      const val = td.innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.value = val;
      td.appendChild(input);
    });

    // Selects
    [
      { idx: 7, options: ["Employee", "Contractor", "Others"] },
      { idx: 8, options: ["Negative", "Positive"] }
    ].forEach(({ idx, options }) => {
      const td = row.children[idx];
      const val = td.innerText;
      td.innerHTML = "";
      const select = document.createElement("select");
      options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.text = opt;
        if (opt === val) o.selected = true;
        select.appendChild(o);
      });
      td.appendChild(select);
    });

    // ✅ BAC FIX (CRITICAL)
    const bacTd = row.children[9];
    const bacVal = bacTd.innerText;
    bacTd.innerHTML = "";
    const bacInput = document.createElement("input");
    bacInput.type = "number";
    bacInput.value = bacVal || "";
    bacInput.style.width = "100%";
    bacTd.appendChild(bacInput);

    // Attachment
    const existingBase64 = row.dataset.attachment || null;
    const existingType = row.dataset.fileType || "application/pdf";
    const existingName = row.dataset.fileName || "Attachment";

    row.children[10].innerHTML = "";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = function () {
      previewFile(this);
    };

    const previewDiv = document.createElement("div");
    previewDiv.className = "img-preview";

    if (existingBase64) {
      const btnView = document.createElement("button");
      btnView.type = "button";
      btnView.innerText = "View Document";
      btnView.onclick = () =>
        showFile(existingBase64, existingType, existingName);
      previewDiv.appendChild(btnView);
    }

    row.children[10].appendChild(fileInput);
    row.children[10].appendChild(previewDiv);

    // Remarks
    const remarksTd = row.children[12];
    const remarksVal = remarksTd.innerText;
    remarksTd.innerHTML = "";
    const textarea = document.createElement("textarea");
    textarea.value = remarksVal;
    textarea.rows = 2;
    textarea.style.width = "100%";
    remarksTd.appendChild(textarea);

    btn.disabled = true;
    btn.innerText = "Editing";
    document.getElementById("saveBtn").style.display = "inline-block";
  }

  function validateMandatoryFields() {
  let isValid = true;

  document.querySelectorAll(".mandatory-error").forEach(el =>
    el.classList.remove("mandatory-error")
  );
  document.querySelectorAll(".mandatory-star").forEach(el => el.remove());
  document.querySelectorAll(".mandatory-cell").forEach(el =>
    el.classList.remove("mandatory-cell")
  );

  const rows = document.querySelectorAll("#bbaTable tbody tr");

  rows.forEach(row => {
    const dateInput     = row.children[2]?.querySelector("input"); // date
    const timeInput     = row.children[3]?.querySelector("input"); // time
    const nameInput     = row.children[5]?.querySelector("input");  // Name
    const securityInput = row.children[11]?.querySelector("input"); // Security

    [dateInput, timeInput, nameInput, securityInput].forEach(input => {
      if (input && !input.value) {
        isValid = false;
        input.classList.add("mandatory-error");

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
    if (!validateMandatoryFields()) return;
    const rows = document.querySelectorAll("#bbaTable tbody tr");

    let hasNew = false;
    let hasEdit = false;

    rows.forEach((row) => {
      if (row.dataset.new === "true") hasNew = true;
      if (row.dataset.edited === "true" && !row.dataset.new) hasEdit = true;
    });

    if (!hasNew && !hasEdit) {
      alert("Nothing to save");
      return;
    }

    let confirmMsg = "Do you want to save changes?";
    if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
    if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
    if (hasNew && hasEdit)
      confirmMsg = "Do you want to add and update records?";

    if (!confirm(confirmMsg)) return;

    rows.forEach((row) => {
      const td = row.children;
      const bacVal = td[9].querySelector("input")?.value;

      const payload = {
      s_location_code: USER_LOCATION,
      d_test_date: td[2].querySelector("input")?.value,
      t_test_time: td[3].querySelector("input")?.value,
      s_test_record_no: td[4].querySelector("input")?.value,
      s_individual_name: td[5].querySelector("input")?.value,
      s_card_no: td[6].querySelector("input")?.value,
      s_person_type: td[7].querySelector("select")?.value,
      s_test_result: td[8].querySelector("select")?.value,
      n_bac_count: bacVal === "" ? null : Number(bacVal),
      img_attachment:
        td[10].querySelector("input")?.dataset.base64 ||
        row.dataset.attachment ||
        null,
      s_security_personnel_name: td[11].querySelector("input")?.value,
      s_remarks: td[12].querySelector("textarea")?.value,
    };

      // INSERT
      if (row.dataset.new === "true") {
        $.ajax({
          url: "/save_bba_test_data",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
        });
      }

      // UPDATE
      if (row.dataset.edited === "true" && !row.dataset.new) {
        payload.n_sr_no = row.dataset.id;
        $.ajax({
          url: "/update_bba_test_data",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
        });
      }
    });

    if (hasNew && hasEdit) {
      alert("Records added and updated successfully");
    } else if (hasNew) {
      alert("Record added successfully");
    } else {
      alert("Record updated successfully");
    }
    document.getElementById("saveBtn").style.display = "none";

    loadBbaData();
  }

  /* ================= LOAD ================= */
  function loadBbaData() {
    $.get("/get_bba_test_data", (res) => {
      if (!res.success) return alert("Load failed");
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */
  function renderPage() {
  const tbody = document.querySelector("#bbaTable tbody");
  tbody.innerHTML = "";

  const totalRecords = allData.length;
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  allData.slice(start, end).forEach((r, index) => {
    const tpl = cloneTemplate("bbaViewRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.id = r.n_sr_no;
    row.dataset.attachment = r.img_attachment || null;
    row.dataset.fileType = r.s_file_type || "application/pdf";
    row.dataset.fileName = "Attachment";

   
    const srNo = totalRecords - (start + index);
    row.querySelector(".sr-no").innerText = srNo;

    row.querySelector(".loc").innerText =
      formatLocation(r.s_location_code);
    row.querySelector(".date").innerText =
      formatDateDDMMYYYY(r.d_test_date);
    row.querySelector(".time").innerText = r.t_test_time;
    row.querySelector(".record").innerText = r.s_test_record_no;
    row.querySelector(".name").innerText = r.s_individual_name;
    row.querySelector(".card").innerText = r.s_card_no || "";
    row.querySelector(".type").innerText = r.s_person_type;
    row.querySelector(".result").innerText = r.s_test_result;
    row.querySelector(".bac").innerText = r.n_bac_count;

    row.querySelector(".bac").innerText = r.n_bac_count ?? "";

    if (r.img_attachment) {
      row.children[10].innerHTML = `
        <button type="button" onclick="showFile(
          '${r.img_attachment}',
          '${r.s_file_type || "application/pdf"}',
          'Attachment'
        )">View Document</button>
      `;
    } else {
      row.children[10].innerText = "";
    }

    row.querySelector(".security").innerText =
      r.s_security_personnel_name;
    row.querySelector(".remarks").innerText = r.s_remarks || "";

    tbody.appendChild(row);
  });
  recalculateSrNo();
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

 /* ================= DOWNLOAD ================= */
async function downloadTable() {
  if (!allData.length) {
    alert("No data available to download");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("BBA Test Register");

  /* ===== TITLE ===== */
  worksheet.mergeCells(1, 1, 1, 12);
  worksheet.getCell("A1").value = "BBA Test Record Register";
  worksheet.getCell("A1").font = { bold: true, size: 16 };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle"
  };
  worksheet.getRow(1).height = 30;

  /* =====  BLANK ROWS ===== */
  worksheet.addRow([]);
 

  /* ===== HEADERS ===== */
  const headers = [
    "Sr No",
    "Location",
    "Test Date",
    "Test Time",
    "Test Record No",
    "Individual Name",
    "Card No",
    "Person Type",
    "Test Result",
    "BAC Count",
    "Attachment Available",
    "Security",
    "Remarks"
  ];

  const headerRowIndex = worksheet.lastRow.number + 1;
  worksheet.addRow(headers);

  worksheet.getRow(headerRowIndex).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center"
    };
  });
  worksheet.getRow(headerRowIndex).height = 40;

  /* ===== DATA ===== */
  let srNo = 1;
  allData.forEach(r => {
    worksheet.addRow([
      srNo++,
      r.s_location_code ?? "",
      r.d_test_date ?? "",
      r.t_test_time ?? "",
      r.s_test_record_no ?? "",
      r.s_individual_name ?? "",
      r.s_card_no ?? "",
      r.s_person_type ?? "",
      r.s_test_result ?? "",
      r.n_bac_count ?? "",
      r.img_attachment ? "Yes" : "No",
      r.s_security_personnel_name ?? "",
      r.s_remarks ?? ""
    ]);
  });

  /* ===== COLUMN WIDTH ===== */
  worksheet.columns.forEach(column => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(maxLength + 2, 30);
  });

  /* ===== DOWNLOAD ===== */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "BAA_Test_Record_Register.xlsx";
  link.click();
}
const avatar = document.getElementById("profileAvatar");
const menu = document.getElementById("profileMenu");

avatar.addEventListener("click", () => {

    if(menu.style.display === "block"){
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

});

document.addEventListener("click", function(e){

    if(!avatar.contains(e.target)){
        menu.style.display = "none";
    }

});


  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.previewFile = previewFile;
  window.showFile = showFile;
  window.downloadTable = downloadTable;

  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.closePreview = closePreview;
  window.downloadCurrentFile = downloadCurrentFile;

  document.addEventListener("input", e => {
  const input = e.target;
  if (!input.classList.contains("mandatory-error")) return;

  input.classList.remove("mandatory-error");

  const cell = input.closest("td");
  cell?.classList.remove("mandatory-cell");

  const star = cell?.querySelector(".mandatory-star");
  if (star) star.remove();
});


  document.addEventListener("DOMContentLoaded", loadBbaData);
}

bbaTestApp();
