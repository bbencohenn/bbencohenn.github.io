console.log("✅ script.js is running!");
$(document).ready(function () {
    const menu = $(".menu");
    const menuBlur = $("<div class='menu-blur'></div>").appendTo("body");
    const transitionOverlay = $(".page-transition");

    function toggleMenu() {
        if (menu.hasClass("active")) {
            menu.removeClass("active");
            menuBlur.css("opacity", "0");
            setTimeout(() => {
                menuBlur.removeClass("show").css("visibility", "hidden");
            }, 300);
        } else {
            menu.removeClass("hidden");
            setTimeout(() => {
                menu.addClass("active");
                setActiveMenu();
            }, 10);
            menuBlur.addClass("show").css({
                "opacity": "1",
                "visibility": "visible"
            });
        }
    }

    function setActiveMenu() {
        const currentPage = window.location.pathname;
        $(".list-item").removeClass("active");
        $(".list-item").each(function () {
            if (currentPage.includes($(this).attr("href"))) {
                $(this).addClass("active");
            }
        });
    }

    $(".hamburger").click(toggleMenu);
    $(".close-menu").click(toggleMenu);
    menuBlur.click(toggleMenu);
    setActiveMenu();
});

document.addEventListener("DOMContentLoaded", () => {
    const tooltip = document.getElementById("tooltip");
    const items = document.querySelectorAll(".list-item");
    let tooltipVisible = false;

    items.forEach(item => {
        item.addEventListener("mouseenter", (e) => {
            tooltip.textContent = item.getAttribute("data-label");
            tooltip.style.opacity = "0";
            tooltip.style.visibility = "visible";
            tooltipVisible = true;
            tooltip.style.left = `${e.clientX + 12}px`;
            tooltip.style.top = `${e.clientY + 12}px`;
            setTimeout(() => {
                tooltip.style.opacity = "1";
            }, 10);
        });

        item.addEventListener("mouseleave", () => {
            tooltipVisible = false;
            tooltip.style.opacity = "0";
            setTimeout(() => {
                if (!tooltipVisible) {
                    tooltip.style.visibility = "hidden";
                }
            }, 200);
        });
    });

    document.addEventListener("mousemove", (e) => {
        if (tooltipVisible) {
            tooltip.style.left = `${e.clientX + 12}px`;
            tooltip.style.top = `${e.clientY + 12}px`;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".info-btn");
    const contentBox = document.querySelector(".content-box");
    const modalContent = document.querySelector(".modal-content");
    const closeBtn = document.querySelector(".close-btn");
    const blurOverlay = document.querySelector(".blur-overlay");

    if (!modalContent) return;

    const contentData = {
        whoami: `
            <div class="about-me">
                <p>Hi! My name is <b>Ben Cohen</b> (pictured to the right). I was born in Sydney, Australia in 2004,
                    which makes me 21 years old now! I'm currently in my second year of studying a <b>Bachelor of
                    Computing Science</b> at the <b>University of Technology Sydney</b>.
                </p>
                <img src="resources/me.png" alt="Ben Cohen" class="about-me-image">
            </div>
        `,
        skills: `
            <h2>Skills</h2>
            <ul>
                <li>🔹 Web Development (HTML, CSS, JS, React)</li>
                <li>🔹 Cybersecurity & Ethical Hacking</li>
                <li>🔹 Python, SQL, and AI Development</li>
            </ul>
        `,
        projects: `
            <h2>Projects</h2>
            <p>Here are some of my favorite projects:</p>
            <ul>
                <li>✅ <a href="#">Dino Runner Game</a></li>
                <li>✅ <a href="#">Google Play Store Data Analysis</a></li>
                <li>✅ <a href="#">Interactive Portfolio Website</a></li>
            </ul>
        `,
        contact: `
            <h2>Contact Me</h2>
            <p>📩 Email: <a href="mailto:ben@example.com">ben@example.com</a></p>
            <p>💼 LinkedIn: <a href="#">linkedin.com/in/bencohen</a></p>
        `,
        achievements: `
            <h2>Achievements</h2>
            <p>🎓 UTS Dean's List 2024</p>
            <p>🏆 Google Cybersecurity Challenge Finalist</p>
            <p>📝 100+ GitHub Repositories</p>
        `,
        education: `
            <h2>Education</h2>
            <p>📖 Bachelor of Computing Science, UTS (2023 - Present)</p>
        `
    };

    function openContent(contentKey) {
        if (!contentData[contentKey]) return;
        modalContent.innerHTML = contentData[contentKey];
        contentBox.classList.add("show");
        blurOverlay.classList.add("show");
    }

    function closeContent() {
        contentBox.classList.add("hide");
        blurOverlay.style.opacity = "0";
        setTimeout(() => {
            contentBox.classList.remove("show", "hide");
            blurOverlay.classList.remove("show");
            blurOverlay.style.visibility = "hidden";
        }, 400);
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const contentKey = button.getAttribute("data-content");
            openContent(contentKey);
        });
    });

    closeBtn.addEventListener("click", closeContent);
    blurOverlay.addEventListener("click", closeContent);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeContent();
    });
});
$(document).ready(function () {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("✅ Page transition script is running!"); // Debugging log

        const transitionOverlay = document.querySelector(".page-transition");
        if (!transitionOverlay) {
            console.error("❌ Error: .page-transition not found in the DOM!");
            return;
        }

        const menuItems = document.querySelectorAll(".list-item a");

        function triggerPageTransition(url) {
            console.log(`🔄 Fading out and going to: ${url}`);
            transitionOverlay.classList.add("active");

            setTimeout(() => {
                window.location.href = url;
            }, 1200);
        }

        menuItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const targetURL = item.href;
                triggerPageTransition(targetURL);
            });
        });

        window.addEventListener("load", () => {
            setTimeout(() => {
                transitionOverlay.classList.remove("active");
            }, 300);
        });
    });
});
