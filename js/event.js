const { useState, useEffect } = React;

const events = [
    {
        id: "music",
        title: "Music Concert",
        venue: "Bangalore",
        date: "15 September 2026",
        time: "7:00 PM",
        price: 999,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900",
        description: "Enjoy a live music concert featuring popular artists, amazing lighting, and an unforgettable experience."
    },
    {
        id: "tech",
        title: "Tech Conference",
        venue: "Hyderabad",
        date: "25 September 2026",
        time: "10:00 AM",
        price: 799,
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900",
        description: "Meet industry experts, attend technical sessions and explore the latest innovations."
    },
    {
        id: "food",
        title: "Food Festival",
        venue: "Chennai",
        date: "12 October 2026",
        time: "1:00 PM",
        price: 499,
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
        description: "Taste delicious dishes from famous chefs and restaurants across India."
    }
];

function BookingApp() {
    const params = new URLSearchParams(window.location.search);
    const eventKey = params.get("event") || "music";
    const currentEvent = events.find((event) => event.id === eventKey) || events[0];

    const [ticketCount, setTicketCount] = useState(1);

    useEffect(() => {
        setTicketCount(1);
    }, [eventKey]);

    const total = currentEvent.price * ticketCount;

    const handleBookNow = () => {
        const bookingId = "EVT" + Math.floor(Math.random() * 900000 + 100000);
        alert(
            `Booking Successful!\n\nBooking ID : ${bookingId}\nEvent : ${currentEvent.title}\nTickets : ${ticketCount}\nTotal Amount : ₹${total}\n\nThank you for booking with EventHub.`
        );
    };

    return React.createElement(
        "div",
        { className: "details-container" },
        React.createElement(
            "div",
            null,
            React.createElement("img", { src: currentEvent.image, alt: currentEvent.title })
        ),
        React.createElement(
            "div",
            { className: "details-info" },
            React.createElement("h1", null, currentEvent.title),
            React.createElement(
                "p",
                null,
                React.createElement("strong", null, React.createElement("i", { className: "fa-solid fa-location-dot" }), " Venue :"),
                React.createElement("span", null, " ", currentEvent.venue)
            ),
            React.createElement(
                "p",
                null,
                React.createElement("strong", null, React.createElement("i", { className: "fa-solid fa-calendar-days" }), " Date :"),
                React.createElement("span", null, " ", currentEvent.date)
            ),
            React.createElement(
                "p",
                null,
                React.createElement("strong", null, React.createElement("i", { className: "fa-solid fa-clock" }), " Time :"),
                React.createElement("span", null, " ", currentEvent.time)
            ),
            React.createElement("p", null, React.createElement("strong", null, "Description")),
            React.createElement("p", null, currentEvent.description),
            React.createElement(
                "div",
                { className: "price" },
                "₹ ",
                React.createElement("span", null, currentEvent.price),
                " per ticket"
            ),
            React.createElement("h3", null, "Select Number of Tickets"),
            React.createElement(
                "div",
                { className: "quantity-box" },
                React.createElement(
                    "button",
                    { id: "minusBtn", onClick: () => setTicketCount((count) => Math.max(1, count - 1)) },
                    "-"
                ),
                React.createElement("input", { type: "text", value: ticketCount, readOnly: true }),
                React.createElement(
                    "button",
                    { id: "plusBtn", onClick: () => setTicketCount((count) => count + 1) },
                    "+"
                )
            ),
            React.createElement(
                "div",
                { className: "total-price" },
                "Total : ₹ ",
                React.createElement("span", null, total)
            ),
            React.createElement(
                "button",
                { className: "confirm-btn", onClick: handleBookNow },
                "Book Ticket"
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById("booking-react-root"));
root.render(React.createElement(BookingApp));
