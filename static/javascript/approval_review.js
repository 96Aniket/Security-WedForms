$(document).ready(function () {

  // ================= PREVIEW =================
  window.previewFile = function (input, previewId) {

    const file = input.files[0];
    const preview = document.getElementById(previewId);

    if (!file) {
      preview.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };

    reader.readAsDataURL(file);
  };

  // ================= MAIN FUNCTION =================
  window.submitApproval = function (action) {
    const form = document.getElementById("approvalForm");
    const formData = new FormData(form);
    formData.append("action", action);
    const remark = $("#remark").val().trim();
    if (action === "REJECT" && !remark) {
      alert("Remark is mandatory when rejecting");
      return;
    }

    const btnApprove = $(".approve-btn");
    const btnReject = $(".reject-btn");

    if (btnApprove.prop("disabled")) return;

    btnApprove.prop("disabled", true).text("Processing...");
    btnReject.prop("disabled", true);

    $.ajax({
      url: "/approval-action",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,

      success: function (res) {
        console.log("Response:", res);

        let message = "";

        if (res.status === "MOVED") {
          message = "Request forwarded to next approver";
        }

        else if (
          res.status === "APPROVED" ||
          res.status === "FINAL_APPROVED" ||
          res.status === "DONE" ||
          res.status === "COMPLETED"
        ) {
          message = "Request approved successfully";
        }

        else if (res.status === "REJECTED_BACK") {
          message = "Sent back for correction";
        }

        else if (
          res.status === "REJECTED" ||
          res.status === "REJECTED_FINAL" ||
          res.status === "FINAL_REJECTED"
        ) {
          message = "Request rejected";
        }

        else {
          message = "Something unexpected happened";
        }

        alert(message);

        setTimeout(() => {
          window.close();
        }, 300);

      },

      error: function () {
        alert("Server Error");
        btnApprove.prop("disabled", false).text("Approve");
        btnReject.prop("disabled", false);
      }

    });
  };
});
