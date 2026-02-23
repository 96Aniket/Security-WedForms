/* =======================
   LOAD DASHBOARD REQUESTS
======================= */
function loadRequests() {
  fetch('/api/dashboard-requests')
    .then(res => res.json())
    .then(data => {
      let html = '';
      data.forEach(r => {
        html += `
          <tr>
            <td>${r.request_id}</td>
            <td class="${
              r.overall_status === 'APPROVED'
                ? 'status-approved'
                : r.overall_status === 'REJECTED'
                  ? 'status-rejected'
                  : 'status-pending'
            }">
              ${r.overall_status}
            </td>
            <td>${r.current_approver_email || '-'}</td>
            <td>${formatDateTime(r.last_action_time)}</td>
            <td class="action-cell">
              <button
                class="action-btn btn-timeline"
                onclick="viewTimeline(${r.request_id})">
                Timeline
              </button>

              ${
                r.overall_status === 'PENDING'
                  ? `<button
                      class="action-btn btn-resend"
                      onclick="resend(${r.request_id}, ${r.current_level}, '${r.current_approver_email}')">
                      Resend
                    </button>`
                  : ''
              }
            </td>
          </tr>`;
      });
      document.getElementById('requestTable').innerHTML = html;
    });
}
function formatDateTime(dtStr) {
  if (!dtStr) return "-";

  const dt = new Date(dtStr);
  const date = dt.toISOString().slice(0, 10);
  const time = dt.toTimeString().slice(0, 8);

  return `${date} ${time}`;
}

/* =======================
   TIMELINE
======================= */
function viewTimeline(id) {
  fetch(`/api/timeline/${id}`)
    .then(res => res.json())
    .then(data => {

      let html = "";

      data.forEach(t => {
        const dt = new Date(t.time);

        const date = dt.toISOString().slice(0, 10);
        const time = dt.toTimeString().slice(0, 8);

        html += `
          <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${t.email}</td>
            <td><b>${t.action}</b></td>
            <td>${t.remark || "-"}</td>
          </tr>
        `;
      });

      document.getElementById("timelineBody").innerHTML = html;
      document.getElementById("timelineBox").style.display = "block";
    });
}

function closeTimeline() {
  document.getElementById("timelineBox").style.display = "none";
}

/* =======================
   RESEND
======================= */
function resend(id, level, email) {
  if (!email) {
    alert("No current approver found");
    return;
  }

  fetch('/api/resend-approval', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      request_id: id,
      current_level: level,
      approver_email: email
    })
  }).then(() => alert("Approval mail resent"));
}

/* =======================
   FORM SAVE (AUTO SR NO)
======================= */
let savedFormSrNo = null;

function saveRequisition() {

  const payload = {
    s_location: document.getElementById("s_location").value,
    dt_request_date: document.getElementById("dt_request_date").value,
    s_first_name: document.getElementById("s_first_name").value,
    s_middle_name: document.getElementById("s_middle_name").value,
    s_last_name: document.getElementById("s_last_name").value,
    dt_date_of_birth: document.getElementById("dt_date_of_birth").value,
    n_age: document.getElementById("n_age").value,
    s_agency_name: document.getElementById("s_agency_name").value,
    s_sap_vendor_code: document.getElementById("s_sap_vendor_code").value,
    s_nature_of_job: document.getElementById("s_nature_of_job").value,
    s_work_order_no: document.getElementById("s_work_order_no").value,
    dt_work_order_validity: document.getElementById("dt_work_order_validity").value,
    dt_date_of_joining: document.getElementById("dt_date_of_joining").value,
    s_exact_work_location: document.getElementById("s_exact_work_location").value,
    s_gender: document.getElementById("s_gender").value,
    s_aadhar_card_no: document.getElementById("s_aadhar_card_no").value,
    s_present_address: document.getElementById("s_present_address").value,
    s_present_city: document.getElementById("s_present_city").value,
    s_present_state: document.getElementById("s_present_state").value,
    s_present_pincode: document.getElementById("s_present_pincode").value,
    s_contact_no: document.getElementById("s_contact_no").value,
    s_emergency_contact_details: document.getElementById("s_emergency_contact_details").value,
    s_emergency_city: document.getElementById("s_emergency_city").value,
    s_emergency_state: document.getElementById("s_emergency_state").value,
    s_emergency_pincode: document.getElementById("s_emergency_pincode").value,
    s_emergency_contact_no: document.getElementById("s_emergency_contact_no").value
  };

  fetch('/api/save-form', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    savedFormSrNo = data.form_sr_no;

    document.getElementById("srValue").innerText = savedFormSrNo;
    document.getElementById("srDisplay").style.display = "block";

    alert("Form saved successfully");
  });
}

/* =======================
   CREATE REQUEST
======================= */
function createRequest() {

  const user1Email = document.getElementById('user1Email').value;

  if (!user1Email) {
    alert("Please enter receiver email");
    return;
  }

  fetch('/api/create-request', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      first_user_email: user1Email
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Mail sent successfully");
    loadRequests();
  });
}



/* =======================
   INIT
======================= */
loadRequests();
