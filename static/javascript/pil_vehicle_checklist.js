function vehicleChecklistApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  /* ================= HELPERS ================= */
  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#vehicleTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#vehicleTable tbody");
    const tpl = cloneTemplate("addRowTemplate");
    const row = tpl.querySelector("tr");
    row.querySelector(".location").innerText = USER_LOCATION;
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
      url: "/delete_vehicle_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        n_sr_no: row.dataset.id
      }),
      success: function (res) {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
        } else {
          alert(res.message || "Delete failed");
        }
      },
      error: function () {
        alert("Server error while deleting");
      }
    });
  }

  /* ================= EDIT ================= */
function editRow(btn) {
  const row = btn.closest("tr");
  row.dataset.edited = "true";

  row.children[1].innerText = USER_LOCATION;

  const map = [
    { cls: ".dt", type: "datetime-local" },
    { cls: ".vno", type: "text" },
    { cls: ".vtype", type: "text" },
    { cls: ".driver", type: "text" },
    { cls: ".contact", type: "text" },
    { cls: ".purpose", type: "textarea" }
  ];

  map.forEach((m, i) => {
    const td = row.children[2 + i];
    let val = row.querySelector(m.cls).innerText;

    if (m.type === "datetime-local" && val) {
      val = val.replace(" ", "T").substring(0, 16);
    }

    td.innerHTML = "";

    let el;
    if (m.type === "textarea") {
      el = document.createElement("textarea");
      el.value = val;
    } else {
      el = document.createElement("input");
      el.type = m.type;
      el.value = val;
    }
    td.appendChild(el);
  });

  btn.disabled = true;
  btn.innerText = "Editing";
}


  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#vehicleTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {
      const td = row.children;

      const payload = {
        s_location_code: USER_LOCATION,
        dt_entry_datetime: td[2].querySelector("input")?.value,
        s_vehicle_no: td[3].querySelector("input")?.value,
        s_vehicle_type: td[4].querySelector("input")?.value,
        s_driver_name: td[5].querySelector("input")?.value,
        s_contact_no: td[6].querySelector("input")?.value,
        s_purpose_of_entry: td[7].querySelector("textarea")?.value
      };

      /* -------- CREATE -------- */
      if (row.dataset.new === "true") {
        hasAction = true;

        $.ajax({
          url: "/save_vehicle_data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
          error: function () {
            alert("Error saving vehicle record");
          }
        });
      }

      /* -------- UPDATE -------- */
      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        payload.n_sr_no = row.dataset.id;

        $.ajax({
          url: "/update_vehicle_data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
          error: function () {
            alert("Error updating vehicle record");
          }
        });
      }
    });

    if (!hasAction) {
      alert("Nothing to save");
      return;
    }

    alert("Saved successfully");
    loadVehicleData();
  }

  /* ================= LOAD ================= */
  function loadVehicleData() {
    $.ajax({
      url: "/get_vehicle_data",
      type: "GET",
      success: function (res) {
        if (!res.success) {
          alert("Load failed");
          return;
        }

        allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
        currentPage = 1;
        renderPage();
      },
      error: function () {
        alert("Server error while loading data");
      }
    });
  }

  function renderPage() {
    const tbody = document.querySelector("#vehicleTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach(r => {
      const row = cloneTemplate("viewRowTemplate").querySelector("tr");
      row.dataset.id = r.n_sr_no;

      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".dt").innerText = r.dt_entry_datetime;
      row.querySelector(".vno").innerText = r.s_vehicle_no;
      row.querySelector(".vtype").innerText = r.s_vehicle_type;
      row.querySelector(".driver").innerText = r.s_driver_name;
      row.querySelector(".contact").innerText = r.s_contact_no;
      row.querySelector(".purpose").innerText = r.s_purpose_of_entry;

      tbody.appendChild(row);
    });

    updateSerialNumbers();
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage);
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

  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadRow = downloadRow;

  document.addEventListener("DOMContentLoaded", loadVehicleData);
}

function downloadRow(btn) {
  const row = btn.closest("tr");
  let data = {};

  if (row.dataset.id) {
    data.n_sr_no = row.dataset.id;
  } else {
    const td = row.children;
    data = {
      s_location_code: USER_LOCATION,
      dt_entry_datetime: td[2].querySelector("input")?.value,
      s_vehicle_no: td[3].querySelector("input")?.value,
      s_vehicle_type: td[4].querySelector("input")?.value,
      s_driver_name: td[5].querySelector("input")?.value,
      s_contact_no: td[6].querySelector("input")?.value,
      s_purpose_of_entry: td[7].querySelector("textarea")?.value
    };
  }

  fetch("/download_vehicle_checklist_pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Vehicle_Checklist.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}


/* ================= START APP ================= */
vehicleChecklistApp();
