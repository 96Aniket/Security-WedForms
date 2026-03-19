$("#requisitionForm").on("submit", function (e) {

    e.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const submitBtn = $(".btn-save");

    submitBtn.prop("disabled", true).text("Submitting...");

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
        url: "/api/resubmit-form",
        type: "POST",
        data: formData,

        processData: false,   
        contentType: false,   

        success: function (res) {

            if (res.status === "resubmitted") {
                alert("Form updated and resubmitted successfully");
                window.close();
            } else {
                alert(res.error || "Something went wrong");
                submitBtn.prop("disabled", false).text("Save & Resubmit");
            }

        },

        error: function () {
            alert("Server error");
            submitBtn.prop("disabled", false).text("Save & Resubmit");
        }
    });

});