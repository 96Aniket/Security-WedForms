function requisitionDashboardApp() {

  /* ================= STATE ================= */

  let savedFormSrNo = null;

  /* ================= HELPERS ================= */

  function formatDateTime(dtStr) {
    if (!dtStr) return "-";
    const dt = new Date(dtStr);
    return `${dt.toISOString().slice(0, 10)} ${dt.toTimeString().slice(0, 8)}`;
  }

  /* ================= LOAD REQUESTS ================= */

  function loadRequests() {
    $.ajax({
      url: "/api/dashboard-requests",
      method: "GET",
      dataType: "json",
      success: data => renderRequests(data)
    });
  }

  /* ================= RENDER ================= */

  function renderRequests(data) {
    let html = "";

    data.forEach(r => {
      const finalStatus =
        r.overall_status === "APPROVED"
          ? "APPROVED"
          : r.overall_status === "REJECTED"
          ? "REJECTED"
          : "PENDING";

      const statusClass =
        finalStatus === "APPROVED"
          ? "status-approved"
          : finalStatus === "REJECTED"
          ? "status-rejected"
          : "status-pending";

      html += `
        <tr>
          <td>${r.request_id}</td>
          <td class="${statusClass}">${finalStatus}</td>
          <td>${r.current_approver_email || "-"}</td>
          <td>${formatDateTime(r.last_action_time)}</td>
          <td class="action-cell">
            <button class="action-btn btn-timeline"
              onclick="viewTimeline(${r.request_id})">
              Timeline
            </button>

            ${
              r.overall_status === "PENDING" && r.current_level !== -1
                ? `<button class="action-btn btn-resend"
                    onclick="resendApproval(${r.request_id},
                      ${r.current_level},
                      '${r.current_approver_email}')">
                    Resend
                  </button>`
                : ""
            }
          </td>
        </tr>`;
    });

    $("#requestTable").html(html);
  }

  /* ================= TIMELINE ================= */

  function viewTimeline(id) {
    $.ajax({
      url: `/api/timeline/${id}`,
      method: "GET",
      dataType: "json",
      success: data => {
        let html = "";

        data.forEach(t => {
          const dt = new Date(t.time);
          html += `
            <tr>
              <td>${dt.toISOString().slice(0, 10)}</td>
              <td>${dt.toTimeString().slice(0, 8)}</td>
              <td>${t.email}</td>
              <td><b>${t.action}</b></td>
              <td>${t.remark || "-"}</td>
            </tr>`;
        });

        $("#timelineBody").html(html);
        $("#timelineBox").show();
      }
    });
  }

  function closeTimeline() {
    $("#timelineBox").hide();
  }

  /* ================= RESEND ================= */

  function resendApproval(id, level, email) {
    if (!email) {
      alert("No current approver found");
      return;
    }

    $.ajax({
      url: "/api/resend-approval",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        request_id: id,
        current_level: level,
        approver_email: email
      }),
      success: () => alert("Approval mail resent")
    });
  }

  /* ================= SAVE FORM ================= */

  function saveRequisition() {
    const payload = {
      s_location: $("#s_location").val(),
      dt_request_date: $("#dt_request_date").val(),
      s_first_name: $("#s_first_name").val(),
      s_middle_name: $("#s_middle_name").val(),
      s_last_name: $("#s_last_name").val(),
      dt_date_of_birth: $("#dt_date_of_birth").val(),
      n_age: $("#n_age").val(),
      s_agency_name: $("#s_agency_name").val(),
      s_sap_vendor_code: $("#s_sap_vendor_code").val(),
      s_nature_of_job: $("#s_nature_of_job").val(),
      s_work_order_no: $("#s_work_order_no").val(),
      dt_work_order_validity: $("#dt_work_order_validity").val(),
      dt_date_of_joining: $("#dt_date_of_joining").val(),
      s_exact_work_location: $("#s_exact_work_location").val(),
      s_gender: $("#s_gender").val(),
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
      s_emergency_contact_no: $("#s_emergency_contact_no").val()
    };

    $.ajax({
      url: "/api/save-form",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(payload),
      success: res => {
        savedFormSrNo = res.form_sr_no;
        $("#srValue").text(savedFormSrNo);
        $("#srDisplay").show();
        alert("Form saved successfully");
      }
    });
  }

  /* ================= CREATE REQUEST ================= */

  function createRequest() {
    const email = $("#user1Email").val();

    if (!email) {
      alert("Please enter receiver email");
      return;
    }

    $.ajax({
      url: "/api/create-request",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ first_user_email: email }),
      success: () => {
        alert("Mail sent successfully");
        loadRequests();
      }
    });
  }

  /* ================= EXPOSE ================= */

  window.viewTimeline = viewTimeline;
  window.closeTimeline = closeTimeline;
  window.resendApproval = resendApproval;
  window.saveRequisition = saveRequisition;
  window.createRequest = createRequest;

  /* ================= INIT ================= */

  loadRequests();
}

/* ================= START APP ================= */
requisitionDashboardApp();