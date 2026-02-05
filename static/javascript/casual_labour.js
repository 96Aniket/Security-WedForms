function casualLabourApp() {

  let allData = [];
  let labours = [];
  let isEdit = false;
  let editId = null;

  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_casual_labour_data", (res) => {
      if (!res.success || !Array.isArray(res.data)) return;
      allData = res.data;
      renderTable();
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

  /* ================= VIEW SWITCH ================= */

  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    labours = [];

    $("#listView").hide();
    $("#step1").show();

    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);
  };

  window.nextStep = () => {
    $("#step1").hide();
    $("#step2").show();
  };

  window.backStep = () => {
    $("#step2").hide();
    $("#step1").show();
  };

  window.cancel = () => location.reload();

  /* ================= EDIT ================= */

  $("#masterTable").on("click", ".icon-btn.edit", function () {
    const record = $(this).closest("tr").data("record");

    isEdit = true;
    editId = record.n_sl_no;

    $("#listView").hide();
    $("#step1").show();

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
    labours.push({
      s_labour_name: $("#labour_name").val(),
      n_age: $("#labour_age").val(),
      s_sex: $("#labour_sex").val(),
      s_address: $("#labour_address").val(),
      s_temp_access_card_no: $("#labour_card").val(),
      s_mobile_no: $("#labour_mobile").val(),
      s_id_type: $("#labour_id_type").val(),
      s_govt_id_no: $("#labour_id_no").val(),
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

    const payload = {
      master: {
        n_sl_no: editId,
        s_location: USER_LOCATION,
        s_contractor_name: $("#s_contractor_name").val(),
        s_nature_of_work: $("#s_nature_of_work").val(),
        s_place_of_work: $("#s_place_of_work").val(),
        dt_work_datetime: $("#dt_work_datetime").val(),
      },
      labours,
    };

    const url = isEdit
      ? "/update_casual_labour_data"
      : "/save_casual_labour_data";

    if (!confirm(isEdit ? "Update this record?" : "Add this record?")) return;

    $.ajax({
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: (res) => {
        alert(res.message || "Saved successfully");
        location.reload();
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

  /* ================= INIT ================= */

  loadData();
}

casualLabourApp();
