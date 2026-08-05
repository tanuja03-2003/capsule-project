// ===============================
// Login Button
// ===============================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        alert("Login functionality will be added in the backend.");
    });
}


// ===============================
// Explore Events Button
// ===============================

const exploreBtn = document.getElementById("exploreBtn");

if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        window.location.href = "events.html";
    });
}


// ===============================
// Book Ticket Buttons
// ===============================

const bookButtons = document.querySelectorAll(".bookBtn");

bookButtons.forEach(button => {

    button.addEventListener("click", () => {

        const eventName = button.parentElement.querySelector("h3").innerText;

        const confirmBooking = confirm(
            `Do you want to book a ticket for "${eventName}"?`
        );

        if (confirmBooking) {

            alert(
                `🎉 Ticket booked successfully for ${eventName}!\n\nA QR code will be generated after payment.`
            );

        }

    });

});


// ===============================
// Contact Form
// ===============================

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();
        const subject = document.getElementById("subject")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        if (!name || !email || !phone || !subject || !message) {
            alert("Please fill all the fields.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^[0-9]{10}$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!phonePattern.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        alert("Thank you! Your message has been sent successfully.");
        contactForm.reset();

    });
}


// ===============================
// Animated Statistics Counter
// ===============================

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const target = Number(counter.getAttribute("data-target"));

    if (!target) return;

    counter.innerText = "0";

    const updateCounter = () => {

        const current = Number(counter.innerText);

        const increment = Math.ceil(target / 150);

        if (current < target) {

            counter.innerText = current + increment;

            setTimeout(updateCounter, 15);

        }
        else {

            counter.innerText = target;

        }

    };

    updateCounter();

});


// ===============================
// Scroll To Top Button
// ===============================

const topBtn = document.getElementById("topBtn");

if (topBtn) {
    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.style.display = "block";

        }
        else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });
}


// ===============================
// Navbar Active Link
// ===============================

const navLinks = document.querySelectorAll(".navbar a");

navLinks.forEach(link => {

    link.addEventListener("click", function () {

        navLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});


// ===============================
// Hero Button Animation
// ===============================

if (exploreBtn) {
    exploreBtn.addEventListener("mouseover", () => {

        exploreBtn.style.transform = "scale(1.08)";

    });

    exploreBtn.addEventListener("mouseout", () => {

        exploreBtn.style.transform = "scale(1)";

    });
}


// ===============================
// Card Hover Animation
// ===============================

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.boxShadow = "0 12px 25px rgba(0,0,0,0.2)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";

    });

});


// ===============================
// Welcome Message
// ===============================

window.onload = () => {

    console.log("Welcome to EventHub");

};