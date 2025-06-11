import React from 'react';

import './index.scss';

export const Item = React.memo(({ count }) => {
  return (
    <div className="cardsScroll-item">
      <div className="img-ticket">
        <img src="/icons/tickets/ticketNoShadow.svg" alt="иконка билета" />
      </div>

      <div className="cardsScroll-item__content">
        <p>+{count}</p>
      </div>
    </div>
  );
});
