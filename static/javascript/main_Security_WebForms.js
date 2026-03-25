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