console.log("✅ script.js is running!");
$(document).ready(function () {
    const menu = $(".menu");
    const menuBlur = $("<div class='menu-blur'></div>").appendTo("body");

    function toggleMenu() {
        if (menu.hasClass("active")) {
            menu.removeClass("active").addClass("hidden");
            menuBlur.css("opacity", "0");
            setTimeout(() => {
                menuBlur.removeClass("show").css("visibility", "hidden");
            }, 300);
        } else {
            menu.removeClass("hidden");
            void menu[0].offsetWidth;
            menu.addClass("active");
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

    function calculateAge() {
        const birthDate = new Date("2004-01-29T07:30:00+11:00");
        const now = new Date();
        const diff = now - birthDate;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { years, months, days, hours, minutes };
    }

    const age = calculateAge();

    const contentData = {
        whoami: `
            <div class="about-me">
                <p>Hi! My name is <b>Ben Cohen</b> (pictured to the right). I was born in Sydney, Australia in 2004,
                    which makes me ${age.years} years, ${age.months} month(s), ${age.days} day(s), ${age.hours} hour(s), and ${age.minutes} minute(s) old now! I'm currently in my second year of studying a <b>Bachelor of
                    Computing Science</b> at the <b>University of Technology Sydney</b>.</p>
                <img src="resources/me.png" alt="Ben Cohen" class="about-me-image">
            </div>
            <div class="about-me">
                <img src="resources/sax.jpg" alt="Ben Cohen" class="about-me-image">
                <p>I am a <b>resourceful</b> and <b>dedicated</b> university student with excellent <b>analytical skills</b> and a demonstrated commitment to providing <b>great service and work</b> wherever I can. I'm a <b>well-rounded team player</b> committed to pursuing my life goals at <b>high levels</b>. I am always keen to <b>identify the needs of my job</b> and deliver <b>effective solutions</b> to produce the <b>best possible outcomes</b>.</p>
            </div>
            <br>
        `,
        skills: `
            <h2>Skills</h2>
            <ul>
                <li>Web Development</li>
                <ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>
                <li>Programming</li>
                <ul><li>Python</li><li>Java</li><li>C++</li><li>SQL</li><li>PHP</li><li>R</li></ul>
                <li>Software</li>
                <ul><li>Microsoft Office</li><li>Adobe Creative Suite</li><li>Unity</li></ul>
                <li>Data Science</li>
                <ul><li>Machine Learning</li><li>Deep Learning</li><li>Data Analysis</li><li>Statistical Analysis</li><li>Power BI</li><li>Tableau</li></ul>
            </ul>
        `,
        hobbies: `
            <h2>Hobbies</h2>
            <h3>🎵 Music</h3>
            <ul>
                <li>I've been playing saxophone since 2013, and I am trained in both classical and jazz performance.</li>
                <li>I have played drums since 2014, I am trained in a wide variety of styles and genres.</li>
                <li>I am self-taught in guitar and bass guitar, and there are many other instruments that I can play to a basic level as well!</li>
                <li>I often compose music in my free time, in a wide variety of genres and styles</li>
            </ul>
            <h3>🌍 Geography & History</h3>
            <ul>
                <li>I have always had a strong interest in geography and history</li>
                <li>I can (off of the top of my head) name every country in the world and its capital city, as well as the flags of most countries</li>
                <li>I can also list all US states, and I can point to every country on a map and most capital cities too!</li>
            </ul>

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

document.addEventListener("DOMContentLoaded", () => {
    const transitionOverlay = document.querySelector(".page-transition");
    if (!transitionOverlay) return;

    const menuItems = document.querySelectorAll(".list-item a");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const url = item.href;
            transitionOverlay.classList.add("active");

            const menu = document.querySelector(".menu");
            const menuBlur = document.querySelector(".menu-blur");
            menu.classList.remove("active");
            menu.classList.add("hidden");
            if (menuBlur) {
                menuBlur.classList.remove("show");
                menuBlur.style.visibility = "hidden";
                menuBlur.style.opacity = "0";
            }

            setTimeout(() => {
                window.location.href = url;
            }, 1200);
        });
    });

    window.addEventListener("load", () => {
        setTimeout(() => {
            transitionOverlay.classList.remove("active");
        }, 300);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const timeline = document.querySelector(".timeline-container");
    if (timeline) {
        timeline.scrollLeft = 0;
        timeline.addEventListener("wheel", (event) => {
            event.preventDefault();
            timeline.scrollLeft += event.deltaY * 2;
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const carousels = document.querySelectorAll(".carousel-container");

    carousels.forEach(carousel => {
      carousel.addEventListener("wheel", (e) => {
        // Only act on vertical scrolls (trackpad or mouse)
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          e.preventDefault();
          carousel.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    });
  });
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--x', `${x}%`);
    document.body.style.setProperty('--y', `${y}%`);
});
