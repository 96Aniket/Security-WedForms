 function previewFile(input, previewId) {

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
      }

      reader.readAsDataURL(file);
    }

    function validateReject() {

      const remark = document.getElementById("remark").value.trim();

      if (remark === "") {
        alert("Remark is mandatory when rejecting the request.");
        return false;
      }

      return true;
    }
