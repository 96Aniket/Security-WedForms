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



$("#labour_mobile").on("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

$("#labour_id_no").on("input", function () {
  const type = $("#labour_id_type").val();

  if (type === "Aadhar") {
    this.value = this.value.replace(/\D/g, "").slice(0, 12);
  }

  else if (type === "PAN") {
    // alphanumeric only, max 10, auto uppercase
    this.value = this.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10)
      .toUpperCase();
  }

  else if (type === "Driving License") {
  this.value = this.value
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .slice(0, 25);   
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
    const tbody = $("#masterTable tbody");
    tbody.empty();

    allData.forEach(r => {
      const tr = $(`
        <tr>
          <td>${r.s_location || ""}</td>
          <td>${r.s_contractor_name || ""}</td>
          <td>${r.s_nature_of_work || ""}</td>
          <td>${r.dt_work_datetime || ""}</td>
          <td class="action-col">
            <button class="icon-btn edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn delete">
              <i class="fa-solid fa-trash"></i>
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

  pageData.forEach(r => {
    const tr = $(`
      <tr>
        <td>${r.s_location || ""}</td>
        <td>${r.s_contractor_name || ""}</td>
        <td>${r.s_nature_of_work || ""}</td>
        <td>${r.s_place_of_work || ""}</td>
        <td>${r.dt_work_datetime || ""}</td>
        <td class="action-col">
          <button class="icon-btn edit"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn delete"><i class="fa-solid fa-trash"></i></button>
        </td>
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

    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);
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
    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);

    $("#s_contractor_name").val(record.s_contractor_name || "");
    $("#s_nature_of_work").val(record.s_nature_of_work || "");
    $("#s_place_of_work").val(record.s_place_of_work || "");
    $("#dt_work_datetime").val(
      record.dt_work_datetime
        ? record.dt_work_datetime.replace(" ", "T")
        : ""
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
  if (!name || !age || !sex || !mobile) {
    alert("Please fill all mandatory labour details.");
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
  }

  else if (idType === "PAN") {
    idNo = idNo.toUpperCase();
    if (!isValidPAN(idNo)) {
      alert("PAN must be in format ABCDE1234F.");
      return;
    }
  }

  else if (idType === "Driving License") {
    if (!isValidDrivingLicense(idNo)) {
      alert("Driving License number is invalid.");
      return;
    }
  }

  /* ===== PUSH DATA ===== */
  labours.push({
    s_labour_name: name,
    n_age: age,
    s_sex: sex,
    s_address: address,
    s_temp_access_card_no: cardNo,
    s_mobile_no: mobile,
    s_id_type: idType,
    s_govt_id_no: idNo,
  });

  renderLabours();
  clearLabour();
};

  function renderLabours() {
    const tbody = $("#labourTable tbody");
    tbody.empty();

    labours.forEach((l, i) => {
      tbody.append(`
        <tr>
          <td>${l.s_labour_name || ""}</td>
          <td>${l.n_age || ""}</td>
          <td>${l.s_sex || ""}</td>
          <td>${l.s_address || ""}</td>
          <td>${l.s_mobile_no || ""}</td>
          <td>
            <button class="danger" onclick="removeLabour(${i})">X</button>
          </td>
        </tr>
      `);
    });
  }

  window.removeLabour = (i) => {
    labours.splice(i, 1);
    renderLabours();
  };

  function clearLabour() {
    $("#labour_name,#labour_age,#labour_mobile,#labour_id_no").val("");
    $("#labour_sex,#labour_address,#labour_card,#labour_id_type").val("");
  }

  
  /* ================= SAVE ================= */

window.saveData = () => {

  /* ========= MASTER VALIDATION ========= */
  const contractor = $("#s_contractor_name").val().trim();
  const nature = $("#s_nature_of_work").val().trim();
  const place = $("#s_place_of_work").val().trim();
  const datetime = $("#dt_work_datetime").val();

  if (!contractor || !nature || !place || !datetime) {
    alert("Please fill all mandatory Work Details before saving.");
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
      !l.n_age ||
      !l.s_sex ||
      !l.s_address ||
      !l.s_temp_access_card_no ||
      !l.s_mobile_no ||
      !l.s_id_type ||
      !l.s_govt_id_no
    ) {
      alert(`Please complete all details for Labour #${i + 1}.`);
      return;
    }
  }

  /* ========= PAYLOAD ========= */
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

  /* ===== SAME CONFIRM STYLE AS MITRA ===== */
  const confirmMsg = isEdit
    ? "Do you want to update this record?"
    : "Do you want to add this record?";

  if (!confirm(confirmMsg)) return;

  $.ajax({
    url: url,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: (res) => {
      if (isEdit) {
        alert("Record updated successfully");
      } else {
        alert("Record added successfully");
      }
      window.location.reload();   // safe refresh
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

  if (!confirm("Are you sure you want to delete this record?")) return;

  $.ajax({
    url: "/delete_casual_labour_data",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ n_sl_no: record.n_sl_no }),
    success: (res) => {
      alert("Deleted successfully");
      loadData();
    },
    error: () => {
      alert("Delete failed at server");
    },
  });
});


  /* ================= INIT ================= */
window.nextPage = nextPage;
window.prevPage = prevPage;
  loadData();
}

casualLabourApp();
