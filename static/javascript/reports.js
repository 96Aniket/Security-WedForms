function reportDownloadApp() {

  /* ================= DOWNLOAD EXCEL ================= */
 function downloadReport() {
  const table = $("#tableSelect").val();
  const start = $("#startDate").val();
  const end = $("#endDate").val();

  let location = USER_LOCATION;

  if (USER_ROLE === "admin") {
    location = $("#locationSelect").val();
    if (!location) {
      alert("Select location");
      return;
    }
  }

  if (!table) {
    alert("Select table");
    return;
  }

  if (!start || !end) {
    alert("Select date range");
    return;
  }

  if (start > end) {
    alert("Invalid date range");
    return;
  }

  $.ajax({
    url: "/download_filtered_excel",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ table, start, end, location }),
    xhrFields: { responseType: "blob" },

    success: function (blob, status, xhr) {
      const contentType = xhr.getResponseHeader("Content-Type") || "";
      if (!contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
        alert("Invalid file received");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}_${location}_${start}_to_${end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },

    error: function (xhr) {

    console.log("Status:", xhr.status);
    console.log("Response:", xhr.responseText);

    if (xhr.response) {

      const reader = new FileReader();

      reader.onload = function () {
        console.error("Server error:", reader.result);
        alert(reader.result);
      };

      reader.readAsText(xhr.response);

    } else {
      alert("Download failed");
    }
  }


  });
}

  function setupLocationFilter() {
  if (USER_ROLE === "admin") {
    $("#locationFilter").show();
    loadLocations();
  }
}

  /* ================= LOAD TABLE DROPDOWN ================= */
  function loadReportTables() {

    $.ajax({
      url: "/get_report_tables",
      method: "GET",
      success: function (tables) {

        const select = $("#tableSelect");
        select.empty();
        select.append(`<option value="">Select Report</option>`);

        tables.forEach(t => {
          select.append(
            `<option value="${t.value}">${t.label}</option>`
          );
        });
      },
      error: function () {
        alert("Failed to load report tables");
      }
    });
  }

function loadLocations() {
  $.ajax({
    url: "/get_locations",
    method: "GET",
    success: function (res) {
      if (!res.success) {
        alert("Failed to load locations");
        return;
      }

      const select = $("#locationSelect");
      select.empty();
      select.append(`<option value="">Select Location</option>`);

      res.data.forEach(loc => {
        select.append(`<option value="${loc}">${loc}</option>`);
      });
    },
    error: function () {
      alert("Error loading locations");
    }
  });
}
const avatar = document.getElementById("profileAvatar");
const menu = document.getElementById("profileMenu");

avatar.addEventListener("click", () => {

    if(menu.style.display === "block"){
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

});

document.addEventListener("click", function(e){

    if(!avatar.contains(e.target)){
        menu.style.display = "none";
    }

});


  /* ================= EVENT BINDING ================= */
  $("#downloadBtn").on("click", downloadReport);

  /* ================= INIT ================= */
  loadReportTables();
  setupLocationFilter();
}

reportDownloadApp();
