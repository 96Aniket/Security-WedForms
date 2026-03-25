let editingItemIndex = null;

function visitorDeclarationApp() {
  let allData = [];
  let items = [];
  let isEdit = false;
  let editId = null;

  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = () => document.getElementById("pageInfo");
  const prevBtn = () => document.getElementById("prevBtn");
  const nextBtn = () => document.getElementById("nextBtn");

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

  function formatLocation(loc) {
    if (!loc) return "";
    if (/^[A-Z]{2}-\d{2}$/.test(loc)) {
      return loc;
    }
    const match = loc.match(/^([A-Z]{2})(\d{1,2})$/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, "0")}`;
    }
    return loc;
  }

  function clearMandatory(input) {
    input.classList.remove("mandatory-error");

    const field = input.closest(".field");
    if (!field) return;

    const label = field.querySelector("label");
    const star = label?.querySelector(".mandatory-star");
    if (star) star.remove();
  }

  /* auto-clear on typing */
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("mandatory-error")) {
      clearMandatory(e.target);
    }
  });

  /* ============ LOAD ============ */
  function loadData() {
    $.get("/get_visitor_declaration_data", (res) => {
      if (!res.success) return;
      allData = res.data;
      currentPage = 1;
      renderTable();
      $("#paginationBar").show();
    });
  }

  /* ============ RENDER MASTER ============ */
  function renderTable() {
    const tbody = document.querySelector("#masterTable tbody");
    tbody.innerHTML = "";

    const template = document.getElementById("visitorRowTemplate");

    const totalRecords = allData.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = allData.slice(start, end);

    pageData.forEach((r, index) => {
      const clone = template.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      const srNo = start + index + 1;
      tr.querySelector(".sr-no").textContent = srNo;

      tr.querySelector(".location").textContent = formatLocation(r.s_location);
      tr.querySelector(".visitor-name").textContent = r.s_visitor_name || "";
      tr.querySelector(".host-name").textContent = r.s_host_name || "";
      tr.querySelector(".pass-no").textContent = r.s_visitor_pass_no || "";
      tr.querySelector(".visit-datetime").textContent =
        r.dt_visit_datetime || "";

      $(tr).data("record", r);

      tbody.appendChild(clone);
    });

    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;

    pageInfo().innerText = `Page ${currentPage} of ${totalPages}`;
    prevBtn().disabled = currentPage === 1;
    nextBtn().disabled = currentPage === totalPages;
  }

  function nextPage() {
    if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
      currentPage++;
      renderTable();
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  }

  /* ============ VIEW SWITCH ============ */
  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    items = [];

    $("#paginationBar").hide();
    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();
    $("#s_location").val(USER_LOCATION).prop("readonly", true);
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });
  };

  window.backStep = () => {
    $("#step2").hide();
    $("#step1").show();
  };
  window.cancel = () => location.reload();

  /* ============ EDIT ============ */
  $("#masterTable").on("click", ".edit", function () {
    const r = $(this).closest("tr").data("record");

    isEdit = true;
    editId = r.n_sl_no;

    $("#paginationBar").hide();
    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();

    $("#s_location").val(USER_LOCATION).prop("readonly", true);

    $("#s_visitor_name").val(r.s_visitor_name);
    $("#s_host_name").val(r.s_host_name || "");
    $("#s_visitor_pass_no").val(r.s_visitor_pass_no);
    $("#s_whom_to_meet").val(r.s_whom_to_meet);
    $("#dt_visit_datetime").val(r.dt_visit_datetime.replace(" ", "T"));

    items = r.items || [];
    renderItems();
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });
  });

  /* ============ ITEMS ============ */
  window.addItem = () => {
    const descInput = document.getElementById("item_desc");
    const qtyInput = document.getElementById("item_qty");

    const desc = descInput.value.trim();
    const qty = qtyInput.value.trim();

    let valid = true;

    if (!desc) {
      markMandatory(descInput);
      valid = false;
    }

    if (!qty) {
      markMandatory(qtyInput);
      valid = false;
    }

    if (!valid) {
      alert("Please fill mandatory Item details.");
      return;
    }

    const itemObj = {
      s_item_code_description: desc,
      s_uom: $("#item_uom").val(),
      n_quantity: qty,
    };

    if (editingItemIndex !== null) {
      items[editingItemIndex] = itemObj;
      editingItemIndex = null;
    } else {
      items.push(itemObj);
    }

    renderItems();
    $("#item_desc,#item_uom,#item_qty").val("");
  };

  function renderItems() {
    const tbody = document.querySelector("#itemTable tbody");
    tbody.innerHTML = "";

    const template = document.getElementById("itemRowTemplate");

    items.forEach((i, idx) => {
      const clone = template.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      tr.querySelector(".desc").textContent = i.s_item_code_description || "";
      tr.querySelector(".uom").textContent = i.s_uom || "";
      tr.querySelector(".qty").textContent = i.n_quantity || "";

      tr.querySelector(".edit").addEventListener("click", () => editItem(idx));
      tr.querySelector(".delete").addEventListener("click", () =>
        removeItem(idx),
      );

      tbody.appendChild(clone);
    });
  }

  window.editItem = (index) => {
    const i = items[index];

    editingItemIndex = index;

    $("#item_desc").val(i.s_item_code_description);
    $("#item_uom").val(i.s_uom);
    $("#item_qty").val(i.n_quantity);

    $("html, body").animate(
      {
        scrollTop: $("#item_desc").offset().top - 100,
      },
      300,
    );
  };

  window.removeItem = (i) => {
    items.splice(i, 1);
    editingItemIndex = null;
    renderItems();
  };

  /* ============ SAVE ============ */
  window.saveData = () => {
    /* ========= MASTER MANDATORY VALIDATION ========= */
    let valid = true;

    const visitorInput = document.getElementById("s_visitor_name");
    const meetInput = document.getElementById("s_whom_to_meet");
    const datetimeInput = document.getElementById("dt_visit_datetime");

    if (!visitorInput.value.trim()) {
      markMandatory(visitorInput);
      valid = false;
    }

    if (!meetInput.value.trim()) {
      markMandatory(meetInput);
      valid = false;
    }

    if (!datetimeInput.value) {
      markMandatory(datetimeInput);
      valid = false;
    }

    if (!valid) {
      alert("Please fill mandatory Visitor details.");
      return;
    }

    if (!items || items.length === 0) {
      alert("Please add at least one Item before saving.");
      return;
    }

    /* ========= PAYLOAD ========= */
    const payload = {
      master: {
        n_sl_no: editId,
        s_location: USER_LOCATION,
        s_visitor_name: visitorInput.value.trim(),
        s_visitor_pass_no: $("#s_visitor_pass_no").val(),
        s_whom_to_meet: meetInput.value.trim(),
        dt_visit_datetime: datetimeInput.value,
        s_host_name: $("#s_host_name").val(),
      },
      items,
    };

    const url = isEdit
      ? "/update_visitor_declaration_data"
      : "/save_visitor_declaration_data";

    if (!confirm(isEdit ? "Update record?" : "Save record?")) return;

    $.ajax({
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: (r) => {
        alert(r.message);
        location.reload();
      },
    });
  };

  /* ============ DELETE ============ */
  $("#masterTable").on("click", ".delete", function () {
    const r = $(this).closest("tr").data("record");
    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_visitor_declaration_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sl_no: r.n_sl_no }),
      success: (r) => {
        alert(r.message);
        loadData();
      },
    });
  });

  window.downloadTableExcel = async function () {
    const res = await $.get("/get_visitor_declaration_data");

    const data = res.data; 

    if (!data || data.length === 0) {
      alert("No data available");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Visitor Report");

    /* ===== TITLE ===== */
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value = "Visitor Declaration Report";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.addRow([]);

    /* ===== HEADER (NO ACTION COLUMN) ===== */
    const header = [
      "Sr No",
      "Location",
      "Visitor Name",
      "Host Name",
      "Pass No",
      "Date / Time",
    ];

    const headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    /* ===== DATA ===== */
    data.forEach((row, index) => {
      worksheet.addRow([
        index + 1,
        row.s_location || "",
        row.s_visitor_name || "",
        row.s_host_name || "",
        row.s_visitor_pass_no || "",
        row.dt_visit_datetime || "",
      ]);
    });

    /* ===== AUTO WIDTH ===== */
    worksheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    /* ===== DOWNLOAD ===== */
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Visitor_Table_Report.xlsx";
    link.click();
  };

  /* ============ Download============ */
  $("#masterTable").on("click", ".icon-btn.download", function () {
    const record = $(this).closest("tr").data("record");

    if (!record || !record.items || record.items.length === 0) {
      alert("No item details available.");
      return;
    }

    showDownloadOptions(record);
  });

  async function downloadVisitorSlipExcel(record) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Visitor Slip");

    let row = 3;

    // ===== TITLE =====
    worksheet.mergeCells("A1:D1");
    worksheet.getCell("A1").value = "Visitor Declaration Slip";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([]);

    /* ===== VISITOR DETAILS (ONCE) ===== */
    const masterFields = [
      ["Location", formatLocation(record.s_location ?? "")],
      ["Visitor Name", record.s_visitor_name ?? ""],
      ["Host Name", record.s_host_name ?? ""],
      ["Visitor Pass No", record.s_visitor_pass_no ?? ""],
      ["Whom To Meet", record.s_whom_to_meet ?? ""],
      ["Visit Date / Time", record.dt_visit_datetime ?? ""],
    ];

    masterFields.forEach(([label, value]) => {
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`A${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = value;
      row++;
    });

    row += 1; // ONE blank row only

    /* ===== ITEM TABLE HEADER ===== */
    worksheet.getRow(row).values = [
      "Sr No",
      "Item Description",
      "UOM",
      "Quantity",
    ];

    worksheet.getRow(row).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    row++;

    /* ===== ITEM DATA (REPEATING) ===== */
    let srNo = 1;
    (record.items || []).forEach((i) => {
      worksheet.getRow(row).values = [
        srNo++,
        i.s_item_code_description ?? "",
        i.s_uom ?? "",
        i.n_quantity ?? "",
      ];
      row++;
    });

    /* ===== AUTO COLUMN WIDTH ===== */
    worksheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    /* ===== DOWNLOAD ===== */
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Visitor_Declaration_Slip.xlsx";
    link.click();
  }

  /* ================= BULK DOWNLOAD (LIST VIEW ONLY) ================= */
  async function downloadVisitorSlipPDF(record) {
    const doc = new window.jspdf.jsPDF("p", "mm", "a4");

    let y = 10;

    /* ===== HEADER ===== */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PIL", 105, y, { align: "center" });

    y += 6;
    doc.setFontSize(11);
    doc.text("VISITOR DECLARATION SLIP", 105, y, { align: "center" });

    y += 5;
    doc.setFontSize(9);
    doc.text("(Returnable Material)", 105, y, { align: "center" });

    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    /* ===== FORM STYLE HEADER ===== */

    doc.text("I", 10, y);
    doc.text(record.s_visitor_name || "", 15, y);
    doc.line(15, y + 1, 110, y + 1);

    doc.text("Visitor pass No.", 115, y);
    doc.text(record.s_visitor_pass_no || "", 155, y);
    doc.line(150, y + 1, 200, y + 1);

    y += 6;

    doc.text("want to meet Mr. / Mrs.", 10, y);
    doc.text(record.s_whom_to_meet || "", 70, y);
    doc.line(65, y + 1, 200, y + 1);

    y += 6;

    doc.text(
      "and carrying following sample / material inside the PIL premises up to",
      10,
      y,
    );

    doc.line(10, y + 2, 200, y + 2);

    y += 6;

    doc.text(
      "Same will be returned after approval / rejection / visit.",
      10,
      y,
    );

    y += 8;

    doc.text("Date:", 150, y);
    doc.text(record.dt_visit_datetime || "", 170, y);
    doc.line(165, y + 1, 200, y + 1);

    y += 10;

    /* ===== TABLE HEADER ===== */

    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = 160;
    const startX = (pageWidth - tableWidth) / 2;

    doc.rect(startX, y, 15, 8);
    doc.rect(startX + 15, y, 95, 8);
    doc.rect(startX + 110, y, 25, 8);
    doc.rect(startX + 135, y, 25, 8);

    doc.setFont("helvetica", "bold");
    doc.text("Sr No.", startX + 2, y + 5);
    doc.text("ITEM CODE / DESCRIPTION", startX + 25, y + 5);
    doc.text("UOM*", startX + 115, y + 5);
    doc.text("QUANTITY", startX + 137, y + 5);

    y += 8;
    doc.setFont("helvetica", "normal");

    let sr = 1;

    (record.items || []).forEach((item) => {
      const rowHeight = 8;

      doc.rect(startX, y, 15, rowHeight);
      doc.rect(startX + 15, y, 95, rowHeight);
      doc.rect(startX + 110, y, 25, rowHeight);
      doc.rect(startX + 135, y, 25, rowHeight);

      doc.text(String(sr++), startX + 4, y + 5);
      doc.text(item.s_item_code_description || "", startX + 18, y + 5, {
        maxWidth: 90,
      });
      doc.text(item.s_uom || "", startX + 115, y + 5);
      doc.text(String(item.n_quantity || ""), startX + 140, y + 5);

      y += rowHeight;
    });

    const remainingRows = 12 - (record.items?.length || 0);

    for (let i = 0; i < remainingRows; i++) {
      doc.rect(startX, y, 15, 8);
      doc.rect(startX + 15, y, 95, 8);
      doc.rect(startX + 110, y, 25, 8);
      doc.rect(startX + 135, y, 25, 8);
      y += 8;
    }

    /* ===== FOOTER ===== */

    y += 10;

    const centerX = pageWidth / 2;

    doc.text("Time:", startX, y);
    doc.text("Date:", startX, y + 6);

    doc.text("Visitor Signature:", startX, y + 14);

    doc.text("Checked By:", startX + 120, y);
    doc.text("Name & Sign of Security", startX + 105, y + 14);

    /* ===== FOOTER TEXT (LEFT SIDE + BIG FONT) ===== */

    y += 25;

    doc.setFontSize(10);

    doc.text(
      "UOM - Unit of measurement (Nos/ Kgs / packages / pairs)",
      startX,
      y,
    );

    y += 5;

    doc.text(
      "The Visitor declaration slip is valid for the day of visit only.",
      startX,
      y,
    );

    /* ===== SAVE ===== */
    doc.save(`Visitor_${record.s_visitor_name}.pdf`);
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
    downloadVisitorSlipPDF(selectedRecord);
    closeDownloadModal();
  };

  window.downloadAsExcel = function () {
    if (!selectedRecord) return;
    downloadVisitorSlipExcel(selectedRecord);
    closeDownloadModal();
  };
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

  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadVisitorSlipPDF = downloadVisitorSlipPDF;

  loadData();
}

visitorDeclarationApp();
