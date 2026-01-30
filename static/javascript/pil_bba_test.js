function bbaTestApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  /* ================= IMAGE PREVIEW ================= */
  function previewImage(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      input.dataset.base64 = e.target.result;

      const previewDiv = input.nextElementSibling;
      previewDiv.innerHTML = `
        <button type="button" onclick="showImage('${e.target.result}')">
          View Document
        </button>
      `;
    };

    reader.readAsDataURL(file);
  }

  function showImage(base64) {
    const imgWindow = window.open("");
    imgWindow.document.write(`
      <html>
        <head><title>Attachment Preview</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
          <img src="${base64}" style="max-width:100%; max-height:100%;">
        </body>
      </html>
    `);
  }

  /* ================= HELPERS ================= */
  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#bbaTable tbody");
    const tpl = cloneTemplate("bbaAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

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
      url: "/delete_bba_test_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: res => {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
        } else {
          alert(res.message || "Delete failed");
        }
      }
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

    [4, 5, 8, 10, 11].forEach(idx => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";
      const input = document.createElement("input");
      input.value = val;
      row.children[idx].appendChild(input);
    });

    [6, 7].forEach(idx => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";

      const select = document.createElement("select");
      const options = idx === 6
        ? ["Employee", "Contractor", "Others"]
        : ["Negative", "Positive"];

      options.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        o.text = v;
        if (v === val) o.selected = true;
        select.appendChild(o);
      });

      row.children[idx].appendChild(select);
    });

    row.children[9].innerHTML = `
      <input type="file" accept="image/*" onchange="window.previewImage(this)">
      <div class="img-preview"></div>
    `;

    btn.disabled = true;
    btn.innerText = "Editing";
  }

  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {
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
        img_attachment: td[9].querySelector("input")?.dataset.base64 || null,
        s_security_personnel_name: td[10].querySelector("input")?.value,
        s_remarks: td[11].querySelector("input")?.value
      };

      if (row.dataset.new === "true") {
        hasAction = true;
        $.ajax({
          url: "/save_bba_test_data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }

      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        payload.n_sr_no = row.dataset.id;
        $.ajax({
          url: "/update_bba_test_data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }
    });

    if (!hasAction) return alert("Nothing to save");

    alert("Saved successfully");
    loadBbaData();
  }

  /* ================= LOAD ================= */
  function loadBbaData() {
    $.get("/get_bba_test_data", res => {
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

    allData.slice(start, end).forEach(r => {
      const tpl = cloneTemplate("bbaViewRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = r.n_sr_no;
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
          <button onclick="showImage('${r.img_attachment}')">
            View Document
          </button>
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

  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.previewImage = previewImage;
  window.showImage = showImage;
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  document.addEventListener("DOMContentLoaded", loadBbaData);
}

bbaTestApp();
