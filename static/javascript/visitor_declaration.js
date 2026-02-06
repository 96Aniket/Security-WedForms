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

  /* ============ LOAD ============ */
  function loadData() {
    $.get("/get_visitor_declaration_data", res => {
      if (!res.success) return;
      allData = res.data;
      currentPage = 1;
      renderTable();
      $("#paginationBar").show();

    });
  }

  /* ============ RENDER MASTER ============ */
  function renderTable() {
    const tbody = $("#masterTable tbody");
    tbody.empty();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageData = allData.slice(start, end);

    pageData.forEach(r => {
      const tr = $(`
      <tr>
        <td>${r.s_location}</td>
        <td>${r.s_visitor_name}</td>
        <td>${r.s_visitor_pass_no}</td>
        <td>${r.dt_visit_datetime}</td>
        <td>
          <button class="icon-btn edit"><i class="fa fa-pen"></i></button>
          <button class="icon-btn delete"><i class="fa fa-trash"></i></button>
        </td>
      </tr>
    `);

      tr.data("record", r);
      tbody.append(tr);
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
    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });


  };


  window.backStep = () => { $("#step2").hide(); $("#step1").show(); };
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

    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);

    $("#s_visitor_name").val(r.s_visitor_name);
    $("#s_visitor_pass_no").val(r.s_visitor_pass_no);
    $("#s_whom_to_meet").val(r.s_whom_to_meet);
    $("#dt_visit_datetime").val(r.dt_visit_datetime.replace(" ", "T"));

    items = r.items || [];
    renderItems();
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });
  });

  /* ============ ITEMS ============ */
  window.addItem = () => {

  const itemObj = {
    s_item_code_description: $("#item_desc").val(),
    s_uom: $("#item_uom").val(),
    n_quantity: $("#item_qty").val()
  };

  if (editingItemIndex !== null) {
    // UPDATE existing item
    items[editingItemIndex] = itemObj;
    editingItemIndex = null;
  } else {
    // ADD new item
    items.push(itemObj);
  }

  renderItems();
  $("#item_desc,#item_uom,#item_qty").val("");
};


  function renderItems() {
    const tbody = $("#itemTable tbody");
    tbody.empty();

    items.forEach((i, idx) => {
      tbody.append(`
        <tr>
          <td>${i.s_item_code_description}</td>
          <td>${i.s_uom}</td>
          <td>${i.n_quantity}</td>
          <td>
  <button class="icon-btn edit" onclick="editItem(${idx})">
    <i class="fa fa-pen"></i>
  </button>
  <button class="danger" onclick="removeItem(${idx})">X</button>
</td>

        </tr>
      `);
    });
  }
  window.editItem = (index) => {
  const i = items[index];

  editingItemIndex = index;

  $("#item_desc").val(i.s_item_code_description);
  $("#item_uom").val(i.s_uom);
  $("#item_qty").val(i.n_quantity);

  // Optional UX improvement
  $("html, body").animate({
    scrollTop: $("#item_desc").offset().top - 100
  }, 300);
};

window.removeItem = i => {
  items.splice(i, 1);
  editingItemIndex = null;
  renderItems();
};


  /* ============ SAVE ============ */
  window.saveData = () => {
    const payload = {
      master: {
        n_sl_no: editId,
        s_location: USER_LOCATION,
        s_visitor_name: $("#s_visitor_name").val(),
        s_visitor_pass_no: $("#s_visitor_pass_no").val(),
        s_whom_to_meet: $("#s_whom_to_meet").val(),
        dt_visit_datetime: $("#dt_visit_datetime").val()
      },
      items
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
      success: r => {
        alert(r.message);
        location.reload();
      }
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
      success: r => {
        alert(r.message);
        loadData();
      }
    });
  });
  window.nextPage = nextPage;
  window.prevPage = prevPage;


  loadData();
}

visitorDeclarationApp();
