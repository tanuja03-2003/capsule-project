const { useState } = React;

const events = [
    {
        id: "music",
        title: "Music Concert",
        location: "Bangalore",
        date: "15 September 2026",
        rating: "4.8 / 5",
        price: "₹999",
        category: "Music",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900",
        link: "event-details.html?event=music"
    },
    {
        id: "tech",
        title: "Tech Conference",
        location: "Hyderabad",
        date: "25 September 2026",
        rating: "4.7 / 5",
        price: "₹799",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900",
        link: "event-details.html?event=tech"
    },
    {
        id: "food",
        title: "Food Festival",
        location: "Chennai",
        date: "12 October 2026",
        rating: "4.6 / 5",
        price: "₹499",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
        link: "event-details.html?event=food"
    }
];

function EventCard(props) {
    return React.createElement(
        "div",
        { className: "event-card" },
        React.createElement("img", { src: props.image, alt: props.title }),
        React.createElement(
            "div",
            { className: "event-info" },
            React.createElement("h3", null, props.title),
            React.createElement("p", null, "📍 ", props.location),
            React.createElement("p", null, "📅 ", props.date),
            React.createElement("p", null, "⭐ ", props.rating),
            React.createElement("span", null, "Starting ", props.price),
            React.createElement("a", { href: props.link }, "View Details")
        )
    );
}

function EventSearchApp() {
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Music", "Technology", "Sports", "Festival"];

    const filteredEvents = events.filter((event) => {
        const matchesQuery =
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            event.location.toLowerCase().includes(query.toLowerCase()) ||
            event.category.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
            selectedCategory === "All" || event.category === selectedCategory;

        return matchesQuery && matchesCategory;
    });

    return React.createElement(
        "section",
        null,
        React.createElement(
            "div",
            { className: "search-section" },
            React.createElement(
                "div",
                { className: "search-box" },
                React.createElement("input", {
                    type: "text",
                    id: "searchInput",
                    placeholder: "Search events...",
                    value: query,
                    onChange: (e) => setQuery(e.target.value)
                }),
                React.createElement("button", { type: "button" }, React.createElement("i", { className: "fa-solid fa-search" }))
            ),
            React.createElement(
                "div",
                { className: "category-list" },
                categories.map((category) =>
                    React.createElement(
                        "button",
                        {
                            key: category,
                            type: "button",
                            className: selectedCategory === category ? "active" : "",
                            onClick: () => setSelectedCategory(category)
                        },
                        category
                    )
                )
            )
        ),
        React.createElement(
            "section",
            null,
            React.createElement("h2", null, "Upcoming Events"),
            React.createElement(
                "p",
                { className: "subtitle" },
                "Book tickets for the most popular events happening near you."
            ),
            React.createElement(
                "div",
                { className: "event-grid" },
                filteredEvents.map((event) =>
                    React.createElement(EventCard, {
                        key: event.id,
                        title: event.title,
                        location: event.location,
                        date: event.date,
                        rating: event.rating,
                        price: event.price,
                        image: event.image,
                        link: event.link
                    })
                )
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById("events-react-root"));
root.render(React.createElement(EventSearchApp));
