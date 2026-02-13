function requisitionFormApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = $("#pageInfo");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const USER_ROLE = "{{ user_role }}";

  let isEdit = false;
  let editId = null;

  function calculateAgeFromDOB(dobStr) {
    if (!dobStr) return "";

    const dob = new Date(dobStr);
    if (isNaN(dob)) return "";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // Birthday not yet occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= 0 ? age : "";
  }

  $("#dt_date_of_birth").on("change", function () {
    const dob = $(this).val();
    const age = calculateAgeFromDOB(dob);
    $("#n_age").val(age);
  });

  /* ================= HELPERS ================= */

  function formatDate(val) {
    return val ? String(val).split(" ")[0] : "";
  }

  function getVal(obj, key) {
    return obj[key] ?? obj[key.toUpperCase()] ?? obj[key.toLowerCase()] ?? null;
  }

  /* ================= LOAD LIST ================= */

  function loadData() {
    $.get("/get_requisition_form", res => {
      if (!res.success) return;
      allData = res.data || [];
      renderPage();
    });
  }

  /* ================= RENDER TABLE ================= */

  function renderPage() {
    const tbody = $("#masterTable tbody");
    tbody.empty();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    pageData.forEach((r, i) => {
      const tr = $(`
        <tr>
          <td>${start + i + 1}</td>
          <td>${getVal(r, "s_location") || ""}</td>
          <td>${formatDate(getVal(r, "dt_request_date"))}</td>
          <td>${getVal(r, "s_contractor_name") || ""}</td>
          <td>${getVal(r, "s_agency_name") || ""}</td>
          <td>${getVal(r, "s_sap_vendor_code") || ""}</td>
          ${USER_ROLE !== "admin" ? `
            <td>
              <button class="icon-btn edit"><i class="fa fa-pen"></i></button>
              <button class="icon-btn delete"><i class="fa fa-trash"></i></button>
            </td>` : ""}
        </tr>
      `);

      tr.data("record", r);
      tbody.append(tr);
    });

    updatePagination();
  }

  function updatePagination() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;
    pageInfo.text(`Page ${currentPage} of ${totalPages}`);
    prevBtn.prop("disabled", currentPage === 1);
    nextBtn.prop("disabled", currentPage === totalPages);
  }

  prevBtn.click(() => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });

  nextBtn.click(() => {
    if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
      currentPage++;
      renderPage();
    }
  });

  /* ================= VIEW SWITCH ================= */

  window.openAddForm = () => {
    isEdit = false;
    editId = null;

    $("#listView").hide();
    $("#paginationBar").hide();
    $("#formView").show();

    document.getElementById("requisitionForm").reset();
    $("#s_location").val(USER_LOCATION);
  };

  window.cancel = () => location.reload();

  /* ================= EDIT ================= */

  $("#masterTable").on("click", ".edit", function () {
    const r = $(this).closest("tr").data("record");

    isEdit = true;
    editId = getVal(r, "n_sr_no");

    $("#listView").hide();
    $("#paginationBar").hide();
    $("#formView").show();

    // ---- DATE FIELDS (FIXED) ----
    $("#dt_request_date").val(formatDate(getVal(r, "dt_request_date")));
    $("#dt_date_of_birth").val(formatDate(getVal(r, "dt_date_of_birth")));
    $("#dt_work_order_validity").val(formatDate(getVal(r, "dt_work_order_validity")));
    $("#dt_date_of_joining").val(formatDate(getVal(r, "dt_date_of_joining")));
    $("#dt_date_of_issue").val(formatDate(getVal(r, "dt_date_of_issue")));

    // ---- CHECKBOXES ----
    $("#s_police_verification_cert").prop("checked", getVal(r, "s_police_verification_cert") === "Y");
    $("#s_medical_certificate").prop("checked", getVal(r, "s_medical_certificate") === "Y");
    $("#s_govt_id_proof").prop("checked", getVal(r, "s_govt_id_proof") === "Y");
    $("#s_hsse_training").prop("checked", getVal(r, "s_hsse_training") === "Y");

    // ---- OTHER INPUTS ----
    Object.keys(r).forEach(key => {
      const el = $("#" + key.toLowerCase());
      if (
        el.length &&
        el.attr("type") !== "checkbox" &&
        el.attr("type") !== "date"
      ) {
        el.val(r[key]);
      }
    });
  });

  /* ================= SAVE / UPDATE ================= */

  window.saveRequisition = () => {

  // ===== VALIDATION =====
  if (!isEdit && !$("#dt_request_date").val()) {
    alert("Please fill required fields");
    return;
  }

  // ===== CONFIRM MESSAGE (SAME STYLE AS PATROLLING) =====
  let confirmMsg = "Do you want to save this record?";
  if (isEdit) confirmMsg = "Do you want to update this record?";

  if (!confirm(confirmMsg)) return;

  const payload = {
  n_sr_no: editId,
  s_location: USER_LOCATION,

  dt_request_date: $("#dt_request_date").val(),
  dt_date_of_birth: $("#dt_date_of_birth").val(),
  dt_work_order_validity: $("#dt_work_order_validity").val(),
  dt_date_of_joining: $("#dt_date_of_joining").val(),
  dt_date_of_issue: $("#dt_date_of_issue").val(),

  s_first_name: $("#s_first_name").val(),
  s_middle_name: $("#s_middle_name").val() || null,
  s_last_name: $("#s_last_name").val(),

  n_age: Number($("#n_age").val()) || 0,

  s_agency_name: $("#s_agency_name").val(),
  s_sap_vendor_code: $("#s_sap_vendor_code").val() || null,

  s_nature_of_job: $("#s_nature_of_job").val(),
  s_work_order_no: $("#s_work_order_no").val(),
  s_exact_work_location: $("#s_exact_work_location").val(),

  n_height_cm: Number($("#n_height_cm").val()) || null,
  s_gender: $("#s_gender").val(),
  s_blood_group: $("#s_blood_group").val() || null,

  s_identification_mark: $("#s_identification_mark").val() || null,
  s_aadhar_card_no: $("#s_aadhar_card_no").val(),

  s_present_address: $("#s_present_address").val(),
  s_present_city: $("#s_present_city").val(),
  s_present_state: $("#s_present_state").val(),
  s_present_pincode: $("#s_present_pincode").val(),
  s_contact_no: $("#s_contact_no").val(),

  s_emergency_contact_details: $("#s_emergency_contact_details").val(),
  s_emergency_city: $("#s_emergency_city").val(),
  s_emergency_state: $("#s_emergency_state").val(),
  s_emergency_pincode: $("#s_emergency_pincode").val(),
  s_emergency_contact_no: $("#s_emergency_contact_no").val(),

  s_police_verification_cert: $("#s_police_verification_cert").is(":checked") ? "Y" : null,
  s_medical_certificate: $("#s_medical_certificate").is(":checked") ? "Y" : null,
  s_govt_id_proof: $("#s_govt_id_proof").is(":checked") ? "Y" : null,
  s_hsse_training: $("#s_hsse_training").is(":checked") ? "Y" : null,

  s_contractor_name: $("#s_contractor_name").val(),
  s_engineer_name: $("#s_engineer_name").val(),
  s_area_manager_name: $("#s_area_manager_name").val(),
  s_security_ic_name: $("#s_security_ic_name").val(),

  s_security_name: $("#s_security_ic_name").val(),
  s_entry_permit_no: $("#s_entry_permit_no").val(),

  // ===== REQUIRED BUT MISSING (SET SAFE NULLS) =====
  s_photo: null,
  s_applicant_signature: null,
  s_contractor_signature: null,
  s_engineer_signature: null,
  s_area_manager_signature: null,
  s_security_ic_signature: null,
  s_issuing_person_signature: null
};


  const url = isEdit ? "/update_requisition_form" : "/save_requisition_form";

  if (isEdit && !editId) {
  alert("Invalid record selected for update");
  return;
}


  $.ajax({
    url,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: res => {
      if (res.success) {
        alert(isEdit ? "Record updated successfully" : "Record added successfully");
        location.reload();
      } else {
        alert(res.message || "Save failed");
      }
    },
    error: () => alert("Server error while saving")
  });
};


  /* ================= DELETE ================= */

  $("#masterTable").on("click", ".delete", function () {
    const r = $(this).closest("tr").data("record");

    if (!confirm("Are you sure you want to delete this record?")) return;

    $.ajax({
      url: "/delete_requisition_form",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: getVal(r, "n_sr_no") }),
      success: res => {
        if (res.success) {
          alert("Deleted successfully");
          loadData();
        } else {
          alert(res.message || "Delete failed");
        }
      },
      error: () => alert("Delete failed at server")
    });
  });


  loadData();
}

requisitionFormApp();
