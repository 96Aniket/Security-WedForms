function vehicleChecklistApp() {

  let allData = [];
  let isEdit = false;
  let editId = null;
  window._editChecklist = null;

  const checklistItems = [
    { code: "DL", label: "Valid Driving License" },
    { code: "RC", label: "Valid Registration Book" },
    { code: "INS", label: "Valid Insurance Certificate" },
    { code: "FIT", label: "Valid Vehicle Fitness Certificate" },
    { code: "PUC", label: "Valid PUC Certificate" },
    { code: "SPK", label: "Spark Arrestor Fitted" },
    { code: "FIRE", label: "Fire Extinguisher" },
    { code: "SELF", label: "Self Start" },
    { code: "UNDER", label: "Driver & Undercarriage Checked" },
    { code: "PLATE", label: "Number Plate Painted" },
    { code: "TYRE", label: "Condition of Tyres" },
    { code: "EMG", label: "Emergency Info Panel" },
    { code: "SHOE", label: "Crew Wearing Shoes" },
    { code: "INFL", label: "Inflammable Items Present" },
    { code: "LOAD", label: "Extra Load" },
    { code: "DRUNK", label: "Crew Drunk" },
    { code: "CCE", label: "CCE Certificate" },
    { code: "BODY", label: "Body / Valves / Seals" },
    { code: "OTHER", label: "Any Other" }
  ];

  /* ============ LOAD LIST ============ */
  function loadData() {
    $.get("/get_vehicle_checklist_data", res => {
      if (!res.success) return;
      allData = res.data;
      renderTable();
    });
  }

  function renderTable() {
    const tbody = $("#masterTable tbody").empty();

    allData.forEach(r => {
      const tr = $(`
        <tr>
          <td>${r.s_vehicle_no}</td>
          <td>${r.s_driver_name || ""}</td>
          <td>${r.dt_entry_datetime}</td>
          <td>
            <button class="icon-btn edit"><i class="fa fa-pen"></i></button>
            <button class="icon-btn delete"><i class="fa fa-trash"></i></button>
          </td>
        </tr>
      `);

      tr.data("record", r);
      tbody.append(tr);
    });
  }

  /* ============ VIEW SWITCH ============ */
  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    window._editChecklist = null;

    $("#listView").hide();
    $("#step2").hide();
    $("#step1").show();
  };

  window.nextStep = () => {
    $("#step1").hide();
    $("#step2").show();

    if (isEdit && window._editChecklist) {
      renderChecklist(window._editChecklist);
    } else {
      renderChecklist();
    }

    /* ============ REMARK ENFORCEMENT ON NO ============ */
$("#checkTable").on("change", "input[type=radio]", function () {
  const tr = $(this).closest("tr");
  const status = $(this).val();
  const remarkInput = tr.find(".remark");

  if (status === "N") {
    
    alert("Enter remark for 'No' status.");

    
    remarkInput
      .prop("required", true)
      .addClass("remark-required")
      .focus();
  } else {
    
    remarkInput
      .prop("required", false)
      .removeClass("remark-required");
  }
});

  };

  window.backStep = () => {
    $("#step2").hide();
    $("#step1").show();
  };

  window.cancel = () => location.reload();

  /* ============ CHECKLIST (OLD LOGIC – UNCHANGED) ============ */
  function renderChecklist(existing = []) {
    const tbody = $("#checkTable tbody");
    tbody.empty();

    checklistItems.forEach(item => {
      tbody.append(`
        <tr data-code="${item.code}" data-label="${item.label}">
          <td>${item.label}</td>
          <td><input type="radio" name="${item.code}" value="Y"></td>
          <td><input type="radio" name="${item.code}" value="N"></td>
          <td><input class="remark"></td>
        </tr>
      `);
    });

    // Prefill for EDIT
    existing.forEach(c => {
      const tr = $(`#checkTable tr[data-code='${c.s_check_code}']`);
      tr.find(`input[value='${c.s_status}']`).prop("checked", true);
      tr.find(".remark").val(c.s_remark);
    });
  }

  /* ============ EDIT ============ */
  $("#masterTable").on("click", ".edit", function () {
    const r = $(this).closest("tr").data("record");

    isEdit = true;
    editId = r.n_vc_id;
    window._editChecklist = r.checklist || [];

    $("#listView").hide();
    $("#step2").hide();
    $("#step1").show();

    $("#s_vehicle_no").val(r.s_vehicle_no);
    $("#s_vehicle_type").val(r.s_vehicle_type);
    $("#s_driver_name").val(r.s_driver_name);
    $("#s_contact_no").val(r.s_contact_no);
    $("#s_occupants_name").val(r.s_occupants_name);
    $("#dt_entry_datetime").val(r.dt_entry_datetime.replace(" ", "T"));
    $("#s_purpose_of_entry").val(r.s_purpose_of_entry);
  });

  /* ============ SAVE / UPDATE ============ */
  window.saveData = () => {

    // 🚫 Block save if checklist not loaded
    if ($("#step2").is(":hidden") || $("#checkTable tbody tr").length === 0) {
      alert("Please complete checklist before saving.");
      return;
    }

    if (isEdit && !editId) {
      alert("Edit ID missing. Please reload.");
      return;
    }

    const rows = $("#checkTable tbody tr");
    const checklist = [];
    let valid = true;

    rows.each(function () {
      const status = $(this).find("input[type=radio]:checked").val();
      const remark = $(this).find(".remark").val();

      if (!status) valid = false;
      if (status === "N" && !remark) valid = false;

      checklist.push({
        s_check_code: $(this).data("code"),
        s_check_label: $(this).data("label"),
        s_status: status,
        s_remark: remark
      });
    });

    if (!valid) {
      alert("Please complete checklist properly");
      return;
    }

    const payload = {
      master: {
        n_vc_id: editId,
        s_location_code: $("#s_location_code").val(),
        s_vehicle_no: $("#s_vehicle_no").val(),
        s_vehicle_type: $("#s_vehicle_type").val(),
        s_driver_name: $("#s_driver_name").val(),
        s_contact_no: $("#s_contact_no").val(),
        s_occupants_name: $("#s_occupants_name").val(),
        dt_entry_datetime: $("#dt_entry_datetime").val(),
        s_purpose_of_entry: $("#s_purpose_of_entry").val()
      },
      checklist
    };

    const url = isEdit
      ? "/update_vehicle_checklist_data"
      : "/save_vehicle_checklist_full";

    if (!confirm(isEdit ? "Update vehicle checklist?" : "Save vehicle checklist?")) return;

    $.ajax({
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: res => {
        alert(res.message);
        location.reload();
      },
      error: () => alert("Server error")
    });
  };

  /* ============ DELETE ============ */
  $("#masterTable").on("click", ".delete", function () {
    const r = $(this).closest("tr").data("record");
    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_vehicle_checklist_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_vc_id: r.n_vc_id }),
      success: r => {
        alert(r.message);
        loadData();
      }
    });
  });

  loadData();
}

vehicleChecklistApp();
