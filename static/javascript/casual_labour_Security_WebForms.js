let editingLabourIndex = null;
let hasUnsavedChanges = false;

function casualLabourApp() {
  let allData = [];
  let labours = [];
  let isEdit = false;
  let editId = null;

  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function formatLocation(loc) {
    if (!loc) return "";
    if (/^[A-Z]{2}-\d{2}$/.test(loc)) {
      return loc;
    }
    const match = loc.match(/^([A-Z]{2})(\d{2})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return loc;
  }

  function markMandatory(input) {
    if (!input) return;

    input.classList.add("mandatory-error");

    const field = input.closest(".field");
    if (!field) return;

    const label = field.querySelector("label");
    if (!label) return;

    if (!label.querySelector(".mandatory-star")) {
      const star = document.createElement("span");
      star.className = "mandatory-star";
      star.textContent = "*";
      label.appendChild(star);
    }
  }

  function markUnsaved() {
    hasUnsavedChanges = true;
    $(".btn-save").addClass("unsaved").text("Save (Required)");
  }

  function clearUnsaved() {
    hasUnsavedChanges = false;
    $(".btn-save").removeClass("unsaved").text("Save");
  }

  function clearMandatory(input) {
    input.classList.remove("mandatory-error");

    const field = input.closest(".field");
    if (!field) return;

    const label = field.querySelector("label");
    const star = label?.querySelector(".mandatory-star");
    if (star) star.remove();
  }

  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("mandatory-error")) {
      clearMandatory(e.target);
    }
  });

  function isValidMobile(mobile) {
    return /^[0-9]{10}$/.test(mobile);
  }

  function isValidAadhar(aadhar) {
    return /^[0-9]{12}$/.test(aadhar);
  }

  function isValidPAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  }

  function isValidDrivingLicense(dl) {
    if (!dl) return false;

    const cleaned = dl.trim();

    return /^[A-Z0-9 -]{8,25}$/i.test(cleaned);
  }

  $("#s_location").val(USER_LOCATION).prop("readonly", true);

  $("#masterTable").on("click", ".icon-btn.download", function () {
    const record = $(this).closest("tr").data("record");

    if (!record || !record.labours || record.labours.length === 0) {
      alert("No labour data available for this record.");
      return;
    }

    showDownloadOptions(record);
  });

  $("#labour_mobile").on("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  $("#labour_id_no").on("input", function () {
    const type = $("#labour_id_type").val();

    if (type === "Aadhar") {
      this.value = this.value.replace(/\D/g, "").slice(0, 12);
    } else if (type === "PAN") {

      this.value = this.value
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 10)
        .toUpperCase();
    } else if (type === "Driving License") {
      this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 25);
    }
  });

  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_casual_labour_data", (res) => {
      if (!res.success || !Array.isArray(res.data)) return;
      allData = res.data;
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */

  function renderTable() {
    if (USER_ROLE !== "admin") {
    }

    const tbody = $("#masterTable tbody");
    tbody.empty();

    allData.forEach((r) => {
      const tr = $(`
        <tr>
          <td>${formatLocation(r.s_location)}</td>
          <td>${r.s_contractor_name || ""}</td>
          
          <td>${r.s_nature_of_work || ""}</td>
          <td>${r.dt_work_datetime || ""}</td>
          <td class="action-col">
  <button class="icon-btn edit" title="Edit">
    <i class="fa-solid fa-pen"></i>
  </button>

  <button class="icon-btn delete" title="Delete">
    <i class="fa-solid fa-trash"></i>
  </button>

  <button class="icon-btn download" title="Download Labour Details">
    <i class="fa-solid fa-download"></i>
  </button>
</td>

        </tr>
      `);

      tr.data("record", r);
      tbody.append(tr);
    });
  }

  function renderPage() {
    const tbody = $("#masterTable tbody");
    tbody.empty();

    const totalRecords = allData.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    pageData.forEach((r, index) => {
      let actionColumn = "";

      if (USER_ROLE !== "admin") {
        actionColumn = `
        <td class="action-col">
          <button class="icon-btn edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn delete">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button class="icon-btn download">
            <i class="fa-solid fa-download"></i>
          </button>
        </td>
      `;
      }
      const srNo = start + index + 1;

      const tr = $(`
      <tr>
        <td class="sr-no">${srNo}</td>
        <td>${formatLocation(r.s_location)}</td>
        <td>${r.s_contractor_name || ""}</td>
        
        <td>${r.s_nature_of_work || ""}</td>
        <td>${r.s_place_of_work || ""}</td>
        <td>${r.dt_work_datetime || ""}</td>
        ${actionColumn}
      </tr>
    `);

      tr.data("record", r);
      tbody.append(tr);
    });

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

  /* ================= VIEW SWITCH ================= */

  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    labours = [];
    $("#paginationBar").hide();

    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();

    $("#s_location").val(USER_LOCATION).prop("readonly", true);
  };

  window.nextStep = () => {
    if ($("#step2").is(":visible")) return;

    $("#step2").slideDown(200);
    document.getElementById("step2").scrollIntoView({ behavior: "smooth" });
  };

  /* ================= EDIT ================= */

  $("#masterTable").on("click", ".icon-btn.edit", function () {
    const record = $(this).closest("tr").data("record");

    isEdit = true;
    editId = record.n_sl_no;
    $("#paginationBar").hide();

    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();
    $("#s_location").val(USER_LOCATION).prop("readonly", true);

    $("#s_contractor_name").val(record.s_contractor_name || "");
    // $("#s_host_name").val(record.s_host_name || "");
    $("#s_nature_of_work").val(record.s_nature_of_work || "");
    $("#s_place_of_work").val(record.s_place_of_work || "");
    $("#dt_work_datetime").val(
      record.dt_work_datetime ? record.dt_work_datetime.replace(" ", "T") : "",
    );

    labours = record.labours || [];
    renderLabours();
  });

  /* ================= LABOUR ================= */

  window.addLabour = () => {
    const name = $("#labour_name").val().trim();
    const age = $("#labour_age").val().trim();
    const sex = $("#labour_sex").val();
    const address = $("#labour_address").val().trim();
    const cardNo = $("#labour_card").val().trim();
    const mobile = $("#labour_mobile").val().trim();
    const idType = $("#labour_id_type").val();
    const rawIdNo = $("#labour_id_no").val().trim();
    $("#addLabourBtn").text("Add Labour").removeClass("update-mode");

    /* ===== REQUIRED FIELDS ===== */
    let labourValid = true;

    if (!name) {
      markMandatory(document.getElementById("labour_name"));
      labourValid = false;
    }

    if (!mobile) {
      markMandatory(document.getElementById("labour_mobile"));
      labourValid = false;
    }

    if (!idType) {
      markMandatory(document.getElementById("labour_id_type"));
      labourValid = false;
    }

    if (!rawIdNo) {
      markMandatory(document.getElementById("labour_id_no"));
      labourValid = false;
    }

    if (!labourValid) {
      alert("Please fill mandatory Labour details.");
      return;
    }

    const ageNum = Number(age);

    if (!Number.isInteger(ageNum) || ageNum < 1) {
      markMandatory(document.getElementById("labour_age"));
      alert("Age must be a valid number greater than 0.");
      return;
    }

    /* ===== MOBILE ===== */
    if (!isValidMobile(mobile)) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    /* ===== ID TYPE SELECTED BUT NUMBER EMPTY ===== */
    if (idType && !rawIdNo) {
      alert("Please enter Govt ID number.");
      return;
    }

    /* ===== ID VALIDATION ===== */
    let idNo = rawIdNo;

    if (idType === "Aadhar") {
      if (!isValidAadhar(idNo)) {
        alert("Aadhar number must be exactly 12 digits.");
        return;
      }
    } else if (idType === "PAN") {
      idNo = idNo.toUpperCase();
      if (!isValidPAN(idNo)) {
        alert("PAN must be in format ABCDE1234F.");
        return;
      }
    } else if (idType === "Driving License") {
      if (!isValidDrivingLicense(idNo)) {
        alert("Driving License number is invalid.");
        return;
      }
    }

    /* ===== PUSH DATA ===== */
    const labourObj = {
      s_labour_name: name,
      n_age: age,
      s_sex: sex,
      s_address: address,
      s_temp_access_card_no: cardNo,
      s_mobile_no: mobile,
      s_id_type: idType,
      s_govt_id_no: idNo,
    };

    if (editingLabourIndex !== null) {
      labours[editingLabourIndex] = labourObj;
      editingLabourIndex = null;
    } else {
      labours.push(labourObj);
    }

    renderLabours();
    clearLabour();
    markUnsaved();
    $("#addLabourBtn").text("Add Labour");
  };

  function renderLabours() {
    const tbody = $("#labourTable tbody");
    tbody.empty();

    labours.forEach((l, i) => {
      let actionColumn = "";

      if (USER_ROLE !== "admin") {
        actionColumn = `
        <td>
          <button class="icon-btn edit" onclick="editLabour(${i})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn delete" onclick="removeLabour(${i})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      }

      tbody.append(`
      <tr>
        <td>${l.s_labour_name || ""}</td>
        <td>${l.n_age || ""}</td>
        <td>${l.s_sex || ""}</td>
        <td>${l.s_address || ""}</td>
        <td>${l.s_temp_access_card_no || ""}</td>
        <td>${l.s_mobile_no || ""}</td>
        ${actionColumn}
      </tr>
    `);
    });
  }

  window.removeLabour = (i) => {
    labours.splice(i, 1);
    renderLabours();
  };

  window.editLabour = (index) => {
    const l = labours[index];

    editingLabourIndex = index;
    $("#addLabourBtn").text("Update Labour").addClass("update-mode");

    $("#addLabourBtn").text("Update Labour");

    $("#labour_name").val(l.s_labour_name);
    $("#labour_age").val(l.n_age);
    $("#labour_sex").val(l.s_sex);
    $("#labour_address").val(l.s_address);
    $("#labour_card").val(l.s_temp_access_card_no);
    $("#labour_mobile").val(l.s_mobile_no);
    $("#labour_id_type").val(l.s_id_type);
    $("#labour_id_no").val(l.s_govt_id_no);

    $("html, body").animate(
      {
        scrollTop: $("#labour_name").offset().top - 100,
      },
      300,
    );
  };

  function clearLabour() {
    $("#labour_name,#labour_age,#labour_mobile,#labour_id_no").val("");
    $("#labour_sex,#labour_address,#labour_card,#labour_id_type").val("");
    editingLabourIndex = null;
    $("#addLabourBtn").text("Add Labour");
    $("#addLabourBtn").text("Add Labour").removeClass("update-mode");
  }

  /* ================= SAVE ================= */

  window.saveData = () => {
    // ===== BLOCK SAVE IF LABOUR EDIT IS PENDING =====
    if (editingLabourIndex !== null) {
      alert(
        "You are editing a labour entry.\n\nPlease click 'Update Labour' before saving.",
      );
      return;
    }

    /* ========= MASTER VALIDATION ========= */
    const contractor = $("#s_contractor_name").val().trim();
    const nature = $("#s_nature_of_work").val().trim();
    const place = $("#s_place_of_work").val().trim();
    const datetime = $("#dt_work_datetime").val();
    // const hostName = $("#s_host_name").val().trim();

    // if (!hostName) {
    //   markMandatory(document.getElementById("s_host_name"));
    //   alert("Please enter Host Name.");
    //   return;
    // }

    let workValid = true;

    const contractorInput = document.getElementById("s_contractor_name");
    const datetimeInput = document.getElementById("dt_work_datetime");

    if (!contractor) {
      markMandatory(contractorInput);
      workValid = false;
    }

    if (!datetime) {
      markMandatory(datetimeInput);
      workValid = false;
    }

    if (!workValid) {
      alert("Please fill mandatory Work Details.");
      return;
    }

    /* ========= LABOUR VALIDATION ========= */
    if (!labours || labours.length === 0) {
      alert("Please add at least one Labour before saving.");
      return;
    }

    for (let i = 0; i < labours.length; i++) {
      const l = labours[i];

      if (
        !l.s_labour_name ||
        !l.s_mobile_no ||
        !l.s_id_type ||
        !l.s_govt_id_no
      ) {
        alert(`Please complete mandatory details for Labour #${i + 1}.`);
        return;
      }
    }

    /* ========= ORIGINAL PAYLOAD (UNCHANGED) ========= */
    const payload = {
      master: {
        n_sl_no: editId,
        s_location: USER_LOCATION,
        s_contractor_name: contractor,
        s_nature_of_work: nature,
        s_place_of_work: place,
        dt_work_datetime: datetime,
        s_host_name: "",
      },
      labours,
    };

    const url = isEdit
      ? "/update_casual_labour_data"
      : "/save_casual_labour_data";

    if (!confirm(isEdit ? "Update this record?" : "Add this record?")) return;

    $.ajax({
      url: url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: (res) => {
        clearUnsaved();
        alert(res.message || "Saved successfully");
        window.location.reload();
      },
      error: (err) => {
        console.error(err);
        alert("Save failed");
      },
    });
  };

  /* ================= DELETE ================= */

  $("#masterTable").on("click", ".icon-btn.delete", function () {
    const record = $(this).closest("tr").data("record");

    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_casual_labour_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sl_no: record.n_sl_no }),
      success: (res) => {
        alert(res.message || "Deleted successfully");
        loadData();
      },
      error: () => alert("Delete failed"),
    });
  });

  /* ================= DOWNLOAD LABOUR DETAILS (SINGLE RECORD) ================= */
  async function downloadCasualPDF(record) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    let y = 10;

    // ===== TITLE =====
    doc.setFontSize(14);
    doc.text("PIL", 95, y);
    y += 6;

    doc.setFontSize(12);
    doc.text("Temporary Entry Permit", 70, y);
    y += 10;

    // ===== DETAILS =====
    doc.setFontSize(10);

    doc.text(`Location: ${record.s_location || ""}`, 10, y);
    y += 6;

    doc.text(`Contractor: ${record.s_contractor_name || ""}`, 10, y);
    y += 6;

    doc.text(`Nature of Work: ${record.s_nature_of_work || ""}`, 10, y);
    y += 6;

    doc.text(`Place of Work: ${record.s_place_of_work || ""}`, 10, y);
    y += 6;

    doc.text(`Date & Time: ${record.dt_work_datetime || ""}`, 10, y);
    y += 10;

    // ===== TABLE START =====
    const startX = 20;
    const tableWidth = 170;
    const colWidths = [70, 20, 20, 60];

    doc.setFont("helvetica", "bold");

    let x = startX;

    ["Name", "Age", "Sex", "Mobile"].forEach((text, i) => {
      doc.rect(x, y, colWidths[i], 8);
      doc.text(text, x + 2, y + 5);
      x += colWidths[i];
    });

    y += 8;

    doc.setFont("helvetica", "normal");

    (record.labours || []).forEach((l, index) => {
      let x = startX;

      const rowData = [
        l.s_labour_name || "",
        String(l.n_age || ""),
        l.s_sex || "",
        l.s_mobile_no || "",
      ];

      rowData.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], 8);
        doc.text(String(cell), x + 2, y + 5, { maxWidth: colWidths[i] - 4 });
        x += colWidths[i];
      });

      y += 8;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    y += 15;

    // ===== SIGNATURE SECTION =====
    doc.setFont(undefined, "bold");

    doc.text("Signature of Contractor Supervisor", 10, y);
    doc.text("Signature of Engineer Incharge", 110, y);
    y += 20;

    doc.text("Signature of Area Incharge", 10, y);
    doc.text("Signature of Security Incharge", 110, y);

    // ===== DOWNLOAD =====
    doc.save("Casual_Labour_Permit.pdf");
  }

  async function downloadLabourDetailsExcel(record) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Casual Labour");

    let rowIndex = 1;

    // ===== TITLE =====
    worksheet.mergeCells("A1:D1");
    worksheet.getCell("A1").value = "Temporary Entry Permit";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    rowIndex += 2;

    // ===== MASTER DETAILS =====
    const details = [
      ["Location", record.s_location],
      ["Contractor", record.s_contractor_name],
      ["Nature of Work", record.s_nature_of_work],
      ["Place of Work", record.s_place_of_work],
      ["Date & Time", record.dt_work_datetime],
    ];

    details.forEach(([label, value]) => {
      worksheet.getCell(`A${rowIndex}`).value = label;
      worksheet.getCell(`A${rowIndex}`).font = { bold: true };
      worksheet.getCell(`B${rowIndex}`).value = value || "";
      rowIndex++;
    });

    rowIndex += 1;

    // ===== TABLE HEADER =====
    worksheet.addRow(["Name", "Age", "Sex", "Mobile"]);

    worksheet.getRow(rowIndex).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    rowIndex++;

    // ===== LABOUR DATA =====
    (record.labours || []).forEach((l) => {
      worksheet.addRow([
        l.s_labour_name || "",
        l.n_age || "",
        l.s_sex || "",
        l.s_mobile_no || "",
      ]);
    });

    // ===== COLUMN WIDTH =====
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    // ===== DOWNLOAD =====
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Casual_Labour.xlsx";
    link.click();
  }

  let selectedRecord = null;

  window.showDownloadOptions = function (record) {
    selectedRecord = record;
    document.getElementById("downloadModal").style.display = "flex";
  };

  window.closeDownloadModal = function () {
    document.getElementById("downloadModal").style.display = "none";
  };

  window.downloadAsPDF = function () {
    if (!selectedRecord) return;
    downloadCasualPDF(selectedRecord);
    closeDownloadModal();
  };

  window.downloadAsExcel = function () {
    if (!selectedRecord) return;
    downloadLabourDetailsExcel(selectedRecord);
    closeDownloadModal();
  };

  /* ================= DOWNLOAD ================= */

  async function downloadTable() {
    if (!allData.length) {
      alert("No data available to download");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Temporary Entry Permit");
    /* ===== TITLE ===== */
    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = "Temporary Entry Permit";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    /* ===== ONE BLANK ROW ===== */
    worksheet.addRow([]);

    const headers = [
      "Location",
      "Contractor",
      "Nature of Work",
      "Place of Work",
      "Date / Time",
    ];

    worksheet.addRow(headers);
    /* ===== BOLD HEADER ROW ===== */
    worksheet.getRow(3).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    allData.forEach((r) => {
      worksheet.addRow([
        r.s_location ?? "",
        r.s_contractor_name ?? "",
        r.s_nature_of_work ?? "",
        r.s_place_of_work ?? "",
        r.dt_work_datetime ?? "",
      ]);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Temporary Entry Permit.xlsx";
    link.click();
  }
  const avatar = document.getElementById("profileAvatar");
  const menu = document.getElementById("profileMenu");

  avatar.addEventListener("click", () => {
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  });

  document.addEventListener("click", function (e) {
    if (!avatar.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  /* ================= INIT ================= */
  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadTable = downloadTable;

  window.addEventListener("beforeunload", function (e) {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  loadData();
}

casualLabourApp();
