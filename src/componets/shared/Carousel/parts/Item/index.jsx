import React from "react";

import "./index.scss";

export const Item = React.memo(({ count, isActive }) => {
  return (
    <div className={`cardsScroll-item ${isActive ? "active" : ""}`}>
      <div className="img-ticket">
        <img src="/icons/tickets/ticketNoShadow.png" alt="иконка билета" />
      </div>

      <div className="cardsScroll-item__content">
        <p>+{count}</p>
      </div>
    </div>
  );
});
