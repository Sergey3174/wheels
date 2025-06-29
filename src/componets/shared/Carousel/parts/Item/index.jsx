import React from "react";

import "./index.scss";

export const Item = React.memo(({ index, count, isActive }) => {
  return (
    <div
      className={`cardsScroll-item cardsScroll-item-${index} ${
        isActive ? "active" : ""
      }`}
    >
      <div className="img-ticket">
        <img
          src="/icons/tickets/ticketNoShadow.webp"
          alt="иконка билета"
          loading="lazy"
        />
      </div>

      <div className="cardsScroll-item__content">
        <p>+{count}</p>
      </div>
    </div>
  );
});
