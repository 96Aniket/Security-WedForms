function visitorDeclarationApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#visitorTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  function getCellValue(td) {
    const input = td.querySelector("input");
    return input ? input.value : td.innerText.trim();
  }

  /* ================= ADD ================= */

  function addRow() {
    const tbody = document.querySelector("#visitorTable tbody");
    const row = cloneTemplate("addRowTemplate").querySelector("tr");

    row.dataset.new = "true";
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

    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_visitor_data",
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

    const fields = [
      { cls: ".dt", type: "datetime-local" },
      { cls: ".vname", type: "text" },
      { cls: ".vpass", type: "text" },
      { cls: ".meet", type: "text" }
    ];

    fields.forEach((f, i) => {
      const td = row.children[2 + i];
      let val = row.querySelector(f.cls).innerText;

      if (f.type === "datetime-local" && val) {
        val = val.replace(" ", "T").substring(0, 16);
      }

      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = f.type;
      input.value = val;
      td.appendChild(input);
    });

    btn.disabled = true;
    btn.innerText = "Editing";
  }

  /* ================= SAVE ================= */

  function saveTable() {
    let ajaxCalls = [];

    document.querySelectorAll("#visitorTable tbody tr").forEach(row => {
      const td = row.children;

      const payload = {
        s_location_code: USER_LOCATION,
        dt_visit_datetime: getCellValue(td[2]),
        s_visitor_name: getCellValue(td[3]),
        s_visitor_pass_no: getCellValue(td[4]),
        s_whom_to_meet: getCellValue(td[5])
      };

      /* -------- CREATE -------- */
      if (row.dataset.new === "true") {
        ajaxCalls.push(
          $.ajax({
            url: "/save_visitor_data",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload)
          })
        );
      }

      /* -------- UPDATE -------- */
      if (row.dataset.edited === "true" && row.dataset.id) {
        payload.n_sr_no = row.dataset.id;

        ajaxCalls.push(
          $.ajax({
            url: "/update_visitor_data",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload)
          })
        );
      }
    });

    if (ajaxCalls.length === 0) {
      alert("Nothing to save");
      return;
    }

    $.when(...ajaxCalls)
      .done(function () {
        alert("Saved successfully");
        loadData();
      })
      .fail(function () {
        alert("Error while saving data");
      });
  }

  /* ================= LOAD ================= */

  function loadData() {
    $.ajax({
      url: "/get_visitor_data",
      type: "GET",
      success: function (res) {
        if (!res.success) {
          alert("Failed to load data");
          return;
        }

        allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
        currentPage = 1;
        renderPage();
      },
      error: function () {
        alert("Server error while loading");
      }
    });
  }

  function renderPage() {
    const tbody = document.querySelector("#visitorTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach(r => {
      const row = cloneTemplate("viewRowTemplate").querySelector("tr");
      row.dataset.id = r.n_sr_no;

      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".dt").innerText = r.dt_visit_datetime;
      row.querySelector(".vname").innerText = r.s_visitor_name;
      row.querySelector(".vpass").innerText = r.s_visitor_pass_no;
      row.querySelector(".meet").innerText = r.s_whom_to_meet;

      tbody.appendChild(row);
    });

    updateSerialNumbers();
    updatePagination();
  }

  function updatePagination() {
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

  document.addEventListener("DOMContentLoaded", loadData);
}

/* ================= START ================= */
visitorDeclarationApp();
