let editingLabourIndex = null;
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

 function markMandatory(input) {
  if (!input) return;

  input.classList.add("mandatory-error");

  const field = input.closest(".field");
  if (!field) return;

  const label = field.querySelector("label");
  if (!label) return;

  // prevent duplicate stars
  if (!label.querySelector(".mandatory-star")) {
    const star = document.createElement("span");
    star.className = "mandatory-star";
    star.textContent = "*";
    label.appendChild(star);
  }
}


function clearMandatory(input) {
  input.classList.remove("mandatory-error");

  const field = input.closest(".field");
  if (!field) return;

  const label = field.querySelector("label");
  const star = label?.querySelector(".mandatory-star");
  if (star) star.remove();
}


document.addEventListener("input", e => {
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

    downloadLabourDetailsExcel(record);
  });

  $("#labour_mobile").on("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  $("#labour_id_no").on("input", function () {
    const type = $("#labour_id_type").val();

    if (type === "Aadhar") {
      this.value = this.value.replace(/\D/g, "").slice(0, 12);
    } else if (type === "PAN") {
      // alphanumeric only, max 10, auto uppercase
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
          <td>${r.s_location || ""}</td>
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

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = allData.slice(start, end);

  pageData.forEach((r) => {

    let actionColumn = "";

    // Show action column only if NOT admin
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

    const tr = $(`
      <tr>
        <td>${r.s_location || ""}</td>
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


  /* pagination control functions */
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
      // UPDATE EXISTING
      labours[editingLabourIndex] = labourObj;
      editingLabourIndex = null;
    } else {
      // ADD NEW
      labours.push(labourObj);
    }

    renderLabours();
    clearLabour();
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
  }

  /* ================= SAVE ================= */

  window.saveData = () => {
    /* ========= MASTER VALIDATION ========= */
    const contractor = $("#s_contractor_name").val().trim();
    const nature = $("#s_nature_of_work").val().trim();
    const place = $("#s_place_of_work").val().trim();
    const datetime = $("#dt_work_datetime").val();

    let workValid = true;

const contractorInput = document.getElementById("s_contractor_name");
const datetimeInput   = document.getElementById("dt_work_datetime");

// contractor mandatory
if (!contractor) {
  markMandatory(contractorInput);
  workValid = false;
}

// date & time mandatory
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
  async function downloadLabourDetailsExcel(record) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Labour Details");
    /* ===== TITLE ===== */
    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").value = "Casual Labour Details";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    /* ===== ONE BLANK ROW ===== */
    worksheet.addRow([]);

    let row = 3;

    // ===== MASTER DETAILS (ONCE) =====
    const masterFields = [
      ["Location", record.s_location ?? ""],
      ["Contractor Name", record.s_contractor_name ?? ""],
      ["Nature of Work", record.s_nature_of_work ?? ""],
      ["Place of Work", record.s_place_of_work ?? ""],
      ["Work Date / Time", record.dt_work_datetime ?? ""],
    ];

    masterFields.forEach(([label, value]) => {
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`A${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = value;
      row++;
    });

    row += 1; // blank line

    // ===== LABOUR TABLE HEADER =====
    worksheet.getRow(row).values = [
      "Labour Name",
      "Age",
      "Sex",
      "Address",
      "Mobile No",
      "ID Type",
      "Govt ID No",
    ];

    worksheet.getRow(row).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    row++;

    // ===== LABOUR DATA (REPEATING) =====
    (record.labours || []).forEach((l) => {
      worksheet.getRow(row).values = [
        l.s_labour_name ?? "",
        l.n_age ?? "",
        l.s_sex ?? "",
        l.s_address ?? "",
        l.s_mobile_no ?? "",
        l.s_id_type ?? "",
        l.s_govt_id_no ?? "",
      ];
      row++;
    });

    // ===== AUTO COLUMN WIDTH =====
    worksheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    // ===== DOWNLOAD =====
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Casual_Labour_Details.xlsx";
    link.click();
  }

  /* ================= DOWNLOAD ================= */

  async function downloadTable() {
    if (!allData.length) {
      alert("No data available to download");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Casual Labour Register");
    /* ===== TITLE ===== */
    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = "Casual Labour Register";
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
    link.download = "Casual_Labour_Register.xlsx";
    link.click();
  }

  /* ================= INIT ================= */
  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadTable = downloadTable;

  loadData();
}

casualLabourApp();
