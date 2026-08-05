const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category-list button");
const eventCards = document.querySelectorAll(".event-card");

let activeCategory = "All";

function filterEvents() {
    const query = searchInput?.value.trim().toLowerCase() || "";

    eventCards.forEach((card) => {
        const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
        const category = (card.dataset.category || "").toLowerCase();
        const matchesCategory = activeCategory === "All" || category === activeCategory.toLowerCase();
        const matchesQuery = !query || title.includes(query) || category.includes(query);

        card.style.display = matchesCategory && matchesQuery ? "block" : "none";
    });
}

searchInput?.addEventListener("input", filterEvents);

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.innerText.trim();

        categoryButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        filterEvents();
    });
});

filterEvents();
