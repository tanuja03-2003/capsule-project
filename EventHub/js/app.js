document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".mobile-menu");
  const nav = document.querySelector(".nav-links");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  }

  const search = document.querySelector("#globalSearch");
  if (search) {
    search.addEventListener("keydown", e => {
      if (e.key === "Enter" && search.value.trim()) {
        window.location.href = `events.html?search=${encodeURIComponent(search.value.trim())}`;
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const params = new URLSearchParams(location.search);
  if (params.get("message")) showToast(params.get("message"));
});

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function eventCard(event) {
  return `
    <article class="event-card">
      <a href="event-details.html?id=${event.id}">
        <div class="event-image">
          <span class="tag">${event.category}</span>
          <span>${event.emoji || "🎟️"}</span>
        </div>
        <div class="event-body">
          <div class="event-title">${event.title}</div>
          <div class="event-meta">${formatDate(event.date)} • ${event.time}</div>
          <div class="event-meta">${event.venue}, ${event.city}</div>
          <div class="event-price">From ₹${event.price} <span class="rating">★ ${event.rating}</span></div>
        </div>
      </a>
    </article>`;
}

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day:"2-digit", month:"short", year:"numeric"
  });
}
