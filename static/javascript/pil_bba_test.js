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

  function updateSerialNumbers() {
  const rows = document.querySelectorAll("#bbaTable tbody tr");
  rows.forEach((row, i) => {
    row.querySelector(".sr-no").innerText = i + 1;
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
    row.querySelector(".loc").innerText = USER_LOCATION;

    const previewDiv = row.querySelector(".img-preview");
    if (previewDiv) previewDiv.innerHTML = "";

    tbody.prepend(row);
    updateSerialNumbers();
    document.getElementById("saveBtn").style.display = "inline-block";

  }

  /* ================= DELETE ================= */
  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new === "true") {
      if (!confirm("Are you sure you want to delete this row?")) return;
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
      success: (res) => {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
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
    row.querySelector(".loc").innerText = USER_LOCATION;

    ["date", "time"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = cls === "date" ? "date" : "time";
      input.value = val;
      td.appendChild(input);
    });

    [4, 5, 8, 10, 11].forEach((idx) => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";
      const input = document.createElement("input");
      input.value = val;
      row.children[idx].appendChild(input);
    });

    [6, 7].forEach((idx) => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";

      const select = document.createElement("select");
      const options =
        idx === 6
          ? ["Employee", "Contractor", "Others"]
          : ["Negative", "Positive"];

      options.forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.text = v;
        if (v === val) o.selected = true;
        select.appendChild(o);
      });

      row.children[idx].appendChild(select);
    });

    const existingBase64 = row.dataset.attachment || null;
    const existingType = row.dataset.fileType || "application/pdf";
    const existingName = row.dataset.fileName || "Attachment";

    row.children[9].innerHTML = "";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = function () {
      previewFile(this);
    };

    const previewDiv = document.createElement("div");
    previewDiv.className = "img-preview";

    if (existingBase64) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "View Document";
      btn.onclick = () => showFile(existingBase64, existingType, existingName);
      previewDiv.appendChild(btn);
    }

    row.children[9].appendChild(fileInput);
    row.children[9].appendChild(previewDiv);

    btn.disabled = true;
    btn.innerText = "Editing";
    document.getElementById("saveBtn").style.display = "inline-block";

  }

  function validateMandatoryFields() {
  let isValid = true;

  // clear old errors
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
    const nameInput     = row.children[5]?.querySelector("input"); // name
    const securityInput = row.children[10]?.querySelector("input"); // security

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

      const payload = {
        s_location_code: USER_LOCATION,
        d_test_date: td[2].querySelector("input")?.value,
        t_test_time: td[3].querySelector("input")?.value,
        s_test_record_no: td[4].querySelector("input")?.value,
        s_individual_name: td[5].querySelector("input")?.value,
        s_person_type: td[6].querySelector("select")?.value,
        s_test_result: td[7].querySelector("select")?.value,
        n_bac_count: td[8].querySelector("input")?.value,
        img_attachment:
          td[9].querySelector("input")?.dataset.base64 ||
          row.dataset.attachment ||
          null,
        s_security_personnel_name: td[10].querySelector("input")?.value,
        s_remarks: td[11].querySelector("input")?.value,
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

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach((r) => {
      const tpl = cloneTemplate("bbaViewRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = r.n_sr_no;
      row.dataset.attachment = r.img_attachment || null;
      row.dataset.fileType = r.s_file_type || "application/pdf";
      row.dataset.fileName = "Attachment";

      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".date").innerText = r.d_test_date;
      row.querySelector(".time").innerText = r.t_test_time;
      row.querySelector(".record").innerText = r.s_test_record_no;
      row.querySelector(".name").innerText = r.s_individual_name;
      row.querySelector(".type").innerText = r.s_person_type;
      row.querySelector(".result").innerText = r.s_test_result;
      row.querySelector(".bac").innerText = r.n_bac_count;

      if (r.img_attachment) {
        row.children[9].innerHTML = `
          <button onclick="showFile(
  '${r.img_attachment}',
  '${r.s_file_type || "application/pdf"}',
  'Attachment'
)">View Document</button>

        `;
      }

      row.querySelector(".security").innerText = r.s_security_personnel_name;
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
