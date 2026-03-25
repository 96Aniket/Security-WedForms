$(document).ready(function () {

  $("#requisitionForm").on("submit", function (e) {

    e.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const btn = $(".btn-save");

    if (btn.prop("disabled")) return;

    btn.prop("disabled", true).text("Submitting...");

    const checkboxFields = [
      "s_police_verification_cert",
      "s_medical_certificate",
      "s_govt_id_proof",
      "s_hsse_training"
    ];

    checkboxFields.forEach(function (k) {
      if (!formData.has(k)) {
        formData.append(k, 0);
      } else {
        formData.set(k, 1);
      }
    });

    $.ajax({
      url: "/api/submit-form",
      type: "POST",
      data: formData,

      processData: false,   
      contentType: false,   

      success: function (res) {

        if (res.status) {

          alert("Requisition submitted successfully ");
          window.close();

        } else {
          alert(res.error || "Something went wrong");
          btn.prop("disabled", false).text("Submit Requisition");
        }

      },

      error: function () {
        alert("Server error");
        btn.prop("disabled", false).text("Submit Requisition");
      }

    });

  });

});